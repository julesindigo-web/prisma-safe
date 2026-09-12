/* PRISMA-SAFE — analisis akar masalah terstruktur (Fase 3):
   5 Whys berantai + Fishbone 6M + SCAT-lite. Tersimpan di _rca pada insiden,
   dapat dicetak sebagai lampiran investigasi SFT07. */
(function(){
"use strict";
var BONES = ["Man (Manusia)", "Machine (Mesin/Alat)", "Method (Metode/SOP)", "Material", "Medium (Lingkungan)", "Measurement (Pengukuran/Pengawasan)"];
function open(id){
  var r = window.PS.get("insiden", id); if(!r) return;
  var rc = r._rca || { whys: ["", "", "", "", ""], bones: {}, scat: { kontak: "", langsung: "", dasar: "", kontrol: "" } };
  var h = '<p class="sub">Insiden: <b>' + window.esc((r.kat || "") + " — " + (r.lokasi || "") + " (" + (r.tgl || "") + ")") + "</b></p>"
    + "<h3>5 Whys — tanya “mengapa” 5 kali berantai</h3>"
    + rc.whys.map(function(w, i){ return '<div class="fld"><label>Why ' + (i + 1) + (i === 0 ? " (gejala awal)" : "") + '</label><input name="w' + i + '" value="' + window.esc(w) + '" placeholder="' + (i === 0 ? "cth. DT-12 menabrak tanggul" : "cth. karena…") + '"></div>'; }).join("")
    + "<h3>Fishbone — faktor per kategori 6M</h3><div class='frow'>"
    + BONES.map(function(b, i){ return '<div class="fld"><label>' + b + '</label><textarea name="b' + i + '">' + window.esc(rc.bones[i] || "") + "</textarea></div>"; }).join("") + "</div>"
    + "<h3>SCAT-lite</h3><div class='frow'>"
    + [["kontak", "Kontak / kejadian berenergi"], ["langsung", "Penyebab langsung (kondisi & tindakan)"], ["dasar", "Penyebab dasar (faktor pribadi & pekerjaan)"], ["kontrol", "Kebutuhan kontrol / sistem"]].map(function(f){
      return '<div class="fld"><label>' + f[1] + '</label><textarea name="s_' + f[0] + '">' + window.esc(rc.scat[f[0]] || "") + "</textarea></div>"; }).join("") + "</div>";
  var m = window.PSV.openModal("Analisis Akar Masalah", h,
    '<button class="btn" data-x2>Batal</button><button class="btn warn" data-p="">'+window.ic("printer","ic-14")+'Cetak</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan analisis</button>');
  function read(){ var o = { whys: [], bones: {}, scat: {} };
    for(var i = 0; i < 5; i++) o.whys.push((m.querySelector('[name="w' + i + '"]').value || "").trim());
    BONES.forEach(function(_, i){ o.bones[i] = (m.querySelector('[name="b' + i + '"]').value || "").trim(); });
    ["kontak", "langsung", "dasar", "kontrol"].forEach(function(k){ o.scat[k] = (m.querySelector('[name="s_' + k + '"]').value || "").trim(); });
    return o; }
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  m.querySelector("[data-ok]").onclick = function(){
    var o = read();
    if(!o.whys[0]){ toast("Isi minimal Why 1.", "err"); return; }
    r._rca = o; window.PS.put("insiden", r);
    if(window.PSAUDIT) window.PSAUDIT.log("rca", "insiden", r.id, "analisis akar disimpan");
    window.PSV.closeModal(); toast("Analisis tersimpan.", "ok"); };
  m.querySelector("[data-p]").onclick = function(){
    var o = read();
    var x = "<h3>5 Whys</h3><table><tbody>" + o.whys.map(function(w, i){ return "<tr><th>Why " + (i + 1) + "</th><td>" + window.esc(w || "—") + "</td></tr>"; }).join("") + "</tbody></table>"
      + "<h3>Fishbone 6M</h3><table><tbody>" + BONES.map(function(b, i){ return "<tr><th>" + b + "</th><td>" + window.esc(o.bones[i] || "—") + "</td></tr>"; }).join("") + "</tbody></table>"
      + "<h3>SCAT-lite</h3><table><tbody>" + [["kontak", "Kontak"], ["langsung", "Penyebab langsung"], ["dasar", "Penyebab dasar"], ["kontrol", "Kontrol"]].map(function(f){ return "<tr><th>" + f[1] + "</th><td>" + window.esc(o.scat[f[0]] || "—") + "</td></tr>"; }).join("") + "</tbody></table>";
    window.PX.printRecord("Lampiran RCA — " + (r.kat || "") + " " + (r.tgl || ""), "ID " + r.id, [["Lokasi", r.lokasi || "—"], ["Kronologi", r.kronologi || "—"]], x); };
}
window.RCA = { open: open, bones: BONES };
})();
