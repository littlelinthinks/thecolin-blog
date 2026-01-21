#!/usr/bin/env python3
import os
import json
import re
from datetime import datetime

# 文章目录
articles_dir = "/Users/colinying/Desktop/Personal Blog Website/articles"

# 类别映射
category_map = {
    "小Lin记": "life",
    "小Lin析": "thinking",
    "小Lin读": "reading",
    "小Lin说": "history"
}

category_en_map = {
    "life": "Life Philosophy",
    "thinking": "Deep Thinking",
    "reading": "Book Reviews",
    "history": "History"
}

# 读取文章文件并提取信息
def parse_article(filename, content):
    # 提取标题 (第一个#开头的行)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else os.path.splitext(filename)[0]

    # 提取类别
    category = "thinking"
    category_name = "小Lin析"
    if "小Lin记" in filename or "小林记" in filename:
        category = "life"
        category_name = "小Lin记"
    elif "小Lin读" in filename or "小林读" in filename:
        category = "reading"
        category_name = "小Lin读"
    elif "小Lin说" in filename or "小林说" in filename:
        category = "history"
        category_name = "小Lin说"

    # 提取日期
    date = "2026年1月1日"
    date_en = "January 1, 2026"
    date_match = re.search(r'W(\d+)_(\d{4})', filename)
    if date_match:
        week_num = int(date_match.group(1))
        day_num = int(date_match.group(2))
        # 简单估算: W1=1月, W2=1月, W3=1月, W4=1月, W5=2月...
        month = 1 + (week_num - 1) // 4
        month = min(month, 3)  # 最多3个月
        day = day_num
        try:
            date = f"2026年{month}月{day}日"
            date_en = datetime(2026, month, day).strftime("%B %d, %Y")
        except:
            date = f"2026年{month}月1日"
            date_en = datetime(2026, month, 1).strftime("%B 1, %Y")

    # 提取摘要 (第一段文字)
    excerpt = ""
    lines = content.split('\n')
    for line in lines[1:15]:
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('-') and not line.startswith('*') and not line.startswith('_'):
            if len(excerpt) + len(line) < 200:
                excerpt += line + " "
            else:
                break

    # 计算阅读时间
    word_count = len(content)
    read_time = max(3, word_count // 500)
    read_time_str = f"{read_time}分钟阅读"
    read_time_en = f"{read_time} min read"

    return {
        "id": filename.replace('\\', '-').replace('_', '-').replace('.md', '').lower(),
        "title": title,
        "titleEn": title,
        "filename": filename,
        "category": category,
        "categoryEn": category_en_map[category],
        "categoryName": category_name,
        "date": date,
        "dateEn": date_en,
        "excerpt": excerpt.strip(),
        "excerptEn": excerpt.strip(),
        "readTime": read_time_str,
        "readTimeEn": read_time_en
    }

# 遍历所有MD文件
articles = []
for filename in os.listdir(articles_dir):
    if filename.endswith('.md'):
        filepath = os.path.join(articles_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            article_info = parse_article(filename, content)
            articles.append(article_info)
            print(f"Processed: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

# 按日期排序
articles.sort(key=lambda x: x['date'], reverse=True)

# 保存JSON
output_path = "/Users/colinying/Desktop/Personal Blog Website/articles.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(articles, f, ensure_ascii=False, indent=2)

print(f"\n✅ Generated {len(articles)} articles!")
print(f"📁 Saved to: {output_path}")
