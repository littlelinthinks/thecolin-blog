/**
 * COLIN Blog - Common Functions
 * Shared JavaScript functionality across all pages
 */

// ===== 语言切换功能 =====
let currentLang = localStorage.getItem('preferred-lang') || 'zh';

function switchLanguage(lang) {
    currentLang = lang;

    // 更新按钮状态
    updateLanguageButtons();

    // 更新所有带语言数据的元素
    updateLanguageContent();

    // 更新title属性
    updateTitleAttributes();

    // 更新页面语言属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 如果有文章标题，更新它
    updateArticleTitle();

    // 更新meta标签
    updateMetaTags();

    // 保存语言偏好
    localStorage.setItem('preferred-lang', lang);
}

function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'var(--bg-card)';
        btn.style.color = 'var(--text-secondary)';
        
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
            btn.style.background = 'var(--accent)';
            btn.style.color = 'var(--button-text-dark)';
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

function updateLanguageContent() {
    document.querySelectorAll('[data-zh][data-en]').forEach(el => {
        const textContent = el.dataset[currentLang];
        if (!textContent) return;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = el.dataset[currentLang + 'Placeholder'] || textContent;
        } else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN' || 
                   el.tagName === 'P' || el.tagName === 'DIV' || el.tagName === 'H1' || 
                   el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'H4' || 
                   el.tagName === 'H5' || el.tagName === 'H6') {
            el.textContent = textContent;
        } else {
            el.innerHTML = textContent;
        }
    });
}

function updateTitleAttributes() {
    document.querySelectorAll('[data-zh-title][data-en-title]').forEach(el => {
        const titleText = el.dataset[currentLang + 'Title'];
        if (titleText) {
            el.setAttribute('title', titleText);
        }
    });
}

function updateArticleTitle() {
    const articleTitle = document.querySelector('.article-title');
    if (articleTitle && articleTitle.dataset[currentLang]) {
        articleTitle.textContent = articleTitle.dataset[currentLang];
    }
}

function updateMetaTags() {
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.dataset[currentLang]) {
        titleEl.textContent = titleEl.dataset[currentLang];
    }

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl && descEl.dataset[currentLang + 'Content']) {
        descEl.setAttribute('content', descEl.dataset[currentLang + 'Content']);
    }
}

function initLanguage() {
    const savedLang = localStorage.getItem('preferred-lang') || 'zh';
    currentLang = savedLang;
    switchLanguage(savedLang);
}

// ===== 主题切换功能 =====
let currentTheme = localStorage.getItem('preferred-theme') || 'light';

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    localStorage.setItem('preferred-theme', currentTheme);
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    }

    const themeSwitcher = document.querySelector('.theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.setAttribute('aria-pressed', currentTheme === 'dark');
        themeSwitcher.setAttribute('aria-checked', currentTheme === 'dark');
    }
}

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

// ===== 返回顶部按钮 =====
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = `
        <span aria-hidden="true">↑</span>
        <span class="visually-hidden">返回顶部</span>
    `;
    backToTopBtn.setAttribute('data-zh-title', '返回顶部');
    backToTopBtn.setAttribute('data-en-title', 'Back to top');
    backToTopBtn.setAttribute('title', '返回顶部');
    backToTopBtn.setAttribute('aria-label', '返回顶部');
    backToTopBtn.setAttribute('tabindex', '-1');
    backToTopBtn.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backToTopBtn);

    // 滚动事件
    window.addEventListener('scroll', handleBackToTopScroll, { passive: true });
    
    // 点击事件
    backToTopBtn.addEventListener('click', scrollToTop);
    
    // 键盘支持
    backToTopBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });
}

function handleBackToTopScroll() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;

    if (window.scrollY > 300) {
        backToTopBtn.classList.remove('hidden');
        backToTopBtn.classList.add('visible');
        backToTopBtn.setAttribute('tabindex', '0');
        backToTopBtn.setAttribute('aria-hidden', 'false');
    } else {
        backToTopBtn.classList.add('hidden');
        backToTopBtn.classList.remove('visible');
        backToTopBtn.setAttribute('tabindex', '-1');
        backToTopBtn.setAttribute('aria-hidden', 'true');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ===== Toast 提示组件 =====
class Toast {
    static show(message, type = 'info', duration = 3000) {
        // 创建容器（如果不存在）
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `${type}-message`;
        toast.style.cssText = `
            background: ${type === 'error' ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' :
                        type === 'success' ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' :
                        type === 'warning' ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' :
                        'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: toastSlideIn 0.3s ease;
            min-width: 280px;
        `;

        const icons = {
            error: '❌',
            success: '✅',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span style="font-size: 20px;">${icons[type] || icons.info}</span>
            <span style="flex: 1;">${message}</span>
        `;

        container.appendChild(toast);

        // 添加动画样式（如果不存在）
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes toastSlideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }

        // 自动消失
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static error(message, duration) {
        this.show(message, 'error', duration);
    }

    static success(message, duration) {
        this.show(message, 'success', duration);
    }

    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// ===== 页面初始化 =====
function initCommonFeatures() {
    // 初始化主题
    initTheme();

    // 初始化语言
    initLanguage();

    // 初始化返回顶部按钮
    initBackToTop();

    // 绑定语言切换按钮
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });

    // 绑定主题切换按钮
    const themeSwitcher = document.querySelector('.theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', toggleTheme);
    }

    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + T: 切换主题
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFeatures);
} else {
    initCommonFeatures();
}

// 导出函数（供其他脚本使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchLanguage,
        toggleTheme,
        initBackToTop,
        initLanguage,
        initTheme,
        Toast
    };
}
