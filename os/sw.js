/* ==========================================================================
   Colin OS · Service Worker v1.0
   策略：
   - 核心页面/样式/脚本/图标 → 预缓存 + cache-first（离线可开）
   - pipeline.json → network-first（在线拿最新，离线回退缓存）
   - Google Fonts → 直接放行（在线时浏览器缓存，离线优雅降级到系统衬线）
   ========================================================================== */

const VERSION = 'colin-os-v1';
const CORE = [
    './',
    './index.html',
    './capture.html',
    './new.html',
    './done.html',
    './manifest.json',
    './assets/css/os.css',
    './assets/js/os.js',
    './assets/data/pipeline.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(VERSION)
            .then(c => c.addAll(CORE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // 数据文件：network-first，保新鲜
    if (url.pathname.endsWith('pipeline.json')) {
        e.respondWith(
            fetch(req)
                .then(res => {
                    const copy = res.clone();
                    caches.open(VERSION).then(c => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // 同源静态资源：cache-first
    if (url.origin === location.origin) {
        e.respondWith(
            caches.match(req).then(hit => hit || fetch(req).then(res => {
                const copy = res.clone();
                caches.open(VERSION).then(c => c.put(req, copy));
                return res;
            }).catch(() => caches.match('./index.html')))
        );
        return;
    }

    // 外域（Google Fonts 等）：普通放行
});
