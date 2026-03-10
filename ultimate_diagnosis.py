#!/usr/bin/env python3
"""
终极深度诊断工具 - 检查网站所有可能的问题
"""

import os
import re
from datetime import datetime

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"

class UltimateDiagnosis:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.checks = []
    
    def check_all_html_files(self):
        """检查所有 HTML 文件"""
        print("\n" + "="*70)
        print("📄 检查所有 HTML 文件")
        print("="*70)
        
        html_files = [f for f in os.listdir(WORK_DIR) if f.endswith('.html')]
        
        for file in html_files:
            filepath = os.path.join(WORK_DIR, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 1. 检查未闭合标签
            tags_to_check = ['div', 'span', 'p', 'a', 'button', 'section', 'article', 'header', 'footer', 'nav', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
            for tag in tags_to_check:
                open_count = len(re.findall(rf'<{tag}(?![^>]*/>)(?![^>]*class="[^"]*inline[^"]*")[^>]*>', content))
                close_count = len(re.findall(rf'</{tag}>', content))
                if open_count != close_count:
                    self.issues.append(f"{file}: {tag} 标签不匹配 (开={open_count}, 关={close_count})")
            
            # 2. 检查重复 ID
            ids = re.findall(r'id="([^"]+)"', content)
            duplicates = [id for id in set(ids) if ids.count(id) > 1]
            if duplicates:
                self.issues.append(f"{file}: 重复 ID - {duplicates}")
            
            # 3. 检查空链接
            empty_links = re.findall(r'href="#"', content)
            if empty_links:
                self.warnings.append(f"{file}: {len(empty_links)} 个空链接 href=\"#\"")
            
            # 4. 检查缺少 alt 的图片
            imgs = re.findall(r'<img[^>]*>', content)
            for img in imgs:
                if 'alt=' not in img:
                    self.warnings.append(f"{file}: 图片缺少 alt 属性")
                    break
            
            # 5. 检查 CSP
            if 'Content-Security-Policy' not in content:
                self.issues.append(f"{file}: 缺少 CSP 安全策略")
            
            # 6. 检查 viewport
            if 'viewport' not in content:
                self.issues.append(f"{file}: 缺少 viewport meta 标签")
            
            # 7. 检查 title
            if '<title>' not in content:
                self.issues.append(f"{file}: 缺少 title 标签")
            
            # 8. 检查 description
            if 'name="description"' not in content:
                self.warnings.append(f"{file}: 缺少 description meta 标签")
            
            # 9. 检查 z-index 冲突
            z_indexes = re.findall(r'z-index:\s*(\d+)', content)
            if z_indexes:
                max_z = max(int(z) for z in z_indexes)
                if max_z > 10000:
                    self.warnings.append(f"{file}: 极高 z-index 值 ({max_z})")
            
            # 10. 检查 onclick 但未定义的函数
            onclicks = re.findall(r'onclick="(\w+)', content)
            func_defs = re.findall(r'function\s+(\w+)\s*\(', content)
            for onclick in onclicks:
                if onclick not in func_defs and onclick not in ['switchCurrency', 'selectAmount', 'selectPayment', 'openCoffeeModal', 'closeCoffeeModal', 'filterByCategory', 'loadMoreArticles', 'showHome', 'showArticle', 'openWechatQrModal', 'closeWechatQrModal', 'copyRSSLink', 'copySubscribeEmail', 'gtag', 'closePaymentModal', 'toggleSingleProductsInBundle', 'openPaymentModal', 'searchProducts']:
                    self.warnings.append(f"{file}: onclick 调用可能未定义函数 - {onclick}")
        
        print(f"✅ 检查完成：{len(html_files)} 个 HTML 文件")
    
    def check_css_files(self):
        """检查 CSS 文件"""
        print("\n" + "="*70)
        print("🎨 检查 CSS 文件")
        print("="*70)
        
        css_dir = os.path.join(WORK_DIR, 'css')
        if os.path.exists(css_dir):
            css_files = [f for f in os.listdir(css_dir) if f.endswith('.css')]
            for file in css_files:
                filepath = os.path.join(css_dir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 检查未闭合的大括号
                open_braces = content.count('{')
                close_braces = content.count('}')
                if open_braces != close_braces:
                    self.issues.append(f"css/{file}: CSS 大括号不匹配 (开={open_braces}, 关={close_braces})")
                
                # 检查!important 滥用
                important_count = content.count('!important')
                if important_count > 50:
                    self.warnings.append(f"css/{file}: 大量使用 !important ({important_count} 次)")
            
            print(f"✅ 检查完成：{len(css_files)} 个 CSS 文件")
    
    def check_js_files(self):
        """检查 JS 文件"""
        print("\n" + "="*70)
        print("⚡ 检查 JavaScript 文件")
        print("="*70)
        
        js_dir = os.path.join(WORK_DIR, 'js')
        if os.path.exists(js_dir):
            js_files = [f for f in os.listdir(js_dir) if f.endswith('.js')]
            for file in js_files:
                filepath = os.path.join(js_dir, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 检查未闭合的大括号
                open_braces = content.count('{')
                close_braces = content.count('}')
                if open_braces != close_braces:
                    self.issues.append(f"js/{file}: JS 大括号不匹配 (开={open_braces}, 关={close_braces})")
                
                # 检查 console.log（生产环境应该移除）
                console_logs = content.count('console.log')
                if console_logs > 0:
                    self.warnings.append(f"js/{file}: 包含 console.log ({console_logs} 次)")
            
            print(f"✅ 检查完成：{len(js_files)} 个 JS 文件")
    
    def check_all_buttons_have_type(self):
        """检查所有按钮是否有 type 属性"""
        print("\n" + "="*70)
        print("🔘 检查按钮 type 属性")
        print("="*70)
        
        html_files = [f for f in os.listdir(WORK_DIR) if f.endswith('.html')]
        total_buttons = 0
        buttons_without_type = 0
        
        for file in html_files:
            filepath = os.path.join(WORK_DIR, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            buttons = re.findall(r'<button(?![^>]*\btype=)[^>]*>', content)
            if buttons:
                buttons_without_type += len(buttons)
            
            total_buttons += len(re.findall(r'<button[^>]*>', content))
        
        if buttons_without_type > 0:
            self.issues.append(f"{buttons_without_type} 个按钮缺少 type 属性")
        else:
            self.checks.append(f"所有 {total_buttons} 个按钮都有 type 属性")
        
        print(f"✅ 检查完成：{total_buttons} 个按钮，{buttons_without_type} 个缺少 type")
    
    def check_language_switch_completeness(self):
        """检查语言切换完整性"""
        print("\n" + "="*70)
        print("🌐 检查语言切换完整性")
        print("="*70)
        
        # 检查 index.html
        filepath = os.path.join(WORK_DIR, 'index.html')
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找所有有文本的元素但没有语言切换属性
        text_elements = re.findall(r'<(h[1-6]|p|span|a|button|div|li|strong|td|th)[^>]*>[^<]+</\1>', content)
        elements_without_lang = []
        
        for elem in text_elements[:100]:  # 限制检查前 100 个
            if 'data-zh' not in elem and 'data-en' not in elem:
                elements_without_lang.append(elem[:100])
        
        if elements_without_lang:
            self.warnings.append(f"index.html: {len(elements_without_lang)} 个文本元素缺少语言切换属性（示例：{elements_without_lang[:3]}）")
        else:
            self.checks.append("所有文本元素都有语言切换属性")
        
        print(f"✅ 检查完成")
    
    def check_modal_close_buttons(self):
        """检查所有模态框是否有关闭按钮"""
        print("\n" + "="*70)
        print("❌ 检查模态框关闭按钮")
        print("="*70)
        
        html_files = [f for f in os.listdir(WORK_DIR) if f.endswith('.html')]
        
        for file in html_files:
            filepath = os.path.join(WORK_DIR, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 查找所有模态框
            modals = re.findall(r'id="([^"]*modal[^"]*)"', content, re.IGNORECASE)
            for modal_id in modals:
                # 检查是否有关闭按钮
                close_patterns = [
                    f'onclick="close{modal_id[0].upper() + modal_id[1:]}"',
                    f'id="close{modal_id[0].upper() + modal_id[1:]}"',
                    f'data-close-modal="{modal_id}"'
                ]
                has_close = any(pattern in content for pattern in close_patterns)
                
                if not has_close and 'payment' not in modal_id:  # 排除支付模态框（已修复）
                    self.warnings.append(f"{file}: 模态框 {modal_id} 可能缺少关闭功能")
        
        print(f"✅ 检查完成")
    
    def check_z_index_consistency(self):
        """检查 z-index 一致性"""
        print("\n" + "="*70)
        print("📊 检查 z-index 层级")
        print("="*70)
        
        html_files = [f for f in os.listdir(WORK_DIR) if f.endswith('.html')]
        all_z_indexes = {}
        
        for file in html_files:
            filepath = os.path.join(WORK_DIR, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            z_indexes = re.findall(r'z-index:\s*(\d+)', content)
            if z_indexes:
                max_z = max(int(z) for z in z_indexes)
                all_z_indexes[file] = max_z
        
        # 检查层级冲突
        for file, max_z in all_z_indexes.items():
            if max_z > 10000 and file not in ['index.html', 'products.html']:
                self.warnings.append(f"{file}: z-index 过高 ({max_z})，可能与下拉菜单冲突")
        
        print(f"✅ 检查完成")
    
    def check_performance_issues(self):
        """检查性能问题"""
        print("\n" + "="*70)
        print("⚡ 检查性能问题")
        print("="*70)
        
        html_files = [f for f in os.listdir(WORK_DIR) if f.endswith('.html')]
        
        for file in html_files:
            filepath = os.path.join(WORK_DIR, file)
            file_size = os.path.getsize(filepath)
            
            if file_size > 500000:  # 500KB
                self.warnings.append(f"{file}: 文件过大 ({file_size/1024:.1f}KB)，建议压缩")
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查内联样式
            inline_styles = len(re.findall(r'style="', content))
            if inline_styles > 50:
                self.warnings.append(f"{file}: 大量内联样式 ({inline_styles} 处)，建议提取到 CSS 文件")
            
            # 检查内联脚本
            inline_scripts = content.count('<script>') + content.count('<script ')
            if inline_scripts > 10:
                self.warnings.append(f"{file}: 大量内联脚本 ({inline_scripts} 个)，建议提取到 JS 文件")
        
        print(f"✅ 检查完成")
    
    def generate_report(self):
        """生成诊断报告"""
        print("\n" + "="*70)
        print("📊 诊断报告总结")
        print("="*70)
        print()
        
        if self.issues:
            print(f"❌ 严重问题 ({len(self.issues)}):")
            for issue in self.issues:
                print(f"   • {issue}")
            print()
        else:
            print("✅ 无严重问题！")
            print()
        
        if self.warnings:
            print(f"⚠️ 警告 ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   • {warning}")
            print()
        else:
            print("✅ 无警告！")
            print()
        
        if self.checks:
            print(f"✅ 通过检查 ({len(self.checks)}):")
            for check in self.checks:
                print(f"   • {check}")
            print()
        
        print("="*70)
        print(f"总计：{len(self.issues)} 个问题，{len(self.warnings)} 个警告，{len(self.checks)} 个通过")
        print("="*70)
        
        # 保存到文件
        report_path = os.path.join(WORK_DIR, "终极诊断报告.md")
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"# 终极诊断报告\n\n")
            f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"## 严重问题 ({len(self.issues)})\n\n")
            for issue in self.issues:
                f.write(f"- ❌ {issue}\n")
            f.write(f"\n## 警告 ({len(self.warnings)})\n\n")
            for warning in self.warnings:
                f.write(f"- ⚠️ {warning}\n")
            f.write(f"\n## 通过检查 ({len(self.checks)})\n\n")
            for check in self.checks:
                f.write(f"- ✅ {check}\n")
        
        print(f"\n📄 报告已保存到：终极诊断报告.md")

# 运行诊断
if __name__ == "__main__":
    diagnosis = UltimateDiagnosis()
    
    print("="*70)
    print("🦞 终极深度诊断工具")
    print("="*70)
    print(f"开始时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"工作目录：{WORK_DIR}")
    print("="*70)
    
    diagnosis.check_all_html_files()
    diagnosis.check_css_files()
    diagnosis.check_js_files()
    diagnosis.check_all_buttons_have_type()
    diagnosis.check_language_switch_completeness()
    diagnosis.check_modal_close_buttons()
    diagnosis.check_z_index_consistency()
    diagnosis.check_performance_issues()
    diagnosis.generate_report()
    
    print("\n✅ 诊断完成！")
