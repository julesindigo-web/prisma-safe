/* PRISMA-SAFE — SMKP Analytics & KPI (Fase 3).
   LTIFR = LTI×1.000.000/MH • TRIFR = (LTI+RWC+MTI)×1.000.000/MH •
   SR = hari-hilang×1.000.000/MH. MH & hari-hilang dari modul Manhours;
   tanpa MH yang diinput, laju ditampilkan sebagai "—" (jujur, bukan nol). */
(function(){
"use strict";
function esc(s){ return window.esc(s); }
function perState(){ window._smkp = window._smkp || { bulan: (window.PS.today() || "").slice(0, 7) }; return window._smkp; }
function inPer(tgl, b){ if(!b) return true; return String(tgl || "").indexOf(b) === 0; }
function mhRow(b){ return window.PS.all("manhours").find(function(r){ return r.bulan === b; }); }
function stats(b){
  var s = { fatal: 0, lti: 0, rwc: 0, mti: 0, near: 0, first: 0, other: 0 };
  window.PS.all("insiden").forEach(function(r){ if(!inPer(r.tgl, b)) return; var k = r.kat || "";
    if(/fatality/i.test(k)) s.fatal++; else if(/^lti/i.test(k)) s.lti++;
    else if(/rwc/i.test(k)) s.rwc++; else if(/mti/i.test(k)) s.mti++;
    else if(/near miss/i.test(k)) s.near++; else if(/first aid/i.test(k)) s.first++; else s.other++; });
  return s;
}
function rates(b){
  var s = stats(b), m = b ? mhRow(b) : null, mh = m ? (+m.mh || 0) : 0, lost = m ? (+m.lost || 0) : 0;
  function r(n){ return mh > 0 ? (n * 1000000 / mh) : null; }
  return { s: s, mh: mh, lost: lost, ltifr: r(s.lti), trifr: r(s.lti + s.rwc + s.mti), sr: r(lost), hasMH: !!m };
}
function fmt(x, d){ return x == null ? "—" : x.toFixed(d == null ? 2 : d); }
function heat(){
  var g = {};
  function add(loc, w){ loc = String(loc || "Lainnya").split(",")[0].trim() || "Lainnya"; g[loc] = (g[loc] || 0) + w; }
  window.PS.all("insiden").forEach(function(r){ add(r.lokasi, /fatality/i.test(r.kat || "") ? 5 : /^lti/i.test(r.kat || "") ? 3 : 1); });
  window.PS.all("hazard").forEach(function(r){ add(r.lokasi, (+r.skor || 0) >= 10 ? 3 : 1); });
  window.PS.all("inspeksi").forEach(function(r){ add(r.area, (+r.n || 0) > 0 ? 1 : 0.2); });
  var ks = Object.keys(g).sort(function(a, b){ return g[b] - g[a]; }).slice(0, 10);
  var mx = Math.max.apply(null, [1].concat(ks.map(function(k){ return g[k]; })));
  if(!ks.length) return '<div class="empty">Belum ada data lokasi.</div>';
  return ks.map(function(k){ var p = Math.round(100 * g[k] / mx);
    var col = p >= 66 ? "#d63a3a" : p >= 33 ? "#e07b1a" : "#2456d6";
    return '<div class="bar-row"><span>' + esc(k) + '</span><div class="bar"><i style="width:' + p + '%;background:' + col + '"></i></div><b>' + g[k].toFixed(1) + '</b></div>'; }).join("");
}
function expStatus(exp){
  if(!exp) return ["—", "grey"];
  var t = new Date(exp + "T00:00:00"), now = new Date(); now.setHours(0, 0, 0, 0);
  var d = Math.round((t - now) / 86400000);
  if(isNaN(d)) return ["—", "grey"];
  if(d < 0) return ["Habis " + Math.abs(d) + " h lalu", "red"];
  if(d <= 30) return [d + " hari lagi", "amber"];
  return [d + " hari lagi", "green"];
}
function matrix(){
  var people = window.PS.all("manpower").filter(function(r){ return r.status === "Aktif"; }).slice(0, 60);
  var certs = window.PS.all("sertifikasi");
  var types = []; certs.forEach(function(c){ if(types.indexOf(c.jenis) < 0) types.push(c.jenis); });
  types = types.slice(0, 8);
  if(!people.length) return "<p>Belum ada manpower aktif.</p>";
  if(!types.length) return "<p>Belum ada data sertifikasi — input di modul Sertifikasi.</p>";
  var h = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nama</th>' + types.map(function(t){ return "<th>" + esc(t) + "</th>"; }).join("") + "</tr></thead><tbody>";
  people.forEach(function(p){
    h += "<tr><td><b>" + esc(p.nama) + "</b><br><span class='hint'>" + esc(p.jabatan || "") + "</span></td>";
    types.forEach(function(t){
      var c = certs.find(function(x){ return x.nama === p.nama && x.jenis === t; });
      if(!c){ h += "<td>—</td>"; return; }
      var st = expStatus(c.exp);
      h += "<td><span class='chip " + st[1] + "'>" + esc(c.exp || "?") + "</span></td>";
    });
    h += "</tr>"; });
  return h + "</tbody></table></div>";
}
function expiring(){
  function days(e){ var t = new Date((e || "") + "T00:00:00"), n = new Date(); n.setHours(0, 0, 0, 0);
    var d = Math.round((t - n) / 86400000); return isNaN(d) ? 1e9 : d; }
  var out = [];
  window.PS.all("sertifikasi").forEach(function(c){ var d = days(c.exp); if(d <= 30) out.push([c.nama + " — " + c.jenis + " (" + (c.exp || "?") + ")", d]); });
  window.PS.all("mcu").forEach(function(c){ var d = days(c.berlaku); if(d <= 30) out.push([c.nama + " — MCU (" + (c.berlaku || "?") + ")", d]); });
  out.sort(function(a, b){ return a[1] - b[1]; });
  if(!out.length) return '<div class="empty">Nihil kedaluwarsa ≤ 30 hari.</div>';
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Personel — dokumen</th><th>Status</th></tr></thead><tbody>' +
    out.slice(0, 30).map(function(x){ return "<tr><td>" + esc(x[0]) + "</td><td><span class='chip " + (x[1] < 0 ? "red" : "amber") + "'>" + (x[1] < 0 ? "KEDALUWARSA" : x[1] + " hari") + "</span></td></tr>"; }).join("") + "</tbody></table></div>";
}
function render(){
  var st = perState(), r = rates(st.bulan), s = r.s;
  var h = '<div class="card"><h2>'+window.ic("smkp","ic-18")+'SMKP Analytics & KPI</h2><p class="sub">Laju dihitung jujur dari Manhours yang diinput — tanpa MH, laju tampil “—”.</p>'
    + '<div class="toolbar no-print"><label>Periode (YYYY-MM, kosongkan = semua)</label><input id="smBulan" value="' + esc(st.bulan) + '" placeholder="2026-09" style="max-width:140px">'
    + '<button class="btn sm primary" id="smGo">Terapkan</button><span style="flex:1"></span>'
    + '<button class="btn sm" id="smXlsx">'+window.ic("download","ic-14")+'Excel</button><button class="btn sm warn" id="smKep">'+window.ic("printer","ic-14")+'Paket Kepmen 1827</button></div></div>'
    + '<div class="grid g4">'
    + [["var(--red)", fmt(r.ltifr), "LTIFR", "LTI: " + s.lti + " • MH: " + (r.mh || "—"), "risk"],
       ["var(--orange)", fmt(r.trifr), "TRIFR", "LTI+RWC+MTI: " + (s.lti + s.rwc + s.mti), "chart"],
       ["var(--violet)", fmt(r.sr), "Severity Rate", "Hari hilang: " + r.lost, "clock"],
       ["var(--red)", s.fatal, "Fatality", "Near miss: " + s.near + " • First aid: " + s.first, "incident"]]
      .map(function(k){ return '<div class="kpi" style="--kpi-c:' + k[0] + '"><span class="kpi-ic">' + window.ic(k[4], "ic-22") + '</span><div class="n">' + k[1] + '</div><div class="l"><b>' + k[2] + '</b></div><div class="d">' + k[3] + '</div></div>'; }).join("") + "</div>"
    + (r.hasMH || !st.bulan ? "" : '<div class="card"><b>'+window.ic("incident","ic-16")+' Manhours periode ' + esc(st.bulan) + ' belum diinput</b> — isi di modul Manhours agar LTIFR/TRIFR/SR terhitung. <button class="btn sm" onclick="location.hash=\'#/manhours\'">Buka Manhours</button></div>')
    + '<div class="grid g2" style="margin-top:16px"><div class="card"><h2>'+window.ic("pin","ic-18")+'Heatmap lokasi rawan</h2><p class="sub">Bobot: fatality 5, LTI 3, hazard tinggi 3, temuan 1</p>' + heat() + '</div>'
    + '<div class="card"><h2>'+window.ic("clock","ic-18")+'Kedaluwarsa ≤ 30 hari</h2><p class="sub">Simper/KIM/POP/POM/POU/SIO + MCU</p>' + expiring() + '</div></div>'
    + '<div class="card"><h2>'+window.ic("users","ic-18")+'Matriks kompetensi</h2><p class="sub">Personel aktif × sertifikasi (tanggal = masa berlaku)</p>' + matrix() + '</div>';
  document.getElementById("view").innerHTML = h;
  document.getElementById("pageTitle").textContent = "SMKP Analytics & KPI";
  document.getElementById("pageSub").textContent = "Periode: " + (st.bulan || "semua") + " • Kepmen ESDM 1827/2018";
  document.getElementById("smGo").onclick = function(){ st.bulan = document.getElementById("smBulan").value.trim(); render(); };
  document.getElementById("smXlsx").onclick = function(){
    var rows = [{ Indikator: "LTIFR", Nilai: fmt(r.ltifr), Periode: st.bulan || "semua" },
      { Indikator: "TRIFR", Nilai: fmt(r.trifr), Periode: st.bulan || "semua" },
      { Indikator: "Severity Rate", Nilai: fmt(r.sr), Periode: st.bulan || "semua" },
      { Indikator: "Fatality", Nilai: s.fatal, Periode: st.bulan || "semua" },
      { Indikator: "LTI", Nilai: s.lti, Periode: st.bulan || "semua" },
      { Indikator: "Near Miss", Nilai: s.near, Periode: st.bulan || "semua" },
      { Indikator: "Manhours", Nilai: r.mh || 0, Periode: st.bulan || "semua" }];
    window.PX.xlsx("smkp", "KPI K3", rows, Object.keys(rows[0]).map(function(k){ return { label: k, get: function(x){ return x[k]; } }; })); };
  document.getElementById("smKep").onclick = kepmen;
}
function kepmen(){
  var st = perState(), r = rates(st.bulan), s = r.s;
  function tbl(head, rr){ return "<table><thead><tr>" + head.map(function(x){ return "<th>" + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
    (rr.map(function(x){ return "<tr>" + x.map(function(c){ return "<td>" + esc(String(c == null ? "—" : c)) + "</td>"; }).join("") + "</tr>"; }).join("") || "<tr><td colspan='" + head.length + "'>Nihil.</td></tr>") + "</tbody></table>"; }
  var h = '<p class="mut">Paket bantu audit SMKP Minerba (Kepmen ESDM 1827 K/30/MEM/2018) • Periode: <b>' + esc(st.bulan || "semua") + '</b> • <b>Sesuaikan dengan ketentuan regulator terkini sebelum diserahkan.</b></p>'
    + "<h3>A. Laju K3</h3>" + tbl(["Indikator", "Nilai", "Pembilang", "Manhours"], [["LTIFR", fmt(r.ltifr), s.lti + " LTI", r.mh || "—"], ["TRIFR", fmt(r.trifr), (s.lti + s.rwc + s.mti) + " kasus", r.mh || "—"], ["Severity Rate", fmt(r.sr), r.lost + " hari hilang", r.mh || "—"], ["Fatality", s.fatal, "—", "—"]])
    + "<h3>B. Rangkuman kecelakaan & hampir bahaya (SFT10)</h3>" + tbl(["Tanggal", "Kategori", "Lokasi", "Uraian"], window.PS.all("insiden").filter(function(x){ return inPer(x.tgl, st.bulan); }).slice(0, 50).map(function(x){ return [x.tgl, x.kat, x.lokasi, String(x.kronologi || "").slice(0, 80)]; }))
    + "<h3>C. Realisasi program K3LH</h3>" + tbl(["Program", "Rencana", "Realisasi"], window.PS.all("program").slice(0, 30).map(function(x){ return [x.program, x.rencana, x.realisasi]; }))
    + "<h3>D. PICA terbuka</h3>" + tbl(["No. PICA", "PIC", "Target", "Status"], window.PS.all("pica").filter(function(x){ return x.status !== "Close"; }).slice(0, 30).map(function(x){ return [x.no, x.pic, x.target, x.status]; }));
  var w = window.open("", "_blank", "width=900,height=700"); if(!w) return;
  w.document.write('<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Paket SMKP</title><style>body{font-family:"Segoe UI",Arial;margin:24px;font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #555;padding:6px 8px;text-align:left}th{background:#eee}h3{margin:18px 0 8px}.sig{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:26px;font-size:12px;text-align:center}.sig div{border-top:1px solid #000;padding-top:4px;margin-top:56px}</style></head><body>'
    + '<div style="border-bottom:3px double #000;padding-bottom:10px;margin-bottom:14px"><h2 style="margin:0">' + esc(window.PS.db.company.nama) + ' — Paket Laporan SMKP</h2><p>' + esc(window.PS.db.company.site) + " • " + esc(new Date().toLocaleString("id-ID")) + "</p></div>" + h
    + '<div class="sig"><div>Dibuat oleh<br>HSE</div><div>Diperiksa oleh<br>Deputy PJO</div><div>Diketahui oleh<br>KTT</div></div><div style="margin:14px 0"><button onclick="window.print()">Cetak / Simpan PDF</button></div></body></html>');
  w.document.close(); w.focus();
}
window.SMKPR = { render: render, rates: rates, expStatus: expStatus };
})();
