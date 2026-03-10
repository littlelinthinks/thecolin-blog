#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix navigation bar in products.html, 销售页面完整版.html, and 支付页面模板.html"""

import re
import os

# The working navigation structure from index.html
NAV_STRUCTURE = '''    <!-- 导航栏 -->
    <nav>
        <div class="nav-container">
            <a href="index.html" class="logo">COLIN</a>
            <div class="nav-right">
                <ul class="nav-links">
                    <li><a href="index.html" data-zh="首页" data-en="Home">首页</a></li>
                    <li class="nav-dropdown">
                        <a href="#articles" data-zh="文章" data-en="Articles">
                            <span data-zh="文章" data-en="Articles">文章</span>
                            <span class="dropdown-arrow">▼</span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="archive.html" data-zh="📚 文章归档" data-en="📚 Archive">📚 文章归档</a></li>
                        </ul>
                    </li>
                    <li class="nav-dropdown">
                        <a href="#resources" data-zh="精选资源" data-en="Resources">
                            <span data-zh="精选资源" data-en="Resources">精选资源</span>
                            <span class="dropdown-arrow">▼</span>
                        </a>
                        <ul class="dropdown-menu">
                            <li class="dropdown-section">
                                <a href="products.html?category=writing" data-zh="✍️ 写作指南" data-en="✍️ Writing Guide" style="font-weight: bold; color: var(--accent);">✍️ 写作指南</a>
                                <ul class="dropdown-submenu">
                                    <li><a href="products.html?category=writing#payment-writing-single" data-zh="📝 写作模板大全（¥49）" data-en="📝 Writing Templates (¥49)">📝 写作模板大全（¥49）</a></li>
                                    <li><a href="products.html?category=writing#payment-writing-single" data-zh="🎯 爆款标题库（¥39）" data-en="🎯 Viral Title Library (¥39)">🎯 爆款标题库（¥39）</a></li>
                                    <li><a href="products.html?category=writing#payment-writing-single" data-zh="📬 Newsletter指南（¥39）" data-en="📬 Newsletter Guide (¥39)">📬 Newsletter指南（¥39）</a></li>
                                    <li><a href="products.html?category=writing#payment-writing-single" data-zh="🎨 Notion模板（¥29）" data-en="🎨 Notion Templates (¥29)">🎨 Notion模板（¥29）</a></li>
                                    <li><a href="products.html?category=writing#payment-writing" data-zh="🔥 写作套装（¥99）" data-en="🔥 Writing Bundle (¥99)" style="font-weight: bold; color: var(--accent);">🔥 写作套装（¥99）</a></li>
                                </ul>
                            </li>
                            <li class="dropdown-section">
                                <a href="products.html?category=goals" data-zh="🎯 目标规划" data-en="🎯 Goal Planning" style="font-weight: bold; color: var(--accent);">🎯 目标规划</a>
                                <ul class="dropdown-submenu">
                                    <li><a href="products.html?category=goals#payment-goals-single" data-zh="🎯 Notion目标系统（¥49）" data-en="🎯 Notion Goal System (¥49)">🎯 Notion目标系统（¥49）</a></li>
                                    <li><a href="products.html?category=goals#payment-goals-single" data-zh="📊 年度规划模板（¥29）" data-en="📊 Annual Planning Template (¥29)">📊 年度规划模板（¥29）</a></li>
                                    <li><a href="products.html?category=goals#payment-goals-single" data-zh="📈 Excel追踪表（¥19）" data-en="📈 Excel Tracker (¥19)">📈 Excel追踪表（¥19）</a></li>
                                    <li><a href="products.html?category=goals#payment-goals" data-zh="🔥 目标套装（¥79）" data-en="🔥 Goal Bundle (¥79)" style="font-weight: bold; color: var(--accent);">🔥 目标套装（¥79）</a></li>
                                </ul>
                            </li>
                            <li class="dropdown-section">
                                <a href="products.html?category=thinking" data-zh="🧠 思维模型" data-en="🧠 Mental Models" style="font-weight: bold; color: var(--accent);">🧠 思维模型</a>
                                <ul class="dropdown-submenu">
                                    <li><a href="products.html?category=thinking#payment-thinking-single" data-zh="🧠 第一性原理（¥39）" data-en="🧠 First Principles (¥39)">🧠 第一性原理（¥39）</a></li>
                                    <li><a href="products.html?category=thinking#payment-thinking-single" data-zh="🔄 逆向思维（¥39）" data-en="🔄 Inverse Thinking (¥39)">🔄 逆向思维（¥39）</a></li>
                                    <li><a href="products.html?category=thinking#payment-thinking-single" data-zh="🌐 系统思考（¥49）" data-en="🌐 Systems Thinking (¥49)">🌐 系统思考（¥49）</a></li>
                                    <li><a href="products.html?category=thinking#payment-thinking" data-zh="🔥 思维套装（¥79）" data-en="🔥 Thinking Bundle (¥79)" style="font-weight: bold; color: var(--accent);">🔥 思维套装（¥79）</a></li>
                                </ul>
                            </li>
                            <li class="dropdown-section">
                                <a href="products.html?category=learning" data-zh="📚 学习方法" data-en="📚 Learning Methods" style="font-weight: bold; color: var(--accent);">📚 学习方法</a>
                                <ul class="dropdown-submenu">
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="📚 主动学习法（¥39）" data-en="📚 Active Learning (¥39)">📚 主动学习法（¥39）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="🎯 费曼技巧（¥39）" data-en="🎯 Feynman Technique (¥39)">🎯 费曼技巧（¥39）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="📖 间隔重复（¥39）" data-en="📖 Spaced Repetition (¥39)">📖 间隔重复（¥39）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning" data-zh="🔥 学习套装（¥79）" data-en="🔥 Learning Bundle (¥79)" style="font-weight: bold; color: var(--accent);">🔥 学习套装（¥79）</a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><a href="subscribe.html" data-zh="订阅" data-en="Subscribe">订阅</a></li>
                </ul>
                <div class="lang-switcher">
                    <button class="lang-btn active" data-lang="zh">中文</button>
                    <button class="lang-btn" data-lang="en">EN</button>
                </div>
                <button class="theme-switcher" aria-label="Toggle theme">
                    <span class="theme-icon">🌙</span>
                </button>
            </div>
        </div>
    </nav>
'''

# CSS to add for navigation
NAV_CSS = '''
        /* Navigation styles */
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            font-family: Georgia, serif;
            color: var(--text-primary);
            text-decoration: none;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
            align-items: center;
            margin: 0;
            padding: 0;
        }

        .nav-links a {
            color: var(--text-primary);
            text-decoration: none;
            transition: color 0.3s;
            font-size: 0.95rem;
        }

        .nav-links a:hover {
            color: var(--accent);
        }

        .dropdown-arrow {
            font-size: 0.6rem;
            margin-left: 0.3rem;
            transition: transform 0.3s;
            display: inline-block;
        }

        .nav-dropdown:hover > .dropdown-arrow {
            transform: rotate(180deg);
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: var(--bg-card);
            min-width: 200px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: 1px solid var(--border);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            padding: 0.5rem 0;
            z-index: 1000;
            list-style: none;
            margin: 0;
        }

        .nav-dropdown:hover > .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-menu > li {
            position: relative;
        }

        .dropdown-menu > li > a {
            display: block;
            padding: 0.6rem 1rem;
            color: var(--text-secondary);
            font-size: 0.9rem;
            white-space: nowrap;
            transition: all 0.2s;
            text-decoration: none;
        }

        .dropdown-menu > li > a:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }

        .dropdown-section {
            position: relative;
        }

        .dropdown-submenu {
            position: absolute;
            left: 100%;
            top: 0;
            min-width: 200px;
            transform: translateX(-10px);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1001;
            list-style: none;
            margin: 0;
            padding: 0;
            background: var(--bg-card);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border: 1px solid var(--border);
        }

        .dropdown-section:hover > .dropdown-submenu {
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
        }

        .dropdown-submenu > li > a {
            display: block;
            padding: 0.5rem 1rem;
            color: var(--text-secondary);
            font-size: 0.85rem;
            white-space: nowrap;
            transition: all 0.2s;
            text-decoration: none;
        }

        .dropdown-submenu > li > a:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }

        .lang-switcher {
            display: flex;
            gap: 0.5rem;
        }

        .lang-btn {
            padding: 0.4rem 0.8rem;
            border: 1px solid var(--border);
            background: var(--bg-card);
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            transition: all 0.3s;
        }

        .lang-btn.active {
            background: var(--accent);
            color: var(--button-text-dark);
        }

        .theme-switcher {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: var(--bg-card);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s;
        }

        .theme-switcher:hover {
            background: var(--bg-secondary);
        }
'''

def fix_file(filepath):
    """Fix navigation in a single file"""
    print(f"Processing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the navigation section
    nav_pattern = r'    <!-- 导航栏 -->\s*<nav>.*?</nav>'
    if re.search(nav_pattern, content, re.DOTALL):
        content = re.sub(nav_pattern, NAV_STRUCTURE, content, flags=re.DOTALL)
        print(f"  ✓ Navigation replaced")
    else:
        print(f"  ✗ Navigation pattern not found")

    # Add CSS if not present
    if '.nav-container {' not in content:
        # Find the closing </style> tag and insert CSS before it
        content = content.replace('</style>', NAV_CSS + '\n    </style>')
        print(f"  ✓ CSS added")
    else:
        print(f"  - CSS already exists")

    # Save the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✓ Saved {filepath}\n")

# Process each file
files_to_fix = [
    '/Users/colinying/Desktop/Personal Blog Website/products.html',
    '/Users/colinying/Desktop/Personal Blog Website/销售页面完整版.html',
    '/Users/colinying/Desktop/Personal Blog Website/支付页面模板.html',
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        fix_file(filepath)
    else:
        print(f"✗ File not found: {filepath}")

print("\n✅ All files processed!")
