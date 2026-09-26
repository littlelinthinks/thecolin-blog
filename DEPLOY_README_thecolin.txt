# thecolin.vip 部署包（生成于 2026-09-26_1710）

新增内容：
- zhibo-zhiwang.html  —— 新长文《智伯之亡：从<资治通鉴>开篇看现代精英的"认知自负"与降维打击》（小Lin思考·天道人性）
- articles.json       —— 已加入该文章条目（url 指向 zhibo-zhiwang.html，首页/归档卡片点击即跳转）

部署步骤：
1. 解压本包，把 zhibo-zhiwang.html 与 articles.json 覆盖到仓库根目录（保持相对路径）。
2. git add . && git commit -m "add 智伯之亡 article" && git push
3. Vercel 自动部署。

质量说明（本版已修复）：
- 文章页已从「首页整页克隆体（4235 行）」精简为干净文章页（约 3048 行）：删除了约 1200 行首页专属死脚本（文章网格/搜索/语言 SPA 等），
  仅保留本页真正用到的 footer 弹窗与分享函数，并修复了打赏弹窗币种切换依赖全局 event 的历史隐患。
- 控制台零报错、零横向溢出；导航/主题/双语/打赏/微信弹窗均正常。
- og / canonical 已修正为文章页。
