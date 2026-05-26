const CACHE = 'rekotokyo-v1';
const PRECACHE = [
  '/REKOTOKYO/',
  '/REKOTOKYO/index.html',
  '/REKOTOKYO/manifest.json',
  '/REKOTOKYO/icon.svg',
];

// 安装时预缓存本地文件
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// 激活时清理旧版本缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求时：有缓存先用缓存，同时后台更新；无缓存走网络
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
