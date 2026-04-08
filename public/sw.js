const APP_CACHE = 'imposter-app-v1'
const WORD_CACHE = 'imposter-words-v1'

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png',
  '/words/index.json',
  '/words/us.json',
  '/words/nepal.json',
  '/words/world.json',
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== APP_CACHE && k !== WORD_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Word packs: cache-first (they change infrequently and must work offline)
  if (url.pathname.startsWith('/words/')) {
    event.respondWith(
      caches.open(WORD_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Navigation requests: network-first, fall back to cached version of same URL or root
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(APP_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached ?? caches.match('/'))
            .then((cached) => cached ?? new Response('Offline', { status: 503 }))
        )
    )
    return
  }

  // Everything else (JS, CSS, images): stale-while-revalidate
  event.respondWith(
    caches.open(APP_CACHE).then(async (cache) => {
      const cached = await cache.match(request)
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone())
        return response
      })
      return cached ?? networkFetch
    })
  )
})
