/**
 * lib/templates.js — 发布内容模板
 *
 * renderColinArticle / renderRwcPost 生成的页面与两个站点的既有页面同款：
 *   - 写作站（thecolin.vip）：内嵌样式与导航 1:1 取自现有文章页
 *   - 读书站（readswithcolin.com）：复用站内 css/style.css + 双语结构
 *
 * md2html：轻量 Markdown（h2/h3、blockquote、ul/ol、粗斜体、hr、分段）。
 * 复杂排版请回写作站手动编辑——中台只负责"发出去"。
 */

const COLIN_STYLE = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#fff;--bg2:#f5f5f5;--bgc:#fff;--t1:#000;--t2:#666;--t3:#999;--bd:#e5e5e5;--gold:#C9A84C;--purple:#7F77DD;--teal:#5DCAA5;--btnbg:#000;--btnfg:#fff}
[data-theme="dark"]{--bg:#0a0a0a;--bg2:#141414;--bgc:#1a1a1a;--t1:#fff;--t2:#a0a0a0;--t3:#555;--bd:#2a2a2a;--btnbg:#fff;--btnfg:#000}
body{font-family:"Noto Serif SC",Georgia,serif;background:var(--bg);color:var(--t1);line-height:1.8;padding-top:64px}
.nav-header{background:rgba(255,255,255,0.97);padding:0 2rem;position:fixed;top:0;left:0;right:0;z-index:1000;backdrop-filter:blur(12px);border-bottom:1px solid var(--bd);height:64px;display:flex;align-items:center}
[data-theme="dark"] .nav-header{background:rgba(10,10,10,0.97);border-bottom-color:#2a2a2a}
.nav-content{max-width:1400px;margin:0 auto;width:100%;display:flex;align-items:center;justify-content:space-between}
.nlw{text-decoration:none;display:flex;flex-direction:column;line-height:1.25;gap:1px}
.nlm{font-family:"Playfair Display",Georgia,serif;font-size:1.15rem;font-weight:700;color:var(--t1);letter-spacing:1px}
.nls{font-size:0.62rem;color:var(--gold);letter-spacing:3px}
.nav-right{display:flex;align-items:center;gap:1.5rem}
.nav-links{display:flex;gap:2rem;list-style:none;align-items:center;margin:0;padding:0}
.nav-link{color:var(--t1);text-decoration:none;font-size:0.9rem;transition:color 0.2s;white-space:nowrap}
.nav-link:hover{color:var(--t2)}
.nav-link.gld{color:var(--gold)!important;font-weight:700}
.lang-switcher{display:flex;gap:4px}
.lang-btn{padding:4px 10px;border:1px solid var(--bd);background:var(--bgc);cursor:pointer;font-size:0.72rem;border-radius:4px;color:var(--t2);transition:all 0.2s}
.lang-btn.active{background:var(--btnbg);color:var(--btnfg);border-color:var(--btnbg)}
.theme-switcher{width:38px;height:38px;border-radius:50%;background:var(--bg2);border:1px solid var(--bd);cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:transform 0.3s}
.theme-switcher:hover{transform:rotate(180deg)}
.hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;padding:8px;border:none;background:transparent;z-index:1100}
.hamburger span{display:block;width:22px;height:2px;background:var(--t1);transition:all 0.3s;transform-origin:center;border-radius:2px}
.hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.active span:nth-child(2){opacity:0}
.hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:900px){
.hamburger{display:flex!important}
.nav-right ul.nav-links{display:none!important;position:fixed;top:64px;left:0;right:0;bottom:0;background:var(--bg);border-top:1px solid var(--bd);flex-direction:column!important;gap:0!important;padding:0.5rem 0 4rem;z-index:1050;overflow-y:auto;-webkit-overflow-scrolling:touch}
.nav-right ul.nav-links.mobile-open{display:flex!important}
.nav-right ul.nav-links>li{width:100%;border-bottom:1px solid var(--bd)}
.nav-right ul.nav-links>li>a{display:block!important;padding:1rem 2rem!important;font-size:1rem!important}
.lang-switcher{display:none!important}
.nls{display:none}
}
.article-wrap{max-width:720px;margin:0 auto;padding:4rem 2rem 6rem}
.article-meta{display:flex;align-items:center;gap:0.8rem;margin-bottom:2rem;flex-wrap:wrap}
.article-collection{font-size:0.68rem;letter-spacing:3px;padding:3px 12px;border-radius:2px;background:rgba(127,119,221,0.1);color:#534AB7;text-decoration:none}
[data-theme="dark"] .article-collection{background:rgba(127,119,221,0.15);color:#AFA9EC}
.article-date,.article-reading{font-size:0.78rem;color:var(--t3)}
.article-title{font-family:"Playfair Display",Georgia,serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:900;line-height:1.2;margin-bottom:1rem;letter-spacing:-0.02em}
.article-byline{font-size:0.82rem;color:var(--t3);margin-bottom:0.5rem}
.article-subtitle{font-size:0.95rem;color:var(--t2);line-height:1.7;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:1px solid var(--bd)}
.article-body h2{font-family:"Playfair Display",Georgia,serif;font-size:1.35rem;font-weight:700;margin:2.5rem 0 1rem;padding-left:1rem;border-left:3px solid var(--gold);line-height:1.3}
.article-body h3{font-size:1.05rem;font-weight:700;margin:2rem 0 0.8rem}
.article-body p{margin-bottom:1.1rem;font-size:0.96rem;line-height:1.9}
.article-body blockquote{border-left:3px solid var(--gold);padding:0.8rem 1.2rem;margin:1.5rem 0;background:rgba(201,168,76,0.04);border-radius:0 4px 4px 0}
[data-theme="dark"] .article-body blockquote{background:rgba(201,168,76,0.06)}
.article-body blockquote p{margin:0;color:var(--t2);font-style:italic}
.article-body pre{background:var(--bg2);padding:1.2rem;border-radius:4px;overflow-x:auto;margin:1.5rem 0;font-size:0.83rem;line-height:1.7;white-space:pre-wrap}
.article-body ul,.article-body ol{padding-left:1.5rem;margin-bottom:1.2rem}
.article-body li{margin-bottom:0.5rem;font-size:0.96rem;line-height:1.8}
.article-body hr{border:none;border-top:1px solid var(--bd);margin:2.5rem 0}
.article-body img{max-width:100%;border-radius:6px;margin:1.5rem 0;display:block}
.book-list{background:var(--bg2);border-radius:6px;padding:1.2rem 1.5rem;margin:1.5rem 0}
.book-list p{margin:0 0 0.5rem;font-size:0.9rem}
.book-list a{color:var(--gold);text-decoration:none;font-size:0.82rem}
.cross-links{margin-top:4rem;padding-top:2rem;border-top:2px solid var(--bd)}
.cross-section{margin-bottom:2rem}
.cross-label{font-size:0.62rem;letter-spacing:5px;color:var(--t3);display:block;margin-bottom:1rem;text-transform:uppercase}
.figure-chips{display:flex;gap:0.8rem;flex-wrap:wrap}
.figure-chip{display:flex;align-items:center;gap:0.7rem;padding:0.7rem 1rem;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;text-decoration:none;color:var(--t1);transition:all 0.2s;font-size:0.83rem}
.figure-chip:hover{border-color:var(--gold);transform:translateY(-2px)}
.figure-chip-num{font-size:0.63rem;color:var(--t3);letter-spacing:2px}
.figure-chip-name{font-weight:600;display:block}
.figure-chip-role{font-size:0.72rem;color:var(--t2);display:block}
.concept-chips{display:flex;gap:0.5rem;flex-wrap:wrap}
.concept-chip{font-size:0.72rem;padding:5px 14px;border-radius:20px;border:1px solid}
.collection-chip{display:inline-flex;align-items:center;gap:0.6rem;padding:0.7rem 1.2rem;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;text-decoration:none;color:var(--t1);transition:all 0.2s;font-size:0.85rem}
.collection-chip:hover{border-color:var(--gold);transform:translateY(-2px)}
.article-footer{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
.wechat-cta{display:inline-flex;align-items:center;gap:0.5rem;padding:0.75rem 1.6rem;background:var(--gold);color:#000;border-radius:3px;font-size:0.85rem;font-weight:600;text-decoration:none;transition:opacity 0.2s}
.wechat-cta:hover{opacity:0.85}
.back-link{font-size:0.82rem;color:var(--t2);text-decoration:none;border-bottom:1px solid var(--bd);padding-bottom:1px}
.back-link:hover{color:var(--t1)}
.back-to-top{position:fixed;bottom:30px;right:30px;width:48px;height:48px;background:var(--btnbg);color:var(--btnfg);border:none;border-radius:50%;cursor:pointer;font-size:1.2rem;opacity:0;visibility:hidden;transition:all 0.3s;z-index:999}
.back-to-top.visible{opacity:1;visibility:visible}
`;

const COLIN_NAV = `<nav class="nav-header" role="navigation">
<div class="nav-content">
<a href="/index.html" class="nlw"><span class="nlm">小Lin思考</span><span class="nls">道 · 术 · 器 认知体系</span></a>
<div class="nav-right">
<button class="hamburger" id="hamburgerBtn" aria-label="打开菜单" aria-expanded="false"><span></span><span></span><span></span></button>
<ul class="nav-links" id="mainNavLinks">
<li><a href="/index.html" class="nav-link"><span class="zh">首页</span><span class="en">Home</span></a></li>
<li><a href="/archive.html" class="nav-link"><span class="zh">思维库</span><span class="en">Library</span></a></li>
<li><a href="/products.html" class="nav-link"><span class="zh">心智工具</span><span class="en">Thinking Tools</span></a></li>
<li><a href="/wisdom.html" class="nav-link gld">✦ <span class="zh">心智折叠</span><span class="en">Mind Folding</span></a></li>
<li><a href="https://readswithcolin.com" target="_blank" rel="noopener" class="nav-link"><span class="zh">读书</span><span class="en">Reads</span></a></li>
<li><a href="/subscribe.html" class="nav-link"><span class="zh">关注公众号</span><span class="en">Subscribe</span></a></li>
</ul>
<div class="lang-switcher"><button class="lang-btn active" data-lang="zh">中文</button><button class="lang-btn" data-lang="en">EN</button></div>
<button class="theme-switcher" id="themeSwitcherBtn" aria-label="切换主题"><span class="theme-icon">🌙</span></button>
</div>
</div>
</nav>`;

const COLIN_GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-MPQTS8G2HD"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MPQTS8G2HD');</script>`;

const RWC_SITE = 'https://readswithcolin.com';
const COLIN_SITE = 'https://www.thecolin.vip';

/* ---------- 轻量 Markdown → HTML ---------- */
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
    return esc(s)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function md2html(md) {
    if (!md) return '';
    const lines = String(md).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let inQuote = false, listMode = null; // 'ul' | 'ol'

    const closeAll = () => {
        if (inQuote) { out.push('</blockquote>'); inQuote = false; }
        if (listMode) { out.push(`</${listMode}>`); listMode = null; }
    };

    for (const raw of lines) {
        const line = raw.trimEnd();

        if (!line.trim()) { closeAll(); continue; }

        const h = line.match(/^(###?)\s+(.*)$/);
        if (h) {
            closeAll();
            out.push(h[1].length === 2 ? `<h2>${inline(h[2])}</h2>` : `<h3>${inline(h[2])}</h3>`);
            continue;
        }
        if (/^(---|\*\*\*)\s*$/.test(line)) { closeAll(); out.push('<hr>'); continue; }

        const q = line.match(/^>\s?(.*)$/);
        if (q) {
            if (listMode) { out.push(`</${listMode}>`); listMode = null; }
            if (!inQuote) { out.push('<blockquote><p>'); inQuote = 'open'; }
            else out.push('<br>');
            out.push(inline(q[1]));
            continue;
        }

        const ul = line.match(/^[-*+]\s+(.*)$/);
        const ol = line.match(/^\d+\.\s+(.*)$/);
        if (ul || ol) {
            if (inQuote) { out.push('</p></blockquote>'); inQuote = false; }
            const want = ul ? 'ul' : 'ol';
            if (listMode !== want) {
                if (listMode) out.push(`</${listMode}>`);
                out.push(`<${want}>`); listMode = want;
            }
            out.push(`<li>${inline((ul || ol)[1])}</li>`);
            continue;
        }

        closeAll();
        out.push(`<p>${inline(line)}</p>`);
    }
    closeAll();
    // blockquote 开段收尾修正（把 opener <blockquote><p> 与内容串起来）
    return out.join('\n').replace('<blockquote><p>\n', '<blockquote><p>').replace('\n</p></blockquote>', '</p></blockquote>');
}

/* ---------- 字数 → 阅读时长 ---------- */
function readMinutes(text) {
    const cjk = (String(text || '').match(/[\u4e00-\u9fff]/g) || []).length;
    const words = String(text || '').replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round((cjk / 400) + (words / 200)));
}

/* ---------- 系列显示名（与 articles.json 既有命名保持一致） ---------- */
const SERIES_NAMES = {
    'human-nature':      { zh: '人性观察', en: 'Human Nature' },
    'metacognition':     { zh: '元认知', en: 'Metacognition' },
    'western-classics':  { zh: '西方经典·思维模型', en: 'Western Classics · Mental Models' },
    'tiandao-humanity':  { zh: '天道·人性', en: 'The Way & Human Nature' },
    'lin-notes':         { zh: '小Lin的笔记', en: "Lin's Notes" },
    'mind':              { zh: '心智', en: 'Mind' }
};
function seriesName(series, lang) {
    const s = SERIES_NAMES[series];
    if (!s) return series || '随笔';
    return lang === 'en' ? s.en : s.zh;
}

/* ============================================================
 * 写作站文章页
 * ============================================================ */
function renderColinArticle(post) {
    const { slug, title, summary, body, series } = post;
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const minutes = readMinutes(body);
    const chars = (body || '').length;
    const url = `${COLIN_SITE}/articles/${slug}`;
    const html = md2html(body);
    const sName = seriesName(series, 'zh');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} | 小Lin思考</title>
<meta name="description" content="${esc(summary || '')}">
${COLIN_GA}
<script>(function(){var t=localStorage.getItem("preferred-theme")||"light",l=localStorage.getItem("preferred-lang")||"zh";document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-lang",l)})()</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Noto+Serif+SC:wght@300;400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<style>${COLIN_STYLE}</style>
    <meta property="og:title" content="${esc(title)} | 小Lin思考">
    <meta property="og:description" content="${esc(summary || '')}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${COLIN_SITE}/images/og-image.jpg">
    <meta property="og:site_name" content="小Lin思考 · 道·术·器认知体系">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(summary || '')}">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="zh" href="${url}" />
    <link rel="alternate" hreflang="x-default" href="${url}" />
</head>
<body>
${COLIN_NAV}
<button class="back-to-top" id="backToTop">↑</button>
<main>
<article class="article-wrap">
<div class="article-meta">
<a href="/archive.html?series=${encodeURIComponent(series || '')}" class="article-collection">${esc(sName)}</a>
<span class="article-date">${ym}</span>
<span class="article-reading">约${minutes}分钟阅读 · 约${chars}字</span>
</div>
<h1 class="article-title">${esc(title)}</h1>
<p class="article-byline">作者：小Lin思考</p>
<p class="article-subtitle">${esc(summary || '')}</p>
<div class="article-body">

${html}

<hr>
<p style="font-size:0.82rem;color:var(--t3);text-align:center;margin-top:2rem;">© 小Lin思考 | 用道·术·器，重建你的认知操作系统<br>觉得有共鸣，转发给一个正在迷茫的朋友。</p>

</div>
<div style="margin-top:2.5rem;padding:1.1rem 1.3rem;border:1px solid var(--bd);border-radius:8px;display:flex;gap:14px;align-items:flex-start;">
<span style="font-size:1.5rem;line-height:1;">📝</span>
<div style="display:flex;flex-direction:column;gap:4px;">
<span style="font-size:0.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--t2);">本篇属于系列</span>
<span style="font-weight:700;font-size:1.02rem;color:var(--t1);">${esc(sName)}</span>
<span style="font-size:0.78rem;color:var(--t2);"><a href="/archive.html?series=${encodeURIComponent(series || '')}" style="color:var(--gold);text-decoration:none;">查看本系列全部文章 →</a> · 公众号「小Lin思考」连载中</span>
</div>
</div>
<div class="article-footer">
<a href="/subscribe.html" class="wechat-cta">📱 关注公众号 · 不错过更新</a>
<a href="https://readswithcolin.com" target="_blank" rel="noopener" class="back-link">📚 我的读书站 Reads with Colin →</a>
<a href="/archive.html" class="back-link">← 返回思维库</a>
</div>
</article>
</main>
<script src="/js/common.js"></script>
<script>
var btt = document.getElementById('backToTop');
window.addEventListener('scroll', function(){ btt.classList.toggle('visible', window.scrollY > 400); }, {passive:true});
btt.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
</script>
</body>
</html>`;
}

/** 写作站 articles.json 新条目 */
function buildColinArticleEntry(post) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const minutes = readMinutes(post.body);
    const series = post.series || 'lin-notes';
    return {
        id: post.slug,
        title: post.title,
        titleEn: post.titleEn || post.title,
        filename: `articles/${post.slug}/index.html`,
        url: `articles/${post.slug}/`,
        category: series,
        categoryEn: seriesName(series, 'en'),
        categoryName: seriesName(series, 'zh'),
        categoryNameEn: seriesName(series, 'en'),
        date: `${y}年${m}月${d}日`,
        dateEn: `${['January','February','March','April','May','June','July','August','September','October','November','December'][m - 1]} ${d}, ${y}`,
        excerpt: post.summary || '',
        excerptEn: post.summaryEn || post.summary || '',
        readTime: `${minutes}分钟阅读`,
        readTimeEn: `${minutes} min read`,
        series,
        seriesName: seriesName(series, 'zh'),
        seriesNameEn: seriesName(series, 'en'),
        publishMeta: {
            source: 'pwa',
            publishedAt: now.toISOString(),
            publishTargets: ['thecolin-vip'],
            published: true
        }
    };
}

/* ============================================================
 * 读书站笔记页（复用站内 css/style.css，双语结构）
 * ============================================================ */
function renderRwcPost(post) {
    const { slug, title, titleEn, summary, summaryEn, body, bodyEn, series } = post;
    const now = new Date();
    const url = `${RWC_SITE}/posts/${slug}.html`;
    const enHtml = md2html(bodyEn || summaryEn || '');
    const zhHtml = md2html(body || summary || '');
    const catName = seriesName(series, 'en');
    const minutes = readMinutes(bodyEn || body);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titleEn || title)} — a reading note | Reads with Colin</title>
  <meta name="description" content="${esc(summaryEn || summary || '')}">
  <meta property="og:title" content="${esc(titleEn || title)} — a reading note">
  <meta property="og:description" content="${esc(summaryEn || summary || '')}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Noto+Serif+SC:wght@600;700;900&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
  <meta name="theme-color" content="#5B7A64">
</head>
<body>

  <nav class="nav">
    <a class="nav-brand" href="../index.html">
      <span class="name">Reads <em>with</em> Colin</span>
    </a>
    <div class="nav-right">
      <a class="nav-link" href="../archive.html"><span lang="en">Archive</span><span lang="zh">往期</span></a>
      <a class="nav-link" href="../categories.html"><span lang="en">Categories</span><span lang="zh">分类</span></a>
      <div class="lang-switch" role="group" aria-label="Language">
        <a href="#" data-set-lang="en" class="active">EN</a>
        <a href="#" data-set-lang="zh">中文</a>
      </div>
    </div>
  </nav>

  <article class="post-page">
    <header class="post-header">
      <div class="post-meta">
        <span class="rwc-badge">${esc((post.rwcTag || 'RWC').toUpperCase())}</span>
        <span class="dot">·</span>
        <span>${esc(catName)}</span>
        <span class="dot">·</span>
        <span>${minutes} min read</span>
      </div>
      <h1>
        <span lang="en">${esc(titleEn || title)}</span>
        <span lang="zh">${esc(title)}</span>
      </h1>
      <p class="subtitle">
        <span lang="en">A reading note by Colin${summaryEn ? ' — ' + esc(summaryEn) : '.'}</span>
        <span lang="zh">Colin 的读书笔记${summary ? ' · ' + esc(summary) : ''}</span>
      </p>
    </header>

    <div class="post-body">
      ${enHtml ? `<div lang="en">\n${enHtml}\n</div>` : ''}
      ${zhHtml ? `<div lang="zh">\n${zhHtml}\n</div>` : ''}
    </div>

    <footer class="post-footer" style="margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(0,0,0,.1);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
      <a href="../archive.html" style="text-decoration:none;color:inherit;opacity:.7;">← Archive</a>
      <a href="https://www.thecolin.vip" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;opacity:.7;">Writing · thecolin.vip ↗</a>
    </footer>
  </article>

  <script>
    // 双语切换（与站内一致的 lang 属性驱动）
    document.querySelectorAll('[data-set-lang]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        var lang = a.getAttribute('data-set-lang');
        document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
        document.querySelectorAll('[data-set-lang]').forEach(function(x) { x.classList.toggle('active', x === a); });
        try { localStorage.setItem('preferred-lang', lang); } catch (e) {}
      });
    });
    try {
      var saved = localStorage.getItem('preferred-lang');
      if (saved === 'zh') {
        var zhBtn = document.querySelector('[data-set-lang="zh"]');
        if (zhBtn) zhBtn.click();
      }
    } catch (e) {}
  </script>
</body>
</html>`;
}

/** 读书站 data/posts.json 新条目（与 extract_posts.py schema 一致，缺失字段优雅降级） */
function buildRwcPostEntry(post, rwcNumber) {
    const now = new Date();
    return {
        slug: post.slug,
        rwcNumber,
        category: post.series || 'thinking',
        categoryLabel: seriesName(post.series, 'en'),
        categoryLabelZh: seriesName(post.series, 'zh'),
        titleEn: post.titleEn || post.title,
        titleZh: post.title,
        authorEn: 'Colin',
        authorZh: '小Lin思考',
        teaserEn: post.summaryEn || post.summary || '',
        teaserZh: post.summary || '',
        greetingEn: 'Hello —',
        greetingZh: '你好 —',
        introEn: post.summaryEn || '',
        introZh: post.summary || '',
        quote: { textEn: '', textZh: '', srcEn: '', srcZh: '' },
        readMin: readMinutes(post.bodyEn || post.body),
        cover: '',
        featured: false,
        publishedAt: now.toISOString().slice(0, 10),
        isNew: true,
        source: 'pwa'
    };
}

/**
 * 把新条目合并进 JSON 数组文本（prepend；同 id/slug 覆盖）。
 * 返回 { text, nextNumber } —— nextNumber 供读书站 RWC 编号递增。
 */
function mergeJsonArray(existingText, newEntry, idKey, numberKey) {
    let parsed = [];
    if (existingText) {
        try { parsed = JSON.parse(existingText); } catch (e) {
            throw new Error('目标 JSON 文件解析失败：' + e.message);
        }
    }

    // 支持两种结构：裸数组（写作站 articles.json）或 { items: [...] } wrapper（读书站 posts.json）
    const isWrapper = parsed && !Array.isArray(parsed) && Array.isArray(parsed.items);
    let arr = isWrapper ? parsed.items : (Array.isArray(parsed) ? parsed : []);

    const key = String(newEntry[idKey] || '');
    arr = arr.filter(x => String(x[idKey] || '') !== key);

    let nextNumber = null;
    if (numberKey) {
        const maxNum = arr.reduce((mx, x) => Math.max(mx, Number(x[numberKey]) || 0), 0);
        nextNumber = maxNum + 1;
        newEntry[numberKey] = nextNumber;
    }
    arr.unshift(newEntry);

    let text;
    if (isWrapper) {
        parsed.items = arr;
        parsed.updated = new Date().toISOString().slice(0, 10);
        text = JSON.stringify(parsed, null, 2) + '\n';
    } else {
        text = JSON.stringify(arr, null, 2) + '\n';
    }
    return { text, nextNumber };
}

module.exports = {
    renderColinArticle, buildColinArticleEntry,
    renderRwcPost, buildRwcPostEntry,
    mergeJsonArray, md2html, slugText: (s) => s
};
