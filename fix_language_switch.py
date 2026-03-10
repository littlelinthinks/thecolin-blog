#!/usr/bin/env python3
"""修复 products.html 的语言切换功能"""

import re

WORK_DIR = "/Users/colinying/Desktop/Personal Blog Website"
filepath = f"{WORK_DIR}/products.html"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 找到并替换 switchLanguage 函数
old_func = """        function switchLanguage(lang) {
            currentLang = lang;

            // 更新按钮状态
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'var(--bg-card)';
                btn.style.color = 'var(--text-secondary)';
                if (btn.dataset.lang === lang) {
                    btn.classList.add('active');
                    btn.style.background = 'var(--accent)';
                    btn.style.color = 'var(--button-text-dark)';
                }
            });

            // 更新所有带语言数据的元素
            document.querySelectorAll('[data-zh][data-en]').forEach(el => {
                const textContent = el.dataset[lang];
                if (!textContent) return;

                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = el.dataset[lang + 'Placeholder'] || textContent;
                } else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'LABEL' || el.tagName === 'OPTION') {
                    el.textContent = textContent;
                } else {
                    el.innerHTML = textContent;
                }
            });

            // 更新带 placeholder 的 input 元素
            document.querySelectorAll('[data-zh-placeholder][data-en-placeholder]').forEach(el => {
                el.placeholder = el.dataset[lang + 'Placeholder'];
            });

            // 更新页面语言属性
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

            // 保存语言偏好
            localStorage.setItem('preferred-lang', lang);

            // 重新过滤产品（因为搜索可能使用中文关键词）
            searchProducts();
        }"""

new_func = """        function switchLanguage(lang) {
            currentLang = lang;
            console.log('🌐 Switching language to:', lang);

            // 更新按钮状态
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.lang === lang) {
                    btn.classList.add('active');
                }
            });

            // 更新所有带语言数据的元素（包括 data-zh-content/data-en-content）
            document.querySelectorAll('[data-zh], [data-en]').forEach(el => {
                const textContent = el.dataset[lang] || el.dataset[lang + 'Content'];
                if (!textContent) return;

                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = el.dataset[lang + 'Placeholder'] || textContent;
                } else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || el.tagName === 'H5' || el.tagName === 'LABEL' || el.tagName === 'OPTION' || el.tagName === 'LI' || el.tagName === 'STRONG' || el.tagName === 'EM') {
                    el.textContent = textContent;
                } else {
                    el.innerHTML = textContent;
                }
            });

            // 更新带 placeholder 的 input 元素
            document.querySelectorAll('[data-zh-placeholder], [data-en-placeholder]').forEach(el => {
                el.placeholder = el.dataset[lang + 'Placeholder'];
            });

            // 更新页面语言属性
            document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

            // 保存语言偏好
            localStorage.setItem('preferred-lang', lang);

            // 重新过滤产品（因为搜索可能使用中文关键词）
            searchProducts();
            
            console.log('✅ Language switched to', lang);
        }"""

content = content.replace(old_func, new_func)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 语言切换功能已修复")
print("   - 支持 data-zh 和 data-zh-content")
print("   - 添加调试日志")
print("   - 支持更多 HTML 标签")
