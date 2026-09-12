/* PRISMA-SAFE — dashboard eksekutif: KPI leading/lagging, grafik SVG,
   aksi cepat Mode Mudah, aktivitas terbaru, ringkasan eksekutif siap cetak. */
(function(){
"use strict";
function cnt(m,fn){ return PS.all(m).filter(fn||function(){return true;}).length; }
function group(m,k){ var g={}; PS.all(m).forEach(function(r){ var key=String(r[k]||"Lainnya"); g[key]=(g[key]||0)+1; }); return g; }
function bars(g,colors){ var ks=Object.keys(g).sort(function(a,b){return g[b]-g[a];}).slice(0,7);
  var mx=Math.max.apply(null,[1].concat(ks.map(function(k){return g[k];})));
  return ks.map(function(k){ var p=Math.round(100*g[k]/mx);
    return '<div class="bar-row"><span>'+esc(k)+'</span><div class="bar"><i style="width:'+p+'%"></i></div><b>'+g[k]+'</b></div>'; }).join("")||'<div class="empty">Belum ada data.</div>'; }
function donut(parts){ var tot=parts.reduce(function(a,p){return a+p[1];},0)||1, acc=0, segs=[];
  var C=["#15803d","#f5b301","#d63a3a","#2456d6","#0e9f8a","#6d3fd4"];
  parts.forEach(function(p,i){ var f=p[1]/tot, s=acc; acc+=f;
    segs.push('<circle cx="60" cy="60" r="46" fill="none" stroke="'+C[i%C.length]+'" stroke-width="18" stroke-dasharray="'+(f*289.03).toFixed(1)+' 289.03" stroke-dashoffset="'+(-s*289.03).toFixed(1)+'" transform="rotate(-90 60 60)"/>'); });
  return '<div class="donut"><svg width="120" height="120" viewBox="0 0 120 120">'+segs.join("")+'<text x="60" y="66" text-anchor="middle" font-size="20" font-weight="800">'+tot+'</text></svg><div class="legend"><ul>'+
    parts.map(function(p,i){return '<li><span class="sw" style="background:'+C[i%C.length]+'"></span>'+esc(p[0])+' — <b>'+p[1]+'</b></li>';}).join("")+'</ul></div></div>'; }
function renderDash(){
  var fatal=cnt("insiden",function(r){return /fatality/i.test(r.kat||"");});
  var lti=cnt("insiden",function(r){return /^lti/i.test(r.kat||"");});
  var near=cnt("insiden",function(r){return /near miss/i.test(r.kat||"");});
  var picaOpen=cnt("pica",function(r){return r.status!=="Close";});
  var insp=cnt("inspeksi"), p2hBL=cnt("p2h",function(r){return /tidak layak/i.test(r.hasil||"");});
  var prog=PS.all("program"), cap=prog.length?Math.round(100*prog.reduce(function(a,r){return a+(+r.realisasi||0);},0)/Math.max(1,prog.reduce(function(a,r){return a+(+r.rencana||0);},0))):0;
  var mp=cnt("manpower",function(r){return r.status==="Aktif";});
  var h='<div class="quick no-print">'+
   [["inspeksi","📋","Lapor Inspeksi","SAP, SKAT, APAR, mess…"],["insiden","⚠","Lapor Kejadian","Near miss, insiden, kerusakan"],
    ["pica","🛠","Buat PICA","Temuan → tindak lanjut"],["p2h","🚛","Cek P2H","Checklist harian unit"],
    ["induksi","🎓","Daftarkan Induksi","Karyawan, visitor, kontraktor"],["laporan","📝","Laporan Harian","SFT04 — 2 menit"]].map(function(q){
    return '<button data-q="'+q[0]+'"><b>'+q[1]+' '+q[2]+'</b><span>'+q[3]+'</span></button>';}).join("")+'</div>';
  h+='<div class="grid g4">'+
   [["var(--red)",fatal,"Fatality","Lagging — target NOL"],["var(--orange)",lti,"LTI","Lost Time Injury"],
    ["var(--amber-d)",near,"Near Miss","Dilaporkan — budaya baik"],["var(--blue)",picaOpen,"PICA Terbuka","Perlu verifikasi & tutup"],
    ["var(--teal)",insp,"Inspeksi Tercatat","Leading indicator"],["var(--red)",p2hBL,"Unit TIDAK LAYAK","Parkir — larang operasi"],
    ["var(--violet)",cap+"%","Capaian Program K3LH","Rencana vs realisasi"],["var(--green)",mp,"Manpower Aktif","Terdata di sistem"]
   ].map(function(k){return '<div class="kpi" style="--kpi-c:'+k[0]+'"><div class="n">'+k[1]+'</div><div class="l"><b>'+k[2]+'</b></div><div class="d">'+k[3]+'</div></div>';}).join("")+'</div>';
  h+='<div class="grid g2" style="margin-top:16px"><div class="card"><h2>Insiden per kategori</h2><p class="sub">Distribusi semua kejadian tercatat</p>'+bars(group("insiden","kat"))+'</div>'+
     '<div class="card"><h2>Inspeksi per jenis</h2><p class="sub">Fokus pengawasan lapangan</p>'+bars(group("inspeksi","jenis"))+'</div></div>';
  h+='<div class="grid g2"><div class="card"><h2>Status PICA</h2><p class="sub">Open harus bergerak ke Close terverifikasi</p>'+
     donut([["Open",cnt("pica",function(r){return r.status==="Open";})],["In Progress",cnt("pica",function(r){return r.status==="In Progress";})],["Overdue",cnt("pica",function(r){return r.status==="Overdue";})],["Close",cnt("pica",function(r){return r.status==="Close";})]])+'</div>'+
     '<div class="card"><h2>Kunjungan klinik per departemen</h2><p class="sub">Surveilans kesehatan kerja</p>'+bars(group("klinik","dept"))+'</div></div>';
  var recent=[].concat(PS.all("insiden").map(function(r){return["insiden",r.tgl,(r.kat||"")+" — "+(r.lokasi||"")];}),
    PS.all("pica").map(function(r){return["pica",r.tgl,(r.no||"")+" — "+String(r.masalah||"").slice(0,50)];}),
    PS.all("inspeksi").map(function(r){return["inspeksi",r.tgl,(r.jenis||"")+" — "+(r.area||"")];}))
    .sort(function(a,b){return String(b[1]).localeCompare(String(a[1]));}).slice(0,8);
  var bd=PS.all("units").filter(function(r){ return r.status === "Breakdown"; });
  var sosO=PS.all("sos").filter(function(r){ return r.status !== "Selesai"; });
  var hzH=cnt("hazard",function(r){ return r.status !== "Close" && (r.level === "TINGGI" || r.level === "EKSTREM"); });
  var expN=0, _nd=new Date(); _nd.setHours(0,0,0,0);
  PS.all("sertifikasi").forEach(function(c){ if(!c.exp) return; var d=Math.round((new Date(c.exp+"T00:00:00")-_nd)/86400000); if(!isNaN(d)&&d<=30) expN++; });
  PS.all("mcu").forEach(function(c){ if(!c.berlaku) return; var d=Math.round((new Date(c.berlaku+"T00:00:00")-_nd)/86400000); if(!isNaN(d)&&d<=30) expN++; });
  h+='<div class="card" style="border-left:5px solid '+((bd.length||sosO.length)?"#d63a3a":"#15803d")+'"><h2>⚠ Peringatan operasional</h2><div class="toolbar">'
    +'<span class="chip '+(bd.length?"red":"green")+'">⛔ Breakdown: '+bd.length+'</span>'
    +'<span class="chip '+(sosO.length?"red":"green")+'">🚨 SOS terbuka: '+sosO.length+'</span>'
    +'<span class="chip '+(expN?"amber":"green")+'">📜 Kedaluwarsa ≤30h: '+expN+'</span>'
    +'<span class="chip '+(hzH?"amber":"green")+'">☢ Hazard tinggi/ekstrem: '+hzH+'</span></div>'
    +(bd.length?'<p class="sub">Unit breakdown (DILARANG operasi): <b>'+bd.map(function(u){ return esc(u.nopol); }).join(", ")+'</b></p>':"")
    +'</div>';
  h+='<div class="card"><h2>Aktivitas terbaru</h2><p class="sub">8 pembaruan terakhir lintas modul</p><div class="timeline">'+
    (recent.map(function(x){return '<div><span class="chip blue">'+esc(x[0])+'</span> <b>'+esc(x[1]||"-")+'</b> — '+esc(x[2])+'</div>';}).join("")||'<div class="empty">Belum ada aktivitas.</div>')+'</div>'+
    '<div class="toolbar no-print" style="margin-top:12px"><button class="btn sm warn" id="btnExec">🖨 Ringkasan Eksekutif (PDF)</button><span class="hint">1 halaman: KPI + PICA terbuka + unit tidak layak.</span></div></div>';
  document.getElementById("view").innerHTML=h;
  document.getElementById("pageTitle").textContent="Dashboard K3";
  document.getElementById("pageSub").textContent=PS.db.company.nama+" • "+PS.db.company.site+" • "+PS.total()+" data";
  document.querySelectorAll("[data-q]").forEach(function(b){ b.onclick=function(){ location.hash="#/"+b.dataset.q; }; });
  document.getElementById("btnExec").onclick=execSummary;
}
function execSummary(){
  var rows=PS.all("pica").filter(function(r){return r.status!=="Close";}).slice(0,15).map(function(r){return [r.no+" — "+r.masalah,r.pic,r.target,r.status];});
  var bad=PS.all("p2h").filter(function(r){return /tidak layak/i.test(r.hasil||"");}).slice(0,15).map(function(r){return [(r.nopol||"")+" ("+(r.unit||"")+")",r.operator,r.tgl,r.hasil];});
  function tbl(head,rr){ return '<table><thead><tr>'+head.map(function(x){return "<th>"+x+"</th>";}).join("")+'</tr></thead><tbody>'+
    (rr.map(function(x){return "<tr>"+x.map(function(c){return "<td>"+esc(c)+"</td>";}).join("")+"</tr>";}).join("")||'<tr><td colspan="'+head.length+'">Nihil — kondisi baik.</td></tr>')+'</tbody></table>'; }
  var h='<p class="mut">Zero Fatality & LTI • Fatality: <b>'+cnt("insiden",function(r){return /fatality/i.test(r.kat||"");})+'</b> • LTI: <b>'+cnt("insiden",function(r){return /^lti/i.test(r.kat||"");})+'</b> • Inspeksi: <b>'+cnt("inspeksi")+'</b> • PICA terbuka: <b>'+cnt("pica",function(r){return r.status!=="Close";})+'</b></p>'+
   '<h3>PICA terbuka (prioritas)</h3>'+tbl(["PICA / masalah","PIC","Target","Status"],rows)+
   '<h3>Unit TIDAK LAYAK (larang operasi)</h3>'+tbl(["Unit","Operator","Tanggal","Hasil"],bad);
  window._pxPrint=h;
  /* cetak langsung */
  (function(){ var w=window.open("","_blank","width=900,height=700"); if(!w) return;
    w.document.write('<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Ringkasan Eksekutif</title><style>body{font-family:"Segoe UI",Arial;margin:24px;font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #555;padding:6px 8px;text-align:left}th{background:#eee}.sig{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:26px;font-size:12px;text-align:center}.sig div{border-top:1px solid #000;padding-top:4px;margin-top:56px}</style></head><body>'+
    '<div style="border-bottom:3px double #000;padding-bottom:10px;margin-bottom:14px"><h2 style="margin:0">'+esc(PS.db.company.nama)+' — Ringkasan Eksekutif K3</h2><p>'+esc(PS.db.company.site)+' • '+esc(new Date().toLocaleString("id-ID"))+'</p></div>'+h+
    '<div class="sig"><div>Dibuat oleh<br>HSE</div><div>Diperiksa oleh<br>Deputy PJO</div><div>Diketahui oleh<br>PJO</div></div><div style="margin:14px 0"><button onclick="window.print()">🖨 Cetak / Simpan PDF</button></div></body></html>');
    w.document.close(); w.focus(); })();
}
window.PSD={render:renderDash};
})();
