# Google Analytics 4 注册教程

## 📋 注册步骤（5分钟完成）

### 步骤1：访问 Google Analytics
1. 打开浏览器，访问：https://analytics.google.com/
2. 点击左下角 **"开始测量"** 或 **"创建账户"**

### 步骤2：创建账户
填写以下信息：
```
账户名称：COLIN Blog
账户数据共享设置：
  ✅ 不勾选任何选项（推荐）
```
点击 **"下一步"**

### 步骤3：创建媒体资源
填写以下信息：
```
媒体资源名称：thecolin.vip
报告时区：(GMT+08:00) 北京、重庆、香港特别行政区、乌鲁木齐
货币：人民币元 (CNY ¥)
```
点击 **"下一步"**

### 步骤4：填写业务信息
填写以下信息：
```
业务类别：个人或博客
业务规模：小型（1-10人）
您打算如何使用 Google Analytics：
  ✅ 衡量广告投资回报率（ROI）
  ✅ 衡量网站用户行为
```
点击 **"创建"**

### 步骤5：接受服务条款
```
地区：中国
勾选：我接受《Google Analytics（分析）服务条款》
勾选：我接受《数据修正 amendments》协议
勾选：我接受《Google Analytics（分析）额外条款》
```
点击 **"接受"**

### 步骤6：创建数据流
1. 选择平台：**"网站"**
2. 设置数据流：
   ```
       网站网址：https://thecolin.vip
   数据流名称：主站
   ```
3. 点击 **"创建数据流"**

### 步骤7：获取测量 ID
创建成功后，你会看到：
```
测量 ID：G-XXXXXXXXXX
```

**这就是你需要替换到网站文件中的 ID！**

---

## 🔧 如何替换测量 ID

### 需要替换的文件（共6个）：
1. `index.html` - 第 56 行
2. `products.html` - 第 12 行
3. `subscribe.html` - 第 11 行
4. `article.html` - 第 11 行
5. `archive.html` - 第 7 行
6. `销售页面完整版.html` - 第 15 行

### 替换方法：
在每个文件中，找到以下代码：
```javascript
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
```

将 `G-XXXXXXXXXX` 替换为你的真实测量 ID，例如：
```javascript
gtag('config', 'G-XXXXXXXXXX'); // 替换为 G-2X3ABCD1234
```

---

## ✅ 如何验证安装成功

### 方法1：浏览器开发者工具
1. 打开你的网站：https://thecolin.vip
2. 按 **F12** 打开开发者工具
3. 切换到 **Network (网络)** 标签
4. 刷新页面 (F5)
5. 在搜索框输入：`collect`
6. 如果看到向 `google-analytics.com` 发送的请求，说明已成功

### 方法2：Google Analytics 实时查看
1. 登录 Google Analytics：https://analytics.google.com/
2. 左侧菜单点击 **"报告"** → **"实时"** → **"概览"**
3. 在新标签页打开你的网站
4. 应该看到 **"过去30分钟的活跃用户"** 显示 1 人

### 方法3：Google Tag Assistant（推荐）
1. 安装 Chrome 扩展：Google Tag Assistant
2. 访问你的网站
3. 点击浏览器右上角的 Tag Assistant 图标
4. 应该看到：**"Google Analytics: Found"**

---

## 📊 配置完成后可以追踪的数据

安装成功后，你可以追踪：
- ✅ 页面浏览量
- ✅ 访问用户数
- ✅ 用户地理位置
- ✅ 访问设备（手机/电脑）
- ✅ 用户停留时间
- ✅ 跳出率
- ✅ 流量来源（搜索/直接/推荐）
- ✅ 已配置的事件（订阅、搜索、购买点击）

---

## 💡 常见问题

### Q1: 看不到数据怎么办？
**A:**
1. 检查测量 ID 是否正确复制
2. 等待 24-48 小时（数据可能有延迟）
3. 清除浏览器缓存后重新访问
4. 检查是否有广告拦截器

### Q2: 测量 ID 在哪里查看？
**A:**
1. 登录 Google Analytics
2. 点击 **"管理"** (齿轮图标）
3. 媒体资源 → 数据流 → 选择你的网站
4. 顶部显示 **"测量 ID"**

### Q3: 可以追踪多个网站吗？
**A:** 可以！每个网站创建一个媒体资源，每个都有独立的测量 ID

### Q4: 数据显示为 0？
**A:**
- 新网站需要 24 小时后才开始显示数据
- 确保网站已部署并可以访问
- 自己访问也会被统计

### Q5: 如何排除自己的访问？
**A:**
1. Google Analytics → 管理 → 数据流
2. 选择你的数据流 → 配置标记设置
3. 添加内部流量过滤器（需要技术配置）

---

## 🎯 快速检查清单

完成注册后，确保：
- [ ] 已创建 Google Analytics 账号
- [ ] 已创建媒体资源 (thecolin.vip)
- [ ] 已创建数据流
- [ ] 已复制测量 ID (格式：G-XXXXXXXXXX)
- [ ] 已替换所有 6 个文件中的占位符
- [ ] 已上传文件到服务器
- [ ] 已通过浏览器开发者工具验证
- [ ] 已在 Google Analytics 看到实时数据

---

## 📞 需要帮助？

**官方文档：** https://support.google.com/analytics/
**官方社区：** https://support.google.com/analytics/community
**Tag Assistant：** https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk

---

**预计耗时：** 10-15 分钟
**难度：** 简单
**状态：** ✅ 完成
