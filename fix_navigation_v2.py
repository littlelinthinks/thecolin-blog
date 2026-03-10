#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix navigation bar in products.html and 支付页面模板.html to match index.html"""

import re
import os

# The correct navigation structure from index.html
NAV_STRUCTURE = '''    <nav>
        <div class="nav-container">
            <a href="#" onclick="showHome(event)" class="logo">COLIN</a>
            <div class="nav-right">
                <ul class="nav-links">
                    <li><a href="#" onclick="showHome(event)" data-zh="首页" data-en="Home">首页</a></li>
                    <li class="nav-dropdown">
                        <a href="#articles" data-zh="文章" data-en="Articles">
                            <span data-zh="文章" data-en="Articles">文章</span>
                            <span class="dropdown-arrow">▼</span>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="archive.html" data-zh="📚 文章归档" data-en="📚 Archive">📚 文章归档</a></li>
                            <li><a href="#articles" data-category="life" onclick="filterByCategory('life', event)" data-zh="小Lin记" data-en="Life Notes">小Lin记</a></li>
                            <li><a href="#articles" data-category="thinking" onclick="filterByCategory('thinking', event)" data-zh="小Lin析" data-en="Thinking">小Lin析</a></li>
                            <li><a href="#articles" data-category="reading" onclick="filterByCategory('reading', event)" data-zh="小Lin读" data-en="Reading">小Lin读</a></li>
                            <li><a href="#articles" data-category="history" onclick="filterByCategory('history', event)" data-zh="小Lin说" data-en="History">小Lin说</a></li>
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
                                    <li><a href="products.html?category=thinking#payment-thinking-single" data-zh="⚖️ 概率思维（¥39）" data-en="⚖️ Probabilistic Thinking (¥39)">⚖️ 概率思维（¥39）</a></li>
                                    <li><a href="products.html?category=thinking#payment-thinking" data-zh="🔥 思维套装（¥89）" data-en="🔥 Thinking Bundle (¥89)" style="font-weight: bold; color: var(--accent);">🔥 思维套装（¥89）</a></li>
                                </ul>
                            </li>
                            <li class="dropdown-section">
                                <a href="products.html?category=learning" data-zh="📚 学习方法" data-en="📚 Learning Methods" style="font-weight: bold; color: var(--accent);">📚 学习方法</a>
                                <ul class="dropdown-submenu">
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="🎓 费曼学习法（¥39）" data-en="🎓 Feynman Technique (¥39)">🎓 费曼学习法（¥39）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="📅 间隔重复（¥39）" data-en="📅 Spaced Repetition (¥39)">📅 间隔重复（¥39）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="📖 深度阅读（¥49）" data-en="📖 Deep Reading (¥49)">📖 深度阅读（¥49）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning-single" data-zh="🎯 知识管理（¥49）" data-en="🎯 Knowledge Management (¥49)">🎯 知识管理（¥49）</a></li>
                                    <li><a href="products.html?category=learning#payment-learning" data-zh="🔥 学习套装（¥99）" data-en="🔥 Learning Bundle (¥99)" style="font-weight: bold; color: var(--accent);">🔥 学习套装（¥99）</a></li>
                                </ul>
                            </li>
                            <li style="border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 0.5rem;">
                                <a href="products.html#payment-complete" data-zh="🎉 完整套装（¥159）" data-en="🎉 Complete Bundle (¥159)" style="font-weight: bold; color: #ff6b6b;">🎉 完整套装（¥159）</a>
                            </li>
                        </ul>
                    </li>
                    <li><a href="#about" data-zh="关于" data-en="About">关于</a></li>
                </ul>
                <div class="search-container">
                    <button class="search-btn">
                        <span data-zh="🔍 搜索" data-en="🔍 Search">🔍 搜索</span>
                    </button>
                </div>
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

def fix_file(filepath):
    """Fix navigation in a single file"""
    print(f"Processing {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and replace the entire <nav>...</nav> section
    # Pattern to match any <nav> tag with its closing </nav>
    nav_pattern = r'<nav[^>]*>.*?</nav>'

    if re.search(nav_pattern, content, re.DOTALL):
        content = re.sub(nav_pattern, NAV_STRUCTURE, content, flags=re.DOTALL)
        print(f"  ✓ Navigation replaced")
    else:
        print(f"  ✗ Navigation pattern not found")

    # Remove any inline style blocks that might have been added inside nav
    # Remove style blocks that are between </nav> and the next element
    content = re.sub(r'</nav>\s*<style>.*?</style>\s*</nav>', '</nav>', content, flags=re.DOTALL)

    # Save the file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✓ Saved {filepath}\n")

# Process each file
files_to_fix = [
    '/Users/colinying/Desktop/Personal Blog Website/products.html',
    '/Users/colinying/Desktop/Personal Blog Website/支付页面模板.html',
]

for filepath in files_to_fix:
    if os.path.exists(filepath):
        fix_file(filepath)
    else:
        print(f"✗ File not found: {filepath}")

print("\n✅ All files processed!")
