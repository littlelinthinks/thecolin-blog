# GitHub + Vercel 部署优化指南

## 🚀 快速部署流程

### 1. 提交到 GitHub

```bash
cd "/Users/colinying/Desktop/Personal Blog Website"

# 初始化 Git（如果还没有）
git init

# 添加所有优化后的文件
git add .

# 提交更改
git commit -m "perf: 网站性能优化

- 添加关键CSS内联，异步加载非关键CSS
- 添加Service Worker实现离线访问
- 添加PWA支持（manifest.json）
- 优化资源预加载（DNS预解析、preconnect）
- 添加图片懒加载
- 更新Vercel配置（缓存策略、安全头）"

# 推送到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### 2. Vercel 配置

#### 方法一：通过 Vercel Dashboard（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Other
   - **Build Command**: 留空（静态网站）
   - **Output Directory**: 留空（根目录）
5. 点击 "Deploy"

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd "/Users/colinying/Desktop/Personal Blog Website"
vercel --prod
```

---

### 3. 环境变量配置（用于 GitHub Actions）

在 GitHub 仓库设置中添加 Secrets：

1. 访问: `Settings` → `Secrets and variables` → `Actions`
2. 添加以下 secrets：

| Secret Name | 获取方式 |
|-------------|----------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | `~/.vercel/project.json` 中的 `orgId` |
| `VERCEL_PROJECT_ID` | `~/.vercel/project.json` 中的 `projectId` |

获取命令：
```bash
cat ~/.vercel/project.json
```

---

### 4. 验证部署

#### 检查 Service Worker
1. 打开网站: https://thecolin.vip
2. DevTools → Application → Service Workers
3. 确认看到:
   - ✅ Status: Activated
   - ✅ SW: /sw.js

#### 检查缓存
1. DevTools → Application → Cache Storage
2. 应该看到: `colin-blog-v2`

#### 性能测试
```bash
# 使用 Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

---

## 📊 Vercel 特定优化

### 1. 边缘缓存（自动）

Vercel 自动为你的静态资源启用边缘缓存：

| 资源类型 | 缓存时间 | 说明 |
|---------|---------|------|
| CSS/JS | 1年 | 文件名不变则永久缓存 |
| 图片 | 1年 | immutable |
| HTML | 0秒 | 总是获取最新 |
| SW | 0秒 | Service Worker 不缓存 |

### 2. 压缩（自动）

Vercel 自动启用：
- ✅ Brotli 压缩（比 Gzip 好 20%）
- ✅ HTTP/2 Server Push（关键资源）
- ✅ 全球 CDN（Edge Network）

### 3. 图片优化（Vercel 原生支持）

使用 Vercel 的图片优化服务：

```html
<!-- 普通图片 -->
<img src="/images/photo.jpg" width="800" height="600" />

<!-- Vercel 优化图片 -->
<img
  src="/_next/image?url=/images/photo.jpg&w=800&q=75"
  width="800"
  height="600"
  loading="lazy"
/>
```

注意：需要 Next.js 项目才能自动使用。纯 HTML 项目使用现有的优化即可。

---

## 🔧 高级配置

### 自定义域名

1. Vercel Dashboard → 你的项目 → Settings → Domains
2. 添加域名: `thecolin.vip`
3. 按提示配置 DNS：
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: CNAME, Name: www, Value: cname.vercel-dns.com

### 分支预览

每次 Pull Request 会自动生成预览链接：

```
https://your-project-git-feature-branch.vercel.app
```

### 环境变量

在 Vercel Dashboard 设置环境变量：

```
ANALYTICS_ID=G-MPQTS8G2HD
```

---

## 🧪 测试清单

部署后检查：

### 性能测试
- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

### 功能测试
- [ ] 深色/浅色主题切换
- [ ] 中英文切换
- [ ] 返回顶部按钮
- [ ] 离线访问（断网刷新）

### PWA 测试
- [ ] 可以添加到主屏幕
- [ ] 有启动画面
- [ ] 离线时显示缓存内容

---

## 📈 性能监控

### Vercel Analytics（免费）

1. Dashboard → Analytics → Enable
2. 自动收集：
   - 真实用户性能数据 (RUM)
   - Core Web Vitals
   - 访问量统计

### 使用 Web Vitals

在 `common.js` 中添加：

```javascript
// 发送 Core Web Vitals 到 Vercel Analytics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToVercelAnalytics(metric) {
  const body = JSON.stringify(metric);
  (navigator.sendBeacon && navigator.sendBeacon('/_vercel/insights/vitals', body)) ||
    fetch('/_vercel/insights/vitals', {
      body,
      method: 'POST',
      keepalive: true,
    });
}

getCLS(sendToVercelAnalytics);
getFID(sendToVercelAnalytics);
getFCP(sendToVercelAnalytics);
getLCP(sendToVercelAnalytics);
getTTFB(sendToVercelAnalytics);
```

---

## 🚨 故障排除

### Service Worker 未注册

检查浏览器控制台是否有错误。常见问题：
- SW 文件路径错误 → 检查 `sw.js` 在根目录
- HTTPS 必需 → Vercel 自动提供
- CSP 阻止 → 检查 `Content-Security-Policy`

### 缓存不生效

清除缓存：
```javascript
// 在控制台运行
navigator.serviceWorker.getRegistrations().then(regs => {
  for (let reg of regs) reg.unregister();
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### 部署失败

检查：
1. `vercel.json` 语法是否正确
2. 文件是否有敏感信息
3. GitHub Actions secrets 是否配置

---

## 📚 相关文件

| 文件 | 用途 |
|------|------|
| `vercel.json` | Vercel 配置（路由、缓存、头） |
| `sw.js` | Service Worker（离线支持） |
| `manifest.json` | PWA 配置 |
| `budget.json` | Lighthouse 性能预算 |
| `.github/workflows/deploy.yml` | 自动部署工作流 |

---

## ✅ 部署后验证

运行以下命令验证：

```bash
# 1. 检查网站可访问
curl -I https://thecolin.vip

# 2. 检查缓存头
curl -I https://thecolin.vip/css/common.css | grep cache-control

# 3. 检查 Service Worker
curl https://thecolin.vip/sw.js | head -5

# 4. 检查 manifest
curl https://thecolin.vip/manifest.json | jq .
```

---

**🎉 完成！你的网站现在拥有企业级的性能和部署流程。**
