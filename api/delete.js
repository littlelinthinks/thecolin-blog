/**
 * /api/delete — 删除已发布文章
 *
 * 流程：
 *   1. 鉴权（X-OS-Token）
 *   2. 按 channels 删除仓库文件 + 从 JSON 数据源移除条目
 *   3. 返回 { ok, deleted: { channel: true }, errors }
 *
 * Body: { slug: 'xxx', channels: ['thecolin', 'readswithcolin'] }
 */

const { checkAuth } = require('./lib/auth');
const { readFile, commitFiles, deleteFile } = require('./lib/github');

const REPOS = {
    thecolin:       { owner: 'littlelinthinks', repo: 'thecolin-blog',   branch: 'main' },
    readswithcolin: { owner: 'littlelinthinks', repo: 'readswithcolin',  branch: 'main' }
};

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OS-Token, Authorization');
}

async function parseBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf-8');
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
}

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: '仅支持 POST' });

    const auth = checkAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

    const b = await parseBody(req);
    const slug = String(b.slug || '').trim();
    const channels = Array.isArray(b.channels) ? b.channels : [];

    if (!slug) return res.status(400).json({ ok: false, error: 'slug 缺失' });
    if (!channels.length) return res.status(400).json({ ok: false, error: 'channels 缺失' });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(503).json({ ok: false, error: '服务端未配置 GITHUB_TOKEN' });

    const deleted = {};
    const errors = [];
    const done = channels.filter(c => REPOS[c]);

    for (const ch of done) {
        const { owner, repo, branch } = REPOS[ch];
        try {
            const filePath = ch === 'thecolin' ? `articles/${slug}/index.html` : `posts/${slug}.html`;
            const jsonPath = ch === 'thecolin' ? 'articles.json' : 'data/posts.json';

            // 1. 删除文章页面/文件
            await deleteFile({ token, owner, repo, branch, path: filePath, message: `delete: ${slug}` });

            // 2. 从 JSON 列表移除条目
            const existing = await readFile({ token, owner, repo, path: jsonPath, branch });
            let updated = null;
            if (existing) {
                if (ch === 'thecolin') {
                    const arr = JSON.parse(existing);
                    const next = arr.filter(x => x.slug !== slug && x.url !== `articles/${slug}/` && !x.url?.includes(`/${slug}/`));
                    updated = JSON.stringify(next, null, 2);
                } else {
                    const wrapper = JSON.parse(existing);
                    wrapper.items = (wrapper.items || []).filter(x => x.slug !== slug);
                    updated = JSON.stringify(wrapper, null, 2);
                }
            }

            if (updated !== null) {
                await commitFiles({
                    token, owner, repo, branch,
                    message: `delete metadata: ${slug}`,
                    files: [{ path: jsonPath, content: updated }]
                });
            }

            deleted[ch] = true;
        } catch (e) {
            errors.push(`${ch}: ${e.message}`);
        }
    }

    const okCount = Object.keys(deleted).length;
    const result = {
        ok: okCount > 0,
        partial: okCount > 0 && errors.length > 0,
        deleted,
        error: errors.length ? errors.join(' | ') : ''
    };

    console.log(`[delete] slug=${slug} channels=${done.join(',')} ok=${okCount}/${done.length} ${result.error}`);
    return res.status(okCount > 0 ? 200 : 500).json(result);
};
