/* PRISMA-SAFE service worker v1.1.0
   Strategi: app-shell precache (cache-first) + navigasi network-first
   dengan fallback offline + runtime SWR untuk CDN + api/ network-only. */
var CACHE = "prisma-safe-v1.1.0";
var PRECACHE = [
  "/", "/index.html", "/offline.html", "/manifest.webmanifest",
  "/css/app.css",
  "/js/seed.js", "/js/store.js", "/js/exports.js", "/js/schema.js",
  "/js/views.js", "/js/dashboard.js", "/js/hazard.js", "/js/ptw.js", "/js/rca.js",
  "/js/smkp.js", "/js/sos.js", "/js/audit.js", "/js/rbac.js", "/js/sync.js", "/js/idb.js",
  "/js/app.js", "/js/pwa.js",
  "/js/vendor/xlsx.full.min.js",
  "/icons/icon-192.png", "/icons/icon-512.png",
  "/icons/maskable-512.png", "/icons/apple-touch-icon.png",
  "/icons/favicon.svg"
];
var CDN_CACHE = "prisma-safe-cdn-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if ((k.indexOf("prisma-safe-") === 0) && k !== CACHE && k !== CDN_CACHE) return caches.delete(k);
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
function cacheFirst(req) {
  return caches.match(req, { ignoreSearch: false }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}
function swr(req) { /* stale-while-revalidate utk CDN */
  return caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CDN_CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.pathname.indexOf("/api/") === 0) return; /* network-only, ditangani UI */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match("/index.html").then(function (hit) { return hit || caches.match("/offline.html"); });
      })
    );
    return;
  }
  if (url.origin === self.location.origin) { e.respondWith(cacheFirst(req)); return; }
  e.respondWith(swr(req)); /* CDN: SheetJS dkk — offline memakai cache terakhir */
});
