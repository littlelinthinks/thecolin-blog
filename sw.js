/**
 * COLIN Blog - Service Worker
 * Enables offline access and faster loading through caching
 * @version 4.0 (resilient: per-file caching, network-first navigation, offline fallback)
 */

const CACHE_NAME = 'colin-blog-v9'; // v9: 图标修正（DK→C）+ PWA manifest icon 同步
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/common.css',
    '/css/home.css',
    '/js/common.js',
    '/articles.json',
    '/series.json',
    '/rss.xml',
    '/favicon.ico',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    '/manifest.json'
];

// Install: cache static assets ONE BY ONE so a single failure never breaks activation
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[SW v4] Caching static assets (per-file, fault tolerant)');
            await Promise.all(STATIC_ASSETS.map(async (asset) => {
                try {
                    await cache.add(new Request(asset, { cache: 'reload' }));
                } catch (err) {
                    console.log('[SW v4] Skipped failed asset:', asset, err.message);
                }
            }));
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches (v1/v2/v3)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW v4] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (analytics, fonts, etc.)
    if (url.origin !== self.location.origin) return;

    // Strategy: Network-first for page navigation (always try to serve fresh page)
    if (request.mode === 'navigate') {
        event.respondWith(navigationHandler(request));
        return;
    }

    // Strategy: Network First for data files (articles.json etc.)
    if (url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Strategy: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Default: Cache First
    event.respondWith(cacheFirst(request));
});

// Helper: Check if static asset
function isStaticAsset(pathname) {
    return pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|ico)$/);
}

// Navigation: network first, cache fallback, offline page last resort
async function navigationHandler(request) {
    const cached = await caches.match(request, { ignoreSearch: true });
    // Also try the generic index.html in cache
    const cachedIndex = await caches.match('/index.html');

    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW v4] Navigation fetch failed, serving cache/offline page');
        if (cached) return cached;
        if (cachedIndex) return cachedIndex;
        return offlinePage();
    }
}

// Strategy: Cache First
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW v4] Fetch failed:', error);
        return new Response('Offline - Content unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Strategy: Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

// Built-in offline fallback page (no network needed)
function offlinePage() {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Colin's Blog - 暂时无法连接</title>
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#111;color:#eee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
.box{max-width:420px;padding:40px 30px}
h1{font-size:1.4em;margin-bottom:.6em}
p{line-height:1.7;color:#aaa;font-size:.95em}
a{color:#6ea8fe;text-decoration:none}
button{margin-top:1.2em;padding:10px 28px;background:#6ea8fe;border:0;border-radius:6px;color:#111;font-size:1em;cursor:pointer}
</style>
</head>
<body>
<div class="box">
<h1>📡 暂时无法连接服务器</h1>
<p>当前网络访问不到网站源站。<br>这通常是网络链路问题，不是网站故障。</p>
<button onclick="location.reload()">重新尝试</button>
</div>
</body>
</html>`;
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}
