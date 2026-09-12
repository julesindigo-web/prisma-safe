/* PRISMA-SAFE — lapisan penyimpanan lokal (localStorage, tanpa server).
   Aman untuk file:// maupun hosting statis. Backup/restore via JSON. */
(function(){
"use strict";
var KEY = "prismasafe.v1", SEEDKEY = "prismasafe.seed";
function uid(p){ return (p||"PRM")+"-"+Date.now().toString(36).toUpperCase()+"-"+Math.floor(Math.random()*46656).toString(36).toUpperCase(); }
function today(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function load(){ try{ var raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw); }catch(e){} return null; }
function save(db){ try{ localStorage.setItem(KEY, JSON.stringify(db)); }catch(e){ toast("Penyimpanan penuh/gagal: "+e.message,"err"); return false; }
  try{ if(window.PSIDB) window.PSIDB.persist(db); }catch(_){}
  return true; }
function blankDB(){ return { v:2, seq:0, company: JSON.parse(JSON.stringify(window.PRISMA_SEED.company)),
  rows:{laporan:[],inspeksi:[],pica:[],insiden:[],ibpr:[],jsa:[],induksi:[],p2h:[],permit:[],manpower:[],klinik:[],apd:[],program:[],mom:[],regulasi:[],dokumen:[],
    hazard:[],units:[],fatigue:[],mcu:[],tele:[],manhours:[],muster:[],sos:[],sertifikasi:[] },
  outbox:[], audit:[] }; }
function seed(db){
  var S = window.PRISMA_SEED, R = db.rows;
  S.ibprContoh.forEach(function(r){ R.ibpr.push({id:uid("IBPR"),dept:r[0],aktivitas:r[1],bahaya:r[2],l0:+r[3],s0:+r[4],kontrol:r[5],l1:+r[6],s1:+r[7],pic:r[8],tgl:today(),sumber:"Data awal (contoh)"}); });
  S.manpowerContoh.forEach(function(r){ R.manpower.push({id:uid("MP"),nama:r[0],jabatan:r[1],dept:r[2],level:r[3],perush:r[4],status:r[5],mcu:"-",sim:"-",kpo:"-"}); });
  S.klinikContoh.forEach(function(r,i){ R.klinik.push({id:uid("KL"),tgl:r[0],nama:r[1],dept:r[2],diagnosa:r[3],tindak:r[4]}); });
  S.program.forEach(function(r,i){ R.program.push({id:uid("PRG"),target:r[0],program:r[1],kontrol:r[2],frekuensi:r[3],pic:r[4],rencana: i<6?1:4, realisasi:0, bulan:"2026-09", ket:""}); });
  S.regulasi.forEach(function(r){ R.regulasi.push({id:uid("REG"),nomor:r[0],judul:r[1],ringkasan:r[2],pic:r[3],status:r[4]}); });
  S.forms.forEach(function(r){ R.dokumen.push({id:uid("DOC"),kode:r[0],nama:r[1],kelompok:r[2],revisi:"Rev.00",tgl:today(),ket:"Katalog referensi"}); });
  S.apdMatrix.forEach(function(r){ R.apd.push({id:uid("APD"),jenis:r[0],area:r[1],sifat:r[2],stok:0,satuan:"pcs",lokasi:"Gudang HSE",pj:"HSE"}); });
  R.mom.push({id:uid("MOM"),tgl:today(),jenis:"P5M",topik:"Contoh — Golden Rules & fatigue management",pemateri:"HSE",peserta:12,lokasi:"Muster point",hasil:"Nihil temuan kritis"});
  (S.unitContoh || []).forEach(function(r){ R.units.push({id:uid("UNT"),nopol:r[0],jenis:r[1],lokasi:r[2],status:"Layak",sebab:"-",sejak:today()}); });
  (S.mcuContoh || []).forEach(function(r){ R.mcu.push({id:uid("MCU"),nama:r[0],tgl:r[1],hasil:r[2],berlaku:r[3],catatan:"Data awal (contoh)"}); });
  (S.sertContoh || []).forEach(function(r){ R.sertifikasi.push({id:uid("SRT"),nama:r[0],jenis:r[1],no:r[2],terbit:today(),exp:r[3],ket:"Data awal (contoh)"}); });
  (S.mhContoh || []).forEach(function(r){ R.manhours.push({id:uid("MH"),bulan:r[0],mh:r[1],lost:r[2],ket:"Data awal (contoh)"}); });
  R.muster.push({id:uid("MST"),kode:"MSTR-01",tgl:today(),titik:((S.musterPoints || [])[0] || "Muster Point Utama"),pj:"HSE",catatan:"Contoh titik kumpul"});
  R.laporan.push({id:uid("LAP"),tgl:today(),shift:"Shift 1 (Siang)",cuaca:"Cerah",lokasi:"Pit Area & Hauling Road",mp:120,jam:8,aktivitas:"Contoh — produksi & hauling normal; SAP 1x; P2H 20 unit",inspeksi:"SAP — nihil temuan kritis",temuan:"-",insiden:"Nihil",tl:"-",oleh:"HSE"});
  try{ localStorage.setItem(SEEDKEY, window.PRISMA_SEED.version); }catch(e){}
}
var _fresh = !load();
var DB = load();
if(!DB){ DB = blankDB(); seed(DB); save(DB); }
DB.rows = DB.rows || {}; DB.outbox = DB.outbox || []; DB.audit = DB.audit || [];
Object.keys(blankDB().rows).forEach(function(k){ if(!DB.rows[k]) DB.rows[k] = []; });
window.PS = {
  db: DB,
  uid: uid, today: today,
  persist: function(){ return save(DB); },
  all: function(m){ return DB.rows[m]||[]; },
  get: function(m,id){ return (DB.rows[m]||[]).find(function(r){return r.id===id;}); },
  put: function(m,obj){ var arr=DB.rows[m]; var i=arr.findIndex(function(r){return r.id===obj.id;}); if(i>=0)arr[i]=obj; else arr.unshift(obj); save(DB); },
  del: function(m,id){ DB.rows[m]=DB.rows[m].filter(function(r){return r.id!==id;}); save(DB); },
  reset: function(){ DB = blankDB(); seed(DB); save(DB); window.PS.db = DB; },
  exportJSON: function(){ return JSON.stringify({app:"PRISMA-SAFE",v:1,at:new Date().toISOString(),db:DB},null,1); },
  importJSON: function(txt){ var o=JSON.parse(txt); if(!o.db||!o.db.rows) throw new Error("Berkas bukan backup PRISMA-SAFE."); DB=o.db; DB.rows=DB.rows||{}; DB.outbox=DB.outbox||[]; DB.audit=DB.audit||[];
    Object.keys(blankDB().rows).forEach(function(k){ if(!DB.rows[k]) DB.rows[k]=[]; }); save(DB); window.PS.db=DB; },
  count: function(m){ return (DB.rows[m]||[]).length; },
  total: function(){ return Object.keys(DB.rows).reduce(function(a,k){return a+DB.rows[k].length;},0); }
};
window.PS.ready = (_fresh && window.PSIDB) ? window.PSIDB.hydrate().then(function(cloud){
  if(cloud && cloud.rows){ DB = cloud; DB.rows = DB.rows || {}; DB.outbox = DB.outbox || []; DB.audit = DB.audit || [];
    Object.keys(blankDB().rows).forEach(function(k){ if(!DB.rows[k]) DB.rows[k] = []; });
    window.PS.db = DB; try{ localStorage.setItem(KEY, JSON.stringify(DB)); }catch(_){}
    toast("Database dipulihkan dari salinan IndexedDB.", "ok"); }
  return true;
}).catch(function(){ return true; }) : Promise.resolve(true);
window.toast = function(msg,kind){ var t=document.createElement("div"); t.className="toast "+(kind||""); t.textContent=msg;
  document.getElementById("toastRoot").appendChild(t); setTimeout(function(){ t.style.opacity="0"; setTimeout(function(){t.remove();},300); },3200); };
window.esc = function(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); };
})();
