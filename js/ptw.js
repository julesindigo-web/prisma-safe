/* PRISMA-SAFE — PTW approval multi-level + TTD digital + LOTO (Fase 2).
   Alur: Diajukan → Supervisor(L1) → Safety(L2) → KTT(L3, berlaku) → Selesai.
   TTD ditangkap via kanvas (pointer), disimpan sebagai JPEG dataURL kecil.
   LOTO: daftar titik isolasi + verifikasi nol-energi oleh peran verify. */
(function(){
"use strict";
var LOTO_SEED = ["Sumber listrik utama", "Sumber mekanik/gerak", "Tekanan (hidrolik/pneumatik)", "Gravitasi/beban tergantung", "Panas/permukaan panas", "Bahan bakar/carian mudah terbakar"];
function needLoto(r){ return /hot work|confined|electrical|lifting|ketinggian/i.test(r.jenis || ""); }
function appr(r){ r._appr = r._appr || {}; return r._appr; }
function statusAfter(r){
  var a = appr(r);
  if(a.l3 && a.l3.st === "tolak") return "Ditolak";
  if(!(a.l1 && a.l1.st === "setuju")) return "Diajukan";
  if(!(a.l2 && a.l2.st === "setuju")) return "Disetujui Supervisor";
  if(!(a.l3 && a.l3.st === "setuju")) return "Disetujui Safety";
  return "Disetujui KTT — berlaku";
}
function sigPad(cb){
  var m = window.PSV.openModal("Tanda tangan digital",
    '<p class="sub">Tulis di kotak dengan jari/mouse, lalu simpan.</p><canvas id="sigCv" width="560" height="200" style="width:100%;border:2px dashed #94a3c7;border-radius:12px;touch-action:none;background:#fbfcff"></canvas>' +
    '<div class="fld" style="margin-top:10px"><label>Nama penandatangan *</label><input id="sigNm"></div>',
    '<button class="btn" data-x2>Batal</button><button class="btn sm" data-cl>Bersihkan</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan TTD</button>');
  var cv = m.querySelector("#sigCv"), cx = cv.getContext("2d"), draw = false, mark = false;
  cx.lineWidth = 3; cx.lineCap = "round"; cx.strokeStyle = "#0b1530";
  function pos(e){ var b = cv.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e;
    return [(p.clientX - b.left) * cv.width / b.width, (p.clientY - b.top) * cv.height / b.height]; }
  function dn(e){ e.preventDefault(); draw = true; var p = pos(e); cx.beginPath(); cx.moveTo(p[0], p[1]); }
  function mv(e){ if(!draw) return; e.preventDefault(); var p = pos(e); cx.lineTo(p[0], p[1]); cx.stroke(); mark = true; }
  function up(){ draw = false; }
  cv.addEventListener("pointerdown", dn); cv.addEventListener("pointermove", mv);
  cv.addEventListener("pointerup", up); cv.addEventListener("pointerleave", up);
  cv.addEventListener("touchstart", dn, { passive: false }); cv.addEventListener("touchmove", mv, { passive: false }); cv.addEventListener("touchend", up);
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("[data-cl]").onclick = function(){ cx.clearRect(0, 0, cv.width, cv.height); mark = false; };
  m.querySelector("[data-ok]").onclick = function(){
    var nm = (m.querySelector("#sigNm").value || "").trim();
    if(!nm){ toast("Isi nama penandatangan.", "err"); return; }
    if(!mark){ toast("Kotak TTD masih kosong.", "err"); return; }
    var small = document.createElement("canvas"); small.width = 280; small.height = 100;
    small.getContext("2d").drawImage(cv, 0, 0, 280, 100);
    window.PSV.closeModal();
    cb({ by: nm, ts: new Date().toLocaleString("id-ID"), ttd: small.toDataURL("image/jpeg", 0.7) });
  };
}
function view(id){
  var r = window.PS.get("permit", id); if(!r) return;
  if(needLoto(r) && !r._loto) r._loto = LOTO_SEED.map(function(x){ return { item: x, ok: false }; });
  var a = appr(r);
  var kv = [["No. permit", r.no], ["Jenis", r.jenis], ["Lokasi", r.lokasi], ["Berlaku", (r.mulai || "-") + " → " + (r.selesai || "-")],
    ["Uraian", r.uraian], ["Kontrol & APD", r.kontrol || "—"], ["Pelaksana", r.pelaksana || "—"], ["Pengawas", r.pengawas || "—"], ["Status", r.status]];
  var lv = [["l1", "Supervisor", "approve1"], ["l2", "Safety Officer", "approve2"], ["l3", "KTT", "approve3"]];
  var ap = "<h3>Persetujuan multi-level</h3><div class='timeline'>" + lv.map(function(x){
    var s = a[x[0]];
    return "<div><b>" + x[1] + ":</b> " + (s ? ("<span class='chip " + (s.st === "setuju" ? "green" : "red") + "'>" + s.st + "</span> " + window.esc(s.by) + " • " + window.esc(s.ts)) : "<span class='chip grey'>menunggu</span>") + "</div>";
  }).join("") + "</div>";
  var lo = "";
  if(r._loto) lo = "<h3>Checklist LOTO</h3><table class='tbl'><thead><tr><th>Titik isolasi</th><th>Status</th></tr></thead><tbody>" +
    r._loto.map(function(t, i){ return "<tr><td>" + window.esc(t.item) + "</td><td>" + (t.ok ? "<span class='chip green'>"+window.ic("check","ic-14")+"terisolasi</span>" : "<label style='font-size:13px'><input type='checkbox' data-lo='" + i + "'> tandai</label>") + "</td></tr>"; }).join("") + "</tbody></table>" +
    (r._lotoVer ? "<p>Verifikasi nol-energi: <b>" + window.esc(r._lotoVer) + "</b></p>" : "");
  var m = window.PSV.openModal("Permit — " + (r.no || ""),
    '<dl class="detail">' + kv.map(function(k){ return "<dt>" + window.esc(k[0]) + "</dt><dd>" + window.esc(String(k[1] == null ? "—" : k[1])) + "</dd>"; }).join("") + "</dl>" + ap + lo,
    '<button class="btn" data-x2>Tutup</button><button class="btn sm" data-vloto="">'+window.ic("shield","ic-14")+'Verifikasi LOTO</button><button class="btn sm warn" data-p="">'+window.ic("printer","ic-14")+'Cetak</button><span style="flex:1"></span><button class="btn sm danger" data-no="">'+window.ic("x","ic-14")+'Tolak</button><button class="btn sm primary" data-a1="">'+window.ic("check","ic-14")+'Setujui L1</button><button class="btn sm primary" data-a2="">'+window.ic("check","ic-14")+'Setujui L2</button><button class="btn sm primary" data-a3="">'+window.ic("check","ic-14")+'Setujui L3</button>');
  m.querySelector("[data-x2]").onclick = function(){ window.PSV.closeModal(); refresh(); };
  function refresh(){ window.PSV.renderModule(window.PS_MODULES.permit); }
  function guard(act){ if(!window.RBAC.can(act)){ toast(window.RBAC.deny(act), "err"); return false; } return true; }
  function approve(lvKey, perm, label){
    if(!guard(perm)) return;
    if(lvKey === "l2" && !(a.l1 && a.l1.st === "setuju")){ toast("Tunggu persetujuan Supervisor dulu.", "err"); return; }
    if(lvKey === "l3" && !(a.l2 && a.l2.st === "setuju")){ toast("Tunggu persetujuan Safety dulu.", "err"); return; }
    window.PSV.closeModal();
    sigPad(function(s){ s.st = "setuju"; a[lvKey] = s; r.status = statusAfter(r);
      window.PS.put("permit", r);
      if(window.PSAUDIT) window.PSAUDIT.log("approve", "permit", r.id, label + " oleh " + s.by);
      toast(label + " tercatat.", "ok"); view(r.id); });
  }
  m.querySelector("[data-a1]").onclick = function(){ approve("l1", "approve1", "Persetujuan Supervisor"); };
  m.querySelector("[data-a2]").onclick = function(){ approve("l2", "approve2", "Persetujuan Safety"); };
  m.querySelector("[data-a3]").onclick = function(){ approve("l3", "approve3", "Persetujuan KTT"); };
  m.querySelector("[data-no]").onclick = function(){
    if(!guard("approve1")) return; window.PSV.closeModal();
    sigPad(function(s){ s.st = "tolak"; (a.l1 && a.l1.st === "setuju") ? (a.l2 = s) : (a.l1 = s);
      r.status = "Ditolak"; window.PS.put("permit", r);
      if(window.PSAUDIT) window.PSAUDIT.log("reject", "permit", r.id, "ditolak oleh " + s.by);
      toast("Permit ditolak.", "err"); refresh(); });
  };
  m.querySelectorAll("[data-lo]").forEach(function(c){ c.onchange = function(){
    r._loto[+c.dataset.lo].ok = c.checked; window.PS.put("permit", r); }; });
  m.querySelector("[data-vloto]").onclick = function(){
    if(!guard("verify")) return;
    if(!r._loto || r._loto.some(function(t){ return !t.ok; })){ toast("Semua titik LOTO harus terisolasi dulu.", "err"); return; }
    r._lotoVer = window.RBAC.role() + " • " + new Date().toLocaleString("id-ID");
    window.PS.put("permit", r);
    if(window.PSAUDIT) window.PSAUDIT.log("verify", "permit", r.id, "nol-energi: " + r._lotoVer);
    toast("Nol-energi terverifikasi.", "ok"); window.PSV.closeModal(); view(r.id); };
  m.querySelector("[data-p]").onclick = function(){
    var sig = lv.map(function(x){ var s = a[x[0]]; return [x[1], s ? (s.st + " — " + s.by + " • " + s.ts) : "menunggu"]; });
    window.PX.printRecord("Ijin Kerja Aman " + (r.no || "") + " (SFT29)", "Status: " + r.status, kv.concat(sig),
      (r._loto ? "<h3>LOTO</h3><p>" + r._loto.map(function(t){ return window.esc(t.item) + ": " + (t.ok ? "terisolasi" : "BELUM"); }).join("; ") + "</p>" : "")); };
}
window.PTW = { view: view };
})();
