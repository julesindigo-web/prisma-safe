/* PRISMA-SAFE — jejak audit hash-chain (Fase 1).
   Setiap create/update/delete (+ aksi otorisasi) dicatat append-only dengan
   hash = djb2(entri + hash entri sebelumnya). Rantai terputus => terdeteksi
   utak-atik (tamper-EVIDENT). Batas jujur: bukan tamper-PROOF (butuh server
   WORM/ledger); verifikasi via Pengaturan → Jejak Audit. Kap 2000 entri. */
(function(){
"use strict";
function h(s){ var x = 5381; for(var i = 0; i < s.length; i++){ x = (((x << 5) + x) + s.charCodeAt(i)) >>> 0; } return ("0000000" + x.toString(16)).slice(-8); }
function log(action, mod, id, detail){
  try{
    var db = window.PS.db;
    db.audit = db.audit || [];
    var prev = db.audit.length ? db.audit[db.audit.length - 1].hash : "GENESIS";
    var e = { seq: db.audit.length + 1, ts: new Date().toISOString(),
      actor: (window.RBAC ? window.RBAC.role() : "?"),
      action: action, mod: mod || "", id: id || "", detail: String(detail || "").slice(0, 200), prev: prev };
    e.hash = h(JSON.stringify([e.seq, e.ts, e.actor, e.action, e.mod, e.id, e.detail, prev]));
    db.audit.push(e);
    if(db.audit.length > 2000) db.audit = db.audit.slice(-2000);
    window.PS.persist();
  }catch(_){}
}
function verify(){
  try{
    var a = window.PS.db.audit || [], prev = "GENESIS";
    for(var i = 0; i < a.length; i++){ var e = a[i];
      if(e.prev !== prev) return { ok: false, at: e.seq, msg: "rantai putus pada #" + e.seq };
      var expect = h(JSON.stringify([e.seq, e.ts, e.actor, e.action, e.mod, e.id, e.detail, e.prev]));
      if(expect !== e.hash) return { ok: false, at: e.seq, msg: "hash tak cocok pada #" + e.seq };
      prev = e.hash;
    }
    return { ok: true, n: a.length };
  }catch(err){ return { ok: false, at: -1, msg: String(err && err.message || err) }; }
}
function label(r){ return (r && (r.no || r.nama || r.nopol || r.program || r.kode || r.tgl || r.id)) || ""; }
function init(){
  if(!window.PS || window.PS._audited) return; window.PS._audited = true;
  var P = window.PS, _put = P.put.bind(P), _del = P.del.bind(P);
  P.put = function(m, o){ var isNew = !P.get(m, o.id); _put(m, o); log(isNew ? "create" : "update", m, o.id, label(o)); if(window.PSSYNC) window.PSSYNC.kick(); };
  P.del = function(m, id){ var r = P.get(m, id); _del(m, id); log("delete", m, id, label(r)); if(window.PSSYNC) window.PSSYNC.kick(); };
}
window.PSAUDIT = { log: log, verify: verify, init: init };
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
