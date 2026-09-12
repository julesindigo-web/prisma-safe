/* PRISMA-SAFE PWA controller v1.1.0
   - Registrasi service worker (hanya http/https; file:// tetap jalan tanpa SW)
   - Alur install (beforeinstallprompt) + update (updatefound)
   - Indikator status: Online/Offline + kesehatan server api/health */
(function(){
"use strict";
var APP_VERSION = "1.1.0";
var deferredPrompt = null;
function pill(txt, cls){ var p = document.getElementById("netPill"); if(!p) return;
  p.className = "chip " + cls; p.textContent = txt; }
function markOnline(){ pill("● Online", "green"); }
function markLocal(msg){ pill("● " + (msg || "Lokal/Offline"), "amber"); }
function checkServer(){
  if(!navigator.onLine){ markLocal("Offline — data aman di perangkat"); return; }
  if(!/^https?:/.test(location.protocol)){ markLocal("Lokal (file) — siap deploy"); return; }
  if(typeof fetch !== "function"){ markLocal("Lokal — mode lokal"); return; }
  var done = false;
  var timer = setTimeout(function(){ if(!done){ done = true; markLocal("Server tak merespons — mode lokal"); } }, 4000);
  fetch("api/health", { cache: "no-store" }).then(function(r){ return r.json(); }).then(function(j){
    if(done) return; done = true; clearTimeout(timer);
    if(j && j.status === "ok") pill("● Online • srv " + (j.version || "?"), "green");
    else { markLocal("Server anomali — mode lokal"); }
  }).catch(function(){ if(done) return; done = true; clearTimeout(timer); markLocal("Lokal/Offline — mode lokal"); });
}
function registerSW(){
  if(!("serviceWorker" in navigator)) return;
  if(!/^https?:/.test(location.protocol)) return; /* file:// : lewati diam-diam */
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js", { scope: "./" }).then(function(reg){
      reg.addEventListener("updatefound", function(){
        var nw = reg.installing; if(!nw) return;
        nw.addEventListener("statechange", function(){
          if(nw.state === "installed" && navigator.serviceWorker.controller){
            toast("Versi baru tersedia — muat ulang halaman untuk memperbarui.", "");
            window._psUpdateReady = true;
          }
        });
      });
    }).catch(function(){ /* SW opsional: aplikasi tetap jalan penuh tanpa SW */ });
  });
  var reloaded = false;
  if("serviceWorker" in navigator){
    navigator.serviceWorker.addEventListener("controllerchange", function(){
      if(reloaded || !window._psUpdateReady) return; reloaded = true;
      /* tidak auto-reload agar input pengguna tidak hilang */
    });
  }
}
function installFlow(){
  var btn = document.getElementById("btnInstall");
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); deferredPrompt = e;
    if(btn) btn.hidden = false;
  });
  if(btn) btn.addEventListener("click", function(){
    if(!deferredPrompt){ toast("Gunakan menu browser ⋮ → “Install/ Tambahkan ke Layar Utama”.", ""); return; }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(ch){
      if(ch.outcome === "accepted") toast("PRISMA-SAFE dipasang. Buka dari layar utama.", "ok");
      deferredPrompt = null; btn.hidden = true;
    });
  });
  window.addEventListener("appinstalled", function(){
    deferredPrompt = null; if(btn) btn.hidden = true;
    toast("PRISMA-SAFE terpasang sebagai aplikasi.", "ok");
  });
  var mq = (typeof window.matchMedia === "function") ? window.matchMedia("(display-mode: standalone)") : null;
  var standalone = (mq && mq.matches) || window.navigator.standalone === true;
  if(standalone && btn) btn.hidden = true;
}
window.PSPWA = { version: APP_VERSION, recheck: checkServer };
document.readyState === "loading"
  ? document.addEventListener("DOMContentLoaded", function(){ registerSW(); installFlow(); checkServer(); })
  : (function(){ registerSW(); installFlow(); checkServer(); })();
window.addEventListener("online", function(){ markOnline(); checkServer(); toast("Kembali online.", "ok"); });
window.addEventListener("offline", function(){ markLocal("Offline — data aman di perangkat"); });
setInterval(checkServer, 60000);
})();
