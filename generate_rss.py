#!/usr/bin/env python3
"""
从 articles.json 自动生成 RSS Feed
"""
import json
from datetime import datetime
import os

def generate_rss():
    # 读取文章数据
    with open('articles.json', 'r', encoding='utf-8') as f:
        articles = json.load(f)

    # RSS 头部
    rss_content = '''<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>COLIN - 探索深邃思想</title>
    <link>https://thecolin.vip</link>
    <description>专注于深度思考、终身学习和个人成长的思想分享平台</description>
    <language>zh-cn</language>
    <lastBuildDate>{lastBuildDate}</lastBuildDate>
    <atom:link href="https://thecolin.vip/rss.xml" rel="self" type="application/rss+xml" />
'''

    # 当前时间
    current_date = datetime.now().strftime('%a, %d %b %Y %H:%M:%S GMT')
    rss_content = rss_content.format(lastBuildDate=current_date)

    # 添加每篇文章
    for article in articles:
        # 解析日期
        try:
            # 尝试解析中文日期格式
            date_str = article.get('date', '')
            if '年' in date_str:
                # 2026年1月21日 -> Jan 21, 2026
                date_str = date_str.replace('年', '-').replace('月', '-').replace('日', '')
                pub_date = datetime.strptime(date_str, '%Y-%m-%d').strftime('%a, %d %b %Y %H:%M:%S GMT')
            elif ',' in date_str:
                # January 21, 2026 -> Jan 21, 2026
                pub_date = datetime.strptime(date_str, '%B %d, %Y').strftime('%a, %d %b %Y %H:%M:%S GMT')
            else:
                pub_date = current_date
        except:
            pub_date = current_date

        # 文章链接
        article_url = f"https://thecolin.vip/article.html?id={article['id']}"

        # 摘要（中英文优先中文）
        description = article.get('excerpt', article.get('excerptEn', ''))

        # RSS条目
        item = f'''
    <item>
        <title>{article['title']}</title>
        <link>{article_url}</link>
        <guid>{article_url}</guid>
        <pubDate>{pub_date}</pubDate>
        <description><![CDATA[{description}]]></description>
        <category>{article.get('categoryName', '个人成长')}</category>
        <author>COLIN</author>
    </item>'''

        rss_content += item

    # RSS 尾部
    rss_content += '''
</channel>
</rss>'''

    # 保存 RSS 文件
    with open('rss.xml', 'w', encoding='utf-8') as f:
        f.write(rss_content)

    print(f"✅ RSS Feed 已生成，包含 {len(articles)} 篇文章")
    print(f"📄 文件: rss.xml")

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    generate_rss()
