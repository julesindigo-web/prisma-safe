/* PRISMA-SAFE — ekspor multi-format: CSV • Excel (.xlsx) • Cetak/PDF • JSON.
   Cetak memakai jendela print dengan kop perusahaan + blok tanda tangan,
   sehingga presisi dan rapi di semua printer / Save-as-PDF. */
(function(){
"use strict";
function fname(mod,ext){ var d=new Date(), p=function(n){return String(n).padStart(2,"0");};
  return "PRISMA-SAFE_"+mod+"_"+d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"-"+p(d.getHours())+p(d.getMinutes())+"."+ext; }
function download(name,content,mime){ var b=content instanceof Blob?content:new Blob([content],{type:mime||"text/plain;charset=utf-8"});
  var a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click();
  setTimeout(function(){ try{ if(URL.revokeObjectURL) URL.revokeObjectURL(a.href); }catch(_){} a.remove();},800); }
function toCSV(rows,cols){ var q=function(v){ v=String(v==null?"":v); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  var out=[cols.map(function(c){return q(c.label);}).join(";")];
  rows.forEach(function(r){ out.push(cols.map(function(c){return q(c.get(r));}).join(";")); });
  return "\ufeff"+out.join("\r\n"); }
function kopHTML(title,sub){ var c=window.PS.db.company;
  return '<div class="print-kop"><h2>'+esc(c.nama)+' — '+esc(title)+'</h2><p>'+esc(c.site)+' • '+esc(sub||"")+' • Dicetak: '+esc(new Date().toLocaleString("id-ID"))+'</p></div>'; }
function sigHTML(){ return '<div class="sig"><div>Dibuat oleh<br>HSE</div><div>Diperiksa oleh<br>Deputy PJO</div><div>Diketahui oleh<br>PJO</div></div>'; }
function printHTML(title,sub,bodyHTML){
  var w=window.open("","_blank","width=900,height=700"); if(!w){ toast("Pop-up diblokir — izinkan pop-up untuk mencetak.","err"); return; }
  w.document.write('<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>'+esc(title)+'</title><style>'+
   'body{font-family:"Segoe UI",Arial,sans-serif;color:#111;margin:24px;font-size:13px}'+
   '.print-kop{border-bottom:3px double #000;padding-bottom:10px;margin-bottom:14px}.print-kop h2{margin:0;font-size:18px}.print-kop p{margin:2px 0;font-size:12px}'+
   'table{width:100%;border-collapse:collapse}th,td{border:1px solid #555;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eee;font-size:11px;text-transform:uppercase}'+
   '.sig{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:26px;font-size:12px;text-align:center}.sig div{border-top:1px solid #000;padding-top:4px;margin-top:56px}'+
   'h3{margin:18px 0 8px}.mut{color:#555;font-size:12px}.kv{display:grid;grid-template-columns:200px 1fr;gap:4px 10px;margin-bottom:10px}.kv dt{color:#555}.kv dd{margin:0;font-weight:700}'+
   '@media print{.no-print{display:none}} .no-print{margin:14px 0}button{padding:8px 16px;font-size:14px}</style></head><body>'+
   kopHTML(title,sub)+bodyHTML+sigHTML()+'<div class="no-print"><button onclick="window.print()">🖨 Cetak / Simpan PDF</button></div></body></html>');
  w.document.close(); w.focus();
}
window.PX = {
  csv: function(mod,label,rows,cols){ if(!rows.length){toast("Tidak ada data untuk diekspor.","err");return;} download(fname(mod,"csv"),toCSV(rows,cols),"text/csv;charset=utf-8"); toast("CSV terunduh: "+rows.length+" baris.","ok"); },
  xlsx: function(mod,label,rows,cols){
    if(!rows.length){toast("Tidak ada data untuk diekspor.","err");return;}
    if(window.XLSX){ try{
      var data=rows.map(function(r){var o={};cols.forEach(function(c){o[c.label]=c.get(r);});return o;});
      var ws=XLSX.utils.json_to_sheet(data); ws["!cols"]=cols.map(function(){return{wch:24};});
      var wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,label.slice(0,31));
      XLSX.writeFile(wb,fname(mod,"xlsx")); toast("Excel terunduh: "+rows.length+" baris.","ok"); return;
    }catch(e){} }
    toast("Mode offline — mengunduh CSV sebagai gantinya.","err"); window.PX.csv(mod,label,rows,cols);
  },
  printTable: function(title,sub,rows,cols){
    if(!rows.length){toast("Tidak ada data untuk dicetak.","err");return;}
    var h='<p class="mut">Jumlah: <b>'+rows.length+'</b> data • '+esc(sub||"")+'</p><table><thead><tr><th>No</th>'+
      cols.map(function(c){return "<th>"+esc(c.label)+"</th>";}).join("")+'</tr></thead><tbody>'+
      rows.map(function(r,i){return "<tr><td>"+(i+1)+"</td>"+cols.map(function(c){return "<td>"+esc(c.get(r))+"</td>";}).join("")+"</tr>";}).join("")+'</tbody></table>';
    printHTML(title,sub,h);
  },
  printRecord: function(title,sub,kvPairs,extraHTML){
    var h='<dl class="kv">'+kvPairs.map(function(k){return "<dt>"+esc(k[0])+"</dt><dd>"+esc(k[1])+"</dd>";}).join("")+'</dl>'+(extraHTML||"");
    printHTML(title,sub,h);
  }
};
})();
