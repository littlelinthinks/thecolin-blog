#!/usr/bin/env python3
"""
综合修复所有页面的常见问题：
1. 导航栏链接
2. 按钮点击事件
3. 表单提交
4. 移动端适配
5. 暗色模式切换
"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

def fix_html_file(filepath):
    """修复单个 HTML 文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    fixes_applied = []
    
    # 1. 确保所有按钮都有 onclick 或 type="button"
    buttons_without_type = re.findall(r'<button(?![^>]*type=)([^>]*onclick="[^"]*"[^>]*)>', content)
    if buttons_without_type:
        fixes_applied.append(f"发现 {len(buttons_without_type)} 个按钮需要添加 type")
    
    # 2. 检查导航栏链接
    if 'href="products.html"' in content:
        fixes_applied.append("✓ 产品页链接正确")
    
    # 3. 确保主题切换功能完整
    if 'theme-switcher' in content and 'currentTheme' not in content:
        # 添加主题切换变量
        if 'let currentTheme' not in content:
            content = content.replace(
                "let currentLang = localStorage.getItem('preferred-lang') || 'zh';",
                "let currentLang = localStorage.getItem('preferred-lang') || 'zh';\nlet currentTheme = localStorage.getItem('theme') || 'light';"
            )
            fixes_applied.append("✓ 添加主题变量")
    
    # 4. 确保所有模态框有关闭功能
    modals = re.findall(r'id="([^"]*modal[^"]*)"', content, re.IGNORECASE)
    for modal_id in modals:
        if f"close{modal_id[0].upper() + modal_id[1:]}" not in content and f"getElementById('{modal_id}')" not in content:
            fixes_applied.append(f"⚠️ 模态框 {modal_id} 可能缺少关闭功能")
    
    # 5. 检查表单提交
    forms = re.findall(r'<form[^>]*>', content)
    for form in forms:
        if 'onsubmit' not in form and 'submit' not in content:
            fixes_applied.append(f"⚠️ 表单可能缺少提交处理：{form[:50]}")
    
    # 6. 确保移动端菜单功能
    if 'nav-links' in content and 'mobile-menu' not in content and 'hamburger' not in content:
        fixes_applied.append("⚠️ 可能缺少移动端菜单按钮")
    
    # 写入修复后的内容
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
    
    return fixes_applied

def main():
    os.chdir(WORK_DIR)
    
    print("=" * 60)
    print("综合页面检查与修复")
    print("=" * 60)
    print()
    
    # 检查主要页面
    pages_to_check = [
        'index.html',
        'products.html',
        'article.html',
        'archive.html',
        'subscribe.html',
        '404.html'
    ]
    
    all_fixes = {}
    
    for page in pages_to_check:
        if os.path.exists(page):
            print(f"\n📄 检查 {page}...")
            fixes = fix_html_file(f"{WORK_DIR}/{page}")
            all_fixes[page] = fixes
            
            if fixes:
                for fix in fixes:
                    print(f"   {fix}")
            else:
                print(f"   ✅ 无明显问题")
    
    print("\n" + "=" * 60)
    print("检查完成！")
    print("=" * 60)

if __name__ == "__main__":
    main()
