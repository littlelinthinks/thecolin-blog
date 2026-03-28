/**
 * 小Lin思考 - Service Worker
 * Enables offline access and faster loading through caching
 * @version 2.0
 */

const CACHE_NAME = 'xiaolin-thinks-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/common.css',
    '/css/home.css',
    '/js/common.js',
    '/articles.json',
    '/rss.xml',
    '/favicon.ico'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        }).catch((err) => {
            console.log('[SW] Cache failed:', err);
        })
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip analytics and external requests
    if (url.hostname.includes('google-analytics') ||
        url.hostname.includes('googletagmanager') ||
        url.hostname.includes('fonts.googleapis') ||
        url.hostname.includes('fonts.gstatic')) {
        return;
    }

    // Strategy: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Strategy: Stale While Revalidate for HTML pages
    if (request.mode === 'navigate') {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Strategy: Network First for API/data
    if (url.pathname.includes('/api/') || url.pathname.endsWith('.json')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // Default: Cache First
    event.respondWith(cacheFirst(request));
});

// Helper: Check if static asset
function isStaticAsset(pathname) {
    return pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|ico)$/);
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
        console.log('[SW] Fetch failed:', error);
        // Return offline fallback if available
        return new Response('Offline - Content unavailable', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Strategy: Stale While Revalidate
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(() => cached);

    return cached || fetchPromise;
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
