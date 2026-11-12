const CACHE='express-store-v3';
const ASSETS=['./index.html','./products.html','./checkout.html','./about.html','./account.html','./delivery.html','./assets/retail.css','./assets/store.css','./assets/enhancements.css','./assets/navigation.js','./assets/shop.js','./assets/express-convenience-logo.jpeg','./assets/bread.jpeg','./assets/eggs.jpeg','./assets/sausages.jpeg','./assets/snacks.jpeg','./assets/household.jpeg','./assets/drinks.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('express-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(!ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname)&&url.pathname!==new URL('./',self.registration.scope).pathname)return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}return r}).catch(async()=>await caches.match(e.request)||new Response('You are offline. Reconnect to continue.',{status:503,headers:{'Content-Type':'text/plain'}})));
});
