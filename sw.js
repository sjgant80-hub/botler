/* ◊·κ=φ⁴ · botler service worker · offline-first · prime 619 */

const CACHE = 'botler-v1-0';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(SHELL).catch(() => {});
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // do NOT intercept WebLLM CDN, esm.run, googleapis (OAuth + Gmail) — let those go direct
  if (url.host.includes('esm.run') || url.host.includes('googleapis.com') ||
      url.host.includes('googleusercontent.com') || url.host.includes('googleapis.org') ||
      url.host.includes('huggingface.co') || url.host.includes('jsdelivr.net') ||
      url.host.includes('accounts.google.com') || url.host.includes('anthropic.com') ||
      url.host.includes('openai.com')) {
    return; // network only
  }

  // shell · cache-first
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
        return r;
      }).catch(() => caches.match('./index.html')))
    );
  }
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
