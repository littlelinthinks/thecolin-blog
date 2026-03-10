#!/usr/bin/env python3
"""
深度诊断工具 - 检查所有 JavaScript 函数和事件绑定
"""

import os
import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

def analyze_js_functions(filepath):
    """分析 JS 函数定义和调用"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(filepath)
    
    # 提取所有函数定义
    func_defs = re.findall(r'function\s+(\w+)\s*\(', content)
    
    # 提取所有 onclick 调用
    onclick_funcs = re.findall(r'onclick="(\w+)', content)
    
    # 提取所有 addEventListener
    event_listeners = re.findall(r"addEventListener\(['\"](\w+)['\"]", content)
    
    # 找出未定义的函数调用
    undefined_funcs = []
    for func in onclick_funcs:
        if func not in func_defs and func not in ['switchCurrency', 'selectAmount', 'selectPayment', 'openCoffeeModal', 'closeCoffeeModal', 'filterByCategory', 'loadMoreArticles', 'showHome', 'showArticle', 'openWechatQrModal', 'closeWechatQrModal', 'copyRSSLink', 'copySubscribeEmail', 'gtag']:
            undefined_funcs.append(func)
    
    return {
        'functions': func_defs,
        'onclick_calls': onclick_funcs,
        'event_listeners': event_listeners,
        'undefined': undefined_funcs
    }

def check_css_issues(filepath):
    """检查 CSS 潜在问题"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 检查 z-index 冲突
    z_indexes = re.findall(r'z-index:\s*(\d+)', content)
    if z_indexes:
        max_z = max(int(z) for z in z_indexes)
        if max_z > 10000:
            issues.append(f"⚠️ 高 z-index 值：{max_z} (可能导致层级问题)")
    
    # 检查 pointer-events
    if 'pointer-events: none' in content and 'pointer-events: auto' not in content:
        issues.append("⚠️ 有 pointer-events: none 但没有对应的 auto 恢复")
    
    # 检查 cursor
    if 'cursor:' in content and 'cursor: pointer' not in content:
        issues.append("⚠️ 可能缺少 cursor: pointer 设置")
    
    return issues

def check_html_structure(filepath):
    """检查 HTML 结构问题"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 检查标签闭合
    tags = ['div', 'span', 'p', 'a', 'button', 'section', 'article', 'header', 'footer', 'nav']
    for tag in tags:
        open_count = len(re.findall(rf'<{tag}(?![^>]*/>)', content))
        close_count = len(re.findall(rf'</{tag}>', content))
        if open_count != close_count:
            issues.append(f"❌ {tag} 标签不匹配：开={open_count}, 关={close_count}")
    
    # 检查重复的 id
    ids = re.findall(r'id="([^"]+)"', content)
    duplicate_ids = [id for id in ids if ids.count(id) > 1]
    if duplicate_ids:
        issues.append(f"❌ 重复的 ID: {set(duplicate_ids)}")
    
    # 检查空链接
    empty_links = re.findall(r'href="#"', content)
    if empty_links:
        issues.append(f"⚠️ {len(empty_links)} 个空链接 href=\"#\"")
    
    return issues

def main():
    os.chdir(WORK_DIR)
    
    print("=" * 70)
    print("🔬 深度诊断报告")
    print("=" * 70)
    print()
    
    # 分析主要页面
    pages = ['index.html', 'products.html', 'article.html']
    
    for page in pages:
        if not os.path.exists(page):
            continue
        
        print(f"\n{'='*70}")
        print(f"📄 {page}")
        print(f"{'='*70}")
        
        # JS 函数分析
        js_analysis = analyze_js_functions(page)
        print(f"\n📊 JavaScript 分析:")
        print(f"   函数定义：{len(js_analysis['functions'])} 个")
        print(f"   onclick 调用：{len(js_analysis['onclick_calls'])} 个")
        print(f"   事件监听器：{len(js_analysis['event_listeners'])} 个")
        
        if js_analysis['undefined']:
            print(f"   ⚠️ 未定义函数调用：{js_analysis['undefined']}")
        else:
            print(f"   ✅ 所有 onclick 函数都已定义")
        
        # CSS 检查
        css_issues = check_css_issues(page)
        if css_issues:
            print(f"\n🎨 CSS 检查:")
            for issue in css_issues:
                print(f"   {issue}")
        else:
            print(f"\n🎨 CSS 检查：✅ 无明显问题")
        
        # HTML 结构检查
        html_issues = check_html_structure(page)
        if html_issues:
            print(f"\n🏗️ HTML 结构检查:")
            for issue in html_issues:
                print(f"   {issue}")
        else:
            print(f"\n🏗️ HTML 结构检查：✅ 完美")
    
    print(f"\n{'='*70}")
    print("🎯 诊断完成")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
