/* PRISMA-SAFE — skema 17 modul K3. Satu definisi menggerakkan:
   tabel + pencarian + formulir + validasi + detail + ekspor CSV/XLSX/Cetak. */
(function(){
"use strict";
var S = window.PRISMA_SEED;
var D = S.departments, L = S.locations, U = S.units;
function sel(v){ return {t:"select",opts:v}; }
var M = {};
function mod(key,title,group,sub,form,fields,cols,opts){
  M[key]={key:key,title:title,group:group,sub:sub,form:form,fields:fields,cols:cols,
    search:(opts&&opts.search)||cols.map(function(c){return c.k;}).filter(Boolean),
    detail:(opts&&opts.detail)||null, empty:(opts&&opts.empty)||"Belum ada data. Klik “＋ Tambah” untuk menginput."};
  return M[key];
}
/* ---------- 1 LAPORAN HARIAN (SFT04) ---------- */
mod("laporan","Laporan Harian","UTAMA","Aktivitas K3 harian ala SMI-FRM-SFT04: shift, cuaca, MP, inspeksi, temuan, insiden.","SFT04",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"select",k:"shift",label:"Shift",req:1,opts:["Shift 1 (Siang)","Shift 2 (Malam)","Shift Panjang","Lembur"]},
 {t:"select",k:"cuaca",label:"Cuaca",opts:["Cerah","Berawan","Hujan ringan","Hujan lebat","Berkabut"]},
 {t:"text",k:"lokasi",label:"Lokasi kerja",req:1,hint:"cth. Pit Area & Hauling Road KM 2–4"},
 {t:"number",k:"mp",label:"Manpower hadir",def:0},{t:"number",k:"jam",label:"Jam kerja",def:8},
 {t:"textarea",k:"aktivitas",label:"Aktivitas hari ini",req:1},{t:"textarea",k:"inspeksi",label:"Inspeksi / patroli dilakukan"},
 {t:"textarea",k:"temuan",label:"Temuan"},{t:"textarea",k:"insiden",label:"Insiden / near miss",def:"Nihil"},
 {t:"textarea",k:"tl",label:"Tindak lanjut"},{t:"text",k:"oleh",label:"Dibuat oleh",req:1}
],[
 {k:"tgl",label:"Tanggal"},{k:"shift",label:"Shift"},{k:"lokasi",label:"Lokasi"},
 {label:"MP",get:function(r){return r.mp||0;}},{k:"insiden",label:"Insiden",chip:function(r){return /nihil/i.test(r.insiden||"")?"green":"red";}}
]);
/* ---------- 2 INSPEKSI ---------- */
mod("inspeksi","Inspeksi K3","PENGAWASAN","SAP, SKAT, APAR, mess, hauling, pit, workshop, ETO-jetty, terencana…","SFT37",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"select",k:"jenis",label:"Jenis inspeksi",req:1,opts:S.inspectionTypes},
 {t:"text",k:"area",label:"Area / lokasi",req:1},{t:"text",k:"oleh",label:"Pemeriksa",req:1},
 {t:"number",k:"n",label:"Jumlah temuan",def:0},{t:"select",k:"krit",label:"Temuan kritis?",opts:["Nihil","Ada — sudah ditindaklanjuti","Ada — perlu PICA"]},
 {t:"textarea",k:"uraian",label:"Uraian temuan & observasi",hint:"Satu baris per temuan: lokasi — uraian — saran"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Close","Open","Perlu PICA"]}
],[
 {k:"tgl",label:"Tanggal"},{k:"jenis",label:"Jenis"},{k:"area",label:"Area"},
 {label:"Temuan",get:function(r){return r.n||0;}},{k:"status",label:"Status",chip:function(r){return r.status==="Close"?"green":r.status==="Open"?"amber":"red";}}
]);
/* ---------- 3 PICA ---------- */
mod("pica","PICA & Tindak Lanjut","PENGAWASAN","Problem Identification & Corrective Action: akar masalah → korektif/preventif → verifikasi.","SFT26",[
 {t:"text",k:"no",label:"No. PICA",req:1,hint:"cth. PICA-2026-09-001"},
 {t:"select",k:"sumber",label:"Sumber",req:1,opts:["Inspeksi","Insiden / Near Miss","Audit SMKP","Sampling SML","Regulatory","Keluhan","Komisioning"]},
 {t:"date",k:"tgl",label:"Tanggal temuan",req:1},{t:"textarea",k:"masalah",label:"Deskripsi masalah",req:1},
 {t:"textarea",k:"akar",label:"Analisa akar masalah"},{t:"textarea",k:"korektif",label:"Tindakan korektif"},
 {t:"textarea",k:"preventif",label:"Tindakan preventif"},{t:"text",k:"pic",label:"PIC",req:1},
 {t:"date",k:"target",label:"Target selesai",req:1},
 {t:"select",k:"status",label:"Status",req:1,opts:["Open","In Progress","Close","Overdue"]},
 {t:"textarea",k:"verif",label:"Verifikasi HSE"}
],[
 {k:"no",label:"No. PICA"},{k:"masalah",label:"Masalah",get:function(r){return String(r.masalah||"").slice(0,60);}},
 {k:"pic",label:"PIC"},{k:"target",label:"Target"},
 {k:"status",label:"Status",chip:function(r){return r.status==="Close"?"green":r.status==="Open"?"amber":r.status==="Overdue"?"red":"blue";}}
]);
/* ---------- 4 INSIDEN ---------- */
mod("insiden","Insiden & Investigasi","PENGAWASAN","Near miss → first aid → MTI/RWC/LTI → fatality. Terhubung ke SFT07/09/10.","SFT07",[
 {t:"select",k:"kat",label:"Kategori",req:1,opts:S.incidentCats},{t:"date",k:"tgl",label:"Tanggal kejadian",req:1},
 {t:"text",k:"waktu",label:"Waktu (WITA)",hint:"cth. 14:35"},{t:"text",k:"lokasi",label:"Lokasi",req:1},
 {t:"text",k:"unit",label:"Unit / peralatan terkait"},{t:"text",k:"korban",label:"Korban / pihak terdampak"},
 {t:"textarea",k:"kronologi",label:"Kronologi",req:1},{t:"textarea",k:"sebab",label:"Sebab langsung & tidak langsung"},
 {t:"textarea",k:"akar",label:"Akar masalah"},{t:"textarea",k:"tindakan",label:"Tindakan korektif & preventif"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Open — investigasi berjalan","Close — sudah verifikasi","Dilaporkan ke regulator"]},
 {t:"text",k:"oleh",label:"Pelapor",req:1}
],[
 {k:"tgl",label:"Tanggal"},{k:"kat",label:"Kategori",chip:function(r){return /fatality|^lti/i.test(r.kat||"")?"red":/near miss|first aid/i.test(r.kat||"")?"amber":"blue";}},
 {k:"lokasi",label:"Lokasi"},{k:"status",label:"Status",chip:function(r){return /^close/i.test(r.status||"")?"green":"amber";}}
]);
/* ---------- 5 IBPR ---------- */
mod("ibpr","IBPR / HIRADC","ANALISIS RISIKO","Identifikasi bahaya, penilaian risiko matriks 5×5 & hierarki pengendalian (SFT01).","SFT01",[
 {t:"select",k:"dept",label:"Departemen",req:1,opts:D},{t:"text",k:"aktivitas",label:"Aktivitas / pekerjaan",req:1},
 {t:"textarea",k:"bahaya",label:"Bahaya & risiko",req:1},
 {t:"select",k:"l0",label:"L awal (1–5)",req:1,opts:["1","2","3","4","5"]},{t:"select",k:"s0",label:"S awal (1–5)",req:1,opts:["1","2","3","4","5"]},
 {t:"textarea",k:"kontrol",label:"Pengendalian (hierarki)",req:1,hint:"Eliminasi → Substitusi → Engineering → Administratif → APD"},
 {t:"select",k:"l1",label:"L sisa (1–5)",req:1,opts:["1","2","3","4","5"]},{t:"select",k:"s1",label:"S sisa (1–5)",req:1,opts:["1","2","3","4","5"]},
 {t:"text",k:"pic",label:"Penanggung jawab"},{t:"date",k:"tgl",label:"Tanggal kajian"},
 {t:"text",k:"sumber",label:"Sumber / dokumen"}
],[
 {k:"aktivitas",label:"Aktivitas",get:function(r){return String(r.aktivitas||"").slice(0,55);}},
 {label:"Risiko awal",get:function(r){var s=(+r.l0||0)*(+r.s0||0);return s+" • "+S.riskMatrix.level(s)[0];},chip:function(r){var s=(+r.l0||0)*(+r.s0||0);return S.riskMatrix.level(s)[1];}},
 {label:"Risiko sisa",get:function(r){var s=(+r.l1||0)*(+r.s1||0);return s+" • "+S.riskMatrix.level(s)[0];},chip:function(r){var s=(+r.l1||0)*(+r.s1||0);return S.riskMatrix.level(s)[1];}},
 {k:"dept",label:"Dept"}
]);
/* ---------- 6 JSA ---------- */
mod("jsa","JSA (Job Safety Analysis)","ANALISIS RISIKO","Langkah kerja → bahaya per langkah → kontrol. Wajib sebelum pekerjaan berisiko.","SFT01",[
 {t:"text",k:"pekerjaan",label:"Pekerjaan",req:1},{t:"select",k:"dept",label:"Departemen",opts:D},
 {t:"text",k:"lokasi",label:"Lokasi"},{t:"date",k:"tgl",label:"Tanggal",req:1},
 {t:"textarea",k:"langkah",label:"Langkah kerja (satu baris per langkah)",req:1},
 {t:"textarea",k:"bahaya",label:"Bahaya per langkah",req:1},{t:"textarea",k:"kontrol",label:"Kontrol per langkah",req:1},
 {t:"text",k:"disusun",label:"Disusun oleh"},{t:"text",k:"disetujui",label:"Disetujui (pengawas)"}
],[
 {k:"pekerjaan",label:"Pekerjaan"},{k:"lokasi",label:"Lokasi"},{k:"tgl",label:"Tanggal"},{k:"disetujui",label:"Persetujuan",chip:function(r){return r.disetujui?"green":"amber";}}
]);
/* ---------- 7 INDUKSI ---------- */
mod("induksi","Induksi & Post Test","PERSONEL & KESEHATAN","Induksi karyawan, visitor & kontraktor + post test per unit + sertifikat.","P&A11",[
 {t:"text",k:"nama",label:"Nama peserta",req:1},{t:"select",k:"tipe",label:"Tipe",req:1,opts:["Karyawan baru","Visitor/Tamu","Kontraktor","Promosi/rotasi"]},
 {t:"text",k:"perush",label:"Perusahaan / instansi"},{t:"text",k:"jabatan",label:"Jabatan / keperluan"},
 {t:"date",k:"tgl",label:"Tanggal induksi",req:1},{t:"text",k:"pemateri",label:"Pemateri"},
 {t:"select",k:"materi",label:"Materi",opts:S.materiInduksi},{t:"number",k:"nilai",label:"Nilai post test (0–100)",def:0},
 {t:"select",k:"hasil",label:"Hasil",req:1,opts:["Lulus","Remedial","Belum test"]},{t:"text",k:"sert",label:"No. sertifikat / kartu"}
],[
 {k:"nama",label:"Nama"},{k:"tipe",label:"Tipe"},{k:"tgl",label:"Tanggal"},
 {label:"Nilai",get:function(r){return r.nilai==null||r.nilai===""?"-":r.nilai;}},
 {k:"hasil",label:"Hasil",chip:function(r){return r.hasil==="Lulus"?"green":r.hasil==="Remedial"?"amber":"grey";}}
]);
/* ---------- 8 P2H ---------- */
mod("p2h","P2H Unit","PERSONEL & KESEHATAN","Pre-start check harian semua unit (SFT39 series & P&M01/02). Unit TIDAK LAYAK tidak boleh operasi.","SFT39",[
 {t:"select",k:"kelompok",label:"Kelompok unit",req:1,opts:Object.keys(S.p2hItems)},
 {t:"select",k:"unit",label:"Jenis unit",req:1,opts:U},{t:"text",k:"nopol",label:"No. unit / nopol",req:1},
 {t:"text",k:"operator",label:"Operator / driver",req:1},{t:"date",k:"tgl",label:"Tanggal",req:1},
 {t:"text",k:"hm",label:"HM / KM"},{t:"textarea",k:"rusak",label:"Item RUSAK / catatan (otomatis bila checklist)"},
 {t:"select",k:"hasil",label:"Hasil akhir",req:1,opts:["LAYAK operasi","TIDAK LAYAK — parkir & lapor mekanik","Layak bersyarat — pantau"]}
],[
 {k:"tgl",label:"Tanggal"},{k:"nopol",label:"No. unit"},{k:"unit",label:"Unit"},{k:"operator",label:"Operator"},
 {k:"hasil",label:"Hasil",chip:function(r){return /^layak operasi/i.test(r.hasil||"")?"green":/tidak layak/i.test(r.hasil||"")?"red":"amber";}}
],{detail:function(r){ return [["Checklist","Lihat/isi checklist item pada tombol “Checklist” di aksi baris."]]; }});
/* ---------- 9 PERMIT ---------- */
mod("permit","Ijin Kerja Aman","ANALISIS RISIKO","Safe Work Permit SFT29: hot work, confined space, ketinggian, elektrikal, lifting…","SFT29",[
 {t:"text",k:"no",label:"No. permit",req:1},{t:"select",k:"jenis",label:"Jenis pekerjaan",req:1,opts:S.permitTypes},
 {t:"text",k:"lokasi",label:"Lokasi",req:1},{t:"date",k:"mulai",label:"Berlaku mulai",req:1},{t:"date",k:"selesai",label:"Berlaku s/d",req:1},
 {t:"textarea",k:"uraian",label:"Uraian pekerjaan",req:1},{t:"textarea",k:"kontrol",label:"Pengendalian & APD khusus"},
 {t:"text",k:"pelaksana",label:"Pelaksana / kontraktor"},{t:"text",k:"pengawas",label:"Pengawas pekerjaan"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Diajukan","Disetujui Supervisor","Disetujui Safety","Disetujui KTT — berlaku","Selesai & ditutup","Ditolak","Diperpanjang"]}
],[
 {k:"no",label:"No."},{k:"jenis",label:"Jenis",get:function(r){return String(r.jenis||"").split("(")[0];}},
 {k:"lokasi",label:"Lokasi"},{k:"status",label:"Status",chip:function(r){return /disetujui/i.test(r.status||"")?"green":/selesai/i.test(r.status||"")?"teal":/ditolak/i.test(r.status||"")?"red":"amber";}}
]);
/* ---------- 10 MANPOWER ---------- */
mod("manpower","Manpower & Kompetensi","PERSONEL & KESEHATAN","Personel ADI+SMI: jabatan, level, MCU, SIM/lisensi, KPO/PJO.","P&A07",[
 {t:"text",k:"nama",label:"Nama",req:1},{t:"text",k:"jabatan",label:"Jabatan / posisi",req:1},
 {t:"select",k:"dept",label:"Departemen",opts:D},{t:"select",k:"level",label:"Level",opts:["Top Management","Staff","Pengawas","Operasional/Non Staff"]},
 {t:"select",k:"perush",label:"Perusahaan",opts:["SMI","ADI","AUXIN","CREC","Kontraktor lain"]},
 {t:"select",k:"mcu",label:"MCU",opts:["-","Fit","Fit with note","Unfit","Kedaluarsa"]},
 {t:"text",k:"sim",label:"SIM / lisensi unit"},{t:"text",k:"kpo",label:"KPO / sertifikasi"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Aktif","Cuti/Roster","Nonaktif","Baru — perlu induksi"]}
],[
 {k:"nama",label:"Nama"},{k:"jabatan",label:"Jabatan"},{k:"dept",label:"Dept"},
 {k:"mcu",label:"MCU",chip:function(r){return r.mcu==="Fit"?"green":r.mcu==="Unfit"?"red":"grey";}},
 {k:"status",label:"Status",chip:function(r){return r.status==="Aktif"?"green":/perlu induksi/i.test(r.status||"")?"amber":"grey";}}
]);
/* ---------- 11 KLINIK ---------- */
mod("klinik","Klinik & Kesehatan","PERSONEL & KESEHATAN","Kunjungan klinik, data orang sakit, fatigue test & rujukan.","SFT38",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"text",k:"nama",label:"Nama pasien (inisial bila sensitif)",req:1},
 {t:"select",k:"dept",label:"Departemen",opts:D},{t:"text",k:"diagnosa",label:"Diagnosa sementara / keluhan",req:1},
 {t:"select",k:"tindak",label:"Tindak lanjut",opts:["Rawat jalan","Observasi","Light duty","Rujuk RS","Rujuk gigi","Istirahat (sick leave)","MCU ulang","Edukasi"]},
 {t:"textarea",k:"cat",label:"Catatan"}
],[
 {k:"tgl",label:"Tanggal"},{k:"nama",label:"Pasien"},{k:"dept",label:"Dept"},{k:"diagnosa",label:"Diagnosa"},{k:"tindak",label:"Tindak lanjut"}
]);
/* ---------- 12 APD ---------- */
mod("apd","APD & Inventori","PERSONEL & KESEHATAN","Matriks APD per jabatan + stok gudang HSE.","APD",[
 {t:"text",k:"jenis",label:"Jenis APD",req:1},{t:"text",k:"area",label:"Area / jabatan wajib"},
 {t:"select",k:"sifat",label:"Sifat",opts:["Wajib","Sesuai risiko","Kondisional","Wajib tersedia"]},
 {t:"number",k:"stok",label:"Stok",def:0},{t:"text",k:"satuan",label:"Satuan",def:"pcs"},
 {t:"text",k:"lokasi",label:"Lokasi simpan"},{t:"text",k:"pj",label:"Penanggung jawab"}
],[
 {k:"jenis",label:"Jenis APD"},{k:"sifat",label:"Sifat",chip:function(r){return r.sifat==="Wajib"?"red":r.sifat==="Wajib tersedia"?"amber":"blue";}},
 {label:"Stok",get:function(r){return (r.stok||0)+" "+(r.satuan||"");},chip:function(r){return (+r.stok||0)===0?"red":(+r.stok||0)<10?"amber":"green";}}
]);
/* ---------- 13 PROGRAM ---------- */
mod("program","Program K3LH","PROGRAM & TATA KELOLA","Rencana vs realisasi program bulanan & triwulan + PIC ( ala Program K3LH ).","SFT02",[
 {t:"text",k:"target",label:"Target / sasaran",req:1},{t:"text",k:"program",label:"Program",req:1},
 {t:"text",k:"kontrol",label:"Modul kontrol"},{t:"select",k:"frekuensi",label:"Frekuensi",opts:["Harian","Mingguan","Bulanan","Triwulan","Tahunan","Insidentil"]},
 {t:"text",k:"pic",label:"PIC"},{t:"text",k:"bulan",label:"Periode (YYYY-MM)",req:1},
 {t:"number",k:"rencana",label:"Rencana (x)",def:1},{t:"number",k:"realisasi",label:"Realisasi (x)",def:0},
 {t:"textarea",k:"ket",label:"Keterangan"}
],[
 {k:"program",label:"Program"},{k:"bulan",label:"Periode"},
 {label:"Capaian",get:function(r){var p=r.rencana>0?Math.round(100*r.realisasi/r.rencana):0;return r.realisasi+"/"+r.rencana+" ("+p+"%)";},chip:function(r){var p=r.rencana>0?100*r.realisasi/r.rencana:0;return p>=100?"green":p>=50?"amber":"red";}},
 {k:"pic",label:"PIC"}
]);
/* ---------- 14 MOM ---------- */
mod("mom","MoM, P5M & Safety Talk","PROGRAM & TATA KELOLA","Minutes of meeting, P5M harian & safety talk + daftar hadir (SFT08/SFT36).","SFT08",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"select",k:"jenis",label:"Jenis",req:1,opts:["P5M","Safety Talk","MoM Internal","MoM TMS–VMM (HSE)","MoM VMM–ADI–SMI","Eksekusi Meeting Insiden"]},
 {t:"text",k:"topik",label:"Topik",req:1},{t:"text",k:"pemateri",label:"Pemateri / pimpinan"},
 {t:"number",k:"peserta",label:"Jumlah peserta",def:0},{t:"text",k:"lokasi",label:"Lokasi"},
 {t:"textarea",k:"hasil",label:"Hasil & keputusan"}
],[
 {k:"tgl",label:"Tanggal"},{k:"jenis",label:"Jenis"},{k:"topik",label:"Topik",get:function(r){return String(r.topik||"").slice(0,60);}},{label:"Hadir",get:function(r){return r.peserta||0;}}
]);
/* ---------- 15 REGULASI ---------- */
mod("regulasi","Regulasi & Kepatuhan","PROGRAM & TATA KELOLA","UU 1/1970 • PP 50/2012 • ESDM 26/2018 • 1827/2018 + evaluasi kesesuaian.","REG",[
 {t:"text",k:"nomor",label:"Nomor peraturan",req:1},{t:"text",k:"judul",label:"Judul",req:1},
 {t:"textarea",k:"ringkasan",label:"Rangkuman isi & kewajiban"},{t:"text",k:"pic",label:"PIC"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Berlaku","Berlaku — perlu tindak lanjut","Arsip","Dicabut/Diperbarui"]}
],[
 {k:"nomor",label:"Nomor"},{k:"judul",label:"Judul"},{k:"status",label:"Status",chip:function(r){return r.status==="Berlaku"?"green":/tindak lanjut/i.test(r.status||"")?"amber":"grey";}}
]);
/* ---------- 16 DOKUMEN ---------- */
mod("dokumen","Dokumen & Formulir","PROGRAM & TATA KELOLA","Daftar induk dokumen: seluruh kode SMI-FRM-SFT, P&A, LOG, MPE, KTT-PJO.","DID",[
 {t:"text",k:"kode",label:"Kode dokumen",req:1},{t:"text",k:"nama",label:"Nama dokumen",req:1},
 {t:"select",k:"kelompok",label:"Kelompok",opts:["IBPR","Inspeksi","Laporan","Insiden","PICA","Permit","P2H","Program","Rapat","Personel","Kesehatan","Logistik","Regulasi","APD","Lainnya"]},
 {t:"text",k:"revisi",label:"Revisi",def:"Rev.00"},{t:"date",k:"tgl",label:"Tanggal berlaku"},
 {t:"textarea",k:"ket",label:"Keterangan / lokasi file"}
],[
 {k:"kode",label:"Kode"},{k:"nama",label:"Nama dokumen",get:function(r){return String(r.nama||"").slice(0,70);}},{k:"kelompok",label:"Kelompok",chip:function(){return "blue";}},{k:"revisi",label:"Rev"}
]);
/* ---------- 17 HAZARD & NEAR-MISS (SFT13, custom GPS+foto) ---------- */
mod("hazard","Hazard & Near-Miss","PENGAWASAN","Lapor bahaya: GPS + foto bukti + auto-skor 5×5. Offline-first, tersimpan di perangkat.","SFT13",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"text",k:"pelapor",label:"Pelapor",req:1},
 {t:"text",k:"lokasi",label:"Lokasi",req:1},{t:"select",k:"jenis",label:"Jenis",opts:["Kondisi tidak aman","Tindakan tidak aman","Near miss","Housekeeping","Jalan & rambu","Listrik","Ketinggian","Pengangkatan","Lingkungan","Lainnya"]},
 {t:"textarea",k:"uraian",label:"Uraian"},
 {t:"select",k:"l",label:"L (1–5)",opts:["1","2","3","4","5"]},{t:"select",k:"s",label:"S (1–5)",opts:["1","2","3","4","5"]},
 {t:"select",k:"status",label:"Status",req:1,opts:["Open","In Progress","Close"]}
],[
 {k:"tgl",label:"Tanggal"},{k:"lokasi",label:"Lokasi"},{k:"jenis",label:"Jenis"},
 {label:"Skor",get:function(r){ return (r.skor == null ? "?" : r.skor) + " • " + (r.level || "—"); },chip:function(r){ return {"RENDAH":"green","SEDANG":"blue","TINGGI":"amber","EKSTREM":"red"}[r.level] || "grey"; }},
 {k:"status",label:"Status",chip:function(r){ return r.status === "Close" ? "green" : r.status === "Open" ? "amber" : "blue"; }}
]);
/* ---------- 18 UNIT & STATUS (auto-breakdown dari P2H) ---------- */
mod("units","Unit & Status Kelayakan","PENGAWASAN","Master unit: Layak/Terbatas/Breakdown. P2H TIDAK LAYAK mem-breakdown otomatis.","UNIT",[
 {t:"text",k:"nopol",label:"No. unit",req:1},{t:"select",k:"jenis",label:"Jenis",req:1,opts:U},
 {t:"text",k:"lokasi",label:"Lokasi"},{t:"select",k:"status",label:"Status",req:1,opts:["Layak","Terbatas","Breakdown"]},
 {t:"textarea",k:"sebab",label:"Sebab / catatan"},{t:"date",k:"sejak",label:"Sejak"}
],[
 {k:"nopol",label:"No. unit"},{k:"jenis",label:"Jenis"},
 {k:"status",label:"Status",chip:function(r){ return r.status === "Layak" ? "green" : r.status === "Terbatas" ? "amber" : "red"; }},
 {k:"lokasi",label:"Lokasi"}
]);
/* ---------- 19 FATIGUE & FIT-TO-WORK ---------- */
mod("fatigue","Fatigue & Fit-to-Work","PERSONEL & KESEHATAN","Self-assessment pra-shift: jam tidur + skala kantuk + gejala → status fit otomatis.","SFT38",[
 {t:"text",k:"nama",label:"Nama",req:1},{t:"date",k:"tgl",label:"Tanggal",req:1},
 {t:"select",k:"shift",label:"Shift",opts:["Shift 1 (Siang)","Shift 2 (Malam)"]},
 {t:"number",k:"tidur",label:"Jam tidur sebelum shift",req:1,def:7},
 {t:"select",k:"kantuk",label:"Skala kantuk 1 (segar) – 9 (sangat mengantuk)",req:1,opts:["1","2","3","4","5","6","7","8","9"]},
 {t:"select",k:"gejala",label:"Gejala",opts:["Nihil","Mata berat","Pusing","Pegal / lelah berat","Mual","Lainnya"]},
 {t:"select",k:"hasil",label:"Hasil (otomatis)",opts:["Fit","Fit dengan catatan","TIDAK FIT — istirahat"]}
],[
 {k:"tgl",label:"Tanggal"},{k:"nama",label:"Nama"},
 {label:"Tidur",get:function(r){ return (r.tidur == null || r.tidur === "" ? "—" : r.tidur) + " jam"; }},
 {k:"kantuk",label:"Kantuk"},
 {k:"hasil",label:"Hasil",chip:function(r){ return r.hasil === "Fit" ? "green" : /TIDAK FIT/.test(r.hasil || "") ? "red" : "amber"; }}
]);
/* ---------- 20 MCU ---------- */
mod("mcu","MCU Berkala","PERSONEL & KESEHATAN","Riwayat medical check-up + masa berlaku. ≤30 hari masuk peringatan SMKP.","P&A52",[
 {t:"text",k:"nama",label:"Nama",req:1},{t:"date",k:"tgl",label:"Tanggal MCU",req:1},
 {t:"select",k:"hasil",label:"Hasil",req:1,opts:["Fit","Fit with note","Unfit","Follow-up"]},
 {t:"date",k:"berlaku",label:"Berlaku s/d"},{t:"textarea",k:"catatan",label:"Catatan"}
],[
 {k:"nama",label:"Nama"},{k:"tgl",label:"Tanggal"},
 {k:"hasil",label:"Hasil",chip:function(r){ return r.hasil === "Fit" ? "green" : r.hasil === "Unfit" ? "red" : "amber"; }},
 {k:"berlaku",label:"Berlaku s/d"}
]);
/* ---------- 21 TELEMETRI ---------- */
mod("tele","Telemetri Lingkungan","PENGAWASAN","Ukur gas/debu/bising/suhu + ambang → status otomatis. Sensor live butuh middleware; modul siap catat manual/impor.","TLM",[
 {t:"text",k:"waktu",label:"Waktu (YYYY-MM-DD HH:MM)",req:1},{t:"text",k:"lokasi",label:"Lokasi",req:1},
 {t:"select",k:"jenis",label:"Parameter",req:1,opts:S.teleTypes},
 {t:"number",k:"nilai",label:"Nilai ukur",req:1},{t:"text",k:"satuan",label:"Satuan"},
 {t:"number",k:"ambang",label:"Ambang batas",req:1},
 {t:"select",k:"status",label:"Status (otomatis)",opts:["Normal","LEBIH AMBANG"]}
],[
 {k:"waktu",label:"Waktu"},{k:"lokasi",label:"Lokasi"},{k:"jenis",label:"Parameter"},
 {label:"Nilai",get:function(r){ return (r.nilai == null ? "—" : r.nilai) + " " + (r.satuan || ""); }},
 {k:"status",label:"Status",chip:function(r){ return r.status === "LEBIH AMBANG" ? "red" : "green"; }}
]);
/* ---------- 22 MANHOURS ---------- */
mod("manhours","Manhours","PROGRAM & TATA KELOLA","Jam kerja manusia + hari-hilang per bulan. Wajib agar LTIFR/TRIFR/SR terhitung.","MH",[
 {t:"text",k:"bulan",label:"Periode (YYYY-MM)",req:1},{t:"number",k:"mh",label:"Manhours",req:1,def:0},
 {t:"number",k:"lost",label:"Hari hilang (LTI)",def:0},{t:"textarea",k:"ket",label:"Keterangan"}
],[
 {k:"bulan",label:"Periode"},
 {label:"Manhours",get:function(r){ return (+r.mh || 0).toLocaleString("id-ID"); }},
 {label:"Hari hilang",get:function(r){ return r.lost || 0; }}
]);
/* ---------- 23 MUSTER ---------- */
mod("muster","Muster & Evakuasi","DARURAT","Titik kumpul + absensi kode event. SOS dicatat di modul SOS.","MST",[
 {t:"text",k:"kode",label:"Kode event",req:1},{t:"date",k:"tgl",label:"Tanggal",req:1},
 {t:"select",k:"titik",label:"Titik kumpul",req:1,opts:S.musterPoints},
 {t:"text",k:"pj",label:"Koordinator"},{t:"textarea",k:"catatan",label:"Catatan"}
],[
 {k:"tgl",label:"Tanggal"},{k:"titik",label:"Titik"},
 {label:"Hadir",get:function(r){ return (r._hadir || []).length + " org"; }},
 {k:"pj",label:"Koordinator"}
]);
/* ---------- 24 SOS ---------- */
mod("sos","SOS Darurat","DARURAT","Log panggilan darurat. Gunakan tombol SOS mengambang untuk lapor 1-klik + GPS.","SOS",[
 {t:"date",k:"tgl",label:"Tanggal",req:1},{t:"text",k:"jam",label:"Jam"},
 {t:"select",k:"jenis",label:"Jenis",req:1,opts:["Kecelakaan kerja","Kebakaran","Longsor/jatuhan","Kondisi medis","Alat berat bahaya","Lainnya"]},
 {t:"text",k:"gps",label:"Posisi"},{t:"textarea",k:"ket",label:"Keterangan"},
 {t:"text",k:"pelapor",label:"Pelapor"},
 {t:"select",k:"status",label:"Status",req:1,opts:["Open","Selesai"]}
],[
 {k:"tgl",label:"Tanggal"},{k:"jam",label:"Jam"},{k:"jenis",label:"Jenis",chip:function(){ return "red"; }},
 {k:"gps",label:"Posisi",get:function(r){ return String(r.gps || "—").slice(0, 40); }},
 {k:"status",label:"Status",chip:function(r){ return r.status === "Selesai" ? "green" : "red"; }}
]);
/* ---------- 25 SERTIFIKASI & SIMPER ---------- */
mod("sertifikasi","Sertifikasi & Simper","PERSONEL & KESEHATAN","Simper, KIM, POP/POM/POU, SIO, Blasting + masa berlaku & alert H-30.","SRT",[
 {t:"text",k:"nama",label:"Nama pemegang",req:1},
 {t:"select",k:"jenis",label:"Jenis",req:1,opts:["Simper","KIM","POP","POM","POU","SIO","Blasting (Juru Ledak)","Lainnya"]},
 {t:"text",k:"no",label:"Nomor"},{t:"date",k:"terbit",label:"Terbit"},
 {t:"date",k:"exp",label:"Berlaku s/d",req:1},{t:"textarea",k:"ket",label:"Keterangan"}
],[
 {k:"nama",label:"Nama"},{k:"jenis",label:"Jenis"},{k:"no",label:"Nomor"},
 {k:"exp",label:"Berlaku s/d",chip:function(r){ if(!r.exp) return "grey"; var d = Math.round((new Date(r.exp + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 86400000); return isNaN(d) ? "grey" : d < 0 ? "red" : d <= 30 ? "amber" : "green"; }}
]);
/* Kait fitur lanjutan (definisi fungsi ada di js/hazard, ptw, rca, sos; dipanggil saat runtime) */
M.hazard.onAdd = function(){ window.HAZARD.add(); };
M.hazard.onView = function(id){ window.HAZARD.view(id); };
M.permit.onView = function(id){ window.PTW.view(id); };
M.insiden.rowActions = [{ k: "rca", label: "Analisis" }];
M.insiden.onAction = function(k, id){ if(k === "rca") window.RCA.open(id); };
M.muster.rowActions = [{ k: "hadir", label: "Absensi" }];
M.muster.onAction = function(k, id){ if(k === "hadir") window.SOSM.checkin(id); };
M.units.rowActions = [{ k: "tag", label: "Cetak Tag" }];
M.units.onAction = function(k, id){ if(k !== "tag") return; var r = window.PS.get("units", id); if(!r) return;
  window.PX.printRecord("STATUS UNIT — " + (r.nopol || ""), r.status === "Breakdown" ? "⛔ DILARANG OPERASI" : r.status,
    [["No. unit", r.nopol], ["Jenis", r.jenis], ["Status", r.status], ["Sebab", r.sebab || "—"], ["Sejak", r.sejak || "—"], ["Lokasi", r.lokasi || "—"]],
    r.status === "Breakdown" ? "<h2>⛔ UNIT DILARANG DIOPERASIKAN</h2><p>Pasang lembar ini di kabin/kunci kontak. Pencabutan hanya oleh Safety Officer/KTT setelah verifikasi.</p>" : ""); };
M.fatigue.compute = function(o){ var t = +o.tidur || 0, k = +o.kantuk || 0;
  o.hasil = (t < 4 || k >= 8) ? "TIDAK FIT — istirahat" : (t < 6 || k >= 6 || (o.gejala && o.gejala !== "Nihil")) ? "Fit dengan catatan" : "Fit"; };
M.tele.compute = function(o){ o.status = (+o.nilai || 0) >= (+o.ambang || 0) ? "LEBIH AMBANG" : "Normal"; };
window.PS_MODULES = M;
window.PS_GROUPS = ["UTAMA","PENGAWASAN","ANALISIS RISIKO","PERSONEL & KESEHATAN","PROGRAM & TATA KELOLA","DARURAT"];
})();
