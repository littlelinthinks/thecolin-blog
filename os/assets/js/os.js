/* ==========================================================================
   Personal Knowledge OS · 交互逻辑 v1.2
   数据策略：pipeline.json（只读基线） + localStorage（本机增量）
   —— 静态站无法回写服务器，因此本机改动存在浏览器；发布动作走 /api/publish。
   v1.2：新增发布字段（slug/lang/英文三件套/publish 结果）+ OS.publish() 骨架
   ========================================================================== */

const OS = (() => {
    'use strict';

    /* ---------- 常量 ---------- */
    const STORE_KEY = 'colin_os_pipeline_v1';
    const THEME_KEY = 'colin_os_theme';
    const API_PUBLISH = '/api/publish';   // 阶段 4 部署的 Vercel Serverless

    const STATUS = {
        seed:      { key: 'seed',      label: '起念', en: 'Seed',      next: 'draft',     hint: '只有一句话' },
        draft:     { key: 'draft',     label: '起草', en: 'Draft',     next: 'ready',     hint: '正在写' },
        ready:     { key: 'ready',     label: '待发', en: 'Ready',     next: 'published', hint: '写完等发' },
        published: { key: 'published', label: '已发', en: 'Published', next: null,        hint: '已上线' }
    };

    const CHANNELS = {
        thecolin:       { label: '写作站', full: 'thecolin.vip' },
        readswithcolin: { label: '读书站', full: 'readswithcolin.com' },
        wechat:         { label: '公众号', full: '小Lin思考' }
    };

    const STALE_DAYS = 5;

    /* ---------- 工具 ---------- */
    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const today = () => new Date().toISOString().slice(0, 10);

    /* slug：英文/数字直接转 kebab-case；纯中文/混合时混入短 id 保证唯一与 URL 安全 */
    function slugify(text, fallbackSeed) {
        const base = String(text || '')
            .toLowerCase()
            .replace(/['’"“”,.!?;:、。！？；：（）()《》<>【】\[\]—–~·…]/g, '')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        // 剩余长度太短说明基本是中文 → 用 fallbackSeed（一般是 id）
        if (base.length >= 3) return base.slice(0, 60);
        return String(fallbackSeed || 'post').toLowerCase().replace(/[^\w-]/g, '');
    }

    /* 一条 item 的发布态（v1.2 schema）。旧数据缺字段时在此补齐默认值 */
    function normalizeItem(it) {
        return Object.assign({
            slug: '', lang: 'zh',
            titleEn: '', summaryEn: '', bodyEn: '',
            publish: { status: 'none', publishedAt: '', urls: {}, error: '' }
        }, it, {
            // publish 子对象单独合并，防止整对象覆盖丢字段
            publish: Object.assign(
                { status: 'none', publishedAt: '', urls: {}, error: '' },
                it.publish || {}
            )
        });
    }

    /* 发布态徽标文案 */
    function publishBadge(it) {
        const p = it.publish || {};
        if (p.status === 'success') {
            const n = Object.keys(p.urls || {}).length;
            return `<span class="os-pub-badge ok" title="已发布 ${n} 个目标">✓ 已发布</span>`;
        }
        if (p.status === 'partial') return `<span class="os-pub-badge part" title="${esc(p.error || '')}">◐ 部分成功</span>`;
        if (p.status === 'error')   return `<span class="os-pub-badge err" title="${esc(p.error || '')}">✕ 发布失败</span>`;
        if (p.status === 'sending') return `<span class="os-pub-badge send">… 发布中</span>`;
        return '';
    }

    function daysBetween(a, b) {
        const d1 = new Date(a + 'T00:00:00');
        const d2 = new Date(b + 'T00:00:00');
        return Math.max(0, Math.round((d2 - d1) / 86400000));
    }

    function fmtDate(s) {
        if (!s) return '';
        const [y, m, d] = s.split('-');
        return `${y}.${+m}.${+d}`;
    }

    /* ---------- 数据层 ---------- */
    let baseline = [];   // 来自 pipeline.json
    let local    = [];   // 来自 localStorage
    let merged   = [];   // 合并结果（local 优先）

    function mergeItems() {
        const map = new Map();
        baseline.forEach(i => map.set(i.id, normalizeItem(i)));
        local.forEach(i => map.set(i.id, normalizeItem(i)));
        merged = Array.from(map.values());
        return merged;
    }

    async function loadBaseline() {
        try {
            const res = await fetch('./assets/data/pipeline.json', { cache: 'no-store' });
            baseline = (await res.json()).items || [];
        } catch (e) {
            console.warn('[OS] pipeline.json 读取失败，仅用本机数据', e);
            baseline = [];
        }
    }

    function loadLocal() {
        try { local = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
        catch { local = []; }
    }

    function saveLocal() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(local)); return true; }
        catch { toast('本机存储写入失败'); return false; }
    }

    /* 找到一条（用于推进状态） */
    function findItem(id) {
        return merged.find(i => i.id === id);
    }

    function upsertLocal(item) {
        const idx = local.findIndex(i => i.id === item.id);
        if (idx >= 0) local[idx] = item; else local.push(item);
        saveLocal();
    }

    /* 推进 / 回退状态 */
    function advance(id, dir = 1) {
        const it = findItem(id);
        if (!it) return;
        const order = ['seed', 'draft', 'ready', 'published'];
        let i = order.indexOf(it.status);
        if (i < 0) return;
        i = Math.min(order.length - 1, Math.max(0, i + dir));
        it.status = order[i];
        it.updated = today();
        upsertLocal({ ...it });
        renderAll();
        toast(`已推进到「${STATUS[it.status].label}」`);
    }

    /* ---------- 主题 ---------- */
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (sysDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);

        $$('.os-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cur = document.documentElement.getAttribute('data-theme');
                const next = cur === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem(THEME_KEY, next);
                updateThemeIcon(next);
            });
        });
    }
    function updateThemeIcon(theme) {
        $$('.os-theme-btn .theme-icon').forEach(el => { el.textContent = theme === 'dark' ? '☀️' : '🌙'; });
    }

    /* ---------- Toast ---------- */
    let toastTimer = null;
    function toast(msg) {
        let el = $('.os-toast');
        if (!el) { el = document.createElement('div'); el.className = 'os-toast'; document.body.appendChild(el); }
        el.textContent = msg;
        requestAnimationFrame(() => el.classList.add('show'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    }

    /* ---------- 渲染：看板 ---------- */
    function cardHTML(it) {
        const age = daysBetween(it.created, today());
        const stale = age >= STALE_DAYS && it.status !== 'published';
        const chans = (it.channels || []).map(c => {
            const meta = CHANNELS[c] || { label: c };
            return `<span class="os-chip ch-${esc(c)}">${esc(meta.label)}</span>`;
        }).join('');
        const rel = (it.related && it.related.length)
            ? `<span class="os-rel" title="与其他想法关联">◈ ${it.related.length}</span>` : '';
        const nextLabel = STATUS[it.status].next ? `推进到 ${STATUS[STATUS[it.status].next].label}` : '已发布';
        const badge = publishBadge(it);
        const langTag = it.lang === 'en' ? '<span class="os-lang-tag">EN</span>'
                      : it.lang === 'bi' ? '<span class="os-lang-tag">双语</span>' : '';

        return `
        <article class="os-card" data-id="${esc(it.id)}" data-open="${esc(it.id)}" role="button" tabindex="0" title="点击编辑">
            ${rel}
            <h3 class="os-card-title">${esc(it.title)}${langTag}</h3>
            <p class="os-card-sum">${esc(it.summary || '（暂无摘要）')}</p>
            <div class="os-card-foot">
                ${chans}
                <span class="os-age ${stale ? 'stale' : ''}" title="停留天数">${age}d</span>
            </div>
            ${badge ? `<div class="os-pub-row">${badge}</div>` : ''}
            ${STATUS[it.status].next ? `<button class="os-adv" title="${esc(nextLabel)}" data-adv="${esc(it.id)}">→</button>` : ''}
        </article>`;
    }

    function renderBoard() {
        const board = $('#osBoard');
        if (!board) return;
        const order = ['seed', 'draft', 'ready', 'published'];

        board.innerHTML = order.map(st => {
            const items = merged
                .filter(i => i.status === st)
                .sort((a, b) => (a.updated < b.updated ? 1 : -1));
            return `
            <section class="os-col">
                <div class="os-col-head">
                    <div>
                        <div class="os-col-title"><span class="os-dot d-${st}"></span>${STATUS[st].label}</div>
                        <div class="os-col-hint">${STATUS[st].hint}</div>
                    </div>
                    <span class="os-col-count">${items.length}</span>
                </div>
                ${items.length ? items.map(cardHTML).join('') : `<div class="os-empty" style="padding:1.5rem .5rem;font-size:.78rem;">空</div>`}
            </section>`;
        }).join('');

        $$('[data-adv]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                advance(btn.getAttribute('data-adv'), 1);
            });
        });

        // 点击卡片 → 进入编辑（发布操作在编辑页/已发页）
        $$('[data-open]').forEach(card => {
            card.addEventListener('click', () => {
                location.href = 'new.html?id=' + encodeURIComponent(card.getAttribute('data-open'));
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target === card) {
                    location.href = 'new.html?id=' + encodeURIComponent(card.getAttribute('data-open'));
                }
            });
        });
    }

    /* ---------- 渲染：统计 ---------- */
    function renderStats() {
        const wrap = $('#osStats');
        if (!wrap) return;
        const week = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
        const data = [
            { n: merged.filter(i => i.status !== 'published').length, l: '在途内容', c: 'g-red' },
            { n: merged.filter(i => ['draft', 'ready'].includes(i.status)).length, l: '起草 / 待发', c: 'g-brown' },
            { n: merged.filter(i => i.status === 'published').length, l: '已发表', c: 'g-green' },
            { n: merged.filter(i => i.updated >= week).length, l: '近 7 天有更新', c: '' }
        ];
        wrap.innerHTML = data.map(d => `
            <div class="os-stat ${d.c}">
                <div class="os-stat-num">${d.n}</div>
                <div class="os-stat-label">${d.l}</div>
            </div>`).join('');
    }

    /* ---------- 渲染：已发作品库 ---------- */
    function renderWorks() {
        const wrap = $('#osWorks');
        if (!wrap) return;
        const items = merged
            .filter(i => i.status === 'published')
            .sort((a, b) => (a.updated < b.updated ? 1 : -1));

        if (!items.length) {
            wrap.innerHTML = `<div class="os-empty"><div class="big">📮</div>还没有已发表的内容</div>`;
            return;
        }

        wrap.innerHTML = items.map(it => {
            const m = it.metrics || {};
            const chans = (it.channels || []).map(c => {
                const meta = CHANNELS[c] || { label: c };
                return `<span class="os-chip ch-${esc(c)}">${esc(meta.label)}</span>`;
            }).join('');
            const metrics = (m.views || m.saves) ? `
                <div class="os-metrics">
                    ${m.views ? `<div><div class="os-metric-num">${m.views}</div><div class="os-metric-label">阅读</div></div>` : ''}
                    ${m.saves ? `<div><div class="os-metric-num">${m.saves}</div><div class="os-metric-label">收藏</div></div>` : ''}
                </div>` : '';
            // 发布结果链接（publish.urls: { thecolin: 'https://...', ... }）
            const urls = Object.entries(it.publish?.urls || {});
            const links = urls.length ? `
                <div class="os-work-links">
                    ${urls.map(([c, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc((CHANNELS[c] || { label: c }).label)} ↗</a>`).join('')}
                </div>` : '';
            const badge = publishBadge(it);
            // 操作区：重新发布（API 渠道）+ 公众号草稿（剪贴板）
            const hasApi = (it.channels || []).some(c => c !== 'wechat');
            const actions = `
                <div class="os-work-actions">
                    ${hasApi ? `<button class="os-mini-btn" data-publish="${esc(it.id)}">🚀 发布</button>` : ''}
                    ${(it.channels || []).includes('wechat') ? `<button class="os-mini-btn ghost" data-wechat="${esc(it.id)}">💬 公众号草稿</button>` : ''}
                    <button class="os-mini-btn ghost" data-edit="${esc(it.id)}">✎ 编辑</button>
                </div>`;

            return `
            <article class="os-work">
                <div>
                    <h3 class="os-work-title">${esc(it.title)}</h3>
                    <div class="os-work-meta">
                        <span>${fmtDate(it.updated)}</span>
                        <span style="opacity:.4">·</span>
                        ${chans}
                        ${badge}
                    </div>
                    ${links}
                    ${it.feedback ? `<div class="os-work-feedback"><b>反馈</b>　${esc(it.feedback)}</div>` : ''}
                    ${actions}
                </div>
                ${metrics}
            </article>`;
        }).join('');

        // 发布 / 公众号草稿 / 编辑
        $$('[data-publish]').forEach(btn => {
            btn.addEventListener('click', async () => {
                btn.disabled = true; btn.textContent = '… 发布中';
                await publish(btn.getAttribute('data-publish'));
            });
        });
        $$('[data-wechat]').forEach(btn => {
            btn.addEventListener('click', () => copyForWechat(btn.getAttribute('data-wechat')));
        });
        $$('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                location.href = 'new.html?id=' + encodeURIComponent(btn.getAttribute('data-edit'));
            });
        });
    }

    function renderAll() { renderBoard(); renderStats(); renderWorks(); }

    /* ---------- 起草页：表单 ---------- */
    function initForm() {
        const form = $('#osForm');
        if (!form) return;

        // 渠道多选
        $$('.os-check', form).forEach(lab => {
            const cb = $('input', lab);
            lab.addEventListener('click', (e) => {
                e.preventDefault();
                cb.checked = !cb.checked;
                lab.classList.toggle('on', cb.checked);
            });
        });

        // 英文内容折叠区（语言选 英文/双语 时展开）
        const langSel = $('#fLang');
        const enBox = $('#fEnBox');
        function toggleEnBox() {
            if (!langSel || !enBox) return;
            const v = langSel.value;
            enBox.style.display = (v === 'en' || v === 'bi') ? '' : 'none';
        }
        if (langSel) { langSel.addEventListener('change', toggleEnBox); toggleEnBox(); }

        // 编辑既有条目：?id=xxx
        const params = new URLSearchParams(location.search);
        const editId = params.get('id');
        if (editId) {
            const it = findItem(editId);
            if (it) {
                $('#fTitle').value = it.title || '';
                $('#fSummary').value = it.summary || '';
                $('#fBody').value = it.body || '';
                $('#fSeries').value = it.series || '';
                $('#fStatus').value = it.status || 'seed';
                if ($('#fSlug'))  $('#fSlug').value = it.slug || '';
                if ($('#fLang'))  $('#fLang').value = it.lang || 'zh';
                if ($('#fTitleEn'))   $('#fTitleEn').value = it.titleEn || '';
                if ($('#fSummaryEn')) $('#fSummaryEn').value = it.summaryEn || '';
                if ($('#fBodyEn'))    $('#fBodyEn').value = it.bodyEn || '';
                $$('.os-check', form).forEach(lab => {
                    const cb = $('input', lab);
                    cb.checked = (it.channels || []).includes(cb.value);
                    lab.classList.toggle('on', cb.checked);
                });
                $('#formTitle').textContent = '编辑内容';
                if (toggleEnBox) toggleEnBox();
            }
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = $('#fTitle').value.trim();
            if (!title) { toast('请先填标题'); return; }

            const channels = $$('.os-check input:checked', form).map(cb => cb.value);
            const status = $('#fStatus').value;
            const existing = editId ? findItem(editId) : null;
            const id = existing ? existing.id : 'os-' + Date.now().toString(36);

            const item = normalizeItem({
                id,
                title,
                summary: $('#fSummary').value.trim(),
                body: $('#fBody').value.trim(),
                status,
                channels: channels.length ? channels : ['thecolin'],
                series: $('#fSeries').value.trim(),
                slug: $('#fSlug') ? $('#fSlug').value.trim() : '',
                lang: $('#fLang') ? $('#fLang').value : 'zh',
                titleEn: $('#fTitleEn') ? $('#fTitleEn').value.trim() : '',
                summaryEn: $('#fSummaryEn') ? $('#fSummaryEn').value.trim() : '',
                bodyEn: $('#fBodyEn') ? $('#fBodyEn').value.trim() : '',
                created: existing ? existing.created : today(),
                updated: today(),
                related: existing ? (existing.related || []) : [],
                metrics: existing ? existing.metrics : null,
                feedback: existing ? existing.feedback : '',
                // 发布结果保留（编辑不丢发布记录）
                publish: existing ? (existing.publish || {}) : {}
            });

            // slug 留空 → 由标题/ID 自动生成（发布时后端也会兜底）
            if (!item.slug) item.slug = slugify(item.titleEn || item.title, item.id);

            upsertLocal(item);
            toast(existing ? '已更新' : `已加入「${STATUS[status].label}」`);
            setTimeout(() => { location.href = 'index.html'; }, 700);
        });

        /* 保存并发布：先保存，再立即调 /api/publish（公众号渠道自动排除，走剪贴板） */
        const pubBtn = $('#osPublishBtn');
        if (pubBtn) {
            pubBtn.addEventListener('click', async () => {
                const title = $('#fTitle').value.trim();
                if (!title) { toast('请先填标题'); return; }

                // 复用 submit 逻辑：构造并保存 item（不发跳转）
                const channels = $$('.os-check input:checked', form).map(cb => cb.value);
                const existing = editId ? findItem(editId) : null;
                const id = existing ? existing.id : 'os-' + Date.now().toString(36);
                const item = normalizeItem({
                    id,
                    title,
                    summary: $('#fSummary').value.trim(),
                    body: $('#fBody').value.trim(),
                    status: 'ready',   // 发布动作本身即代表进入待发
                    channels: channels.length ? channels : ['thecolin'],
                    series: $('#fSeries').value.trim(),
                    slug: $('#fSlug') ? $('#fSlug').value.trim() : '',
                    lang: $('#fLang') ? $('#fLang').value : 'zh',
                    titleEn: $('#fTitleEn') ? $('#fTitleEn').value.trim() : '',
                    summaryEn: $('#fSummaryEn') ? $('#fSummaryEn').value.trim() : '',
                    bodyEn: $('#fBodyEn') ? $('#fBodyEn').value.trim() : '',
                    created: existing ? existing.created : today(),
                    updated: today(),
                    related: existing ? (existing.related || []) : [],
                    metrics: existing ? existing.metrics : null,
                    feedback: existing ? existing.feedback : '',
                    publish: existing ? (existing.publish || {}) : {}
                });
                if (!item.slug) item.slug = slugify(item.titleEn || item.title, item.id);
                upsertLocal(item); mergeItems();

                pubBtn.disabled = true;
                pubBtn.textContent = '… 发布中';
                const r = await publish(item.id);
                pubBtn.disabled = false;
                pubBtn.textContent = '🚀 保存并发布';

                if (r.ok) {
                    const first = Object.values(r.urls || {})[0];
                    setTimeout(() => { location.href = 'done.html'; }, 900);
                    if (first) console.log('发布地址:', r.urls);
                }
            });
        }

        /* 公众号草稿（编辑页直达剪贴板，富文本） */
        const wechatBtn = $('#osWechatBtn');
        if (wechatBtn) {
            wechatBtn.addEventListener('click', async () => {
                // 用当前表单内容生成草稿（无需先保存）
                const it = {
                    title: $('#fTitle').value.trim() || '未命名',
                    summary: $('#fSummary').value.trim(),
                    body: $('#fBody').value.trim()
                };
                const plain = [it.title, '', it.summary, '', it.body].join('\n');
                const html = buildWechatHtml(it);
                try {
                    if (navigator.clipboard && window.ClipboardItem) {
                        const item = new ClipboardItem({
                            'text/html': new Blob([html], { type: 'text/html' }),
                            'text/plain': new Blob([plain], { type: 'text/plain' })
                        });
                        await navigator.clipboard.write([item]);
                        toast('富文本草稿已复制，去公众号粘贴');
                    } else {
                        await navigator.clipboard.writeText(plain);
                        toast('已复制（纯文本），去公众号粘贴');
                    }
                } catch (e) {
                    toast('复制失败，请手动复制正文');
                }
            });
        }
    }

    /* ---------- 发布（调 /api/publish；后端未部署时优雅降级） ---------- */
    const TOKEN_KEY = 'colin_os_publish_token';

    function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
    function setToken(t) {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    }

    /* 口令不存在时弹输入（原生 prompt 足够；失败返回 null 中止发布） */
    function ensureToken() {
        let t = getToken();
        if (!t) {
            t = prompt('输入发布口令（部署时设置的 PUBLISH_TOKEN）');
            if (!t) return null;
            setToken(t.trim());
        }
        return t.trim();
    }

    async function publish(id) {
        const it = findItem(id);
        if (!it) { toast('找不到这条内容'); return { ok: false, error: 'not found' }; }

        const targets = (it.channels || []).filter(c => c !== 'wechat'); // 公众号走剪贴板，不走 API
        if (!targets.length) { toast('请先在编辑里勾选发布渠道'); return { ok: false, error: 'no targets' }; }

        const token = ensureToken();
        if (!token) { toast('没有口令，取消发布'); return { ok: false, error: 'no token' }; }

        it.publish = Object.assign({}, it.publish, { status: 'sending', error: '' });
        upsertLocal(it); mergeItems(); renderAll();

        try {
            const res = await fetch(API_PUBLISH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-OS-Token': token },
                body: JSON.stringify({
                    id: it.id,
                    slug: it.slug || slugify(it.titleEn || it.title, it.id),
                    lang: it.lang || 'zh',
                    title: it.title,
                    titleEn: it.titleEn || '',
                    summary: it.summary || '',
                    summaryEn: it.summaryEn || '',
                    body: it.body || '',
                    bodyEn: it.bodyEn || '',
                    series: it.series || '',
                    channels: targets
                })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.ok) {
                // 口令错误时清掉本地口令，下次重新输入
                if (res.status === 403) setToken('');
                throw new Error(data.error || ('HTTP ' + res.status));
            }

            // data.urls: { thecolin: 'https://...', readswithcolin: '...' }
            it.publish = {
                status: data.partial ? 'partial' : 'success',
                publishedAt: new Date().toISOString(),
                urls: data.urls || {},
                error: data.partial ? (data.error || '部分目标失败') : ''
            };
            it.status = 'published';
            it.updated = today();
            upsertLocal(it); mergeItems(); renderAll();
            toast(data.partial ? '部分发布成功' : '发布成功 🎉');
            return { ok: true, urls: data.urls };
        } catch (err) {
            it.publish = Object.assign({}, it.publish, { status: 'error', error: String(err.message || err) });
            upsertLocal(it); mergeItems(); renderAll();
            toast('发布失败：' + (err.message || err));
            return { ok: false, error: String(err.message || err) };
        }
    }

    /* ---------- 公众号草稿（剪贴板富文本：text/html + text/plain） ---------- */

    /* 前端轻量 md → html（与后端 templates.js 同规则子集：h2/h3、引用、列表、粗斜体、hr、段落） */
    function md2htmlLite(md) {
        if (!md) return '';
        const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const inline = (s) => escHtml(s)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
        const out = [];
        let inQuote = false, inList = null;
        const close = () => {
            if (inQuote) { out.push('</blockquote>'); inQuote = false; }
            if (inList) { out.push(`</${inList}>`); inList = null; }
        };
        for (const raw of String(md).replace(/\r\n/g, '\n').split('\n')) {
            const line = raw.trim();
            if (!line) { close(); continue; }
            const h = line.match(/^(###?)\s+(.*)$/);
            if (h) { close(); out.push(h[1].length === 2 ? `<h2>${inline(h[2])}</h2>` : `<h3>${inline(h[2])}</h3>`); continue; }
            if (/^(---|\*\*\*)\s*$/.test(line)) { close(); out.push('<hr>'); continue; }
            const q = line.match(/^>\s?(.*)$/);
            if (q) {
                if (inList) { out.push(`</${inList}>`); inList = null; }
                if (!inQuote) { out.push('<blockquote>'); inQuote = true; }
                out.push(`<p>${inline(q[1])}</p>`);
                continue;
            }
            const ul = line.match(/^[-*+]\s+(.*)$/);
            const ol = line.match(/^\d+\.\s+(.*)$/);
            if (ul || ol) {
                const want = ul ? 'ul' : 'ol';
                if (inList !== want) { close(); out.push(`<${want}>`); inList = want; }
                out.push(`<li>${inline((ul || ol)[1])}</li>`);
                continue;
            }
            close();
            out.push(`<p>${inline(line)}</p>`);
        }
        close();
        return out.join('\n');
    }

    /* 公众号编辑器兼容的内联样式 HTML（微信不支持外部 CSS，需 style 内联 + section 包裹） */
    function buildWechatHtml(it) {
        const styleP = 'margin:0 0 18px;font-size:16px;line-height:1.9;letter-spacing:.5px;color:#333;';
        const styleH2 = 'margin:32px 0 16px;font-size:19px;font-weight:700;color:#111;';
        const styleH3 = 'margin:24px 0 12px;font-size:17px;font-weight:700;color:#111;';
        const styleQ = 'margin:18px 0;padding:12px 16px;background:#f8f6f0;border-left:3px solid #C9A84C;color:#555;font-style:italic;';
        const body = md2htmlLite(it.body || it.summary || '')
            .replace(/<h2>/g, `<h2 style="${styleH2}">`)
            .replace(/<h3>/g, `<h3 style="${styleH3}">`)
            .replace(/<p>/g, `<p style="${styleP}">`)
            .replace(/<blockquote>/g, `<blockquote style="${styleQ}">`)
            .replace(/<li>/g, '<li style="margin:0 0 8px;font-size:16px;line-height:1.9;color:#333;">');
        const sub = it.summary
            ? `<p style="margin:0 0 24px;padding:0 0 20px;border-bottom:1px solid #eee;font-size:15px;color:#888;line-height:1.8;">${it.summary.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`
            : '';
        return `<section style="max-width:578px;margin:0 auto;font-family:-apple-system,'Noto Serif SC',Georgia,serif;">
<h1 style="margin:0 0 8px;font-size:23px;font-weight:900;color:#111;line-height:1.4;">${(it.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</h1>
<p style="margin:0 0 20px;font-size:13px;color:#aaa;">小Lin思考</p>
${sub}
${body}
<p style="margin:36px 0 0;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#999;text-align:center;">© 小Lin思考 · 用道·术·器，重建你的认知操作系统</p>
</section>`;
    }

    async function copyForWechat(id) {
        const it = findItem(id);
        if (!it) { toast('找不到这条内容'); return false; }
        const plain = [it.title, '', it.summary || '', '', it.body || ''].join('\n');
        const html = buildWechatHtml(it);

        try {
            // 富文本优先（公众号编辑器粘贴保留样式）
            if (navigator.clipboard && window.ClipboardItem) {
                const item = new ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([plain], { type: 'text/plain' })
                });
                await navigator.clipboard.write([item]);
                toast('富文本草稿已复制，去公众号粘贴');
                return true;
            }
            // 降级：纯文本
            await navigator.clipboard.writeText(plain);
            toast('已复制（纯文本），去公众号粘贴');
            return true;
        } catch (e) {
            toast('复制失败，请手动复制正文');
            return false;
        }
    }

    /* ---------- 导出 ---------- */
    function initExport() {
        $$('[data-export]').forEach(btn => {
            btn.addEventListener('click', () => {
                const blob = new Blob([JSON.stringify({ version: '1.0', updated: today(), items: merged }, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `pipeline_${today()}.json`;
                a.click();
                URL.revokeObjectURL(a.href);
                toast('已导出 pipeline.json');
            });
        });
    }

    /* ---------- 速记页 ---------- */
    function initCapture() {
        const form = $('#osCapture');
        if (!form) return;

        renderCaptureRecent();

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = $('#capText').value.trim();
            if (!text) { toast('先写一句再记'); return; }

            const source = $('#capSource').value.trim();
            const firstLine = text.split('\n')[0];
            const item = {
                id: 'os-' + Date.now().toString(36),
                title: firstLine.length > 42 ? firstLine.slice(0, 42) + '…' : firstLine,
                summary: '',
                body: text,
                status: 'seed',
                channels: ['thecolin'],
                series: '',
                source: source || '',
                created: today(),
                updated: today(),
                related: [],
                metrics: null,
                feedback: ''
            };
            upsertLocal(item);
            mergeItems();
            $('#capText').value = '';
            $('#capSource').value = '';
            toast('已记下，落在「起念」');
            renderCaptureRecent();
        });
    }

    function renderCaptureRecent() {
        const wrap = $('#capRecent');
        if (!wrap) return;
        const seeds = merged
            .filter(i => i.status === 'seed')
            .sort((a, b) => (a.created < b.created ? 1 : -1))
            .slice(0, 5);
        if (!seeds.length) {
            wrap.innerHTML = `<div style="padding:1.2rem .2rem;font-size:.8rem;color:var(--text-muted);">还没有起念。第一条从上面开始。</div>`;
            return;
        }
        wrap.innerHTML = seeds.map(it => `
            <div class="os-cap-item">
                <span class="os-cap-date">${fmtDate(it.created)}</span>
                <span class="os-cap-text">${esc(it.title)}</span>
                ${it.source ? `<span class="os-cap-src">《${esc(it.source)}》</span>` : ''}
            </div>`).join('');
    }

    /* ---------- Service Worker（离线可用） ---------- */
    function initSW() {
        if (!('serviceWorker' in navigator)) return;
        if (location.protocol === 'file:') return;
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        });
    }

    /* ---------- 安装到主屏幕 ---------- */
    function initInstall() {
        // 已独立运行（已安装）则不再提示
        if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return;
        // 只在手机上提示
        const isMobile = window.matchMedia('(max-width: 640px)').matches ||
            /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
        if (!isMobile) return;

        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        let deferredPrompt = null;

        const bar = document.createElement('div');
        bar.className = 'os-install-tip';
        bar.innerHTML = isIOS
            ? `<b>装成 App：</b>点 Safari 底部 <span class="tip-key">分享</span> → <span class="tip-key">添加到主屏幕</span>`
            : `<b>装成 App：</b>点浏览器菜单 → <span class="tip-key">安装应用</span>`;
        const close = document.createElement('button');
        close.className = 'tip-close';
        close.textContent = '×';
        close.setAttribute('aria-label', '关闭');
        close.addEventListener('click', () => bar.remove());
        bar.appendChild(close);
        document.body.appendChild(bar);

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            bar.innerHTML = `<b>装成 App：</b>一点就装，离线也能用 <button class="tip-go">安装</button>`;
            bar.appendChild(close);
            bar.querySelector('.tip-go').addEventListener('click', async () => {
                if (!deferredPrompt) return;
                deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                bar.remove();
            });
        });
    }

    /* ---------- 启动 ---------- */
    async function init() {
        initTheme();
        loadLocal();
        await loadBaseline();
        mergeItems();
        renderAll();
        initForm();
        initExport();
        initCapture();
        initSW();
        initInstall();
    }

    return {
        init, toast, advance, publish, copyForWechat, slugify,
        get items() { return merged; },
        find: findItem
    };
})();

document.addEventListener('DOMContentLoaded', OS.init);
