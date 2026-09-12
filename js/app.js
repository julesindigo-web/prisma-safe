/* PRISMA-SAFE — boot, router hash, navigasi, pengaturan & panduan. */
(function(){
"use strict";
var ORDER=["dashboard","laporan","inspeksi","pica","insiden","ibpr","jsa","induksi","p2h","permit","manpower","klinik","apd","program","mom","regulasi","dokumen","hazard","units","fatigue","mcu","tele","manhours","muster","sos","sertifikasi","smkp","set"];
var NIC={dashboard:"dashboard",laporan:"report",inspeksi:"inspect",pica:"pica",insiden:"incident",ibpr:"risk",jsa:"jsa",induksi:"induction",p2h:"p2h",permit:"permit",manpower:"users",klinik:"clinic",apd:"apd",program:"program",mom:"mom",regulasi:"regulasi",dokumen:"dokumen",hazard:"hazard",units:"units",fatigue:"fatigue",mcu:"mcu",tele:"tele",manhours:"manhours",muster:"muster",sos:"sos",sertifikasi:"sertifikasi",smkp:"smkp",set:"settings"};
function title(k){ return k==="dashboard"?"Dashboard":k==="set"?"Pengaturan":(window.PS_MODULES[k]?window.PS_MODULES[k].title:k); }
function buildNav(){ var nav=document.getElementById("nav"), h="";
  window.PS_GROUPS.forEach(function(g){ h+='<div class="nav-g">'+g+'</div>';
    Object.keys(window.PS_MODULES).forEach(function(k){ var d=window.PS_MODULES[k]; if(d.group!==g) return;
      h+='<button class="nav-it" data-r="'+k+'"><span class="nav-ic">'+window.ic(NIC[k]||"report","ic-18")+'</span>'+esc(d.title)+'<small>'+PS.count(k)+'</small></button>'; }); });
  h+='<div class="nav-g">SISTEM</div><button class="nav-it" data-r="smkp"><span class="nav-ic">'+window.ic("smkp","ic-18")+'</span>SMKP Analytics & KPI</button><button class="nav-it" data-r="set"><span class="nav-ic">'+window.ic("settings","ic-18")+'</span>Pengaturan & Panduan</button>';
  nav.innerHTML=h;
  nav.querySelectorAll("[data-r]").forEach(function(b){ b.onclick=function(){ location.hash="#/"+b.dataset.r; document.body.classList.remove("nav-open"); }; });
}
function markNav(r){ document.querySelectorAll(".nav-it").forEach(function(b){ b.classList.toggle("on",b.dataset.r===r); });
  document.getElementById("footStat").textContent=PS.total()+" data • tersimpan otomatis lokal"; }
function renderSet(){
  var c=PS.db.company;
  var h='<div class="card"><h2>'+window.ic("settings","ic-18")+'Pengaturan & Panduan</h2><p class="sub">Profil kop laporan, pencadangan data, dan panduan per level pengguna.</p>'+
  '<div class="frow"><div class="fld"><label>Nama perusahaan</label><input id="cNama" value="'+esc(c.nama)+'"></div>'+
  '<div class="fld"><label>Site / lokasi</label><input id="cSite" value="'+esc(c.site)+'"></div>'+
  '<div class="fld"><label>No. telepon darurat (tombol SOS)</label><input id="cSos" value="'+esc(c.sos || "112")+'"></div></div>'+
  '<div class="toolbar no-print"><button class="btn primary" id="cSave">'+window.ic("check","ic-14")+'Simpan profil</button></div></div>'+
  '<div class="grid g2"><div class="card"><h2>'+window.ic("download","ic-18")+'Backup & Restore</h2><p class="sub">Seluruh data tersimpan lokal di browser perangkat ini. Unduh backup JSON secara berkala.</p>'+
  '<div class="toolbar"><button class="btn sm" id="bJson">'+window.ic("download","ic-14")+'Unduh backup (JSON)</button><button class="btn sm" id="bXlsx">'+window.ic("download","ic-14")+'Semua modul (Excel)</button><button class="btn sm danger" id="bReset">'+window.ic("sync","ic-14")+'Kembalikan data awal</button></div>'+
  '<p class="hint">Tombol Restore ada di bar atas. File backup berekstensi .json dari aplikasi ini.</p></div>'+
  '<div class="card"><h2>'+window.ic("shield","ic-18")+'Jejak Audit (hash-chain)</h2><p class="sub" id="auSub"></p><div class="toolbar no-print"><button class="btn sm" id="auVer">'+window.ic("check","ic-14")+'Verifikasi rantai</button><button class="btn sm" id="auCsv">'+window.ic("download","ic-14")+'Ekspor CSV</button></div><div class="tbl-wrap" style="max-height:300px"><table class="tbl"><thead><tr><th>#</th><th>Waktu</th><th>Aktor</th><th>Aksi</th><th>Modul</th><th>Detail</th><th>Hash</th></tr></thead><tbody id="auBody"></tbody></table></div></div>'+
  '<div class="card"><h2>'+window.ic("sync","ic-18")+'Sinkronisasi (outbox)</h2><p class="sub">Tanpa endpoint, data tetap lokal + backup manual. Isi endpoint untuk mengaktifkan kirim antrean.</p><div class="frow"><div class="fld"><label>Endpoint sync (POST JSON, opsional)</label><input id="syEp" placeholder="https://domain-anda/api/sync"></div></div><div class="toolbar no-print"><button class="btn sm primary" id="sySave">'+window.ic("check","ic-14")+'Simpan endpoint</button><button class="btn sm" id="syGo">'+window.ic("upload","ic-14")+'Kirim antrean sekarang</button></div></div>'+
  '<div class="card"><h2>'+window.ic("dokumen","ic-18")+'Katalog referensi bawaan</h2><p class="sub">Disarikan dari '+ 'D:\\ALL ABOUT WORK'+' — tanpa ada kategori yang dilewatkan.</p>'+
  '<div class="toolbar"><span class="chip blue">'+PS.count("dokumen")+' formulir</span><span class="chip blue">'+window.PRISMA_SEED.inspectionTypes.length+' jenis inspeksi</span><span class="chip blue">'+window.PRISMA_SEED.units.length+' jenis unit</span><span class="chip blue">'+window.PRISMA_SEED.materiInduksi.length+' modul induksi</span><span class="chip blue">'+PS.count("regulasi")+' regulasi</span><span class="chip blue">7 elemen SMKP</span></div></div></div>'+
  '<div class="grid g3"><div class="card"><h2><span class="sdot g"></span>Operator / Pengawas</h2><p class="sub">Aktifkan <b>Mode Mudah</b>, lalu pakai tombol besar di Dashboard: Lapor Inspeksi → isi 4 kolom → Simpan. P2H wajib checklist setiap shift.</p></div>'+
  '<div class="card"><h2><span class="sdot y"></span>HSE Officer</h2><p class="sub">Verifikasi PICA sampai Close, investigasi insiden (SFT07), pantau IBPR risiko EKSTREM/TINGGI, dan unduh Weekly Report via Cetak/PDF per modul.</p></div>'+
  '<div class="card"><h2><span class="sdot b"></span>PJO / Manajemen</h2><p class="sub">Baca Dashboard → Ringkasan Eksekutif (1 halaman PDF) untuk rapat. Target: Zero Fatality & LTI, PICA overdue = 0, unit tidak layak = 0.</p></div></div>';
  document.getElementById("view").innerHTML=h;
  document.getElementById("pageTitle").textContent="Pengaturan";
  document.getElementById("pageSub").textContent="Profil • backup • panduan";
  document.getElementById("cSave").onclick=function(){ c.nama=document.getElementById("cNama").value.trim()||c.nama; c.site=document.getElementById("cSite").value.trim()||c.site; c.sos=document.getElementById("cSos").value.trim()||"112"; PS.persist(); toast("Profil tersimpan.","ok"); };
  document.getElementById("bJson").onclick=function(){ var a=document.createElement("a"); var d=new Date();
    a.href=URL.createObjectURL(new Blob([PS.exportJSON()],{type:"application/json"})); a.download="PRISMA-SAFE_backup_"+d.getFullYear()+".json"; a.click(); toast("Backup terunduh.","ok"); };
  document.getElementById("bXlsx").onclick=function(){ if(!window.XLSX){toast("Butuh internet sekali untuk modul Excel — gunakan CSV per modul.","err");return;}
    var wb=XLSX.utils.book_new();
    Object.keys(window.PS_MODULES).forEach(function(k){ var def=window.PS_MODULES[k], rows=PS.all(k); if(!rows.length)return;
      var data=rows.map(function(r){var o={};def.cols.forEach(function(cc){o[cc.label]=cc.get?cc.get(r):(r[cc.k]==null?"":r[cc.k]);});return o;});
      XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(data),def.title.slice(0,31)); });
    XLSX.writeFile(wb,"PRISMA-SAFE_semua-modul.xlsx"); toast("Excel semua modul terunduh.","ok"); };
  document.getElementById("bReset").onclick=function(){ if(window.RBAC&&!window.RBAC.can("reset")){ toast(window.RBAC.deny("reset data"),"err"); return; } if(confirm("Kembalikan SEMUA data ke bawaan awal? Data input Anda akan hilang — unduh backup dulu bila perlu.")){ PS.reset(); buildNav(); route(); toast("Data dikembalikan ke awal.","ok"); } };
  document.getElementById("auSub").textContent=(PS.db.audit||[]).length+" entri • aktor = peran aktif • verifikasi mendeteksi utak-atik rantai.";
  document.getElementById("auBody").innerHTML=(PS.db.audit||[]).slice(-50).reverse().map(function(e){ return "<tr><td>"+e.seq+"</td><td>"+esc(String(e.ts||"").slice(0,19).replace("T"," "))+"</td><td>"+esc(e.actor||"")+"</td><td>"+esc(e.action||"")+"</td><td>"+esc(e.mod||"")+"</td><td>"+esc(e.detail||"")+"</td><td>"+esc(e.hash||"")+"</td></tr>"; }).join("");
  document.getElementById("auVer").onclick=function(){ var v=window.PSAUDIT?window.PSAUDIT.verify():{ok:false,msg:"audit tak aktif"}; toast(v.ok?("Rantai valid — "+v.n+" entri."):("GAGAL: "+v.msg),v.ok?"ok":"err"); };
  document.getElementById("auCsv").onclick=function(){ var rows=PS.db.audit||[]; PX.csv("audit","Jejak Audit",rows,["seq","ts","actor","action","mod","id","detail","hash"].map(function(k){ return {label:k,get:function(r){ return r[k]; }}; })); };
  document.getElementById("syEp").value=(window.PSSYNC?window.PSSYNC.ep():"");
  document.getElementById("sySave").onclick=function(){ if(window.PSSYNC){ window.PSSYNC.setEp(document.getElementById("syEp").value); toast("Endpoint tersimpan.","ok"); } };
  document.getElementById("syGo").onclick=function(){ if(!window.PSSYNC) return; window.PSSYNC.drain().then(function(r){ toast(r.sent?("Terkirim "+r.sent+" paket."):("Belum terkirim: "+(r.reason||"")),"ok"); if(window.PSSYNC) window.PSSYNC.pill(); }); };
}
function route(){ var r=(location.hash||"#/dashboard").replace("#/","")||"dashboard";
  if(r==="dashboard") PSD.render();
  else if(r==="smkp" && window.SMKPR) window.SMKPR.render();
  else if(r==="set") renderSet();
  else if(window.PS_MODULES[r]) PSV.renderModule(window.PS_MODULES[r]);
  else PSD.render();
  markNav(r);
  document.getElementById("view").focus({preventScroll:true});
  try { window.scrollTo(0, 0); } catch (_) { /* webview lama tanpa scrollTo */ } }
function quickAdd(){ var items=[["inspeksi","Lapor Inspeksi","inspect"],["insiden","Lapor Kejadian","incident"],["hazard","Lapor Hazard","hazard"],["pica","Buat PICA","pica"],["p2h","Cek P2H","p2h"],["fatigue","Cek Fatigue","fatigue"],["induksi","Induksi","induction"],["laporan","Laporan Harian","report"],["klinik","Kunjungan Klinik","clinic"],["mom","MoM / P5M","mom"]];
  var m=PSV.openModal("Input Cepat — mau mencatat apa?",'<div class="quick">'+items.map(function(q){return '<button data-q="'+q[0]+'"><span class="q-ic">'+window.ic(q[2],"ic-20")+'</span><span><b>'+q[1]+'</b></span></button>';}).join("")+'</div>',"");
  m.querySelectorAll("[data-q]").forEach(function(b){ b.onclick=function(){ PSV.closeModal(); location.hash="#/"+b.dataset.q;
    setTimeout(function(){ var btn=document.querySelector('#view [data-a="add"]'); if(btn) btn.click(); },250); }; }); }
function boot(){
  buildNav();
  try{ var e=localStorage.getItem("prismasafe.easy")==="1"; document.getElementById("easyToggle").checked=e; document.body.classList.toggle("easy",e); }catch(_){}
  document.getElementById("easyToggle").addEventListener("change",function(ev){ document.body.classList.toggle("easy",ev.target.checked);
    try{localStorage.setItem("prismasafe.easy",ev.target.checked?"1":"0");}catch(_){} toast(ev.target.checked?"Mode Mudah AKTIF — tampilan disederhanakan.":"Mode Mudah nonaktif.","ok"); });
  document.getElementById("navFilter").addEventListener("input",function(e){ var q=e.target.value.toLowerCase();
    document.querySelectorAll(".nav-it").forEach(function(b){ b.style.display=b.textContent.toLowerCase().indexOf(q)>=0?"":"none"; });
    document.querySelectorAll(".nav-g").forEach(function(g){ var nx=g.nextElementSibling, any=false;
      while(nx&&!nx.classList.contains("nav-g")){ if(nx.style.display!=="none") any=true; nx=nx.nextElementSibling; } g.style.display=any?"":"none"; }); });
  document.getElementById("btnSide").onclick=function(){ document.body.classList.toggle("nav-open"); };
  document.getElementById("btnQuickAdd").onclick=quickAdd;
  document.getElementById("btnBackup").onclick=function(){ var a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([PS.exportJSON()],{type:"application/json"})); a.download="PRISMA-SAFE_backup.json"; a.click(); toast("Backup terunduh.","ok"); };
  document.getElementById("btnRestoreBtn").onclick=function(){ document.getElementById("restoreFile").click(); };
  document.getElementById("restoreFile").addEventListener("change",function(e){ var f=e.target.files[0]; if(!f) return;
    var rd=new FileReader(); rd.onload=function(){ try{ PS.importJSON(rd.result); buildNav(); route(); toast("Restore berhasil.","ok"); }catch(err){ toast("Gagal: "+err.message,"err"); } }; rd.readAsText(f); e.target.value=""; });
  window.addEventListener("hashchange",route);
  route();
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot();
})();
