#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix navigation bar in 支付页面模板.html to remove inline styles and add proper structure"""

import re
import os

# Read the file
filepath = '/Users/colinying/Desktop/Personal Blog Website/支付页面模板.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the inline style block inside nav
content = re.sub(r'        <style>.*?    </style>\n    </nav>', '    </nav>', content, flags=re.DOTALL)

# 2. Fix nav links structure - replace inline styles with classes
# Replace the first link (首页)
content = re.sub(
    r'<li><a href="index\.html" data-zh="首页" data-en="Home" style="[^"]*">首页</a></li>',
    '<li><a href="index.html" data-zh="首页" data-en="Home">首页</a></li>',
    content
)

# Replace articles dropdown trigger
content = re.sub(
    r'<li style="position: relative;">\s*<a href="#articles" data-zh="文章" data-en="Articles" style="[^"]*">',
    '<li class="nav-dropdown">\n                        <a href="#articles" data-zh="文章" data-en="Articles">',
    content
)

# Fix article dropdown arrow
content = re.sub(
    r'<span style="[^"]*">▼</span>',
    '<span class="dropdown-arrow">▼</span>',
    content
)

# Fix article dropdown menu
content = re.sub(
    r'<ul style="position: absolute; top: 100%; left: 0; background: var\(--bg-card\); min-width: 200px; border-radius: 8px; box-shadow: 0 4px 20px rgba\(0,0,0,0\.15\); border: 1px solid var\(--border\); opacity: 0; visibility: hidden; transform: translateY\(10px\); transition: all 0\.3s ease; padding: 0\.5rem 0; z-index: 1000; list-style: none; margin: 0; padding: 0;">\s*<li><a href="archive\.html" data-zh="📚 文章归档" data-en="📚 Archive" style="display: block; padding: 0\.6rem 1rem; color: var\(--text-secondary\); text-decoration: none; transition: all 0\.2s; font-size: 0\.9rem; white-space: nowrap;">📚 文章归档</a></li>\s*</ul>',
    '<ul class="dropdown-menu">\n                            <li><a href="archive.html" data-zh="📚 文章归档" data-en="📚 Archive">📚 文章归档</a></li>\n                        </ul>',
    content
)

# Fix resources dropdown trigger
content = re.sub(
    r'<li style="position: relative;">\s*<a href="#resources" data-zh="精选资源" data-en="Resources" style="[^"]*">',
    '<li class="nav-dropdown">\n                        <a href="#resources" data-zh="精选资源" data-en="Resources">',
    content
)

# Fix resources dropdown menu opening
content = re.sub(
    r'<ul style="position: absolute; top: 100%; left: 0; background: var\(--bg-card\); min-width: 280px; border-radius: 8px; box-shadow: 0 4px 20px rgba\(0,0,0,0\.15\); border: 1px solid var\(--border\); opacity: 0; visibility: hidden; transform: translateY\(10px\); transition: all 0\.3s ease; padding: 0\.5rem 0; z-index: 1000; list-style: none; margin: 0; padding: 0;">',
    '<ul class="dropdown-menu">',
    content
)

# Fix dropdown sections
content = re.sub(
    r'<li style="position: relative;">\s*<a href="products\.html\?category=(\w+)" data-zh="([^"]+)" data-en="([^"]+)" style="font-weight: bold; color: var\(--text-primary\); padding: 0\.7rem 1rem; display: flex; align-items: center; gap: 0\.5rem;">([^<]+)</a>',
    r'<li class="dropdown-section">\n                            <a href="products.html?category=\1" data-zh="\2" data-en="\3" style="font-weight: bold; color: var(--accent);">\4</a>',
    content
)

# Fix dropdown submenus
content = re.sub(
    r'<ul style="position: absolute; left: 100%; top: 0; background: var\(--bg-card\); min-width: 200px; border-radius: 8px; box-shadow: 0 4px 20px rgba\(0,0,0,0\.15\); border: 1px solid var\(--border\); opacity: 0; visibility: hidden; transform: translateX\(-10px\); transition: all 0\.3s ease; padding: 0\.5rem 0; z-index: 1001; list-style: none; margin: 0; padding: 0;">',
    '<ul class="dropdown-submenu">',
    content
)

# Fix all submenu links
content = re.sub(
    r'<li><a href="products\.html\?category=\w+#[^"]*" data-zh="[^"]*" data-en="[^"]*" style="display: block; padding: 0\.5rem 1rem; color: var\(--text-secondary\); text-decoration: none; transition: all 0\.2s; font-size: 0\.85rem; white-space: nowrap;">([^<]+)</a></li>',
    r'<li><a href="#">\1</a></li>',
    content
)

# Fix subscribe link
content = re.sub(
    r'<li><a href="subscribe\.html" data-zh="订阅" data-en="Subscribe" style="[^"]*">订阅</a></li>',
    '<li><a href="subscribe.html" data-zh="订阅" data-en="Subscribe">订阅</a></li>',
    content
)

# Fix language switcher
content = re.sub(
    r'<li>\s*<div style="display: flex; gap: 0\.5rem;">\s*<button class="lang-btn" data-lang="zh" style="[^"]*" aria-label="中文" aria-pressed="true">中文</button>\s*<button class="lang-btn" data-lang="en" style="[^"]*" aria-label="English" aria-pressed="false">EN</button>\s*</div>\s*</li>',
    '<div class="lang-switcher">\n                    <button class="lang-btn active" data-lang="zh">中文</button>\n                    <button class="lang-btn" data-lang="en">EN</button>\n                </div>',
    content
)

# Fix theme switcher
content = re.sub(
    r'<li>\s*<button class="theme-switcher" aria-label="[^"]*" aria-pressed="false" role="switch" style="[^"]*">\s*<span class="theme-icon" aria-hidden="true">🌙</span>\s*</button>\s*</li>',
    '<button class="theme-switcher" aria-label="Toggle theme">\n                    <span class="theme-icon">🌙</span>\n                </button>',
    content
)

# Close nav-right div properly
content = re.sub(
    r'</ul>\s*</div>\s*</nav>',
    '</div>\n            </div>\n        </div>\n    </nav>',
    content
)

# Save the file
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed 支付页面模板.html")
