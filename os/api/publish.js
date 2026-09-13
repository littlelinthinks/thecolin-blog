/**
 * /api/publish — 发布中台入口（Vercel Serverless Function）
 *
 * 流程：
 *   1. 鉴权（X-OS-Token vs env.PUBLISH_TOKEN）
 *   2. 按 channels 分仓库组装文件变更：
 *        thecolin       → littlelinthinks/thecolin-blog   articles/{slug}/index.html + articles.json
 *        readswithcolin → littlelinthinks/readswithcolin  posts/{slug}.html + data/posts.json
 *   3. 每仓库一次 Git Data API 原子 commit → 触发 Vercel 自动部署
 *   4. 返回 { ok, urls: { thecolin, readswithcolin }, commits: {...} }
 *
 * 环境变量（Vercel Dashboard → Settings → Environment Variables）：
 *   GITHUB_TOKEN   fine-grained PAT（两个仓库 contents:read/write）
 *   PUBLISH_TOKEN  PWA 前端口令
 *
 * 公众号不在本接口范围（无 API，前端走剪贴板）。
 */

const { checkAuth } = require('./lib/auth');
const { commitFiles, readFile } = require('./lib/github');
const T = require('./lib/templates');

const REPOS = {
    thecolin:       { owner: 'littlelinthinks', repo: 'thecolin-blog',   branch: 'main' },
    readswithcolin: { owner: 'littlelinthinks', repo: 'readswithcolin',  branch: 'main' }
};

const SITE_URLS = {
    thecolin:       (slug) => `https://www.thecolin.vip/articles/${slug}/`,
    readswithcolin: (slug) => `https://readswithcolin.com/posts/${slug}.html`
};

/* ---------- CORS 预检（同仓库部署其实同域，此处兜底自定义域名场景） ---------- */
function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OS-Token, Authorization');
}

module.exports = async function handler(req, res) {
    cors(res);

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ ok: false, error: '仅支持 POST' });
    }

    /* ---- 鉴权 ---- */
    const auth = checkAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

    /* ---- 参数 ---- */
    const b = req.body || {};
    const slug = String(b.slug || '').trim();
    const title = String(b.title || '').trim();
    const body = String(b.body || '').trim();
    const channels = Array.isArray(b.channels) ? b.channels : [];

    if (!slug || !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
        return res.status(400).json({ ok: false, error: 'slug 缺失或非法（仅字母数字与连字符）' });
    }
    if (!title) return res.status(400).json({ ok: false, error: 'title 缺失' });
    if (!body)  return res.status(400).json({ ok: false, error: 'body 缺失' });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(503).json({ ok: false, error: '服务端未配置 GITHUB_TOKEN' });

    const post = {
        slug,
        lang: b.lang || 'zh',
        title,
        titleEn: String(b.titleEn || ''),
        summary: String(b.summary || ''),
        summaryEn: String(b.summaryEn || ''),
        body,
        bodyEn: String(b.bodyEn || ''),
        series: String(b.series || '')
    };

    const urls = {};
    const commits = {};
    const errors = [];
    const done = channels.filter(c => REPOS[c]);

    if (!done.length) {
        return res.status(400).json({ ok: false, error: '没有可发布的渠道（公众号请用剪贴板方案）' });
    }

    for (const ch of done) {
        const { owner, repo, branch } = REPOS[ch];
        try {
            let files;
            if (ch === 'thecolin') {
                const existing = await readFile({ token, owner, repo, path: 'articles.json', branch });
                const entry = T.buildColinArticleEntry(post);
                const merged = T.mergeJsonArray(existing, entry, 'id');
                files = [
                    { path: `articles/${slug}/index.html`, content: T.renderColinArticle(post) },
                    { path: 'articles.json', content: merged.text }
                ];
            } else {
                const existing = await readFile({ token, owner, repo, path: 'data/posts.json', branch });
                const entry = T.buildRwcPostEntry(post, 0);
                const merged = T.mergeJsonArray(existing, entry, 'slug', 'rwcNumber');
                files = [
                    { path: `posts/${slug}.html`, content: T.renderRwcPost({ ...post, rwcTag: `RWC #${String(merged.nextNumber).padStart(3, '0')}` }) },
                    { path: 'data/posts.json', content: merged.text }
                ];
            }

            const commit = await commitFiles({
                token, owner, repo, branch,
                message: `publish: ${title} (via Personal OS)`,
                files
            });
            commits[ch] = commit.htmlUrl;
            urls[ch] = SITE_URLS[ch](slug);
        } catch (e) {
            errors.push(`${ch}: ${e.message}`);
        }
    }

    const okCount = Object.keys(urls).length;
    const result = {
        ok: okCount > 0,
        partial: okCount > 0 && errors.length > 0,
        urls,
        commits,
        error: errors.length ? errors.join(' | ') : ''
    };

    // 简易日志（Vercel Logs 可见）
    console.log(`[publish] slug=${slug} channels=${done.join(',')} ok=${okCount}/${done.length} ${result.error}`);

    return res.status(okCount > 0 ? 200 : 500).json(result);
};
