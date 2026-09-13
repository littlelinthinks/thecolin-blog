/**
 * lib/auth.js — 发布接口鉴权
 *
 * 两层：
 *   1. PUBLISH_TOKEN —— PWA 前端用户输入的口令（localStorage 记住），
 *      防止陌生人随意调用接口消耗部署次数。
 *   2. GITHUB_TOKEN  —— 只存在于 Vercel 环境变量，永不下发到前端。
 *
 * token 通过 header 传输：  X-OS-Token: <PUBLISH_TOKEN>
 */

function checkAuth(req) {
    const expected = process.env.PUBLISH_TOKEN;
    if (!expected) {
        return { ok: false, status: 503, error: '服务端未配置 PUBLISH_TOKEN 环境变量' };
    }
    const provided = req.headers['x-os-token'] ||
        (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!provided) {
        return { ok: false, status: 401, error: '缺少发布口令（X-OS-Token）' };
    }
    // 常量时间比较，避免 timing 泄露
    if (!timingSafeEqual(String(provided), String(expected))) {
        return { ok: false, status: 403, error: '发布口令不正确' };
    }
    return { ok: true };
}

function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

module.exports = { checkAuth };
