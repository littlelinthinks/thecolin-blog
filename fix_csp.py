#!/usr/bin/env python3
"""修复所有 HTML 文件的 CSP 问题"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

# 正确的 CSP（包含 Google Fonts）
CORRECT_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https: http:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://www.google-analytics.com;"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 移除所有重复的 CSP 注释
    content = re.sub(r'<!-- Content Security Policy \(统一策略\) -->\s*<!-- Content Security Policy \(统一策略\) -->', 
                     '<!-- Content Security Policy (统一策略) -->', content)
    
    # 替换 CSP 为正确版本
    csp_pattern = r'<meta http-equiv="Content-Security-Policy"[^>]*>'
    new_csp = f'<meta http-equiv="Content-Security-Policy" content="{CORRECT_CSP}">'
    content = re.sub(csp_pattern, new_csp, content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ 修复：{os.path.basename(filepath)}")
        return True
    return False

os.chdir(WORK_DIR)
html_files = [f for f in os.listdir('.') if f.endswith('.html') and 'backup' not in f.lower() and '模板' not in f]

print(f"修复 {len(html_files)} 个文件的 CSP...\n")
for f in html_files:
    fix_file(os.path.join(WORK_DIR, f))

print("\n完成！")
