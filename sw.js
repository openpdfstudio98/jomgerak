const CACHE='jomgerak-v54-branding-20261028';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./config.js','./icon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./manifest.webmanifest'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('jomgerak-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;if(u.pathname.includes('/api/'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});
