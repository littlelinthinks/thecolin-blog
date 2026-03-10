#!/usr/bin/env python3
"""
批量修复网站文件：
1. 统一 CSP 策略
2. 添加无障碍支持
3. 优化 meta 标签
4. 压缩优化
"""

import os
import re
from datetime import datetime

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

# 统一的 CSP 策略
UNIFIED_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' https://api.github.com https://www.google-analytics.com;"

# 统一的 meta 标签模板
COMMON_META = '''    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy" content="{}">
    
    <!-- Google Fonts -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//www.googletagmanager.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Serif+SC:wght@300;400;500;700&family=Space+Mono&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Serif+SC:wght@300;400;500;700&family=Space+Mono&display=swap" rel="stylesheet"></noscript>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23000000' rx='12'/><text x='50' y='75' font-family='Georgia, Times New Roman, serif' font-size='72' font-weight='bold' fill='white' text-anchor='middle' letter-spacing='-1'>C</text></svg>">
    
    <!-- Common CSS and JS -->
    <link rel="stylesheet" href="/css/common.css">
    <script src="/js/common.js" defer></script>
    
    <!-- RSS Feed -->
    <link rel="alternate" type="application/rss+xml" title="COLIN's Blog RSS Feed" href="/rss.xml">'''.format(UNIFIED_CSP)

def fix_csp(content):
    """统一 CSP 策略"""
    # 移除旧的 CSP
    content = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '', content)
    # 添加新的 CSP 到 meta charset 之后
    new_csp = f'    <!-- Content Security Policy -->\n    <meta http-equiv="Content-Security-Policy" content="{UNIFIED_CSP}">\n'
    content = content.replace('<meta charset="UTF-8">', f'<meta charset="UTF-8">\n{new_csp}')
    return content

def add_accessibility(content):
    """添加无障碍支持"""
    # 为按钮添加 aria-label（如果没有）
    content = re.sub(r'<button([^>]*)(?<!aria-label)(?<!aria-labelledby)([^>]*)>', 
                     lambda m: f'<button{m.group(1)} aria-label="按钮"{m.group(2)}>' if 'aria-label' not in m.group(0) else m.group(0), content)
    
    # 为导航链接添加 aria-label
    content = re.sub(r'<a([^>]*class="nav-links"[^>]*)>', 
                     lambda m: m.group(0).replace('>', ' aria-label="导航链接">') if 'aria-label' not in m.group(0) else m.group(0), content)
    
    return content

def optimize_meta(content):
    """优化 meta 标签"""
    # 确保有 canonical
    if '<link rel="canonical"' not in content:
        content = content.replace('</head>', '    <link rel="canonical" href="https://thecolin.vip/">\n</head>')
    
    # 确保有 Open Graph
    if '<meta property="og:type"' not in content:
        og_tags = '''    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://thecolin.vip/">
    <meta property="og:title" content="COLIN - 探索深邃思想">
    <meta property="og:description" content="深度思考 · 终身学习 · 持续成长">
    <meta property="og:image" content="https://thecolin.vip/og-image.jpg">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://thecolin.vip/">
    <meta property="twitter:title" content="COLIN - 探索深邃思想">
    <meta property="twitter:description" content="深度思考 · 终身学习 · 持续成长">
    <meta property="twitter:image" content="https://thecolin.vip/og-image.jpg">
'''
        content = content.replace('</head>', f'{og_tags}</head>')
    
    return content

def fix_html_file(filepath):
    """修复单个 HTML 文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 应用修复
    content = fix_csp(content)
    content = add_accessibility(content)
    content = optimize_meta(content)
    
    # 只有内容有变化才写入
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ 修复：{filepath}")
        return True
    else:
        print(f"- 无需修改：{filepath}")
        return False

def main():
    os.chdir(WORK_DIR)
    
    print("=== 开始批量修复网站文件 ===\n")
    
    # 获取所有 HTML 文件
    html_files = []
    for f in os.listdir('.'):
        if f.endswith('.html') and os.path.isfile(f):
            html_files.append(f)
    
    print(f"找到 {len(html_files)} 个 HTML 文件:\n")
    for f in html_files:
        print(f"  - {f}")
    print()
    
    # 修复每个文件
    fixed_count = 0
    for html_file in html_files:
        if fix_html_file(html_file):
            fixed_count += 1
    
    print(f"\n=== 修复完成 ===")
    print(f"共处理 {len(html_files)} 个文件，修复 {fixed_count} 个")

if __name__ == "__main__":
    main()
