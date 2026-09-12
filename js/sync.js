/* PRISMA-SAFE — outbox sinkronisasi (Fase 4).
   Setiap mutasi antre di DB.outbox. Bila endpoint dikonfigurasi (Pengaturan)
   dan perangkat online, antrean di-POST berkelompok (maks 50) lalu ditandai
   _s='sent'. Tanpa endpoint: data tetap lokal + backup manual (jujur, bukan
   klaim "auto-sync cloud"). Endpoint rujukan: /api/sync (echo + validasi). */
(function(){
"use strict";
function cfg(){ try{ return JSON.parse(localStorage.getItem("prismasafe.cfg") || "{}"); }catch(_){ return {}; } }
function ep(){ return cfg().ep || ""; }
function setEp(v){ var c = cfg(); c.ep = String(v || "").trim(); try{ localStorage.setItem("prismasafe.cfg", JSON.stringify(c)); }catch(_){} pill(); }
function pending(){ return (window.PS && window.PS.db.outbox ? window.PS.db.outbox.length : 0); }
function pill(){ var p = document.getElementById("syncPill"); if(!p) return; var n = pending();
  p.className = "chip " + (n ? "amber" : "green");
  p.textContent = n ? ("⧗ " + n + " antre sync") : "✓ antrean kosong"; }
function kick(){
  try{
    var db = window.PS.db; db.outbox = db.outbox || [];
    /* outbox diisi oleh pembungkus put/del di bawah; kick hanya refresh pil */
  }catch(_){}
  pill();
  if(navigator.onLine && ep()) drain();
}
function enqueue(m, id, op){
  try{
    var db = window.PS.db; db.outbox = db.outbox || [];
    db.outbox.push({ m: m, id: id, op: op, ts: new Date().toISOString(), by: (window.RBAC ? window.RBAC.role() : "?") });
    if(db.outbox.length > 500) db.outbox = db.outbox.slice(-500);
  }catch(_){}
}
async function drain(){
  var e = ep();
  if(!e) return { sent: 0, reason: "no-endpoint" };
  if(!navigator.onLine || typeof fetch !== "function") return { sent: 0, reason: "offline" };
  var db = window.PS.db, batch = (db.outbox || []).splice(0, 50);
  if(!batch.length){ pill(); return { sent: 0, reason: "empty" }; }
  var ctrl = new AbortController(), timer = setTimeout(function(){ ctrl.abort(); }, 15000);
  try{
    var res = await fetch(e, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: "PRISMA-SAFE", v: 1, at: new Date().toISOString(), batch: batch }), signal: ctrl.signal });
    clearTimeout(timer);
    if(!res.ok) throw new Error("HTTP " + res.status);
    await res.json();
    batch.forEach(function(b){ if(b.op === "put"){ var r = window.PS.get(b.m, b.id); if(r){ r._s = "sent"; } } });
    window.PS.persist(); pill();
    if(window.PSAUDIT) window.PSAUDIT.log("sync", "outbox", "-", "terkirim " + batch.length + " → " + e);
    return { sent: batch.length };
  }catch(err){
    clearTimeout(timer);
    db.outbox = batch.concat(db.outbox || []); window.PS.persist(); pill();
    return { sent: 0, reason: String((err && err.message) || err) };
  }
}
function init(){
  if(!window.PS || window.PS._synced) return; window.PS._synced = true;
  var P = window.PS, _put = P.put.bind(P), _del = P.del.bind(P);
  P.put = function(m, o){ o._s = o._s || "local"; _put(m, o); enqueue(m, o.id, "put"); pill(); if(navigator.onLine && ep()) drain(); };
  P.del = function(m, id){ _del(m, id); enqueue(m, id, "del"); pill(); if(navigator.onLine && ep()) drain(); };
  window.addEventListener("online", function(){ pill(); drain(); });
  pill();
}
window.PSSYNC = { ep: ep, setEp: setEp, pending: pending, pill: pill, kick: kick, drain: drain, init: init };
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
