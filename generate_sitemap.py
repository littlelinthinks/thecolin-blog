#!/usr/bin/env python3
"""
自动生成 Sitemap.xml
"""
import json
from datetime import datetime
import os

def generate_sitemap():
    # 基础 URL
    base_url = 'https://thecolin.vip'

    # 读取文章数据
    articles = []
    if os.path.exists('articles.json'):
        with open('articles.json', 'r', encoding='utf-8') as f:
            articles = json.load(f)

    # 当前日期
    current_date = datetime.now().strftime('%Y-%m-%d')

    # Sitemap 内容
    sitemap_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'''

    # 首页
    sitemap_content += f'''
  <url>
    <loc>{base_url}/</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>'''

    # 产品页
    sitemap_content += f'''
  <url>
    <loc>{base_url}/products.html</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>'''

    # 文章列表页（如果有的话）
    sitemap_content += f'''
  <url>
    <loc>{base_url}/index.html#articles</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>'''

    # 所有文章页
    for article in articles:
        # 解析日期
        try:
            date_str = article.get('date', '')
            if '年' in date_str:
                date_str = date_str.replace('年', '-').replace('月', '-').replace('日', '')
                lastmod = datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
            elif ',' in date_str:
                lastmod = datetime.strptime(date_str, '%B %d, %Y').strftime('%Y-%m-%d')
            else:
                lastmod = current_date
        except:
            lastmod = current_date

        article_url = f"{base_url}/article.html?id={article['id']}"

        sitemap_content += f'''
  <url>
    <loc>{article_url}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>'''

    # 结束标签
    sitemap_content += '''
</urlset>'''

    # 保存文件
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)

    total_urls = 3 + len(articles)  # 首页 + 产品页 + 文章列表 + 所有文章
    print(f"✅ Sitemap 已生成，包含 {total_urls} 个URL")
    print(f"📄 文件: sitemap.xml")
    print(f"   - 首页: 1")
    print(f"   - 产品页: 1")
    print(f"   - 文章列表: 1")
    print(f"   - 文章页: {len(articles)}")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    generate_sitemap()
