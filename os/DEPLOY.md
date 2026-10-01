# Personal OS 发布中台 · 部署指南

> 手机速记 → 起念 → 起草 → 待发 → **一键发布** → 写作站 / 读书站上线，公众号一键复制草稿。

## 架构一图

```
手机 PWA (Personal OS)
    │  POST /api/publish  （带 X-OS-Token 口令）
    ▼
Vercel Serverless（os-pwa/api/publish.js，持有 GITHUB_TOKEN）
    │  Git Data API 原子 commit（文章页 + JSON 同一提交）
    ├──► github.com/littlelinthinks/thecolin-blog    → Vercel 自动部署 → thecolin.vip
    └──► github.com/littlelinthinks/readswithcolin   → Vercel 自动部署 → readswithcolin.com
公众号：不走 API（微信无开放发布接口），一键复制富文本草稿 → 手动粘贴
```

## 部署步骤

### 1. 把 os-pwa 并入 thecolin-blog 仓库

与写作站同仓库同 Vercel 项目部署（PWA 与 API 同域，免 CORS）：

```bash
git clone git@github.com:littlelinthinks/thecolin-blog.git
cp -r /workspace/os-pwa/. thecolin-blog/os/
cd thecolin-blog && git add os/ && git commit -m "add Personal OS publishing console" && git push
```

Vercel 会自动识别 `os/api/publish.js` 为 Serverless Function：
`https://www.thecolin.vip/api/publish`（或项目域名下的 `/api/publish`）。

> PWA 内部链接是相对路径（`./assets/...`、`new.html`），放 `os/` 子目录无需任何改动。
> 若 Vercel 项目开了 cleanUrls，子目录部署同样兼容。

### 2. 创建 Fine-grained GitHub PAT

GitHub → Settings → Developer settings → Fine-grained tokens：

- **Token name**: `colin-os-publisher`
- **Expiration**: 90 天（到期重新生成）
- **Repository access**: Only select repositories → 勾选
  - `littlelinthinks/thecolin-blog`
  - `littlelinthinks/readswithcolin`
- **Permissions → Repository permissions → Contents**: `Read and write`

### 3. 配置 Vercel 环境变量

Vercel Dashboard → 项目 → Settings → Environment Variables：

| 变量 | 值 | 说明 |
|---|---|---|
| `GITHUB_TOKEN` | 上一步的 PAT | 服务端持有，绝不进前端 |
| `PUBLISH_TOKEN` | 自己定一个口令，如 `colin-2026-xxx` | PWA 里首次发布会提示输入 |

配置后 **Redeploy** 一次生效。

### 4. 手机开始用

1. 手机浏览器打开 `https://www.thecolin.vip/os/`
2. 添加到主屏幕（Safari：分享 → 添加到主屏幕）
3. 写一条 → 推进到「待发」→ 已发页点「🚀 发布」→ 输入一次口令（会记住）
4. Vercel 自动部署约 40-90 秒后，线上可访问

## 发布目标与内容形态

| 渠道 | 仓库 | 生成内容 | 链接形态 |
|---|---|---|---|
| 写作站 | thecolin-blog | `articles/{slug}/index.html` + 更新 `articles.json` | `/articles/{slug}/` |
| 读书站 | readswithcolin | `posts/{slug}.html` + 更新 `data/posts.json`（RWC 编号自动递增） | `/posts/{slug}.html` |
| 公众号 | —（无 API） | 富文本草稿进剪贴板（内联样式，公众号编辑器直接粘） | 手动粘贴 |

每次发布 = 每仓库一个原子 commit（文章 + 数据 JSON 同一提交），commit 形如：

```
publish: 文章标题 (via Personal OS)
```

## 安全设计

- `GITHUB_TOKEN` 只存在于 Vercel 环境变量，前端永远拿不到
- `PUBLISH_TOKEN` 是调用口令，错误口令 403，且前端会自动清除本地错口令
- PAT 是 fine-grained：仅两个仓库、仅 contents 读写、90 天过期
- 发布口令输错不会锁死：重新点发布会再次提示输入

## 已知边界（务实取舍）

- **公众号**无法 API 发布（IP 白名单 + 云服务器资质门槛），剪贴板方案已是个人号最优解
- 读书站 PWA 发布生成**简化版笔记页**（双语结构 + RWC 编号）；完整书评版式（引言/金句卡/封面）仍建议在本地编辑
- `sitemap.xml` / `rss.xml` 不会自动更新（文章数据 JSON 会更新，站内页面即刻可见）；可后续在 API 里加一步顺带重写这两个文件
- PWA 的 pipeline 数据存 localStorage（基线 pipeline.json 只读）——换设备用「导出 JSON」迁移

## 本地开发/测试

```bash
# 静态预览（无 API，发布会失败但不影响其他功能）
cd os-pwa && python3 -m http.server 8878

# Mock 发布 API（模拟成功，用于 UI 联调）
python3 .verify/mock_server.py 8878   # 口令 colin-test-token
```

验证脚本（需 playwright）：

```bash
python3.11 .verify/verify_ospwa_p3.py      # 看板/表单/编辑回填
python3.11 .verify/verify_e2e_publish.py   # 发布端到端（配 mock server）
python3.11 .verify/verify_wechat_clip.py   # 剪贴板富文本
```

## 后端部署实操（恢复「一键发稿」）

> 前端 `thecolin.vip/os/` 已上线可用（本地速记 / 看板）。本段只解决后端 `/api/publish` 当前 404 的问题。
> 代码路径已与线上两站结构对齐：写作站 `articles/{slug}/`、读书站 `posts/{slug}.html` 均实测可达，无需改动。

### 步骤 1：把 `os/` 并入 thecolin-blog 仓库
部署包 `OS_PUBLISH_CONSOLE_DEPLOY.zip` 解压后顶层即为 `os/`（含 PWA 前台 + `api/` 后端 + `package.json`）。
将 `os/` 整个目录拷进 `thecolin-blog` 仓库根目录并 push：

```bash
git clone git@github.com:littlelinthinks/thecolin-blog.git
cp -r OS_PUBLISH_CONSOLE_DEPLOY/os thecolin-blog/
cd thecolin-blog && git add os/ && git commit -m "add Personal OS publish console (api + pwa)" && git push
```

Vercel 会自动把 `os/api/publish.js` 识别为 Serverless Function → `https://www.thecolin.vip/os/api/publish`。

### 步骤 2：创建 fine-grained GitHub PAT
GitHub → Settings → Developer settings → Fine-grained tokens：
- **Token name**：`colin-os-publisher`
- **Expiration**：90 天（到期重新生成）
- **Repository access**：Only select repositories → 勾选 `littlelinthinks/thecolin-blog` 与 `littlelinthinks/readswithcolin`
- **Permissions → Repository permissions → Contents**：`Read and write`

### 步骤 3：配置 Vercel 环境变量
Vercel Dashboard → 项目 → Settings → Environment Variables：

| 变量 | 值 | 说明 |
|---|---|---|
| `GITHUB_TOKEN` | 上一步的 PAT | 服务端持有，绝不进前端 |
| `PUBLISH_TOKEN` | 自己定一个口令，如 `colin-2026-xxx` | PWA 首次发布会提示输入，会本地记住 |

配置后 **Redeploy** 一次生效（Functions 需重新构建以安装 `pinyin-pro` 依赖）。

### 步骤 4：手机验证
1. 打开 `https://www.thecolin.vip/os/` → 写一条 → 推到「待发」→ 已发页点「🚀 发布」→ 输入 PUBLISH_TOKEN
2. 等 Vercel 部署 40-90 秒，文章即出现在两站
3. 核验：`curl -s -o /dev/null -w "%{http_code}" https://www.thecolin.vip/os/api/publish` 现在应返回 **405**（方法不允许）而非 404，即后端已上线

### 与「手动上传 zip」并存纪律
两路径都写 `posts/{slug}.html` + `data/posts.json` / `articles/{slug}/` + `articles.json`，发布中台对 JSON 是**读取后追加合并**（非覆盖），所以手动上传不会被一键发稿清空。
**铁律**：今后每次手动 zip 更新两站，凡增删 post/article，**必须同步更新对应的 `data/posts.json` / `articles.json`**，否则两路径会失同步、冲掉发布中台假设。永不改名 `posts/`、`articles/`。

