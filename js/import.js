/* PRISMA-SAFE — Import Excel massal + template (Quick Win 1).
   Titik masuk: window.IMPORT.template(def)  dan  window.IMPORT.open(def)
   - Template: header = label field editable (tanpa foto/ID/Update), 1 baris contoh + petunjuk sheet, opsi select dicatat di baris petunjuk.
   - Import: pilih .xlsx/.csv → baca via XLSX → petakan header label → k → validasi req & opsi → pratinjau 5 baris → impor massal.
   Aman: tolak executable, batas 200 baris/file, RBAC gate, pagu rekor 1.5MB dijaga. */
(function(){
"use strict";
function esc(s){ return window.esc(s); }
function editableFields(def){
  return def.fields.filter(function(f){ return f.t!=="photo" && f.k!=="_cek" && f.k!=="_files" && f.k!=="_hadir" && f.k!=="_u" && f.k!=="rusak"; });
}
function sampleFor(f){
  if(f.t==="date") return window.PS.today();
  if(f.t==="number") return String(f.def!=null?f.def:0);
  if(f.t==="select") return f.opts && f.opts[0] ? f.opts[0] : "";
  if(f.hint) return "contoh: "+String(f.hint).slice(0,28);
  return "contoh "+f.label;
}
function template(def){
  if(!window.XLSX){ toast("Excel offline belum siap — muat ulang sekali saat online.","err"); return; }
  var fds = editableFields(def);
  if(!fds.length){ toast("Modul ini tak punya kolom yang bisa diimpor.","err"); return; }
  var headers = fds.map(function(f){ return f.label+(f.req?" *":""); });
  var example = fds.map(function(f){ return sampleFor(f); });
  var hint = fds.map(function(f){
    if(f.t==="select" && f.opts) return "Pilihan: "+f.opts.slice(0,6).join(" | ")+(f.opts.length>6?" | …":"");
    if(f.t==="date") return "Format: YYYY-MM-DD";
    if(f.t==="number") return "Angka";
    return "";
  });
  var wsData = [headers, example, hint];
  var ws = window.XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = fds.map(function(){ return {wch:22}; });
  ws["!freeze"] = {xSplit:0,ySplit:1,rTopLeft:"A2"};
  // header style hint via !rows? SheetJS community tak bawa style — cukup freeze & petunjuk baris 3
  var wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, def.title.slice(0,31));
  var fname = "PRISMA-SAFE_template_"+def.key+"_"+new Date().toISOString().slice(0,10)+".xlsx";
  window.XLSX.writeFile(wb, fname);
  if(window.PSAUDIT) window.PSAUDIT.log("template","dokumen",def.key,"unduh template "+def.title);
  toast("Template terunduh — isi baris 2 dst, lalu Import.","ok");
}
function parseDateCell(v){
  if(v==null || v==="") return "";
  if(typeof v==="number" && window.XLSX && window.XLSX.SSF){
    try{ var d = window.XLSX.SSF.parse_date_code(v); if(d) return [d.y, String(d.m).padStart(2,"0"), String(d.d).padStart(2,"0")].join("-"); }catch(_){}
  }
  var s = String(v).trim();
  // terima DD/MM/YYYY → YYYY-MM-DD
  var m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(m) return m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0");
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if(m) return m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0");
  // YYYY-MM saja (manhours)
  m = s.match(/^(\d{4})-(\d{1,2})$/);
  if(m) return m[1]+"-"+m[2].padStart(2,"0");
  // waktu "YYYY-MM-DD HH:MM"
  m = s.match(/^(\d{4}-\d{2}-\d{2})\s/);
  if(m) return m[1];
  return s;
}
function openImport(def){
  if(window.RBAC && !window.RBAC.can("add")){ toast(window.RBAC.deny("mengimpor"),"err"); return; }
  if(!window.XLSX){ toast("Excel belum siap — muat ulang sekali saat online.","err"); return; }
  var inp = document.createElement("input"); inp.type="file"; inp.accept=".xlsx,.xls,.csv";
  inp.onchange = function(){
    var f = inp.files[0]; if(!f) return;
    if(/\.(exe|bat|cmd|ps1|js)$/i.test(f.name)){ toast("Jenis file ditolak.","err"); return; }
    if(f.size > 5*1024*1024){ toast("File >5 MB — pecah menjadi beberapa file.","err"); return; }
    var rd = new FileReader();
    rd.onload = function(e){
      try{
        var data = new Uint8Array(e.target.result);
        var wb = window.XLSX.read(data, {type:"array", cellDates:false});
        var ws = wb.Sheets[wb.SheetNames[0]];
        if(!ws){ toast("Sheet kosong.","err"); return; }
        var rows = window.XLSX.utils.sheet_to_json(ws, {header:1, defval:"", blankrows:false});
        if(!rows.length){ toast("Sheet kosong.","err"); return; }
        var header = rows[0].map(function(h){ return String(h||"").replace(/\s*\*+\s*$/,"").trim(); });
        var fds = editableFields(def);
        var labelToK = {}; fds.forEach(function(fd){ labelToK[fd.label]=fd.k; labelToK[fd.label.toLowerCase()]=fd.k; });
        // petakan kolom: index → k (cocok label persis, fallback urutan)
        var colMap = header.map(function(h,i){
          if(labelToK[h]!=null) return labelToK[h];
          if(labelToK[h.toLowerCase()]!=null) return labelToK[h.toLowerCase()];
          // fallback: urutan header vs fds
          return fds[i] ? fds[i].k : null;
        });
        var missReq = fds.filter(function(fd){ return fd.req && colMap.indexOf(fd.k)<0; });
        if(missReq.length){ toast("Kolom wajib hilang: "+missReq.map(function(x){return x.label;}).join(", ")+". Pakai template.","err"); return; }
        var dataRows = rows.slice(1).filter(function(r){ return r.some(function(c){ return String(c).trim()!==""; }); });
        // baris petunjuk (baris 3 template) sering terikut — buang bila berisi "Pilihan:" / "Format:"
        if(dataRows.length && dataRows[0].some(function(c){ return /Pilihan:|Format:/.test(String(c)); })) dataRows.shift();
        if(!dataRows.length){ toast("Tidak ada baris data.","err"); return; }
        if(dataRows.length>200){ toast("Maks 200 baris/file — file ini "+dataRows.length+" baris. Pecah file.","err"); return; }
        // bangun objek + validasi per baris
        var fByK = {}; fds.forEach(function(fd){ fByK[fd.k]=fd; });
        var objs = [], errs = [];
        dataRows.forEach(function(r,idx){
          var obj={}, rowErr=[];
          colMap.forEach(function(k,ci){
            if(!k || !(k in fByK)) return;
            var fd = fByK[k], raw = r[ci];
            var v = raw==null?"":String(raw).trim();
            if(fd.t==="date" || /tgl|waktu|berlaku|sejak|mulai|selesai|terbit|exp/i.test(fd.k)) v = parseDateCell(raw);
            else if(fd.t==="number") v = v===""? (fd.def!=null?fd.def:0) : Number(String(v).replace(",","."));
            obj[k]=v;
          });
          fds.forEach(function(fd){
            var v = obj[fd.k];
            if(fd.req && (v==null || String(v).trim()==="")) rowErr.push(fd.label+" wajib");
            if(fd.t==="select" && v && fd.opts && fd.opts.indexOf(String(v))<0) rowErr.push(fd.label+": “"+v+"” tak ada di pilihan");
            if(fd.t==="number" && v!=="" && isNaN(+v)) rowErr.push(fd.label+" harus angka");
          });
          objs.push(obj); errs.push(rowErr);
        });
        preview(def, objs, errs, header, colMap, fds);
      }catch(err){ toast("Gagal baca file: "+(err&&err.message||err),"err"); }
    };
    rd.readAsArrayBuffer(f);
  };
  inp.click();
}
function preview(def, objs, errs, header, colMap, fds){
  var okN = errs.filter(function(e){return !e.length;}).length;
  var badN = objs.length - okN;
  var h = '<p class="sub">Ditemukan <b>'+objs.length+'</b> baris — <span class="chip green">'+okN+' valid</span> <span class="chip red">'+badN+' bermasalah</span>. Baris bermasalah tak akan diimpor.</p>'
    +'<div class="tbl-wrap" style="max-height:320px"><table class="tbl"><thead><tr><th>#</th><th>Status</th>'+fds.map(function(f){return "<th>"+esc(f.label)+"</th>";}).join("")+'</tr></thead><tbody>'
    +objs.slice(0,5).map(function(o,i){
      var e = errs[i];
      return '<tr><td>'+(i+1)+'</td><td>'+(e.length?'<span class="chip red">'+esc(e.join("; "))+'</span>':'<span class="chip green">OK</span>')+'</td>'
        +fds.map(function(f){ var v=o[f.k]; return "<td>"+esc(v==null?"":String(v).slice(0,60))+"</td>"; }).join("")+'</tr>';
    }).join("")+'</tbody></table></div>'
    +(objs.length>5?'<p class="hint">Menampilkan 5 dari '+objs.length+' baris — sisanya tetap akan diimpor bila valid.</p>':'');
  var m = window.PSV.openModal("Impor — "+def.title, h,
    '<button class="btn" data-x2>Batal</button><button class="btn primary" data-ok>Batal</button>');
  var btns = m.querySelectorAll("[data-ok]");
  // ada 2 tombol di atas? perbaiki: footer kedua tombol; buat dinamis
  m.querySelector("footer").innerHTML = '<button class="btn" data-x2>Batal</button>'
    + (okN?'<button class="btn primary" data-go>Impor '+okN+' baris valid</button>':'<span class="hint">Tak ada baris valid.</span>');
  m.querySelector("[data-x2]").onclick = window.PSV.closeModal;
  var go = m.querySelector("[data-go]");
  if(go) go.onclick = function(){
    var n=0;
    objs.forEach(function(o,i){
      if(errs[i].length) return;
      // hormati compute & default
      if(typeof def.compute==="function"){ try{ def.compute(o); }catch(_){} }
      // isi default yang kosong
      fds.forEach(function(f){ if((o[f.k]==null || o[f.k]==="") && f.def!=null) o[f.k]=f.def; });
      if(def.fields.some(function(f){return f.k==="tgl" && !o.tgl;})) o.tgl = window.PS.today();
      o.id = window.PS.uid(def.key.slice(0,3).toUpperCase());
      try{ if(JSON.stringify(o).length>1572864) return; }catch(_){ return; }
      window.PS.put(def.key, o); n++;
    });
    window.PSV.closeModal();
    toast("Impor selesai: "+n+" baris ditambahkan.","ok");
    window.PSV.renderModule(def);
  };
}
window.IMPORT = { template: template, open: openImport };
})();
