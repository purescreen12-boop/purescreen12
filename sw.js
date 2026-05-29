// Service Worker Versioning
const STATIC_CACHE = 'static-v3'; // Increment to force all users to fetch new assets ( ie. 2.1 )
const DYNAMIC_CACHE = 'dynamic-v3'; // Increment to force all users to fetch new assets

// List of core assets to be cached on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/index.tsx',
    '/gstv.png',
    '/site.webmanifest',
    '/offline.html'
];

// Add a list of dynamic/network-first URLs
const NETWORK_FIRST_URLS = [
    '/', // Catches the root path request
    '/index.html'
];

// 1. Install Event
self.addEventListener('install', (event) => {
    // Wait until static assets are fully cached before the worker is installed
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(CORE_ASSETS))
            .then(() => self.skipWaiting()) // Force the new SW to activate immediately
            .catch(error => console.error('Static cache installation failed:', error))
    );
});

// 2. Activate Event
self.addEventListener('activate', (event) => {
    // Clean up old caches
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Claim clients to control pages immediately
    );
});

// Fetch event - Uses a SPLIT STRATEGY based on URL path:
// 1. Network-First for dynamic pages (e.g., index, videos) to ensure fresh content.
// 2. Cache-First for all other assets (e.g., images, CSS, JS) for performance.
self.addEventListener('fetch', (event) => {
    // Only process GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    const requestURL = new URL(event.request.url).pathname;
    
    // --- 1. Network-First Strategy for Dynamic Pages ---
    if (NETWORK_FIRST_URLS.includes(requestURL)) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Check validity and cache the FRESH response
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        const responseToCache = networkResponse.clone();
                        caches.open(DYNAMIC_CACHE).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // If network fails (offline), fall back to the dynamic cache for the page
                    return caches.match(event.request).then(cachedResponse => {
                        return cachedResponse || caches.match('/offline.html');
                    });
                })
        );
        return; 
    }
    
    // --- 2. Cache-First Strategy for all other Assets (Images, etc.) ---
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Serve from cache if available
            if (cachedResponse) {
                return cachedResponse;
            }

            // Not in cache, proceed to network request
            return fetch(event.request)
                .then(networkResponse => {
                    // Check for invalid responses (e.g., bad status, cross-origin/opaque)
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
                        return networkResponse;
                    }

                    // Clone response and cache it
                    const responseToCache = networkResponse.clone();
                    
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                })
                .catch(() => {
                    // If network fails here, check for a static offline file if needed
                    return caches.match('/offline.html');
                });
        })
    );
});
