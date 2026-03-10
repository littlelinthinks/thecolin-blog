#!/usr/bin/env python3
"""修复所有 HTML 文件中的按钮，添加 type="button" 属性"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

def fix_buttons(filepath):
    """修复单个文件中的按钮"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixed_count = 0
    
    # 匹配没有 type 属性但有 onclick 的 button 标签
    pattern = r'<button(?![^>]*\btype=)([^>]*onclick="[^"]*"[^>]*)>'
    
    def add_type(match):
        nonlocal fixed_count
        fixed_count += 1
        return f'<button type="button"{match.group(1)}>'
    
    content = re.sub(pattern, add_type, content)
    
    # 也修复没有 onclick 但在模态框内的按钮
    if 'coffee-modal' in filepath or 'modal' in content:
        pattern2 = r'<button(?![^>]*\btype=)([^>]*class="[^"]*btn[^"]*"[^>]*)>'
        content = re.sub(pattern2, add_type, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return fixed_count

os.chdir(WORK_DIR)

html_files = [
    'index.html',
    'products.html',
    'article.html',
    'archive.html',
    'subscribe.html',
    '404.html',
    'wisdom.html'
]

print("=" * 60)
print("🔧 修复所有按钮的 type 属性")
print("=" * 60)

total_fixed = 0
for file in html_files:
    if os.path.exists(file):
        count = fix_buttons(file)
        if count > 0:
            print(f"✅ {file}: 修复 {count} 个按钮")
            total_fixed += count
        else:
            print(f"   {file}: 无需修复")

print("=" * 60)
print(f"总共修复：{total_fixed} 个按钮")
print("=" * 60)
