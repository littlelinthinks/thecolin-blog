thecolin.vip 插件上传包（B 筛选 + C 智囊团）
============================================

上传 4 个文件到 thecolin 仓库根目录（已存在同名文件的一律覆盖）：

  index.html            改造好的首页（只加了 3 处带 [colin-plugins] 注释的代码）
  mind-fold-filter.js   组件B：心智折叠筛选（文章列表上方细条，点开按分类筛选）
  advisory-widget.js    组件C：智囊团（文章区末尾，6 大师问答）
  api/advisory.js       后端（注意：在仓库新建 api 文件夹，放进去）

上传步骤：
  1. GitHub 进 thecolin 仓库 → Add file → Upload files
  2. 拖入 index.html、mind-fold-filter.js、advisory-widget.js（覆盖）
  3. 再 Add file → Create new file，命名 api/advisory.js，把文件内容粘进去
     （或者本地建 api 文件夹后整包拖入）
  4. Vercel 环境变量（可选）：加 DEEPSEEK_API_KEY = 你的 DeepSeek Key
     不加也能用——自动返回高质量演示诊断
  5. 等 1 分钟 → 打开 thecolin.vip 硬刷新（Ctrl/Cmd+Shift+R）

撤回方法：
  用你改动前的原始 index.html 覆盖回去，再删掉 3 个新文件即可，
  页面里所有组件代码都带 [colin-plugins] 注释标记，一搜就能找到。
