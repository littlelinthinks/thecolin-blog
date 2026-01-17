#!/bin/bash

# COLIN博客快速部署脚本
# 使用Vercel一键部署

echo "🚀 开始部署 www.thecolin.com"
echo "================================"

# 检查是否安装了git
if ! command -v git &> /dev/null; then
    echo "❌ 错误：未安装git，请先安装git"
    exit 1
fi

# 检查是否已经是git仓库
if [ ! -d .git ]; then
    echo "📦 初始化Git仓库..."
    git init
    git add .
    git commit -m "Initial commit: COLIN personal blog"
    echo "✅ Git仓库初始化完成"
else
    echo "✅ Git仓库已存在"
fi

echo ""
echo "📝 接下来的步骤："
echo "1. 在GitHub创建新仓库：https://github.com/new"
echo "2. 仓库名建议：thecolin-blog"
echo "3. 执行以下命令连接远程仓库："
echo ""
echo "   git remote add origin https://github.com/你的用户名/thecolin-blog.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. 访问 https://vercel.com 部署网站"
echo "   - 导入GitHub仓库"
echo "   - 一键部署"
echo "   - 添加域名 www.thecolin.com"
echo ""
echo "================================"
echo "📖 详细说明请查看：网站部署指南.md"
