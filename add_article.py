#!/usr/bin/env python3
import json
import os
from datetime import datetime

# 文章数据文件
articles_file = "/Users/colinying/Desktop/Personal Blog Website/articles.json"

# 创建文章的模板
print("=" * 50)
print("添加新文章工具")
print("=" * 50)
print()

# 输入文章信息
title = input("文章标题: ")
title_en = input("英文标题 (按Enter使用中文): ") or title

print("\n选择类别:")
print("1. 小Lin记 (life)")
print("2. 小Lin析 (thinking)")
print("3. 小Lin读 (reading)")
print("4. 小Lin说 (history)")
category_choice = input("输入类别编号 (1-4): ")

category_map = {
    "1": {"id": "life", "name": "小Lin记", "en": "Life Philosophy"},
    "2": {"id": "thinking", "name": "小Lin析", "en": "Deep Thinking"},
    "3": {"id": "reading", "name": "小Lin读", "en": "Book Reviews"},
    "4": {"id": "history", "name": "小Lin说", "en": "History"}
}

category = category_map[category_choice]

# Markdown文件名
filename = f"{category['name']}_{datetime.now().strftime('%Y%m%d')}.md"

date_input = input("\n日期 (例如: 2026年1月19日, 按Enter使用今天): ")
if date_input:
    date = date_input
else:
    date = datetime.now().strftime("%Y年%m月%d日")
    date_en = datetime.now().strftime("%B %d, %Y")

date_en = input("英文日期 (例如: January 19, 2026, 按Enter自动生成): ") or datetime.now().strftime("%B %d, %Y")

excerpt = input("\n文章摘要: ")
excerpt_en = input("英文摘要 (按Enter使用中文): ") or excerpt

read_time = input("阅读时间 (例如: 3分钟阅读): ") or "3分钟阅读"
read_time_en = input("英文阅读时间 (例如: 3 min read): ") or "3 min read"

# 创建文章对象
article = {
    "id": f"{category['id']}-{datetime.now().strftime('%Y%m%d')}",
    "title": title,
    "titleEn": title_en,
    "filename": filename,
    "category": category['id'],
    "categoryEn": category['en'],
    "categoryName": category['name'],
    "date": date,
    "dateEn": date_en,
    "excerpt": excerpt,
    "excerptEn": excerpt_en,
    "readTime": read_time,
    "readTimeEn": read_time_en
}

# 读取现有文章
if os.path.exists(articles_file):
    with open(articles_file, 'r', encoding='utf-8') as f:
        articles = json.load(f)
else:
    articles = []

# 添加新文章
articles.insert(0, article)  # 添加到最前面

# 保存
with open(articles_file, 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print("\n" + "=" * 50)
print("✅ 文章添加成功!")
print("=" * 50)
print(f"标题: {title}")
print(f"类别: {category['name']}")
print(f"日期: {date}")
print(f"\n请创建Markdown文件: articles/{filename}")
print("\n然后运行: git add . && git commit -m 'add article' && git push")
print("=" * 50)
