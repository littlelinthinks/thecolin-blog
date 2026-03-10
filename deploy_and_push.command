#!/bin/bash
cd "/Users/colinying/Desktop/Personal Blog Website"

echo "=== 开始推送代码到 GitHub ==="
echo ""

echo "1. 查看修改状态..."
git status
echo ""

echo "2. 添加所有修改..."
git add -A
echo "✓ 已添加"
echo ""

echo "3. 提交更改..."
git commit -m "修复导航栏：统一结构，移除内联样式，修正 lang-switcher 和 theme-switcher 位置"
echo "✓ 已提交"
echo ""

echo "4. 推送到 GitHub..."
git push
echo "✓ 推送成功！"
echo ""

echo "=== 部署完成 ==="
echo "Vercel 将自动检测到更新并重新部署网站"
echo ""
echo "您可以在 Vercel 控制台查看部署状态"
