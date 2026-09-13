/**
 * lib/github.js — GitHub Git Data API 封装
 *
 * 目标：一次原子 commit 写入 N 个文件（文章页 + JSON 数据），
 * 触发目标仓库的 Vercel 自动部署。相比逐文件 Contents API PUT：
 *   1. 原子性 — 所有文件同一 commit，不存在中间态
 *   2. 无 409 快进冲突 — 基于 base commit 生成新 tree
 *   3. 一次部署 — Vercel 只构建一次
 *
 * 依赖：Node 18+ 原生 fetch（Vercel Functions 默认提供）。
 * PAT 权限：fine-grained，仅两个仓库的 contents:write。
 */

const API = 'https://api.github.com';

function ghHeaders(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'colin-os-publisher'
    };
}

async function ghFetch(token, path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: { ...ghHeaders(token), ...(options.headers || {}) }
    });
    if (!res.ok) {
        let detail = '';
        try { detail = JSON.stringify(await res.json()).slice(0, 300); } catch { /* ignore */ }
        const err = new Error(`GitHub ${options.method || 'GET'} ${path} → ${res.status} ${detail}`);
        err.status = res.status;
        throw err;
    }
    // 201/200 都返回 JSON；204 无 body
    if (res.status === 204) return null;
    return res.json();
}

/**
 * 原子提交多个文件到指定分支。
 * @param {object} opts
 * @param {string} opts.token      GitHub PAT
 * @param {string} opts.owner      仓库属主（littlelinthinks）
 * @param {string} opts.repo       仓库名
 * @param {string} opts.branch     默认 'main'
 * @param {string} opts.message    commit message
 * @param {Array<{path:string, content:string}>} opts.files
 * @returns {Promise<{commitSha:string, htmlUrl:string}>}
 */
async function commitFiles({ token, owner, repo, branch = 'main', message, files }) {
    if (!files || !files.length) throw new Error('commitFiles: files 为空');

    // 1. 取分支头 commit
    const ref = await ghFetch(token, `/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    const baseSha = ref.object.sha;

    // 2. 取 base commit → base tree
    const baseCommit = await ghFetch(token, `/repos/${owner}/${repo}/git/commits/${baseSha}`);
    const baseTreeSha = baseCommit.tree.sha;

    // 3. 逐文件创建 blob
    const treeItems = [];
    for (const f of files) {
        const blob = await ghFetch(token, `/repos/${owner}/${repo}/git/blobs`, {
            method: 'POST',
            body: JSON.stringify({
                content: Buffer.from(f.content, 'utf8').toString('base64'),
                encoding: 'base64'
            })
        });
        treeItems.push({
            path: f.path,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
        });
    }

    // 4. 创建新 tree（基于 base tree，只替换指定 path）
    const tree = await ghFetch(token, `/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems })
    });

    // 5. 创建 commit（parent = 分支头）
    const commit = await ghFetch(token, `/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
            message,
            tree: tree.sha,
            parents: [baseSha]
        })
    });

    // 6. 快进分支引用
    await ghFetch(token, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false })
    });

    return {
        commitSha: commit.sha,
        htmlUrl: `https://github.com/${owner}/${repo}/commit/${commit.sha}`
    };
}

/** 读取仓库文件内容（UTF-8）。404 返回 null（新建场景）。 */
async function readFile({ token, owner, repo, path, branch = 'main' }) {
    try {
        const data = await ghFetch(
            token,
            `/repos/${owner}/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${branch}`
        );
        return Buffer.from(data.content, 'base64').toString('utf8');
    } catch (e) {
        if (e.status === 404) return null;
        throw e;
    }
}

module.exports = { commitFiles, readFile };
