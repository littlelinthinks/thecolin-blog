#!/bin/bash

# 自动更新RSS、Sitemap并部署的脚本

echo "🚀 开始自动更新..."

# 生成 RSS Feed
echo "📝 生成 RSS Feed..."
python3 generate_rss.py

# 生成 Sitemap
echo "🗺️  生成 Sitemap..."
python3 generate_sitemap.py

# 添加所有文件到 Git
echo "📦 添加文件到 Git..."
git add -A

# 提交更改
echo "✅ 提交更改..."
git commit -m "Auto update: RSS and Sitemap ($(date +'%Y-%m-%d %H:%M'))"

# 推送到 GitHub
echo "📤 推送到 GitHub..."
git push

echo "✨ 完成！网站已更新并部署！"
