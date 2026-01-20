# 精选资源文件夹

此文件夹用于存放网站"精选资源"栏目的资源文件。

## 资源分类

### 1. 思考框架 (Thinking Frameworks)
- 思维模型、认知工具、决策框架等
- 推荐文件类型：PDF、Notion模板、思维导图等

### 2. 写作指南 (Writing Guide)
- 写作技巧、模板、习惯建立指南等
- 推荐文件类型：PDF、Markdown模板、Checklist等

### 3. 目标规划 (Goal Planning)
- 目标设定工具、追踪表格、规划模板等
- 推荐文件类型：Excel模板、PDF工具、Notion模板等

### 4. 学习方法 (Learning Methodology)
- 学习技巧、笔记系统、知识管理工具等
- 推荐文件类型：PDF、模板、工具包等

## 使用方法

1. 将资源文件放入对应的子文件夹中
2. 创建子文件夹（如果还没有）：
   - `thinking/` - 思考框架资源
   - `writing/` - 写作指南资源
   - `goals/` - 目标规划资源
   - `learning/` - 学习方法资源

3. 文件上传后，需要在 `index.html` 中更新对应的链接：
   - 找到 `id="resource-thinking"` 等对应的资源卡片
   - 修改 `<a href="#">` 中的链接指向您的资源文件
   - 示例：`<a href="resources/thinking/mind-models.pdf">免费获取 →</a>`

## 注意事项

- 建议文件名使用英文，避免特殊字符
- 文件大小建议不超过 10MB
- 压缩文件请提供清晰的说明文档
