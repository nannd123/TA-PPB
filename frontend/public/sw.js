const CACHE_NAME = 'quizora-shell-v3'
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg?v=quizora-3',
  '/icons/quizora-192.png',
  '/icons/quizora-512.png',
]

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME)
  await cache.addAll(PRECACHE_URLS)

  const appResponse = await fetch('/')
  if (!appResponse.ok) {
    throw new Error(`App shell request failed with status ${appResponse.status}.`)
  }

  const appHtml = await appResponse.clone().text()
  await cache.put('/', appResponse)

  const appAssets = [...appHtml.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css))["']/g)]
    .map((match) => match[1])
  await Promise.all(appAssets.map(async (assetUrl) => {
    const assetResponse = await fetch(assetUrl)
    if (!assetResponse.ok) {
      throw new Error(`App shell asset request failed with status ${assetResponse.status}.`)
    }
    await cache.put(assetUrl, assetResponse)
  }))
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((cacheName) => cacheName.startsWith('quizora-') && cacheName !== CACHE_NAME)
      .map((cacheName) => caches.delete(cacheName)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const requestUrl = new URL(request.url)

  if (
    request.method !== 'GET'
    || requestUrl.origin !== self.location.origin
    || /^\/api(?:\/|$)/.test(requestUrl.pathname)
    || request.headers.has('authorization')
  ) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const offlinePage = await caches.match('/offline.html')
      return offlinePage || Response.error()
    }))
    return
  }

  if (!['script', 'style', 'image', 'font'].includes(request.destination)) {
    return
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE_NAME)
      await cache.put(request, response.clone())
    }
    return response
  })())
})
