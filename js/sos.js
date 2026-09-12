/* PRISMA-SAFE — SOS darurat + muster check-in (Fase 4).
   SOS: 1 tombol → konfirmasi → GPS (toleran gagal) → tersimpan + layar siaga
   (bagikan posisi / telepon darurat / tandai selesai). Muster: kode event +
   checklist kehadiran dari manpower. Batas jujur: tanpa backend, SOS TIDAK
   terkirim otomatis ke ruang kontrol — gunakan Bagikan/telepon manual. */
(function(){
"use strict";
function sosNumber(){ return (window.PS.db.company && window.PS.db.company.sos) || "112"; }
function nowHM(){ var d = new Date(); function p(n){ return String(n).padStart(2, "0"); } return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds()); }
function trigger(){
  if(window.RBAC && !window.RBAC.can("add")){ toast(window.RBAC.deny("membuat SOS"), "err"); return; }
  var m = window.PSV.openModal("PANGGILAN DARURAT (SOS)",
    '<div class="fld"><label>Jenis keadaan darurat *</label><select id="sosJ">' + ["Kecelakaan kerja", "Kebakaran", "Longsor/jatuhan", "Kondisi medis", "Alat berat bahaya", "Tumpahan B3 / lingkungan", "Lainnya"].map(function(o){ return "<option>" + o + "</option>"; }).join("") + "</select></div>"
    + '<div class="fld"><label>Keterangan lokasi (wajib bila GPS gagal)</label><input id="sosK" placeholder="cth. Hauling Road KM 3"></div>'
    + '<p class="hint">GPS akan diambil otomatis (butuh izin). Data tersimpan di perangkat + siap dibagikan manual.</p>',
    '<button class="btn" data-x2>Batal</button><button class="btn danger" data-ok="">'+window.ic("sos","ic-16")+'KIRIM SOS</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("[data-ok]").onclick = function(){
    var j = m.querySelector("#sosJ").value, k = (m.querySelector("#sosK").value || "").trim();
    toast("Mengambil GPS…", "");
    var done = function(gps){
      var r = { id: window.PS.uid("SOS"), tgl: window.PS.today(), jam: nowHM(), jenis: j,
        ket: k, pelapor: (window.RBAC ? window.RBAC.role() : "?"),
        gps: gps ? (gps.lat + "," + gps.lng + " (±" + gps.ak + " m)") : "GPS gagal — " + (k || "tanpa keterangan"),
        lat: gps ? gps.lat : "", lng: gps ? gps.lng : "", status: "Open" };
      window.PS.put("sos", r);
      if(window.PSAUDIT) window.PSAUDIT.log("sos", "sos", r.id, j + " @ " + r.gps);
      window.PSV.closeModal(); beacon(r);
    };
    if(!navigator.geolocation) return done(null);
    var to = setTimeout(function(){ done(null); }, 10000);
    navigator.geolocation.getCurrentPosition(function(p){ clearTimeout(to);
      done({ lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), ak: Math.round(p.coords.accuracy || 0) });
    }, function(){ clearTimeout(to); done(null); }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 });
  };
}
function beacon(r){
  var txt = "SOS PRISMA-SAFE: " + r.jenis + " @ " + r.gps + " (" + r.tgl + " " + r.jam + ") " + (r.ket || "");
  var m = window.PSV.openModal("SOS AKTIF — " + r.jenis,
    '<div class="card" style="border:3px solid #d63a3a;background:#fff5f5"><h2 style="color:#a11">Tetap tenang. Minta bantuan di sekitar & hubungi ruang kontrol.</h2>'
    + "<p><b>Waktu:</b> " + window.esc(r.tgl + " " + r.jam) + "<br><b>Posisi:</b> " + window.esc(r.gps) + "<br><b>Ket:</b> " + window.esc(r.ket || "—") + "</p></div>",
    '<a class="btn warn" id="sosShare" href="#">'+window.ic("share","ic-16")+'Bagikan posisi</a><a class="btn danger" href="tel:' + window.esc(sosNumber()) + '">'+window.ic("phone","ic-16")+'Telepon ' + window.esc(sosNumber()) + '</a><span style="flex:1"></span><button class="btn" data-x2>Tutup</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Tandai selesai</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("#sosShare").onclick = function(e){ e.preventDefault();
    if(navigator.share){ navigator.share({ title: "SOS PRISMA-SAFE", text: txt }).catch(function(){}); }
    else if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(function(){ toast("Teks SOS disalin — tempel ke WA/radio log.", "ok"); }); }
    else toast("Salin manual: " + txt, "err"); };
  m.querySelector("[data-ok]").onclick = function(){ r.status = "Selesai"; window.PS.put("sos", r); window.PSV.closeModal(); toast("SOS ditutup.", "ok"); };
}
function checkin(id){
  var r = window.PS.get("muster", id); if(!r) return;
  var people = window.PS.all("manpower").filter(function(x){ return x.status === "Aktif"; });
  var cur = {}; (r._hadir || []).forEach(function(n){ cur[n] = 1; });
  var m = window.PSV.openModal("Absensi Muster — " + (r.titik || ""),
    '<div class="fld"><label>Kode event * (dibacakan koordinator)</label><input id="muKode" placeholder="cth. MSTR-01"></div>'
    + '<div class="tbl-wrap" style="max-height:320px"><table class="tbl"><tbody>' + people.map(function(p){
      return "<tr><td><label><input type='checkbox' data-nm=\"" + window.esc(p.nama) + "\"" + (cur[p.nama] ? " checked" : "") + "> <b>" + window.esc(p.nama) + "</b> <span class='hint'>" + window.esc(p.dept || "") + "</span></label></td></tr>"; }).join("")
    + "</tbody></table></div>",
    '<button class="btn" data-x2>Batal</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan absensi</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("[data-ok]").onclick = function(){
    var kode = (m.querySelector("#muKode").value || "").trim();
    if(kode !== (r.kode || "")){ toast("Kode event salah.", "err"); return; }
    var list = []; m.querySelectorAll("[data-nm]").forEach(function(c){ if(c.checked) list.push(c.dataset.nm); });
    r._hadir = list; window.PS.put("muster", r);
    if(window.PSAUDIT) window.PSAUDIT.log("muster", "muster", r.id, list.length + " hadir");
    window.PSV.closeModal(); toast(list.length + " personel tercatat.", "ok");
    window.PSV.renderModule(window.PS_MODULES.muster); };
}
function init(){
  var b = document.getElementById("sosBtn"); if(!b) return;
  b.addEventListener("click", trigger);
}
window.SOSM = { init: init, trigger: trigger, checkin: checkin };
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
