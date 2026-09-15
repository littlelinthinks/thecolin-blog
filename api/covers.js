/**
 * /api/covers — 读书站封面管理
 *
 * 说明：
 *   - 部署在 thecolin-blog 的 Vercel 项目，复用 GITHUB_TOKEN / PUBLISH_TOKEN。
 *   - 通过 Git Data API 把封面写入 readswithcolin 仓库并触发自动部署。
 *
 * GET  /api/covers        → 列出 readswithcolin 全部书（slug / 书名 / 当前封面）
 * POST /api/covers        → 上传/替换某本书的封面
 *   Body: { slug: 'xxx', image: 'data:image/jpeg;base64,/9j/4AAQ...' }
 *   支持 MIME: image/jpeg, image/png, image/webp
 */

const { checkAuth } = require('./lib/auth');
const { commitFiles, readFile } = require('./lib/github');

const REPO = { owner: 'littlelinthinks', repo: 'readswithcolin', branch: 'main' };
const POSTS_JSON = 'data/posts.json';
const COVERS_DIR = 'img/covers';

const MIME_EXT = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-OS-Token, Authorization');
}

async function parseBody(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString('utf-8');
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {};
    }
}

function validSlug(slug) {
    return /^[a-z0-9-]+$/.test(String(slug || ''));
}

/** 简化书籍信息返回给前端 */
function simplify(items) {
    return (items || []).map(p => ({
        slug: p.slug,
        rwcNumber: p.rwcNumber,
        titleEn: p.titleEn || '',
        titleZh: p.titleZh || '',
        authorEn: p.authorEn || '',
        authorZh: p.authorZh || '',
        cover: p.cover || ''
    }));
}

module.exports = async function handler(req, res) {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const auth = checkAuth(req);
    if (!auth.ok) return res.status(auth.status).json({ ok: false, error: auth.error });

    const token = process.env.GITHUB_TOKEN;
    if (!token) return res.status(503).json({ ok: false, error: '服务端未配置 GITHUB_TOKEN' });

    try {
        if (req.method === 'GET') {
            const raw = await readFile({ token, ...REPO, path: POSTS_JSON });
            if (!raw) return res.status(404).json({ ok: false, error: 'readswithcolin data/posts.json 不存在' });
            const data = JSON.parse(raw);
            return res.status(200).json({ ok: true, count: (data.items || []).length, items: simplify(data.items || []) });
        }

        if (req.method === 'POST') {
            const b = await parseBody(req);
            const slug = String(b.slug || '').trim();
            const image = String(b.image || '').trim();

            if (!validSlug(slug)) return res.status(400).json({ ok: false, error: 'slug 缺失或格式不正确（仅小写字母、数字、连字符）' });
            if (!image) return res.status(400).json({ ok: false, error: 'image 缺失' });

            const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,\s*([A-Za-z0-9+/=\s]+)$/);
            if (!match) return res.status(400).json({ ok: false, error: 'image 必须是 jpeg/png/webp 的 base64 dataURL' });

            const mime = match[1];
            const ext = MIME_EXT[mime];
            const base64 = match[2].replace(/\s/g, '');

            // 读取当前 posts.json
            const raw = await readFile({ token, ...REPO, path: POSTS_JSON });
            if (!raw) return res.status(404).json({ ok: false, error: 'readswithcolin data/posts.json 不存在' });
            const data = JSON.parse(raw);
            const items = data.items || [];
            const item = items.find(x => x.slug === slug);
            if (!item) return res.status(404).json({ ok: false, error: `未找到 slug=${slug} 的书` });

            const newPath = `${COVERS_DIR}/${slug}.${ext}`;
            const oldCover = item.cover || '';

            // 更新封面字段
            item.cover = newPath;
            data.updated = new Date().toISOString().slice(0, 10);

            const files = [
                { path: newPath, content: base64, encoding: 'base64' },
                { path: POSTS_JSON, content: JSON.stringify(data, null, 2) }
            ];

            // 扩展名变化时删除旧封面（在同一 tree 内标记删除）
            if (oldCover && oldCover !== newPath && oldCover.startsWith(`${COVERS_DIR}/`)) {
                files.push({ path: oldCover, delete: true });
            }

            const commit = await commitFiles({
                token, ...REPO,
                message: `cover: ${slug}.${ext} (via Personal OS)`,
                files
            });

            console.log(`[covers] slug=${slug} ext=${ext} old=${oldCover} new=${newPath}`);
            return res.status(200).json({ ok: true, slug, cover: newPath, commit: commit.htmlUrl });
        }

        return res.status(405).json({ ok: false, error: '仅支持 GET / POST' });
    } catch (e) {
        console.error('[covers error]', e.message);
        return res.status(500).json({ ok: false, error: e.message });
    }
};
