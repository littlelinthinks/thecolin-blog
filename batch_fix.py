#!/usr/bin/env python3
"""
批量修复网站所有 HTML 文件：
1. 统一 CSP 策略
2. 添加缺失的 meta 标签
3. 添加无障碍支持
"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

# 统一的 CSP 策略（允许 cdn.jsdelivr.net 用于 marked.js 等）
UNIFIED_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' https://api.github.com https://www.google-analytics.com;"

def update_csp(content, filepath):
    """更新 CSP 策略"""
    filename = os.path.basename(filepath)
    
    # 检查是否已有 CSP
    csp_pattern = r'<meta http-equiv="Content-Security-Policy"[^>]*>'
    existing_csp = re.search(csp_pattern, content)
    
    new_csp_tag = f'    <!-- Content Security Policy (统一策略) -->\n    <meta http-equiv="Content-Security-Policy" content="{UNIFIED_CSP}">\n'
    
    if existing_csp:
        # 替换现有 CSP
        content = re.sub(csp_pattern, new_csp_tag.strip(), content)
        print(f"  ✓ 更新 CSP: {filename}")
    else:
        # 在 meta charset 后添加 CSP
        content = content.replace(
            '<meta charset="UTF-8">',
            f'<meta charset="UTF-8">\n{new_csp_tag}'
        )
        print(f"  ✓ 添加 CSP: {filename}")
    
    return content

def add_missing_meta(content, filepath):
    """添加缺失的 meta 标签"""
    filename = os.path.basename(filepath)
    modified = False
    
    # 添加 canonical（如果没有）
    if '<link rel="canonical"' not in content and '</head>' in content:
        # 尝试从内容中提取 URL
        if 'thecolin.vip' in content:
            canonical = '    <link rel="canonical" href="https://thecolin.vip/">\n'
        else:
            canonical = '    <link rel="canonical" href="https://thecolin.vip/">\n'
        content = content.replace('</head>', f'{canonical}</head>')
        print(f"  ✓ 添加 canonical: {filename}")
        modified = True
    
    # 添加 Open Graph（如果没有）
    if '<meta property="og:type"' not in content and '</head>' in content:
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
        print(f"  ✓ 添加 Open Graph: {filename}")
        modified = True
    
    return content

def add_accessibility(content, filepath):
    """添加基础无障碍支持"""
    filename = os.path.basename(filepath)
    modified = False
    
    # 为主题切换按钮添加 aria-label（如果存在 theme-switcher 但没有 aria-label）
    if 'theme-switcher' in content and 'aria-label' not in content:
        content = content.replace(
            'class="theme-switcher"',
            'class="theme-switcher" aria-label="切换深色/浅色主题"'
        )
        print(f"  ✓ 添加主题按钮无障碍标签: {filename}")
        modified = True
    
    # 为语言切换按钮添加 aria-label
    if 'lang-btn' in content and 'aria-label' not in content:
        content = re.sub(
            r'class="lang-btn([^"]*)"',
            r'class="lang-btn\1" aria-label="切换语言"',
            content
        )
        print(f"  ✓ 添加语言按钮无障碍标签: {filename}")
        modified = True
    
    # 为导航链接添加 role
    if '<nav' in content and 'role="navigation"' not in content:
        content = content.replace('<nav', '<nav role="navigation"')
        print(f"  ✓ 添加导航 role: {filename}")
        modified = True
    
    return content

def fix_html_file(filepath):
    """修复单个 HTML 文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # 应用修复
        content = update_csp(content, filepath)
        content = add_missing_meta(content, filepath)
        content = add_accessibility(content, filepath)
        
        # 只有内容有变化才写入
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  ✗ 错误处理 {filepath}: {e}")
        return False

def main():
    os.chdir(WORK_DIR)
    
    print("=" * 60)
    print("开始批量修复网站 HTML 文件")
    print("=" * 60)
    print()
    
    # 获取所有 HTML 文件（排除备份文件）
    html_files = []
    for f in os.listdir('.'):
        if f.endswith('.html') and os.path.isfile(f):
            if 'backup' not in f.lower() and '模板' not in f:
                html_files.append(f)
    
    html_files.sort()
    
    print(f"找到 {len(html_files)} 个 HTML 文件:\n")
    for f in html_files:
        print(f"  - {f}")
    print()
    print("-" * 60)
    print("开始修复...\n")
    
    # 修复每个文件
    fixed_count = 0
    for html_file in html_files:
        filepath = os.path.join(WORK_DIR, html_file)
        print(f"处理：{html_file}")
        if fix_html_file(filepath):
            fixed_count += 1
    
    print()
    print("=" * 60)
    print(f"修复完成！")
    print(f"共处理 {len(html_files)} 个文件，修改 {fixed_count} 个")
    print("=" * 60)

if __name__ == "__main__":
    main()
