/* PRISMA-SAFE — manajer berkas & foto per baris data (semua modul).
   Kebijakan aman (C27): tipe disaring kebutuhan (gambar/dokumen/arsip umum,
   tanpa executable), gambar dikompresi di perangkat, file kecil inline
   (≤700 KB) dan file besar ke IndexedDB blobs, pagu rekor ~2 MB agar
   localStorage tak mati kuota. RBAC: lihat/unduh semua peran; tambah/hapus
   butuh hak edit. Semua mutasi lewat PS.put => teraudit otomatis. */
(function(){
"use strict";
var MAX_INLINE = 700 * 1024, MAX_FILE = 15 * 1024 * 1024, MAX_REC = 2 * 1024 * 1024;
var MAX_DIM = 1280, IMG_Q = 0.72;
var BAD_EXT = ["exe", "bat", "cmd", "com", "scr", "ps1", "vbs", "js", "jar", "msi", "dll", "reg", "lnk"];
function esc(s){ return window.esc(s); }
function fmtSize(b){ b = +b || 0; if(b < 1024) return b + " B"; if(b < 1048576) return (b / 1024).toFixed(1) + " KB"; return (b / 1048576).toFixed(2) + " MB"; }
function kindOf(f){ var t = (f.type || "").toLowerCase(), n = (f.name || "").toLowerCase();
  if(t.indexOf("image/") === 0) return "gambar";
  if(t === "application/pdf" || /\.pdf$/.test(n)) return "pdf";
  if(/sheet|excel|csv/.test(t) || /\.(xlsx?|csv)$/.test(n)) return "excel";
  if(/word|msword|officedocument/.test(t) || /\.docx?$/.test(n)) return "dokumen";
  if(/video\//.test(t) || /\.(mp4|3gp|webm)$/.test(n)) return "video";
  return "berkas"; }
function checkName(name){ var ext = String(name || "").split(".").pop().toLowerCase();
  if(BAD_EXT.indexOf(ext) >= 0) throw new Error("Jenis file ." + ext + " ditolak demi keamanan."); }
function readAsDataURL(file){ return new Promise(function(res, rej){
  try{ var r = new FileReader(); r.onload = function(){ res(r.result); }; r.onerror = function(){ rej(new Error("gagal membaca " + file.name)); }; r.readAsDataURL(file); }
  catch(e){ rej(e); } }); }
function compressImage(file){ return new Promise(function(res, rej){
  if(!window.URL || !window.URL.createObjectURL) return rej(new Error("pratinjau URL tak tersedia"));
  var cv = document.createElement("canvas");
  if(!cv.getContext) return rej(new Error("kanvas tak tersedia"));
  var img = new Image();
  img.onload = function(){
    try{
      var k = Math.min(1, MAX_DIM / Math.max(img.width || 1, img.height || 1));
      cv.width = Math.max(1, Math.round((img.width || 1) * k));
      cv.height = Math.max(1, Math.round((img.height || 1) * k));
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      try{ URL.revokeObjectURL(img.src); }catch(_){}
      res(cv.toDataURL("image/jpeg", IMG_Q));
    }catch(e){ rej(e); } };
  img.onerror = function(){ rej(new Error("gambar rusak/tak terbaca")); };
  img.src = URL.createObjectURL(file); }); }
function storeOne(file){
  checkName(file.name);
  if((file.size || 0) > MAX_FILE) return Promise.reject(new Error(file.name + ": melebihi 15 MB."));
  var base = { id: "F" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1296).toString(36).toUpperCase(),
    name: file.name, kind: kindOf(file), size: file.size || 0, ts: new Date().toLocaleString("id-ID") };
  function inlineOf(url){ base.inline = url; return base; }
  function blobOf(url){ base.blob = base.id;
    if(!window.PSIDB || !window.PSIDB.supported) return Promise.reject(new Error(file.name + ": >700 KB butuh IndexedDB yang tak tersedia."));
    return window.PSIDB.saveBlob(base.id, url).then(function(){ return base; }); }
  if(base.kind === "gambar"){
    return compressImage(file).then(inlineOf, function(){
      if((file.size || 0) <= MAX_INLINE) return readAsDataURL(file).then(inlineOf);
      return readAsDataURL(file).then(blobOf); });
  }
  if((file.size || 0) <= MAX_INLINE) return readAsDataURL(file).then(inlineOf);
  return readAsDataURL(file).then(blobOf);
}
function recOf(mod, id){ return window.PS.get(mod, id); }
function guardRec(rec){
  var n = 0; try{ n = JSON.stringify(rec).length; }catch(_){}
  if(n > MAX_REC) throw new Error("Berkas melebihi pagu rekor (~2 MB). Hapus berkas lama / gunakan yang lebih kecil.");
}
function addFiles(mod, id, fileList){
  var rec = recOf(mod, id); if(!rec) return Promise.reject(new Error("data tak ditemukan"));
  var files = Array.prototype.slice.call(fileList || []);
  if(!files.length) return Promise.resolve(rec);
  var chain = Promise.resolve();
  files.forEach(function(f){
    chain = chain.then(function(){
      return storeOne(f).then(function(fr){
        rec._files = rec._files || [];
        rec._files.push(fr);
        guardRec(rec);
      });
    });
  });
  return chain.then(function(){ window.PS.put(mod, rec); return rec; },
    function(err){ window.PS.put(mod, rec); throw err; });
}
function removeFile(mod, id, fid){
  var rec = recOf(mod, id); if(!rec) return;
  var ix = (rec._files || []).findIndex(function(f){ return f.id === fid; });
  if(ix < 0) return;
  var fr = rec._files[ix];
  function done(){ rec._files.splice(ix, 1); window.PS.put(mod, rec); refresh(); }
  if(fr.blob && window.PSIDB && window.PSIDB.supported) window.PSIDB.delBlob(fr.blob).then(done, done);
  else done();
}
function dataOf(fr){
  if(fr.inline) return Promise.resolve(fr.inline);
  if(fr.blob && window.PSIDB && window.PSIDB.supported) return window.PSIDB.getBlob(fr.blob).then(function(v){
    if(!v) throw new Error("isi berkas hilang dari IndexedDB"); return v; });
  return Promise.reject(new Error("isi berkas tak tersedia"));
}
function openFile(fr){
  dataOf(fr).then(function(url){
    if(/^data:image\//.test(url)){
      var w = window.open("", "_blank");
      if(!w){ dl(url, fr.name); return; }
      w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc(fr.name) + '</title><style>body{margin:0;background:#111;display:grid;place-items:center;min-height:100vh}img{max-width:100%;max-height:100vh}</style></head><body><img src="' + url + '"></body></html>');
      w.document.close();
    } else dl(url, fr.name);
  }).catch(function(e){ toast("Gagal membuka: " + e.message, "err"); });
  function dl(url, name){ var a = document.createElement("a"); a.href = url; a.download = name || "berkas"; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); }, 500); }
}
var ICON = { gambar: "camera", pdf: "dokumen", excel: "smkp", dokumen: "report", video: "eye", berkas: "dokumen" };
function open(mod, id){
  var rec = recOf(mod, id); if(!rec){ toast("Data tak ditemukan.", "err"); return; }
  var def = window.PS_MODULES[mod];
  var canEdit = !window.RBAC || window.RBAC.can("edit");
  var m = window.PSV.openModal("Berkas — " + (def ? def.title : mod),
    '<p class="sub">Lampirkan foto bukti, PDF, lembar kerja, dsb. pada baris ini. Gambar dikompresi otomatis; file ≤700 KB inline, selebihnya di IndexedDB.</p>'
    + (canEdit ? '<div class="toolbar no-print"><label class="btn sm" style="cursor:pointer">' + window.ic("upload", "ic-14") + 'Pilih file<input id="flPick" type="file" multiple hidden></label><span class="hint">Maks 15 MB/berkas • .exe/.bat/.ps1/dsb ditolak</span></div>' : '<p class="hint">Peran Anda read-only: boleh membuka/mengunduh.</p>')
    + '<div id="flList"></div>',
    '<button class="btn" data-x2>Tutup</button>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  function refresh(){
    var r = recOf(mod, id), list = (r && r._files) || [];
    var tot = list.reduce(function(a, f){ return a + (+f.size || 0); }, 0);
    var h3 = m.querySelector("header h3"); if(h3) h3.textContent = "Berkas — " + (def ? def.title : mod) + " (" + list.length + ", " + fmtSize(tot) + ")";
    m.querySelector("#flList").innerHTML = list.length ? list.map(function(f, i){
      return '<div class="checkline"><span style="color:#2743a6">' + window.ic(ICON[f.kind] || "dokumen", "ic-20") + '</span>'
        + '<div style="flex:1"><b>' + esc(f.name || ("berkas-" + (i + 1))) + '</b><small>' + esc(f.kind || "") + " • " + fmtSize(f.size) + " • " + esc(f.ts || "") + (f.blob ? " • IndexedDB" : "") + "</small></div>"
        + '<button class="btn sm" data-o="' + i + '">Buka</button>'
        + (canEdit ? ' <button class="btn sm danger" data-d="' + f.id + '">Hapus</button>' : "") + "</div>"; }).join("")
      : '<div class="empty">Belum ada berkas. ' + (canEdit ? "Klik “Pilih file” untuk mengunggah." : "") + "</div>";
    m.querySelectorAll("[data-o]").forEach(function(b){ b.onclick = function(){ var r2 = recOf(mod, id); if(r2 && r2._files[+b.dataset.o]) openFile(r2._files[+b.dataset.o]); }; });
    m.querySelectorAll("[data-d]").forEach(function(b){ b.onclick = function(){ if(confirm("Hapus berkas ini?")) removeFile(mod, id, b.dataset.d); }; });
  }
  var pick = m.querySelector("#flPick");
  if(pick) pick.addEventListener("change", function(e){
    addFiles(mod, id, e.target.files).then(function(){ toast("Berkas terunggah.", "ok"); refresh(); })
      .catch(function(err){ toast("Gagal: " + err.message, "err"); refresh(); });
    e.target.value = ""; });
  refresh();
  window._flRefresh = refresh;
}
function refresh(){ if(window._flRefresh) { try{ window._flRefresh(); }catch(_){} } }
window.FILEU = { open: open, addFiles: addFiles, storeOne: storeOne, fmtSize: fmtSize, MAX_INLINE: MAX_INLINE };
})();
