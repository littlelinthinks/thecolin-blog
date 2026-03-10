#!/usr/bin/env python3
"""批量修复所有发现的问题"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

def fix_buttons(filepath):
    """修复按钮 type 属性"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixed_count = 0
    
    # 修复没有 type 的 button 标签
    pattern = r'<button(?![^>]*\btype=)([^>]*)>'
    
    def add_type(match):
        nonlocal fixed_count
        fixed_count += 1
        attrs = match.group(1)
        # 如果是关闭按钮，添加 type="button"
        return f'<button type="button"{attrs}>'
    
    content = re.sub(pattern, add_type, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return fixed_count

def add_missing_titles():
    """添加缺失的 title 标签"""
    files_needing_title = {
        'products.html': '<title data-zh="资源套装 - 30 天实现成长蜕变 | COLIN" data-en="Resource Bundles - 30-Day Transformation | COLIN">资源套装 - 30 天实现成长蜕变 | COLIN</title>',
        'subscribe.html': '<title data-zh="订阅获取免费资源 - COLIN" data-en="Subscribe for Free Resources - COLIN">订阅获取免费资源 - COLIN</title>',
        '销售页面.html': '<title>销售页面 - COLIN</title>',
        'archive.html': '<title data-zh="文章归档 - COLIN" data-en="Archive - COLIN">文章归档 - COLIN</title>',
    }
    
    for filename, title_tag in files_needing_title.items():
        filepath = os.path.join(WORK_DIR, filename)
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '<title>' not in content:
                # 在 </head> 前添加 title
                content = content.replace('</head>', f'    {title_tag}\n</head>')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {filename}: 添加 title 标签")
            else:
                print(f"   {filename}: title 已存在")

def fix_sales_page_meta():
    """修复销售页面的 meta 标签"""
    filepath = os.path.join(WORK_DIR, '销售页面.html')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 添加 CSP
        if 'Content-Security-Policy' not in content:
            csp_tag = '    <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https: http:; font-src \'self\' data:; connect-src \'self\' https://www.google-analytics.com;">\n'
            content = content.replace('<meta charset="UTF-8">', f'<meta charset="UTF-8">\n{csp_tag}')
            print("✅ 销售页面.html: 添加 CSP")
        
        # 添加 viewport
        if 'viewport' not in content:
            viewport_tag = '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            content = content.replace('<meta charset="UTF-8">', f'<meta charset="UTF-8">\n{viewport_tag}')
            print("✅ 销售页面.html: 添加 viewport")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# 执行修复
print("="*70)
print("🔧 开始批量修复")
print("="*70)

# 1. 修复按钮
html_files = ['index.html', 'products.html', 'article.html', 'archive.html', 'subscribe.html', '404.html', 'wisdom.html', '销售页面.html', '支付页面模板.html', '销售页面完整版.html']

total_fixed = 0
for file in html_files:
    filepath = os.path.join(WORK_DIR, file)
    if os.path.exists(filepath):
        count = fix_buttons(filepath)
        if count > 0:
            print(f"✅ {file}: 修复 {count} 个按钮")
            total_fixed += count

print(f"\n总共修复：{total_fixed} 个按钮")

# 2. 添加缺失的 title
print("\n添加缺失的 title 标签:")
add_missing_titles()

# 3. 修复销售页面 meta
print("\n修复销售页面 meta 标签:")
fix_sales_page_meta()

print("\n" + "="*70)
print("✅ 批量修复完成！")
print("="*70)
