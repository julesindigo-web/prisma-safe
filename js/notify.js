/* PRISMA-SAFE — Pusat notifikasi (Sedang 1).
   Kumpulkan isyarat operasional menjadi satu bell + panel:
   - Kadaluarsa ≤30h (sertifikasi + MCU)
   - Breakdown unit
   - PICA overdue (target lewat & belum Close)
   - Hazard tinggi/ekstrem terbuka
   - SOS terbuka
   Klik bell → panel modal dengan lompat-cepat ke modul + filter periode.
   Badge = total item butuh aksi. Tanpa polling server — hitung lokal tiap render. */
(function(){
"use strict";
function esc(s){ return window.esc(s); }
function daysUntil(exp){
  if(!exp) return 1e9;
  var t=new Date(exp+"T00:00:00"), n=new Date(); n.setHours(0,0,0,0);
  var d=Math.round((t-n)/86400000); return isNaN(d)?1e9:d;
}
function collect(){
  var out=[], now=new Date(); now.setHours(0,0,0,0);
  var todayStr = now.toISOString().slice(0,10);
  // 1. kadaluarsa
  var expItems=[];
  window.PS.all("sertifikasi").forEach(function(c){
    var d=daysUntil(c.exp);
    if(d<=30) expItems.push({label:c.nama+" — "+c.jenis+" ("+(c.exp||"?")+")", sub:d<0?"KEDALUWARSA "+Math.abs(d)+" hari lalu":d+" hari lagi", tone:d<0?"red":"amber", mod:"sertifikasi", id:c.id});
  });
  window.PS.all("mcu").forEach(function(c){
    var d=daysUntil(c.berlaku);
    if(d<=30) expItems.push({label:c.nama+" — MCU ("+(c.berlaku||"?")+")", sub:d<0?"KEDALUWARSA":d+" hari lagi", tone:d<0?"red":"amber", mod:"mcu", id:c.id});
  });
  if(expItems.length) out.push({key:"expiry", title:"Kadaluarsa ≤30 hari", icon:"sertifikasi", tone:expItems.some(function(x){return x.tone==="red";})?"red":"amber", items:expItems});
  // 2. breakdown
  var bds = window.PS.all("units").filter(function(u){ return u.status==="Breakdown"; });
  if(bds.length) out.push({key:"breakdown", title:"Unit Breakdown — larang operasi", icon:"units", tone:"red",
    items:bds.map(function(u){ return {label:u.nopol+" ("+u.jenis+")", sub:u.lokasi+" • sejak "+(u.sejak||"?"), tone:"red", mod:"units", id:u.id}; })});
  // 3. PICA overdue
  var pOver = window.PS.all("pica").filter(function(r){
    if(r.status==="Close") return false;
    if(r.status==="Overdue") return true;
    if(!r.target) return false;
    return r.target < todayStr;
  });
  if(pOver.length) out.push({key:"picaOver", title:"PICA overdue — target lewat", icon:"pica", tone:"red",
    items:pOver.map(function(r){ return {label:r.no+" — "+String(r.masalah||"").slice(0,48), sub:"PIC "+(r.pic||"?")+" • target "+(r.target||"?"), tone:"red", mod:"pica", id:r.id}; })});
  var pOpen = window.PS.all("pica").filter(function(r){ return r.status!=="Close" && pOver.indexOf(r)<0; });
  if(pOpen.length) out.push({key:"picaOpen", title:"PICA terbuka perlu verifikasi", icon:"pica", tone:"amber",
    items:pOpen.slice(0,8).map(function(r){ return {label:r.no, sub:r.status, tone:"amber", mod:"pica", id:r.id}; })});
  // 4. hazard tinggi
  var hzH = window.PS.all("hazard").filter(function(r){ return r.status!=="Close" && (r.level==="TINGGI"||r.level==="EKSTREM"); });
  if(hzH.length) out.push({key:"hazard", title:"Hazard tinggi/ekstrem terbuka", icon:"hazard", tone:hzH.some(function(x){return x.level==="EKSTREM";})?"red":"amber",
    items:hzH.slice(0,8).map(function(r){ return {label:(r.lokasi||"?")+" — "+(r.jenis||""), sub:r.skor+" • "+r.level, tone:r.level==="EKSTREM"?"red":"amber", mod:"hazard", id:r.id}; })});
  // 5. SOS terbuka
  var sosO = window.PS.all("sos").filter(function(r){ return r.status!=="Selesai"; });
  if(sosO.length) out.push({key:"sos", title:"SOS terbuka — butuh tindak lanjut", icon:"sos", tone:"red",
    items:sosO.map(function(r){ return {label:r.jenis+" @ "+(r.gps||r.ket||"?"), sub:r.tgl+" "+(r.jam||""), tone:"red", mod:"sos", id:r.id}; })});
  // 6. inspeksi perlu PICA (leading indicator yang mengendap)
  var inspNeed = window.PS.all("inspeksi").filter(function(r){ return r.krit==="Ada — perlu PICA" && r.status!=="Close"; });
  if(inspNeed.length) out.push({key:"inspPica", title:"Inspeksi perlu PICA belum ditindaklanjuti", icon:"inspect", tone:"amber",
    items:inspNeed.slice(0,6).map(function(r){ return {label:r.jenis+" @ "+r.area, sub:r.tgl, tone:"amber", mod:"inspeksi", id:r.id}; })});
  return out;
}
function totalCount(groups){ return groups.reduce(function(a,g){ return a+g.items.length; },0); }
function refreshBadge(){
  var g=collect(), n=totalCount(g);
  var bell=document.getElementById("notifBell"), badge=document.getElementById("notifBadge");
  if(!bell||!badge) return;
  badge.textContent = n ? String(n) : "";
  badge.style.display = n ? "inline-flex" : "none";
  bell.classList.toggle("has-notif", n>0);
  bell.title = n ? n+" notifikasi butuh aksi — klik untuk lihat" : "Tidak ada notifikasi mendesak";
}
function openPanel(){
  var groups=collect(), n=totalCount(groups);
  if(!groups.length){
    var m0=window.PSV.openModal("Pusat Notifikasi", '<div class="empty">'+window.ic("check","ic-40")+'<p>Tidak ada notifikasi mendesak — semua aman.</p></div>',
      '<button class="btn" data-x2>Tutup</button>');
    m0.querySelector("[data-x2]").onclick=window.PSV.closeModal;
    return;
  }
  var h='<p class="sub">Total <b>'+n+'</b> item butuh aksi — klik baris untuk lompat ke modul.</p>';
  groups.forEach(function(g){
    h+='<div class="card" style="margin-bottom:12px"><h2 style="gap:8px">'+window.ic(g.icon,"ic-18")+esc(g.title)+' <span class="chip '+g.tone+'">'+g.items.length+'</span></h2>'
      +g.items.map(function(it){
        return '<div class="checkline" data-go="'+it.mod+'" data-id="'+it.id+'" style="cursor:pointer">'
          +'<span style="color:'+(it.tone==="red"?"#a11":it.tone==="amber"?"#8a5b00":"#2743a6")+'">'+window.ic(g.icon,"ic-20")+'</span>'
          +'<div style="flex:1"><b>'+esc(it.label)+'</b><small>'+esc(it.sub||"")+'</small></div><span class="chip '+it.tone+'">'+esc(it.sub?it.sub.split("•")[0].trim():it.tone)+'</span></div>';
      }).join("")+'</div>';
  });
  var m=window.PSV.openModal("Pusat Notifikasi — "+n+" butuh aksi", h,
    '<button class="btn" data-x2>Tutup</button>');
  m.querySelector("[data-x2]").onclick=window.PSV.closeModal;
  m.querySelectorAll("[data-go]").forEach(function(el){
    el.onclick=function(){
      var mod=el.getAttribute("data-go"), id=el.getAttribute("data-id");
      window.PSV.closeModal();
      location.hash="#/"+mod;
      setTimeout(function(){
        var r=window.PS.get(mod,id);
        if(r) window.PSV.detailModal(window.PS_MODULES[mod], r);
      }, 350);
    };
  });
}
function init(){
  var bell=document.getElementById("notifBell");
  if(!bell) return;
  bell.addEventListener("click", openPanel);
  // refresh tiap navigasi & tiap mutasi
  window.addEventListener("hashchange", refreshBadge);
  var origPut=window.PS.put, origDel=window.PS.del;
  window.PS.put=function(m,o){ var r=origPut(m,o); refreshBadge(); return r; };
  window.PS.del=function(m,id){ var r=origDel(m,id); refreshBadge(); return r; };
  refreshBadge();
}
window.NOTIF={collect:collect, refresh:refreshBadge, open:openPanel, init:init};
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
