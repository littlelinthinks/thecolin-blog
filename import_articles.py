#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import csv

# 基础目录
base_dir = "/Users/colinying/Desktop/公众号/小Lin思考公众号文章_完整版_20260116"
output_csv = "/Users/colinying/Desktop/notion_import_articles.csv"

# 查找所有文章文件
article_files = []
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.md') and 'W' in file and not any(x in file for x in ['说明', '索引', '报告', '目录']):
            filepath = os.path.join(root, file)
            article_files.append(filepath)

print(f"找到 {len(article_files)} 篇文章")

# 解析文件名
def parse_filename(filename):
    pattern = r'W(\d+)_(\d{4})_(\w+)_(小Lin[记析读说])_(.+)\.md'
    match = re.search(pattern, filename)
    if match:
        week, date, day, column, title = match.groups()
        return week, date, day, column, title
    return None, None, None, None, None

# 读取文件内容
def read_file_content(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        return ""

# 列名映射
column_map = {
    '小Lin记': '随笔',
    '小Lin析': '分析',
    '小Lin读': '读书',
    '小Lin说': '讲述'
}

# 创建CSV数据
csv_data = []
csv_data.append(['Name', 'Title', 'Content', 'Column', 'Date', 'Day', 'Week', 'Tags', 'Status'])

for filepath in sorted(article_files):
    filename = os.path.basename(filepath)
    week, date, day, column, title = parse_filename(filename)
    
    if not title:
        continue
    
    content = read_file_content(filepath)
    column_cn = column_map.get(column, column)
    
    # 构建日期
    full_date = f"2026-{date[:2]}-{date[2:]}"
    
    # 标签推断
    if '心理学' in title:
        tags = '心理学'
    elif '历史' in title:
        tags = '历史'
    elif '天道' in title:
        tags = '天道'
    else:
        tags = column_cn
    
    # 状态
    status = '已发布'
    
    csv_data.append([title, title, content, column_cn, full_date, day, week, tags, status])

# 写入CSV
with open(output_csv, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(csv_data)

print(f"CSV文件已生成: {output_csv}")
print(f"共导入 {len(article_files)} 篇文章")
