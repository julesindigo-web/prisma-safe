/* PRISMA-SAFE — mesin tampilan generik: tabel + cari/filter + form + detail.
   Semua 16 modul CRUD berjalan di atas mesin ini (konsisten & koheren). */
(function(){
"use strict";
var PER = 15;
function fmtVal(f,v){ if(v==null||v==="") return "—";
  if(f.t==="date"&&/^\d{4}-\d{2}-\d{2}/.test(v)){ var p=v.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; }
  return String(v); }
function openModal(title,bodyHTML,footHTML){ var r=document.getElementById("modalRoot");
  r.innerHTML='<div class="mback"><div class="modal" role="dialog" aria-label="'+esc(title)+'"><header><h3>'+esc(title)+
   '</h3><button class="icon-btn" data-x aria-label="Tutup">'+window.ic("x","ic-16")+'</button></header><div class="mbody">'+bodyHTML+'</div>'+
   (footHTML?'<footer>'+footHTML+'</footer>':"")+'</div></div>';
  r.querySelector("[data-x]").onclick=closeModal;
  r.querySelector(".mback").addEventListener("mousedown",function(e){ if(e.target.className==="mback") closeModal(); });
  return r.querySelector(".modal"); }
function closeModal(){ document.getElementById("modalRoot").innerHTML=""; }
function fieldInput(f,val,rec){
  var v = val==null?(f.def==null?"":f.def):val, req=f.req?' <span class="req">*</span>':"";
  var h='<div class="fld" data-f="'+f.k+'"><label>'+esc(f.label)+req+'</label>';
  if(f.t==="textarea") h+='<textarea name="'+f.k+'">'+esc(v)+'</textarea>';
  else if(f.t==="select") h+='<select name="'+f.k+'">'+f.opts.map(function(o){return '<option '+(String(o)===String(v)?"selected":"")+'>'+esc(o)+'</option>';}).join("")+'</select>';
  else if(f.t==="photo") h+='<input type="file" data-ph="'+f.k+'" accept="image/*" multiple>';
  else h+='<input name="'+f.k+'" type="'+(f.t==="date"?"date":f.t==="number"?"number":"text")+'" value="'+esc(v)+'"'+(f.t==="number"?' min="0"':"")+'>';
  if(f.hint) h+='<div class="hint">'+esc(f.hint)+'</div>';
  h+='<div class="err">Wajib diisi.</div>';
  if(f.t==="photo") h+='<div data-th="'+f.k+'" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>';
  h+='</div>'; return h; }
function readForm(modal,fields){ var obj={}, ok=true;
  fields.forEach(function(f){
    if(f.t==="photo"){ var box=modal.querySelector('[data-f="'+f.k+'"]'); var arr=(box&&box._photos)?box._photos:[];
      if(f.req&&!arr.length){ ok=false; if(box) box.classList.add("bad"); } else if(box) box.classList.remove("bad");
      obj[f.k]=arr; return; }
    var el=modal.querySelector('[name="'+f.k+'"]'); var v=el?el.value:"";
    if(f.t==="number") v=(v===""||v==null)?0:+v;
    if(f.req&&String(v).trim()===""){ ok=false; el.closest(".fld").classList.add("bad"); } else if(el) el.closest(".fld").classList.remove("bad");
    obj[f.k]=typeof v==="string"?v.trim():v; });
  return {obj:obj,ok:ok}; }
function state(mod){ window._psui=window._psui||{}; window._psui[mod]=window._psui[mod]||{q:"",f:"",pg:0}; return window._psui[mod]; }
function filteredRows(def){ var st=state(def.key), rows=PS.all(def.key);
  if(st.q){ var q=st.q.toLowerCase(); rows=rows.filter(function(r){ return def.search.some(function(k){return String(r[k]==null?"":r[k]).toLowerCase().indexOf(q)>=0;}); }); }
  if(st.f){ rows=rows.filter(function(r){ return ["status","hasil","kat","jenis","sifat"].some(function(k){return String(r[k])===st.f;}); }); }
  return rows; }
function statusOptions(def){ var set={}, out=[];
  PS.all(def.key).forEach(function(r){ ["status","hasil","kat","jenis"].forEach(function(k){ if(r[k]) set[r[k]]=1; }); });
  Object.keys(set).sort().forEach(function(v){out.push(v);}); return out; }
function colText(def,c,r){ var v=c.get?c.get(r):r[c.k]; if(v==null||v==="")return "—";
  var s=def.fields.find(function(f){return f.k===c.k;});
  return fmtVal(s||{t:"text"}, typeof v==="object"?"":v); }
function renderModule(def){
  var st=state(def.key), rows=filteredRows(def), pages=Math.max(1,Math.ceil(rows.length/PER));
  if(st.pg>=pages) st.pg=pages-1;
  var page=rows.slice(st.pg*PER,st.pg*PER+PER);
  var sopts=statusOptions(def);
  var h='<div class="card"><h2>'+esc(def.title)+' <span class="chip grey">'+esc(def.form)+'</span></h2><p class="sub">'+esc(def.sub)+'</p>';
  h+='<div class="toolbar no-print"><input type="search" id="q" placeholder="Cari data…" value="'+esc(st.q)+'" aria-label="Cari">';
  if(sopts.length) h+='<select id="fq" aria-label="Filter"><option value="">Semua status/kategori</option>'+sopts.map(function(o){return '<option '+(st.f===o?"selected":"")+'>'+esc(o)+'</option>';}).join("")+'</select>';
  h+='<button class="btn sm" data-a="csv">'+window.ic("download","ic-14")+'CSV</button><button class="btn sm" data-a="xlsx">'+window.ic("download","ic-14")+'Excel</button><button class="btn sm" data-a="print">'+window.ic("printer","ic-14")+'Cetak/PDF</button><span style="flex:1"></span>';
  if(!window.RBAC || window.RBAC.can("add")) h+='<button class="btn primary" data-a="add">'+window.ic("plus","ic-14")+'Tambah</button>';
  h+='</div>';
  if(!page.length) h+='<div class="empty">'+window.ic("shield","ic-40")+'<p>'+esc(def.empty)+'</p></div>';
  else{ h+='<div class="tbl-wrap"><table class="tbl"><thead><tr><th>No</th>'+def.cols.map(function(c){return "<th>"+esc(c.label)+"</th>";}).join("")+'<th class="no-print">Aksi</th></tr></thead><tbody>';
    page.forEach(function(r,i){ h+='<tr><td>'+(st.pg*PER+i+1)+'</td>'+def.cols.map(function(c){ var t=colText(def,c,r);
        var ch=c.chip?c.chip(r):null; return "<td>"+(ch?'<span class="chip '+ch+'">'+esc(t)+"</span>":esc(t))+"</td>"; }).join("")+
       '<td class="no-print"><div class="act"><button class="btn sm" data-a="view" data-id="'+r.id+'">Lihat</button><button class="btn sm" data-a="edit" data-id="'+r.id+'">Ubah</button>'+
      (def.key==="p2h"?'<button class="btn sm warn" data-a="cek" data-id="'+r.id+'">Checklist</button>':"")+
      (def.rowActions||[]).map(function(ra){ return '<button class="btn sm warn" data-a="x:'+ra.k+'" data-id="'+r.id+'">'+ra.label+'</button>'; }).join("")+
      '<button class="btn sm" data-a="x:file" data-id="'+r.id+'">'+window.ic("dokumen","ic-14")+'Berkas'+(((r._files||[]).length)?'<span class="badge">'+r._files.length+'</span>':"")+'</button>'+
      ((!window.RBAC||window.RBAC.can("del"))?'<button class="btn sm danger" data-a="del" data-id="'+r.id+'">Hapus</button>':"")+'</div></td></tr>'; });
    h+='</tbody></table></div><div class="pager no-print"><button class="btn sm" data-a="prev" '+(st.pg===0?"disabled":"")+'>'+window.ic("chevL","ic-14")+'</button><span>Halaman '+(st.pg+1)+' / '+pages+' • '+rows.length+' data</span><button class="btn sm" data-a="next" '+(st.pg>=pages-1?"disabled":"")+'>'+window.ic("chevR","ic-14")+'</button></div>'; }
  h+='</div>';
  var el=document.getElementById("view"); el.innerHTML=h;
  el.querySelector("#q").addEventListener("input",function(e){ st.q=e.target.value; st.pg=0; renderModule(def); keepFocus("q"); });
  var fq=el.querySelector("#fq"); if(fq) fq.addEventListener("change",function(e){ st.f=e.target.value; st.pg=0; renderModule(def); });
  el.querySelectorAll("[data-a]").forEach(function(b){ b.onclick=function(){ act(def,b.dataset.a,b.dataset.id); }; });
  document.getElementById("pageTitle").textContent=def.title;
  document.getElementById("pageSub").textContent=def.form+" • "+rows.length+" data";
}
function keepFocus(id){ var e=document.getElementById(id); if(e){ e.focus(); var v=e.value; e.value=""; e.value=v; } }
function exportCols(def){ var cols=[{label:"ID",get:function(r){ return r.id||"-"; }}].concat(def.cols.map(function(c){ return {label:c.label,get:function(r){return c.get?c.get(r):(r[c.k]==null?"":r[c.k]);}}; }));
  if(def.fields.some(function(f){ return f.t === "photo"; })) cols.push({label:"Foto",get:function(r){ var n=(r.foto||[]).length; return n ? n + " foto" : "-"; }});
  cols.push({label:"Update",get:function(r){ if(!r._u) return "-"; try{ var d=new Date(r._u); return d.toLocaleDateString("id-ID") + " " + d.toLocaleTimeString("id-ID"); }catch(_){ return "-"; } }});
  return cols; }
function act(def,a,id){
  var need = (a==="add") ? "add" : (a==="edit" || a==="cek") ? "edit" : (a==="del") ? "del" : (a.indexOf("x:") === 0 ? "edit" : null);
  if(need && window.RBAC && !window.RBAC.can(need)){ toast(window.RBAC.deny(a === "del" ? "menghapus" : "mengubah") + " [modul " + def.title + "]", "err"); return; }
  var rows=filteredRows(def), cols=exportCols(def);
  if(a==="csv") PX.csv(def.key,def.title,rows,cols);
  else if(a==="xlsx") PX.xlsx(def.key,def.title,rows,cols);
  else if(a==="print") PX.printTable(PS.db.company.nama+" — "+def.title+" ("+def.form+")","Periode: semua data • "+rows.length+" baris",rows,cols);
  else if(a==="prev"){ state(def.key).pg--; renderModule(def); }
  else if(a==="next"){ state(def.key).pg++; renderModule(def); }
  else if(a==="add"){ if(typeof def.onAdd === "function") def.onAdd(); else formModal(def,null); }
  else if(a==="edit") formModal(def,PS.get(def.key,id));
  else if(a==="view"){ if(typeof def.onView === "function") def.onView(id); else detailModal(def,PS.get(def.key,id)); }
  else if(a.indexOf("x:") === 0){ var xk = a.slice(2);
    if(xk === "file"){ window.FILEU.open(def.key, id); }
    else if(typeof def.onAction === "function") def.onAction(xk, id); }
  else if(a==="cek") p2hModal(PS.get(def.key,id));
  else if(a==="del"){ if(confirm("Hapus data ini? Tindakan tercatat lokal dan tidak dapat dibatalkan.")){ PS.del(def.key,id); toast("Data dihapus.","ok"); renderModule(def); } }
}
function riskNote(def,rec){ /* catatan risiko live untuk IBPR */
  if(def.key!=="ibpr") return "";
  function lvl(s){ return window.PRISMA_SEED.riskMatrix.level(s)[0]; }
  var a=(+rec.l0||0)*(+rec.s0||0), b=(+rec.l1||0)*(+rec.s1||0);
  return '<div class="card" style="background:var(--tint)"><b>Matriks 5×5 — </b>Risiko awal: <b>'+a+' • '+lvl(a)+'</b> → Risiko sisa: <b>'+b+' • '+lvl(b)+'</b> <span class="hint">Skor = Likelihood × Severity.</span></div>'; }
function formModal(def,rec){
  var isNew=!rec; rec=rec||{};
  if(isNew){ rec={}; def.fields.forEach(function(f){ rec[f.k]=f.def==null?"":f.def; }); if(def.fields.find(function(f){return f.k==="tgl";})) rec.tgl=PS.today(); if(def.fields.find(function(f){return f.k==="status";})) rec.status=def.fields.find(function(f){return f.k==="status";}).opts[0]; }
  var m=openModal((isNew?"Tambah — ":"Ubah — ")+def.title,
    riskNote(def,rec)+'<div class="frow">'+def.fields.map(function(f){return fieldInput(f,rec[f.k],rec);}).join("")+'</div>',
    '<button class="btn" data-x2>Batal</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan</button>');
  m.querySelector("[data-x2]").onclick=closeModal;
  var nilai=m.querySelector('[name="nilai"]'), hasil=m.querySelector('[name="hasil"]');
  if(nilai&&hasil) nilai.addEventListener("input",function(){ var n=+nilai.value||0; hasil.value=n>=80?"Lulus":n>0?"Remedial":"Belum test"; });
  if(def.key==="ibpr"){ ["l0","s0","l1","s1"].forEach(function(k){ var el=m.querySelector('[name="'+k+'"]'); if(el) el.addEventListener("change",function(){ var r=readForm(m,def.fields).obj; m.querySelector(".mbody").insertAdjacentHTML("afterbegin",""); closeModal(); formModal(def,Object.assign({},rec,r)); }); }); }
  def.fields.filter(function(f){ return f.t === "photo"; }).forEach(function(f){
    var inp=m.querySelector('[data-ph="'+f.k+'"]'), th=m.querySelector('[data-th="'+f.k+'"]');
    var fbox=m.querySelector('[data-f="'+f.k+'"]'); fbox._photos=((rec[f.k]||[]).slice(0,3));
    var canPh=!window.RBAC||window.RBAC.can("edit");
    if(inp&&!canPh) inp.style.display="none";
    function drawPh(){ th.innerHTML=fbox._photos.map(function(d,i){
      return '<span style="position:relative"><img src="'+d+'" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid var(--inputbd)">'
        + (canPh?'<button type="button" class="btn sm danger" data-r="'+i+'" style="position:absolute;top:-6px;right:-6px;padding:0 6px">×</button>':"")+'</span>'; }).join("");
      th.querySelectorAll("[data-r]").forEach(function(b){ b.onclick=function(){ fbox._photos.splice(+b.dataset.r,1); drawPh(); }; }); }
    if(inp) inp.addEventListener("change",function(e){
      var files=Array.prototype.slice.call(e.target.files||[]).slice(0,Math.max(0,3-fbox._photos.length));
      if(!files.length){ toast("Maksimal 3 foto.", "err"); return; }
      (function next(i){ if(i>=files.length){ drawPh(); return; }
        var ok1=function(d){ fbox._photos.push(d); next(i+1); }, no1=function(){ toast("Satu foto gagal dibaca.", "err"); next(i+1); };
        if(window.FILEU&&window.FILEU.compressImage) window.FILEU.compressImage(files[i]).then(ok1,no1); else no1();
      })(0); });
    drawPh();
  });
  m.querySelector("[data-ok]").onclick=function(){ var r=readForm(m,def.fields);
    if(!r.ok){ toast("Lengkapi kolom bertanda *.","err"); return; }
    if(typeof def.compute === "function"){ try{ if(def.compute(r.obj, m) === false) return; }catch(e){ toast("Gagal menghitung: " + e.message, "err"); return; } }
    Object.keys(rec).forEach(function(k){ if(!(k in r.obj)) r.obj[k] = rec[k]; });
    try{ if(JSON.stringify(r.obj).length > 1572864){ toast("Data + foto melebihi ~1,5 MB — kurangi jumlah/ukuran foto.", "err"); return; } }catch(_){}
    r.obj.id=rec.id||PS.uid(def.key.slice(0,3).toUpperCase());
    if(def.key==="p2h"){ if(rec._cek) r.obj._cek=rec._cek; r.obj.rusak=r.obj.rusak||rec.rusak||""; }
    PS.put(def.key,r.obj); closeModal(); toast("Data tersimpan.","ok"); renderModule(def); };
}
function detailModal(def,r){ if(!r) return;
  var kv=def.fields.filter(function(f){return f.k!=="rusak";}).map(function(f){
    if(f.t==="photo") return [f.label, ((r[f.k]||[]).length ? r[f.k].length + " foto" : "—")];
    return [f.label,fmtVal(f,r[f.k])]; });
  var extra="";
  if(def.key==="ibpr"){ var S0=window.PRISMA_SEED.riskMatrix, a=(+r.l0||0)*(+r.s0||0), b=(+r.l1||0)*(+r.s1||0);
    extra='<h3>Penilaian risiko (matriks 5×5)</h3><p>Awal: <b>'+a+' • '+S0.level(a)[0]+'</b> → Sisa: <b>'+b+' • '+S0.level(b)[0]+'</b></p>'; }
  if(def.key==="p2h"&&r._cek){ extra='<h3>Hasil checklist P2H</h3><table class="tbl"><thead><tr><th>Item</th><th>Kondisi</th></tr></thead><tbody>'+
    r._cek.map(function(c){return '<tr><td>'+esc(c[0])+'</td><td>'+(c[1]==="Baik"?'<span class="chip green">Baik</span>':'<span class="chip red">Rusak</span>')+'</td></tr>';}).join("")+'</tbody></table>'; }
  if(def.key==="induksi"&&r.nilai!==""&&r.nilai!=null) extra='<p>Status kelulusan: <b>'+(+r.nilai>=80?"LULUS (≥80)":"REMEDIAL (<80)")+'</b></p>';
  if((r._files||[]).length){ extra+='<h3>Berkas terlampir ('+r._files.length+')</h3><p>'+r._files.map(function(f){ return window.esc(f.name||"berkas"); }).join("; ")+'</p><p class="hint">Buka / unduh / kelola via tombol “Berkas” pada baris data.</p>'; }
  def.fields.filter(function(f){ return f.t === "photo"; }).forEach(function(f){ var ph=r[f.k]||[];
    if(ph.length) extra+='<h3>'+esc(f.label)+' ('+ph.length+')</h3>'+ph.map(function(d){
      return '<a href="'+d+'" target="_blank" rel="noopener"><img src="'+d+'" style="width:120px;height:120px;object-fit:cover;border-radius:10px;border:1px solid #c9d2e4;margin:0 8px 8px 0"></a>'; }).join(""); });
  var m=openModal(def.title+" — detail",'<dl class="detail">'+kv.map(function(k){return "<dt>"+esc(k[0])+"</dt><dd>"+esc(k[1])+"</dd>";}).join("")+'</dl>'+extra,
   '<button class="btn" data-x2>Tutup</button><button class="btn warn" data-p="">'+window.ic("printer","ic-14")+'Cetak lembar ini</button>');
  m.querySelector("[data-x2]").onclick=closeModal;
  m.querySelector("[data-p]").onclick=function(){ PX.printRecord(PS.db.company.nama+" — "+def.title+" ("+def.form+")","ID: "+r.id,kv,extra); };
}
/* Checklist P2H interaktif per kelompok unit */
function p2hModal(r){ if(!r) return;
  var items=window.PRISMA_SEED.p2hItems[r.kelompok]||[];
  var cur={}; (r._cek||[]).forEach(function(c){cur[c[0]]=c[1];});
  var m=openModal("Checklist P2H — "+(r.nopol||"")+" ("+(r.unit||"")+")",
   '<p class="sub">Kelompok: <b>'+esc(r.kelompok||"-")+'</b> • Tandai setiap item <b>Baik</b> / <b>Rusak</b>. Hasil tersimpan ke data P2H.</p>'+
   items.map(function(it,i){ var v=cur[it]||"Baik";
     return '<div class="checkline"><div style="flex:1"><b>'+(i+1)+'. '+esc(it)+'</b></div><div class="seg" data-i="'+i+'"><button data-v="Baik" class="'+(v==="Baik"?"on":"")+'">Baik</button><button data-v="Rusak" class="'+(v==="Rusak"?"on bad":"")+'">Rusak</button></div></div>'; }).join(""),
   '<button class="btn" data-x2>Batal</button><button class="btn primary" data-ok="">'+window.ic("check","ic-16")+'Simpan checklist</button>');
  m.querySelector("[data-x2]").onclick=closeModal;
  m.querySelectorAll(".seg").forEach(function(sg){ sg.querySelectorAll("button").forEach(function(b){ b.onclick=function(){
    sg.querySelectorAll("button").forEach(function(x){x.classList.remove("on","bad");});
    b.classList.add("on"); if(b.dataset.v==="Rusak") b.classList.add("bad"); }; }); });
  m.querySelector("[data-ok]").onclick=function(){ var cek=items.map(function(it,i){ var on=m.querySelector('.seg[data-i="'+i+'"] .on'); return [it,on?on.dataset.v:"Baik"]; });
    var rusak=cek.filter(function(c){return c[1]==="Rusak";}).map(function(c){return c[0];});
    r._cek=cek; r.rusak=rusak.length?("RUSAK: "+rusak.join("; ")):"Nihil — semua item Baik.";
    if(rusak.length&&/^layak operasi/i.test(r.hasil||"")) r.hasil="TIDAK LAYAK — parkir & lapor mekanik";
    if(!rusak.length&&/tidak layak/i.test(r.hasil||"")) r.hasil="LAYAK operasi";
    try{ /* sinkron master status unit: TIDAK LAYAK => Breakdown otomatis */
      var u=PS.all("units").find(function(x){ return String(x.nopol||"").toLowerCase()===String(r.nopol||"").toLowerCase(); });
      if(!u) u={id:PS.uid("UNT"),nopol:r.nopol,jenis:r.unit||"-",lokasi:"-",sebab:"-"};
      if(/tidak layak/i.test(r.hasil||"")){ if(u.status!=="Breakdown"){ u.status="Breakdown"; u.sebab="Otomatis P2H "+(r.tgl||""); u.sejak=(r.tgl||PS.today()); } }
      else if(!u.status){ u.status="Layak"; u.sejak=(r.tgl||PS.today()); }
      PS.put("units",u);
    }catch(_){}
    PS.put("p2h",r); closeModal(); toast("Checklist tersimpan ("+rusak.length+" rusak).","ok"); renderModule(window.PS_MODULES.p2h); };
}
window.PSV={renderModule:renderModule,openModal:openModal,closeModal:closeModal,detailModal:detailModal,formModal:formModal};
})();
