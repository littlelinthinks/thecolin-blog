#!/usr/bin/env python3
"""
网站全面诊断工具
检查所有 HTML 文件的功能完整性
"""

import os
import re
from datetime import datetime

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

def check_file(filepath):
    """检查单个文件的各项功能"""
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    warnings = []
    checks = []
    
    # 1. 检查 doctype 和 html 标签
    if '<!DOCTYPE html>' not in content:
        issues.append("❌ 缺少 DOCTYPE 声明")
    else:
        checks.append("✅ DOCTYPE 声明")
    
    if '<html lang=' not in content:
        issues.append("❌ 缺少 lang 属性")
    else:
        checks.append("✅ HTML lang 属性")
    
    # 2. 检查必需的 meta 标签
    required_metas = [
        ('charset="UTF-8"', '字符集 UTF-8'),
        ('viewport', '响应式 viewport'),
        ('description', 'SEO description'),
        ('Content-Security-Policy', 'CSP 安全策略')
    ]
    
    for meta, name in required_metas:
        if meta in content:
            checks.append(f"✅ {name}")
        else:
            issues.append(f"❌ 缺少 {name}")
    
    # 3. 检查 CSS 和 JS 文件引用
    if 'link rel="stylesheet"' in content or '<style>' in content:
        checks.append("✅ CSS 样式")
    else:
        warnings.append("⚠️ 缺少 CSS 样式")
    
    if '<script' in content:
        checks.append("✅ JavaScript")
    else:
        warnings.append("⚠️ 缺少 JavaScript")
    
    # 4. 检查常见问题
    # 检查未闭合的标签
    open_divs = len(re.findall(r'<div(?![^>]*/>)', content))
    close_divs = len(re.findall(r'</div>', content))
    if open_divs != close_divs:
        issues.append(f"❌ div 标签不匹配：开={open_divs}, 关={close_divs}")
    
    # 检查 onclick 但没有对应函数
    onclicks = re.findall(r'onclick="([^"]+)"', content)
    for onclick in onclicks:
        func_name = onclick.split('(')[0]
        if f'function {func_name}' not in content and func_name not in ['openCoffeeModal', 'closeCoffeeModal', 'selectAmount', 'selectPayment', 'switchCurrency', 'filterByCategory', 'loadMoreArticles', 'showHome', 'showArticle', 'openWechatQrModal', 'closeWechatQrModal', 'copyRSSLink', 'copySubscribeEmail']:
            warnings.append(f"⚠️ onclick 调用未定义函数：{func_name}")
    
    # 5. 检查特定功能
    if filename == 'index.html':
        # 检查打赏功能
        if 'coffeeModal' in content and 'openCoffeeModal' in content:
            checks.append("✅ 打赏功能完整")
        else:
            issues.append("❌ 打赏功能不完整")
        
        # 检查搜索功能
        if 'searchInput' in content and 'filterArticles' in content:
            checks.append("✅ 搜索功能")
        else:
            warnings.append("⚠️ 搜索功能可能不完整")
        
        # 检查主题切换
        if 'theme-switcher' in content and 'currentTheme' in content:
            checks.append("✅ 主题切换")
        else:
            warnings.append("⚠️ 主题切换可能不完整")
        
        # 检查语言切换
        if 'lang-btn' in content and 'switchLanguage' in content:
            checks.append("✅ 语言切换")
        else:
            warnings.append("⚠️ 语言切换可能不完整")
    
    if filename == 'products.html':
        # 检查产品页面功能
        if 'payment-modal' in content or 'paymentModal' in content:
            checks.append("✅ 支付模态框")
        else:
            warnings.append("⚠️ 可能缺少支付模态框")
    
    if filename == 'article.html':
        # 检查文章页面功能
        if 'article-content' in content:
            checks.append("✅ 文章内容区域")
        if 'marked' in content:
            checks.append("✅ Markdown 解析")
        if 'reading-progress' in content:
            checks.append("✅ 阅读进度条")
    
    return checks, warnings, issues

def main():
    os.chdir(WORK_DIR)
    
    print("=" * 70)
    print("🔍 网站全面诊断报告")
    print("=" * 70)
    print(f"时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"目录：{WORK_DIR}")
    print("=" * 70)
    print()
    
    # 检查主要页面
    pages = [
        'index.html',
        'products.html',
        'article.html',
        'archive.html',
        'subscribe.html',
        '404.html',
        'wisdom.html'
    ]
    
    all_issues = {}
    all_warnings = {}
    all_checks = {}
    
    for page in pages:
        if os.path.exists(page):
            filepath = os.path.join(WORK_DIR, page)
            checks, warnings, issues = check_file(filepath)
            
            all_checks[page] = checks
            all_warnings[page] = warnings
            all_issues[page] = issues
    
    # 输出报告
    for page in pages:
        if page in all_checks:
            print(f"\n{'='*70}")
            print(f"📄 {page}")
            print(f"{'='*70}")
            
            if all_checks[page]:
                print(f"\n✅ 通过检查 ({len(all_checks[page])}):")
                for check in all_checks[page]:
                    print(f"   {check}")
            
            if all_warnings[page]:
                print(f"\n⚠️ 警告 ({len(all_warnings[page])}):")
                for warn in all_warnings[page]:
                    print(f"   {warn}")
            
            if all_issues[page]:
                print(f"\n❌ 问题 ({len(all_issues[page])}):")
                for issue in all_issues[page]:
                    print(f"   {issue}")
            
            if not all_warnings[page] and not all_issues[page]:
                print(f"\n🎉 完美！没有发现问题")
    
    # 总结
    print(f"\n{'='*70}")
    print("📊 诊断总结")
    print(f"{'='*70}")
    
    total_checks = sum(len(c) for c in all_checks.values())
    total_warnings = sum(len(w) for w in all_warnings.values())
    total_issues = sum(len(i) for i in all_issues.values())
    
    print(f"✅ 通过检查：{total_checks}")
    print(f"⚠️ 警告：{total_warnings}")
    print(f"❌ 问题：{total_issues}")
    
    if total_issues == 0:
        print(f"\n🎉 网站质量优秀！")
    elif total_issues <= 5:
        print(f"\n👍 网站质量良好，建议修复警告项")
    else:
        print(f"\n⚠️ 发现多个问题，建议优先修复")
    
    print(f"\n{'='*70}")

if __name__ == "__main__":
    main()
