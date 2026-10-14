// Guarda la app en el celular para que abra sin señal. Cambie la versión al publicar cambios.
const CACHE = 'gastos-v2';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // Primero internet (máx 4 s) para tener la versión nueva; si no hay, la copia guardada.
  const red = fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  });
  const espera = new Promise((_, ko) => setTimeout(ko, 4000));
  e.respondWith(Promise.race([red, espera]).catch(() =>
    caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./index.html')).then(r => r || red)));
});
