/* JomGerak V6.6.7 — consistent cache, network-first updates. */
const CACHE='jomgerak-v667-consistent-map';
const ASSETS=["./", "./index.html", "./config.js", "./icon.svg", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./manifest.webmanifest", "./v55.js", "./v56.js", "./v60.js", "./v63.js", "./v64.js", "./v65.js", "./v652.js", "./v653.js", "./v654.js", "./v655.js", "./v656.js", "./v661.js", "./v662.js", "./v663.js", "./v664.js", "./v665.js", "./v666.js"];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(ASSETS.map(async asset=>{
   const response=await fetch(new Request(asset,{cache:'reload'}));
   if(response.ok)await cache.put(asset,response);
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('jomgerak-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(event.request);
   if(response.ok){
    const cache=await caches.open(CACHE);
    cache.put(event.request,response.clone()).catch(()=>{});
   }
   return response;
  }catch(error){
   const cached=await caches.match(event.request);
   if(cached)return cached;
   throw error;
  }
 })());
});
