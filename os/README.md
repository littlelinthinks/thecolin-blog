# Colin OS · PWA 发布中台 v1.1

## 这是什么
`thecolin.vip/os/` 的手机版 App 化预览：
- **随时随地速记** → 落到「起念」
- **看板推进** → 起念 → 起草 → 待发 → 已发
- **离线可用** → Service Worker 缓存
- **可装到主屏幕** → 体验接近原生 App

## 文件结构
```
os/
├── index.html          发布台（看板）
├── capture.html        速记页（手机核心入口）
├── new.html            起草页
├── done.html           已发资产库
├── manifest.json       PWA 应用信息
├── sw.js               Service Worker
├── assets/css/os.css   样式（含移动端底部 Tab 栏）
├── assets/js/os.js     交互逻辑
├── assets/data/pipeline.json   演示数据
└── assets/icons/       192/512/Apple-touch 图标
```

## 安装方法（手机）
**iPhone Safari**：打开链接 → 点底部「分享」→「添加到主屏幕」
**Android Chrome**：打开链接 → 点菜单 →「安装应用」

## 当前状态
- 纯静态，写入的数据存在本机浏览器（localStorage）。
- 换设备不会同步，清缓存会丢失。
- 下一版可接 Cloudflare Worker + Git 自动提交，实现「一键发布到网站」。
