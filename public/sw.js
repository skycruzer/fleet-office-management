/**
 * Service Worker for B767 Fleet Management PWA
 * Provides offline functionality and caching strategies for aviation operations
 */

const CACHE_NAME = 'fleet-management-v1.0.0';
const STATIC_CACHE = 'fleet-static-v1.0.0';
const API_CACHE = 'fleet-api-v1.0.0';
const IMAGE_CACHE = 'fleet-images-v1.0.0';

// Critical resources that must be cached for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/pilots',
  '/alerts',
  '/settings',
  '/offline',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/main.js',
  '/_next/static/css/app.css',
  '/manifest.json'
];

// API endpoints for fleet data caching
const API_ROUTES = [
  '/api/pilots',
  '/api/dashboard',
  '/api/checks',
  '/api/compliance'
];

// Cache durations (in milliseconds)
const CACHE_DURATION = {
  STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
  API: 10 * 60 * 1000, // 10 minutes
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
  CRITICAL: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Install event - Cache critical resources
 */
self.addEventListener('install', event => {
  console.log('Fleet Management SW: Installing service worker');

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', event => {
  console.log('Fleet Management SW: Activating service worker');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE &&
                cacheName !== API_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('Fleet Management SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

/**
 * Fetch event - Handle network requests with caching strategies
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    if (isStaticResource(url)) {
      event.respondWith(handleStaticResource(request));
    } else if (isAPIRequest(url)) {
      event.respondWith(handleAPIRequest(request));
    } else if (isImageRequest(url)) {
      event.respondWith(handleImageRequest(request));
    } else if (isNavigationRequest(request)) {
      event.respondWith(handleNavigationRequest(request));
    }
  }
});

/**
 * Background sync for offline data
 */
self.addEventListener('sync', event => {
  if (event.tag === 'fleet-data-sync') {
    event.waitUntil(syncFleetData());
  }
});

/**
 * Push notification handling for critical flight alerts
 */
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      title: data.title || 'Fleet Management Alert',
      body: data.body || 'Critical fleet operation update',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      requireInteraction: data.priority === 'critical',
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ]
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    const data = event.notification.data;
    const url = data.url || '/alerts';

    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Helper functions
function isStaticResource(url) {
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff2') ||
         url.pathname === '/manifest.json';
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') ||
         url.origin.includes('supabase') ||
         API_ROUTES.some(route => url.pathname.startsWith(route));
}

function isImageRequest(url) {
  return url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.avif') ||
         url.pathname.startsWith('/icons/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

/**
 * Cache First strategy for static resources
 */
async function handleStaticResource(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Fleet Management SW: Failed to fetch static resource:', error);
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

/**
 * Network First with fallback strategy for API requests
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache successful API responses with expiration
      const responseClone = response.clone();
      const cacheEntry = {
        response: responseClone,
        timestamp: Date.now()
      };
      cache.put(request, new Response(JSON.stringify(cacheEntry), {
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return response;
  } catch (error) {
    console.log('Fleet Management SW: Network failed, checking cache for API request');

    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      const cacheEntry = await cachedResponse.json();
      const isExpired = Date.now() - cacheEntry.timestamp > CACHE_DURATION.API;

      if (!isExpired) {
        return new Response(JSON.stringify(cacheEntry.response), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'service-worker',
            'X-Cache-Date': new Date(cacheEntry.timestamp).toISOString()
          }
        });
      }
    }

    // Return offline fallback for critical data
    return getCriticalDataFallback(request);
  }
}

/**
 * Cache First with network fallback for images
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image for failed image requests
    return getImagePlaceholder();
  }
}

/**
 * App Shell pattern for navigation requests
 */
async function handleNavigationRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.log('Fleet Management SW: Navigation request failed, serving from cache');
  }

  // Serve cached page or offline fallback
  const cachedResponse = await cache.match(request.url) ||
                         await cache.match('/') ||
                         await cache.match('/offline');

  return cachedResponse || new Response(getOfflineHTML(), {
    headers: { 'Content-Type': 'text/html' }
  });
}

/**
 * Sync fleet data in the background
 */
async function syncFleetData() {
  try {
    console.log('Fleet Management SW: Syncing fleet data');

    // Sync critical fleet data
    const dataToSync = [
      fetch('/api/pilots'),
      fetch('/api/dashboard'),
      fetch('/api/checks/expiring')
    ];

    const responses = await Promise.allSettled(dataToSync);
    console.log('Fleet Management SW: Background sync completed');

    // Notify clients of successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Fleet Management SW: Background sync failed:', error);
  }
}

/**
 * Get critical data fallback for offline scenarios
 */
function getCriticalDataFallback(request) {
  const url = new URL(request.url);

  // Provide minimal offline data structure
  const fallbackData = {
    pilots: [],
    dashboard: {
      totalPilots: 0,
      expiringChecks: 0,
      compliance: 0,
      lastUpdate: new Date().toISOString()
    },
    checks: [],
    message: 'Limited offline data available',
    offline: true
  };

  return new Response(JSON.stringify(fallbackData), {
    headers: {
      'Content-Type': 'application/json',
      'X-Cache': 'offline-fallback'
    }
  });
}

/**
 * Get placeholder image for failed image requests
 */
function getImagePlaceholder() {
  // Return a simple 1x1 transparent pixel as base64
  const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA0i/MYwAAAABJRU5ErkJggg==';
  return fetch(pixel);
}

/**
 * Get offline HTML fallback
 */
function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Fleet Management - Offline</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 40px 20px;
          background: #0f172a;
          color: #e2e8f0;
          text-align: center;
        }
        .offline-container {
          max-width: 400px;
          margin: 0 auto;
        }
        h1 { color: #3b82f6; }
        .icon { font-size: 64px; margin-bottom: 20px; }
        p { line-height: 1.6; margin-bottom: 20px; }
        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .retry-btn:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">✈️</div>
        <h1>Fleet Management</h1>
        <p>You're currently offline. Critical flight operations data is cached locally.</p>
        <p>Reconnect to the internet to access live data and full functionality.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Retry Connection
        </button>
      </div>
    </body>
    </html>
  `;
}

console.log('Fleet Management SW: Service worker loaded');