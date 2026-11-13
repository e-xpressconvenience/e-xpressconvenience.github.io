const CACHE='express-store-v9-sourcing';
const ASSETS=["./source.html","./assets/sourcing.js","./checkout.html", "./index.html", "./delivery.html", "./about.html", "./privacy.html", "./operations.html", "./products.html", "./account.html", "./manifest.webmanifest", "./assets/retail.css", "./assets/store.css", "./assets/enhancements.css", "./assets/xpress.css", "./assets/navigation.js", "./assets/shop.js", "./assets/checkout.js", "./assets/delivery-engine.js", "./assets/xpress-convenience.webp", "./assets/xpress-delivery.webp", "./assets/xpress-lite.webp", "./assets/favicon.svg", "./assets/itau.webp", "./assets/ginger.webp", "./assets/rama.webp", "./assets/salt.webp", "./assets/sugar.webp", "./assets/tea.webp"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('express-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(!ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)&&url.pathname!==new URL('./',self.registration.scope).pathname)return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}return r}).catch(async()=>await caches.match(e.request)||new Response('You are offline. Reconnect to continue.',{status:503,headers:{'Content-Type':'text/plain'}})));
});
