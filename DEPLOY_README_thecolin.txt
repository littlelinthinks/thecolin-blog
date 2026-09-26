# thecolin.vip 部署包（2026-09-26）

新增内容：
- zhibo-zhiwang.html  —— 新长文《智伯之亡：从<资治通鉴>开篇看现代精英的"认知自负"与降维打击》（小Lin思考·天道人性）
- articles.json       —— 已加入该文章条目（url 指向 zhibo-zhiwang.html，首页/归档卡片点击即跳转）

部署步骤：
1. 解压本包，把 zhibo-zhiwang.html 与 articles.json 覆盖到仓库根目录（保持相对路径）。
2. git add . && git commit -m "add 智伯之亡 article" && git push
3. Vercel 自动部署。

说明：zhibo-zhiwang.html 复用站点 css/common.css + js/common.js + 真实导航/页脚，已修正 og/canonical。
控制台有一条无害告警（common.js 在文章页找不到首页专属元素），不影响渲染与交互。
