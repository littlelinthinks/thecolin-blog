#!/bin/bash
# 自动部署脚本 - 双击运行

# 切换到项目目录
cd "/Users/colinying/Desktop/Personal Blog Website"

echo "========================================="
echo "   COLIN Blog - 自动部署脚本"
echo "========================================="
echo ""

# 步骤 1: 查看状态
echo "📋 步骤 1: 查看修改状态..."
echo ""
git status
echo ""

# 等待用户确认
read -p "确认推送这些修改吗？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 1
fi

# 步骤 2: 添加修改
echo ""
echo "➕ 步骤 2: 添加所有修改..."
git add -A
echo "✓ 已添加所有修改"
echo ""

# 步骤 3: 提交
echo "💾 步骤 3: 提交更改..."
git commit -m "修复导航栏：统一结构，移除内联样式，修正 lang-switcher 和 theme-switcher 位置"
echo "✓ 已提交"
echo ""

# 步骤 4: 推送
echo "🚀 步骤 4: 推送到 GitHub..."
git push
echo ""
echo "✓ 推送成功！"
echo ""

# 步骤 5: Vercel 自动部署
echo "⏳ Vercel 正在自动部署..."
echo ""
echo "========================================="
echo "   部署完成！"
echo "========================================="
echo ""
echo "📝 修改内容："
echo "   • products.html - 导航栏标准化"
echo "   • 支付页面模板.html - 完全重构导航栏"
echo "   • subscribe.html - 统一导航栏结构"
echo "   • archive.html - 移除内联样式"
echo ""
echo "🔗 您可以在 Vercel 控制台查看部署状态"
echo ""
