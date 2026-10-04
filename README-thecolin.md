# thecolin 智库升级包（个人数字花园与决策工具）

> ⚠️ **安全底线**：本包只在你的仓库**新增**以下目录与文件，**100% 不改动**任何现有代码 / 路由 / 全局样式。
> 撤销方法：删除本包新增的 `components/`、`data/` 两个目录即可，零残留。

## 目录结构（请整包拖进仓库根目录）

```
thecolin-site/
├── components/widgets/
│   ├── decision-checklist-modal.js  # 186 原则 · 可交互决策检查清单（数据驱动）
│   └── mental-model-latticework.js  # 186 原则 · 思维模型网格（数据驱动 + 场景过滤）
├── data/
│   ├── decision-checklists.json     # 决策预检清单（12 项，覆盖内置 7 项）
│   └── principles-grid.json         # 186 原则网格（22 条代表性原则 + 7 个场景）
└── 智库组件展示.html               # 演示页（可选，勿覆盖 index.html）
```

> 说明："186 原则" 是站点品牌名。本包先交付 **22 条代表性原则 + 12 项决策预检**，数据结构已就绪——
> 你只要在 `data/principles-grid.json` 的 `grids` 数组里继续追加条目（复制一条改文字即可），即可平滑扩到 186 条，组件无需改动。

## 上线步骤

1. 把 `components/`、`data/` 两个目录**整包拖进 thecolin 仓库根目录** → Commit → Vercel 自动部署。
2. 想在某个页面嵌入组件，在目标位置放标签、`</body>` 前加对应 script：

   **186 原则决策检查清单**：
   ```html
   <decision-checklist-modal src="data/decision-checklists.json" trigger="开始决策体检 · 186 原则"></decision-checklist-modal>
   <script src="components/widgets/decision-checklist-modal.js"></script>
   ```
   **186 原则思维模型网格（带场景过滤）**：
   ```html
   <mental-model-latticework src="data/principles-grid.json"></mental-model-latticework>
   <script src="components/widgets/mental-model-latticework.js"></script>
   ```

## 技术说明

- 全部为**纯静态 Web Components + Shadow DOM，零依赖**，样式完全隔离，不碰老站 CSS。
- 两个组件均数据驱动：运行时 `fetch` 对应 JSON；JSON 缺失或路径错误时，自动回退到内置数据（检查清单 7 项 / 网格 5 模型），不会白屏。
- 场景过滤器：当 JSON 的 `scenes` 字段多于 1 项时，网格顶部自动出现场景 chip，点击按场景筛选项。
- 已用无头浏览器实跑验证：检查清单勾选 → 进度条 + 实时评估报告正常；原则网格场景过滤、点开详解正常。

## 撤销

删除 `components/`、`data/` 两个目录即可，老站一切照旧。
