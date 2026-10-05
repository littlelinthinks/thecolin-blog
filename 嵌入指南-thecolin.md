# thecolin.vip 智库组件嵌入指南

## 现状说明

组件和数据**已经全部在线**，但目前只挂在独立演示页上：

> 🔗 直接访问：<https://www.thecolin.vip/智库组件展示.html>
> （或浏览器输入 `www.thecolin.vip/智库组件展示.html`）

首页/导航没有入口指向它，所以你打开 www.thecolin.vip 看到的仍是老页面。要让访客在正式页面上看到模型，只需在页面里粘贴下面这段代码。

## 怎么嵌（推荐嵌到 wisdom.html 智慧页）

打开 `wisdom.html`，找到**最底部**的 `</body>`，把下面整段粘贴到它**前面**，保存上传即可：

```html
<!-- ===== Colin 数字智库 · Web Components 挂载 ===== -->
<script src="components/widgets/mental-model-latticework.js"></script>
<script src="components/widgets/decision-checklist-modal.js"></script>

<section style="max-width:1200px;margin:60px auto;padding:0 20px;">
  <h2 style="text-align:center;margin:0 0 24px;">🧠 200 大跨学科思维模型 · 痛点诊所</h2>
  <mental-model-latticework src="data/mental-models-200.json"></mental-model-latticework>

  <h2 style="text-align:center;margin:56px 0 24px;">👑 200 条领袖原则</h2>
  <mental-model-latticework src="data/principles-grid.json"></mental-model-latticework>

  <h2 style="text-align:center;margin:56px 0 24px;">✅ 决策预检清单</h2>
  <div style="text-align:center;">
    <decision-checklist-modal src="data/decision-checklists.json" trigger="开始决策体检"></decision-checklist-modal>
  </div>
</section>
<!-- ===== 智库挂载结束 ===== -->
```

## 只想要一个区块？按需删减

| 想展示 | 保留哪段 |
|---|---|
| 只展示 200 思维模型（含痛点下拉 + 付费墙） | 第 1 个 `<mental-model-latticework src="data/mental-models-200.json">` |
| 只展示 200 领袖原则 | 第 2 个 `<mental-model-latticework src="data/principles-grid.json">` |
| 只展示决策清单 | `<decision-checklist-modal>` 那一段 |

## 嵌到其他页面也一样

任何页面（`index.html` / `products.html` 等）都通用，只需保证：
1. 两个 `<script>` 标签在页面里出现一次即可（重复引入无害，但没必要）；
2. `<mental-model-latticework>` 标签的 `src` 路径相对该页面正确（站点根目录下的页面直接用 `data/...` 即可）。

## ⚠️ 安全底线

- 不需要改动任何现有 CSS / 布局，组件样式全部隔离在 Shadow DOM 内；
- 组件自动跟随站点亮/暗主题（读取站点 CSS 变量）；
- 老代码零改动，粘贴的整段可随时整体删除，即贴即用、即删即净。
