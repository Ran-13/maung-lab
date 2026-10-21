// Maung Lab service worker: app shell cached; data network-first with offline fallback
const V="ml-v1";const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);if(e.request.method!=="GET")return;
  const sameOrigin=u.origin===location.origin;
  if(sameOrigin){ // network first so data and new versions show up, cache as fallback
    const key=new Request(u.origin+u.pathname);
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(V).then(c=>c.put(key,cl));}return r;}).catch(()=>caches.match(key).then(m=>m||caches.match("./index.html"))));
  }else if(u.hostname.endsWith("fonts.googleapis.com")||u.hostname.endsWith("fonts.gstatic.com")){
    e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const cl=r.clone();caches.open(V).then(c=>c.put(e.request,cl));return r;})));
  }
});
