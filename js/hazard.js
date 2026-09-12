/* PRISMA-SAFE — Hazard & Near-Miss cepat: GPS + foto + auto-skor (Fase 2).
   Tombol GPS memakai Geolocation API (izin pengguna; gagal => isi manual).
   Foto dikompresi di kanvas (maks 1024px, JPEG .72, maks 3) agar hemat
   penyimpanan lokal. Tanpa sinyal pun tercatat (offline-first). */
(function(){
"use strict";
function compress(file){ return new Promise(function(res, rej){
  var img = new Image();
  img.onload = function(){
    try{
      var mx = 1024, w = img.width, hgt = img.height, k = Math.min(1, mx / Math.max(w, hgt));
      w = Math.round(w * k); hgt = Math.round(hgt * k);
      var c = document.createElement("canvas"); c.width = w; c.height = hgt;
      c.getContext("2d").drawImage(img, 0, 0, w, hgt);
      res(c.toDataURL("image/jpeg", 0.72));
      try{ URL.revokeObjectURL(img.src); }catch(_){}
    }catch(e){ rej(e); }
  };
  img.onerror = function(){ rej(new Error("foto tak terbaca")); };
  img.src = URL.createObjectURL(file);
});}
function levelOf(l, s){ return window.PRISMA_SEED.riskMatrix.level((+l || 0) * (+s || 0)); }
function onAdd(){
  var S = window.PRISMA_SEED;
  var st = { gps: null, photos: [] };
  var h = '<div class="frow">'
    + '<div class="fld"><label>Tanggal *</label><input name="tgl" type="date" value="' + window.PS.today() + '"></div>'
    + '<div class="fld"><label>Pelapor *</label><input name="pelapor" placeholder="Nama pelapor"></div>'
    + '<div class="fld"><label>Lokasi *</label><input name="lokasi" list="hzLoc" placeholder="cth. Pit Area KM 2"><datalist id="hzLoc">'
    + S.locations.map(function(l){ return "<option>" + window.esc(l) + "</option>"; }).join("") + "</datalist></div>"
    + '<div class="fld"><label>Jenis bahaya *</label><select name="jenis">' + ["Kondisi tidak aman","Tindakan tidak aman","Near miss","Housekeeping","Jalan & rambu","Listrik","Ketinggian","Pengangkatan","Lingkungan","Lainnya"].map(function(o){ return "<option>" + o + "</option>"; }).join("") + "</select></div>"
    + "</div>"
    + '<div class="fld"><label>Uraian bahaya *</label><textarea name="uraian" placeholder="Apa bahayanya, di mana tepatnya, siapa terpapar…"></textarea></div>'
    + '<div class="frow">'
    + '<div class="fld"><label>Likelihood (1–5) *</label><select name="l">' + S.riskMatrix.likelihood.map(function(x){ return "<option>" + x[0] + "</option>"; }).join("") + "</select></div>"
    + '<div class="fld"><label>Severity (1–5) *</label><select name="s">' + S.riskMatrix.severity.map(function(x){ return "<option>" + x[0] + "</option>"; }).join("") + "</select></div>"
    + "</div>"
    + '<div class="card" style="background:var(--tint)" id="hzPrev">Skor: <b id="hzScore">1 • RENDAH</b></div>'
    + '<div class="frow"><div class="fld"><label>'+window.ic("pin","ic-14")+'GPS (opsional)</label><div class="toolbar"><button class="btn sm" id="hzGps" type="button">'+window.ic("pin","ic-14")+'Ambil GPS</button><span class="hint" id="hzGpsTx">Belum ada koordinat.</span></div></div>'
    + '<div class="fld"><label>'+window.ic("camera","ic-14")+'Foto bukti (maks 3, opsional)</label><input id="hzFoto" type="file" accept="image/*" capture="environment" multiple><div class="hint">Dikompresi otomatis di perangkat.</div><div id="hzThumbs" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div></div></div>';
  var m = window.PSV.openModal("Lapor Hazard / Near-Miss (SFT13)", h,
    '<button class="btn" data-x2>Batal</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan laporan</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  var L = m.querySelector('[name="l"]'), Sv = m.querySelector('[name="s"]');
  function prev(){ var lv = levelOf(L.value, Sv.value); m.querySelector("#hzScore").textContent = ((+L.value) * (+Sv.value)) + " • " + lv[0]; }
  L.onchange = prev; Sv.onchange = prev; prev();
  m.querySelector("#hzGps").onclick = function(){
    var tx = m.querySelector("#hzGpsTx");
    if(!navigator.geolocation){ tx.textContent = "Perangkat tak mendukung GPS — tulis lokasi manual."; return; }
    tx.textContent = "Mengambil posisi…";
    navigator.geolocation.getCurrentPosition(function(p){
      st.gps = { lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6), ak: Math.round(p.coords.accuracy || 0) };
      tx.textContent = st.gps.lat + ", " + st.gps.lng + " (±" + st.gps.ak + " m)";
    }, function(err){ tx.textContent = "GPS gagal (" + (err && err.message || "izin ditolak") + ") — tulis lokasi manual."; },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };
  m.querySelector("#hzFoto").addEventListener("change", function(e){
    var files = Array.prototype.slice.call(e.target.files || []).slice(0, Math.max(0, 3 - st.photos.length));
    if(!files.length){ toast("Maksimal 3 foto.", "err"); return; }
    (function next(i){ if(i >= files.length) return;
      compress(files[i]).then(function(d){ st.photos.push(d); thumbs(); next(i + 1); })
        .catch(function(){ toast("Satu foto gagal dibaca.", "err"); next(i + 1); });
    })(0);
  });
  function thumbs(){ m.querySelector("#hzThumbs").innerHTML = st.photos.map(function(d, i){
    return '<span style="position:relative"><img src="' + d + '" style="width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid var(--inputbd)"><button class="btn sm danger" data-t="' + i + '" style="position:absolute;top:-8px;right:-8px;padding:0 6px">×</button></span>'; }).join("");
    m.querySelectorAll("[data-t]").forEach(function(b){ b.onclick = function(){ st.photos.splice(+b.dataset.t, 1); thumbs(); }; }); }
  m.querySelector("[data-ok]").onclick = function(){
    function v(n){ return (m.querySelector('[name="' + n + '"]').value || "").trim(); }
    var bad = ["tgl", "pelapor", "lokasi", "uraian"].filter(function(n){ return !v(n); });
    if(bad.length){ toast("Lengkapi: tanggal, pelapor, lokasi, uraian.", "err"); return; }
    var lv = levelOf(L.value, Sv.value);
    window.PS.put("hazard", { id: window.PS.uid("HZ"), tgl: v("tgl"), pelapor: v("pelapor"), lokasi: v("lokasi"),
      jenis: v("jenis"), uraian: v("uraian"), l: L.value, s: Sv.value,
      skor: (+L.value) * (+Sv.value), level: lv[0], gps: st.gps, photos: st.photos, status: "Open" });
    window.PSV.closeModal();
    toast(lv[0] === "EKSTREM" || lv[0] === "TINGGI" ? "Tersimpan — risiko " + lv[0] + ", segera tindaklanjuti!" : "Laporan hazard tersimpan.", lv[0] === "RENDAH" ? "ok" : "err");
    window.PSV.renderModule(window.PS_MODULES.hazard);
  };
}
function view(id){
  var r = window.PS.get("hazard", id); if(!r) return;
  var kv = [["Tanggal", r.tgl], ["Pelapor", r.pelapor], ["Lokasi", r.lokasi], ["Jenis", r.jenis],
    ["Uraian", r.uraian], ["Skor risiko", r.skor + " • " + r.level], ["Status", r.status]];
  if(r.gps) kv.push(["GPS", r.gps.lat + ", " + r.gps.lng + " (±" + r.gps.ak + " m)"]);
  var extra = "";
  if(r.gps) extra += '<p><a href="https://www.openstreetmap.org/?mlat=' + r.gps.lat + "&mlon=" + r.gps.lng + '#map=16/' + r.gps.lat + "/" + r.gps.lng + '" target="_blank" rel="noopener">'+window.ic("pin","ic-14")+'Buka peta (butuh internet)</a></p>';
  if((r.photos || []).length) extra += "<h3>Foto bukti (" + r.photos.length + ")</h3>" + r.photos.map(function(d){
    return '<a href="' + d + '" target="_blank" rel="noopener"><img src="' + d + '" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:1px solid var(--inputbd);margin:0 8px 8px 0"></a>'; }).join("");
  var m = window.PSV.openModal("Hazard — detail",
    '<dl class="detail">' + kv.map(function(k){ return "<dt>" + window.esc(k[0]) + "</dt><dd>" + window.esc(String(k[1] == null ? "—" : k[1])) + "</dd>"; }).join("") + "</dl>" + extra,
    '<button class="btn" data-x2>Tutup</button><button class="btn warn" data-p="">'+window.ic("printer","ic-14")+'Cetak lembar ini</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("[data-p]").onclick = function(){ window.PX.printRecord("Laporan Hazard (SFT13)", "ID " + r.id, kv, extra); };
}
window.HAZARD = { add: onAdd, view: view, levelOf: levelOf };
})();
