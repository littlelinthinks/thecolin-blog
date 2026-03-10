#!/usr/bin/env python3
"""修复所有 HTML 文件的 CSP，添加 Cloudflare 域名"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

CORRECT_CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://www.googletagmanager.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; img-src 'self' data: https: http:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://www.google-analytics.com;"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    csp_pattern = r'<meta http-equiv="Content-Security-Policy"[^>]*>'
    new_csp = f'<meta http-equiv="Content-Security-Policy" content="{CORRECT_CSP}">'
    content = re.sub(csp_pattern, new_csp, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✓ {os.path.basename(filepath)}")

os.chdir(WORK_DIR)
html_files = [f for f in os.listdir('.') if f.endswith('.html') and 'backup' not in f.lower() and '模板' not in f]

for f in html_files:
    fix_file(os.path.join(WORK_DIR, f))

print("\n完成！")
