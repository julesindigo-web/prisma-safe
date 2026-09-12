/* PRISMA-SAFE — IndexedDB mirror (Fase 1).
   localStorage tetap jalur utama sinkron; IDB adalah salinan tahan lama kedua:
   bila localStorage kosong (mis. dibersihkan browser) tetapi IDB berisi DB
   valid, DB dipulihkan dari IDB. Batas jujur: ini daya tahan perangkat,
   bukan sinkronisasi antar-perangkat (itu tugas endpoint outbox). */
(function(){
"use strict";
var NAME = "prismasafe", VS = 2;
var ok = (typeof indexedDB !== "undefined");
var t = null;
function open(){ return new Promise(function(res, rej){
  if(!ok) return rej(new Error("indexeddb-unavailable"));
  var r = indexedDB.open(NAME, VS);
  r.onupgradeneeded = function(){ try{ var db = r.result;
    if(!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
    if(!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
  }catch(_){} };
  r.onerror = function(){ rej(r.error || new Error("idb-open")); };
  r.onsuccess = function(){ res(r.result); };
});}
function get(c, k){ return new Promise(function(res, rej){
  var q; try{ q = c.transaction("kv").objectStore("kv").get(k); }catch(e){ rej(e); return; }
  q.onsuccess = function(){ res(q.result == null ? null : q.result); };
  q.onerror = function(){ rej(q.error); };
});}
function put(c, k, v){ return new Promise(function(res, rej){
  var q; try{ q = c.transaction("kv", "readwrite").objectStore("kv").put(v, k); }catch(e){ rej(e); return; }
  q.onsuccess = function(){ res(true); }; q.onerror = function(){ rej(q.error); };
});}
function persist(db){ if(!ok) return; clearTimeout(t);
  t = setTimeout(function(){
    open().then(function(c){ return put(c, "db", JSON.stringify(db)); }).catch(function(){});
  }, 400); }
function hydrate(){ if(!ok) return Promise.resolve(null);
  return open().then(function(c){ return get(c, "db"); })
    .then(function(v){ if(!v) return null; try{ var o = JSON.parse(v); return (o && o.rows) ? o : null; }catch(_){ return null; }; })
    .catch(function(){ return null; }); }
function bstore(mode){ return open().then(function(d){ return d.transaction("blobs", mode).objectStore("blobs"); }); }
function qwrap(p){ return new Promise(function(res, rej){ p.onsuccess = function(){ res(p.result === undefined ? true : p.result); }; p.onerror = function(){ rej(p.error); }; }); }
function saveBlob(id, v){ return bstore("readwrite").then(function(s){ return qwrap(s.put(v, id)); }); }
function getBlob(id){ return bstore("readonly").then(function(s){ return qwrap(s.get(id)); }).then(function(v){ return v == null ? null : v; }); }
function delBlob(id){ return bstore("readwrite").then(function(s){ return qwrap(s.delete(id)); }).catch(function(){ return false; }); }
window.PSIDB = { supported: ok, persist: persist, hydrate: hydrate, saveBlob: saveBlob, getBlob: getBlob, delBlob: delBlob };
})();
