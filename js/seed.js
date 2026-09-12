/* PRISMA-SAFE — data referensi awal.
   Disarikan dari inventarisasi D:\ALL ABOUT WORK (3.446 file, 30 kategori:
   REPORTING daily/weekly/monthly/triwulan, CSMS + SOP-FRM-IK-STD, risk matrix,
   IBPR/HIRADC, JSA, induksi karyawan & visitor, inspeksi SAP/SKAT/APAR/mess/
   hauling/pit/workshop/ETO-jetty/kantin/pre-used/equipment/terencana,
   PICA, accident reporting, P2H semua unit, post-test HTE, safe work permit,
   manpower ADI+SMI, data orang sakit/klinik, APD, program K3LH, MoM/P5M,
   SMKP & sampling audit, regulatory compliance, surat/memo, commissioning).
   Baris contoh bertanda (contoh) — ganti dengan data aktual via UI. */
window.PRISMA_SEED = {
version: "2026-09-12",
company: { nama: "PT Sifang Mining Indonesia", site: "Nikel Open Pit", kota: "Site — Asia/Makassar", sos: "112",
  kop: "PRISMA-SAFE • Aplikasi Keselamatan dan Kesehatan Kerja Pertambangan" },
departments: ["HSE","Operation","Plant","Engineering","Survey","Geologi","HRGA","Logistik","MPE","BOD","Klinik/Medic","Kontraktor"],
locations: ["Pit Area","Hauling Road","Loading Point","Disposal/Dumping Area","Workshop Temporary","Workshop","CHR BT","CHR 100 FSP","ETO & Jetty","Quarry","Camp & Facility","Mess Senior","Mess Junior","Kantin/Dapur","Storage/Warehouse","WS P&M — WH KM","Kantor","Klinik","Jalan Tambang KM 0–5"],
units: ["LV","Dump Truck","Fuel Truck","Water Truck","Service Truck","Manhaul","Excavator","Bulldozer","Motor Grader","Wheel Loader","Compactor","ADT","Crane Truck","Manitou"],
inspectionTypes: ["SAP (Safety Awareness Patrol)","SKAT","APAR","Mess & Dapur","Hauling Road","Pit Area","Workshop","Loading Point","Disposal/Dumping Area","Storage/Warehouse","Camp & Facility","Kantin","ETO & Jetty","Pre-Used Loading Point","Kondisi Equipment & Personel","Kelengkapan Administrasi","Commissioning","Inspeksi Terencana"],
incidentCats: ["Fatality","LTI (Lost Time Injury)","RWC (Restricted Work Case)","MTI (Medical Treatment Injury)","First Aid","Near Miss (Hampir Bahaya)","Kerusakan Properti/Alat","Kebakaran","Lingkungan","Lalu Lintas Tambang"],
permitTypes: ["Hot Work (Pekerjaan Panas)","Confined Space (Ruang Terbatas)","Working at Height","Electrical Work","Lifting/Crane Operation","Excavation/Galian","Radiography","Blasting Support","Umum"],
riskMatrix: {
  likelihood: [[1,"1 • Hampir tidak mungkin"],[2,"2 • Jarang"],[3,"3 • Mungkin"],[4,"4 • Sering"],[5,"5 • Hampir pasti"]],
  severity: [[1,"1 • Insignifikan (P3K)"],[2,"2 • Minor (MTI)"],[3,"3 • Sedang (RWC/LTI tunggal)"],[4,"4 • Mayor (LTI jamak/fatal tunggal)"],[5,"5 • Katastrofik (fatal jamak)"]],
  level: function(s){ return s>=20?["EKSTREM","red"]:s>=10?["TINGGI","amber"]:s>=5?["SEDANG","blue"]:["RENDAH","green"]; }
},
hierarchy: ["Eliminasi","Substitusi","Rekayasa Teknik (Engineering)","Administratif (SOP/Permit/Rotasi)","APD"],
smkp: ["1 • Kebijakan K3","2 • Perencanaan K3","3 • Organisasi & Personel","4 • Implementasi","5 • Evaluasi & Tindak Lanjut","6 • Dokumentasi & Pengendalian Dokumen","7 • Tinjauan Ulang Manajemen"],
/* Katalog formulir SMI-FRM-SFT — semua kode yang ditemukan di referensi */
forms: [
 ["SFT01","Daftar Identifikasi Aspek Bahaya LK3, Penilaian & Pengendalian Risiko (IBPR)","IBPR"],
 ["SFT02","Objective, Target & Program SM MLK3","Program"],
 ["SFT03","Inspeksi Perlengkapan Angkat","Inspeksi"],
 ["SFT04","Daily Activity Report Safety","Laporan"],
 ["SFT05","HSE On Spot Inspection — Hauling Road","Inspeksi"],
 ["SFT05A","HSE On Spot Inspection — Lembar Temuan Hauling Road","Inspeksi"],
 ["SFT06","HSE On Spot Inspection — Kantin","Inspeksi"],
 ["SFT07","Laporan Investigasi Insiden","Insiden"],
 ["SFT08","Minutes of Meeting (MoM)","Rapat"],
 ["SFT09","Pemberitahuan Kecelakaan","Insiden"],
 ["SFT10","Rangkuman Kecelakaan & Hampir Bahaya","Insiden"],
 ["SFT12","HSE On Spot Inspection — WS P&M / WH KM","Inspeksi"],
 ["SFT13","Registrasi Kartu Bahaya (Hazard Card)","Temuan"],
 ["SFT15","HSE On Spot Inspection (ETO & Jetty)","Inspeksi"],
 ["SFT16","Safety Spot Inspection","Inspeksi"],
 ["SFT18","HSE On Spot Inspection Mess Senior & Junior","Inspeksi"],
 ["SFT20","HSE On Spot Inspection Pit Area","Inspeksi"],
 ["SFT21","Lembar Temuan HSE On Spot — Pre-Used Loading Point","Inspeksi"],
 ["SFT22","Inspection Equipment Condition & Personel","Inspeksi"],
 ["SFT24","Jadwal Inspeksi Terencana","Inspeksi"],
 ["SFT25","Laporan Inspeksi Terencana","Inspeksi"],
 ["SFT26","Tindak Lanjut Temuan Inspeksi Terencana","PICA"],
 ["SFT27","Contractors Monthly Report","Laporan"],
 ["SFT28","Eksekusi Meeting Insiden","Rapat"],
 ["SFT29","Ijin Kerja Aman (Safe Work Permit)","Permit"],
 ["SFT36","Daftar Hadir P5M","Rapat"],
 ["SFT37","Safety Inspeksi","Inspeksi"],
 ["SFT38","Fatigue Test","Kesehatan"],
 ["SFT39","P2H Unit — Semua Unit","P2H"],
 ["SFT39C","P2H Unit Compactor","P2H"],
 ["SFT39D","P2H Unit Bulldozer","P2H"],
 ["SFT39E","P2H Unit Excavator","P2H"],
 ["SFT39F","P2H Unit DT / WT / FT / ST","P2H"],
 ["P&M01","Pre-Start Check List LV","P2H"],
 ["P&M02","Pre-Start Check List Alat Berat","P2H"],
 ["STD-SFT01","Risk Assessment Matrix (Standar)","IBPR"],
 ["P&A07","Data Pribadi Karyawan","Personel"],
 ["P&A53","Formulir Permohonan Cuti / Roster Staff","Personel"],
 ["P&A52","Daftar Nama MCU","Kesehatan"],
 ["LOG-WH09","Daily Fuel Consumption","Logistik"],
 ["LOG-WH10","Fuel Issue Slip","Logistik"],
 ["MPE02","Joint Inspection","Inspeksi"],
 ["KTT-PJO-017","Surat Pernyataan Calon PJO","Personel"],
 ["KTT-PJO-019","Surat Penunjukan & Pengesahan PJO","Personel"]
],
/* Item P2H per kelompok unit (disarikan dari form SFT39 series & P&M) */
p2hItems: {
 "Ringan (LV)": ["Oli mesin & kebocoran","Air radiator / coolant","Bahan bakar","Ban & tekanan (termasuk serep)","Lampu depan/belakang/rem/sein","Klakson & alarm mundur","Rem kaki & rem tangan","Kemudi & kaki-kaki","Spion & wiper","Sabuk keselamatan","APAR & masa berlaku","Kotak P3K & segitiga pengaman","Kaca & kebersihan kabin","Hour/KM meter tercatat"],
 "Truck (DT/WT/FT/ST)": ["Oli mesin, hidrolik & kebocoran","Air radiator & intercooler","Bahan bakar & tutup tangki","Ban (depan/belakang/serep) & baut roda","Lampu, sein, lampu kerja & beacon","Klakson, alarm mundur & kamera","Rem utama, exhaust brake & parkir","Kemudi & suspensi","Bak/tangki & pengikat muatan","Selang & katup (khusus FT/WT)","APAR, P3K, segitiga & ganjal roda","PTO & hidrolik bak","Kebersihan kabin & kaca","HM/KM tercatat"],
 "Excavator": ["Oli engine, swing & hidrolik","Coolant & bahan bakar","Track, track frame & baut","Bucket, teeth & pin","Boom, arm & selang hidrolik","Lampu kerja & beacon","Klakson & travel alarm","Swing brake & lock","Kabin ROPS, kaca & wiper","APAR & P3K","Kebocoran bawah unit","HM tercatat"],
 "Dozer/Grader/Loader/Compactor": ["Oli engine, transmisi & hidrolik","Coolant & bahan bakar","Track/ban & cutting edge/moldboard/drum","Blade/bucket & pin-silinder","Ripper (jika ada)","Lampu kerja & beacon","Klakson & alarm mundur","Rem & parkir","Kabin ROPS & sabuk","APAR & P3K","Kebocoran","HM tercatat"],
 "Alat Angkat (Crane/Manitou/ADT)": ["Sertifikat SIO & masa berlaku alat","Wire rope/sling & hook latch","Outrigger & level","Hidrolik & kebocoran","LMI/indicator beban","Lampu & beacon","Klakson & alarm","Rem & parkir","APAR & P3K","Area kerja & barikade","HM tercatat"]
},
apdMatrix: [
 ["Helm keselamatan + chin strap","Semua area operasional","Wajib"],
 ["Sepatu safety (toe cap)","Semua area operasional","Wajib"],
 ["Rompi reflektif (high-vis)","Area pit, hauling, workshop","Wajib"],
 ["Kacamata safety","Workshop, grinding, area berdebu","Sesuai risiko"],
 ["Sarung tangan (mekanik/kimia)","Workshop, handling material/B3","Sesuai risiko"],
 ["Masker debu P2/N95","Hauling road, crusher, area berdebu","Sesuai risiko"],
 ["Earplug/earmuff","Area bising >85 dBA","Sesuai risiko"],
 ["Full body harness + lanyard","Bekerja di ketinggian >1,8 m","Sesuai risiko"],
 ["Jas hujan & sepatu boot","Musim hujan, area basah","Kondisional"],
 ["APAR portable & P3K kit","Setiap unit & mess","Wajib tersedia"]
],
materiInduksi: ["1 • Kebijakan K3L & Golden Rules","2 • Bahaya Utama Tambang Nikel Open Pit","3 • APD Wajib & Matriks","4 • Aturan Lalu Lintas Tambang & Kecepatan","5 • Prosedur P2H & Fatigue Management","6 • Ijin Kerja Aman (Work Permit)","7 • Kartu Bahaya & Pelaporan Near Miss","8 • Tanggap Darurat, Titik Kumpul & APAR","9 • Kesehatan Kerja, Klinik & MCU","10 • Lingkungan: Limbah, BBM & Reklamasi","11 • Sanksi, Warning & Coaching-Counselling","12 • Evaluasi (Post Test, nilai lulus ≥ 80)"],
regulasi: [
 ["UU No. 1 Tahun 1970","Keselamatan Kerja","Umum — organisasi wajib pemeriksaan kesehatan, pelatihan, program K3, pelaporan kecelakaan","HSE/HRD","Berlaku"],
 ["PP No. 50 Tahun 2012","Sistem Manajemen K3 (SMK3)","Penerapan SMK3, audit, sertifikat","BOD/HSE","Berlaku"],
 ["Permenaker No. 03/MEN/1998","Tata Cara Pelaporan & Pemeriksaan Kecelakaan","Pelaporan & pemeriksaan kecelakaan di tempat kerja","HSE","Berlaku"],
 ["Kepmenaker No. 316 Tahun 2024","Peringatan K3 Nasional","Bulan K3 & program kesadaran","BOD/HSE","Berlaku"],
 ["Permen ESDM No. 26 Tahun 2018","Kaidah Pertambangan yang Baik (Good Mining Practice)","Teknis pertambangan, K3 & lingkungan","PJO/HSE","Berlaku"],
 ["Kepmen ESDM No. 1827 K/30/MEM/2018","Pedoman Kaidah Teknik Pertambangan (SMKP Minerba)","7 elemen SMKP Minerba","PJO/HSE","Berlaku"],
 ["Permenaker No. 05/MEN/1996","SMK3 (rujukan historis)","Dokumen sistem terdahulu","HSE","Arsip"],
 ["Kepmenaker No. 245/MEN/1990","Hari K3 Nasional","12 Jan – 12 Feb","HSE","Berlaku"]
],
program: [
 ["Zero Fatality & LTI","Workshop Temporary","Form Insp.","Bulanan","SHE, Plant"],
 ["Zero Fatality & LTI","Loading Point","Form Insp.","Bulanan","SHE, Produksi"],
 ["Zero Fatality & LTI","Disposal & Dumping Area","Form Insp.","Bulanan","SHE, Produksi"],
 ["Zero Fatality & LTI","Hauling Road","Form Insp.","Bulanan","SHE, Produksi"],
 ["Zero Fatality & LTI","Storage House / Warehouse","Form Insp.","Bulanan","SHE, Procurement"],
 ["Zero Fatality & LTI","Camp & Facility","Form Insp.","Bulanan","SHE, CSM"],
 ["P5M & Safety Talk","Semua front kerja","Daftar hadir SFT36","Harian","Pengawas/HSE"],
 ["Induksi Karyawan & Visitor","Ruang induksi","Materi + post test","Setiap ada personel baru","HSE"],
 ["Pemeriksaan APAR","Semua area","Checklist APAR","Bulanan","HSE"],
 ["Pemeriksaan Mess & Dapur","Mess & kantin","Form SFT18/SFT06","Bulanan","HSE/HRGA"],
 ["Safety Patrol (SAP)","Seluruh site","Form SAP","Mingguan","HSE"],
 ["SKAT","Area kerja","Form SKAT","Mingguan","HSE"],
 ["Pelatihan & Post Test Operator","Training center","Soal + kunci + komisioning","Sesuai kebutuhan","Trainer/HSE"],
 ["MCU & Klinik","Klinik site","Rekap kunjungan","Harian","Medic/HRD"]
],
ibprContoh: [
 ["Operation","Pengoperasian Dump Truck di Hauling Road","Tabrakan / terguling; debu; fatik","4","4","Rambu & batas kecepatan; dust suppression; fatigue test SFT38; P2H SFT39F","2","3","Pengawas Produksi"],
 ["HSE","Safety Patrol malam hari","Kontak dengan alat berat; pencahayaan kurang","3","4","High-vis + komunikasi radio; buddy system; lampu senter; jadwal patroli","2","3","HSE Officer"],
 ["Plant","Perawatan unit di Workshop","Terjepit; tumpahan oli; kebakaran","3","3","LOTO; secondary containment; APAR; housekeeping","1","3","Mekanik/Plant"],
 ["Survey","Pengukuran di lereng pit","Longsor; jatuh dari ketinggian","2","5","Geotech clearance; harness; barikade; radio check-in","1","5","Surveyor"]
],
manpowerContoh: [
 ["CONTOH-001","Operator Excavator","Operation","Operasional/Non Staff","SMI","Aktif"],
 ["CONTOH-002","Driver Dump Truck","Operation","Operasional/Non Staff","ADI","Aktif"],
 ["CONTOH-003","HSE Officer","HSE","Staff","SMI","Aktif"],
 ["CONTOH-004","Mekanik","Plant","Operasional/Non Staff","SMI","Aktif"],
 ["CONTOH-005","Mine Plan Engineer","Engineering","Staff","SMI","Aktif"],
 ["CONTOH-006","Surveyor","Survey","Staff","ADI","Aktif"]
],
klinikContoh: [
 ["2026-08-04","CONTOH-A","Engineering","Gangguan metabolisme/nutrisi","Rawat jalan + observasi"],
 ["2026-08-05","CONTOH-B","Operation","Gangguan pencernaan","Rawat jalan"],
 ["2026-08-05","CONTOH-C","Operation","Gangguan gerak tubuh","Fisioterapi ringan + light duty"],
 ["2026-08-06","CONTOH-D","HRGA","Gangguan gigi & mulut","Rujuk dokter gigi"],
 ["2026-08-07","CONTOH-E","Plant","Gangguan mata","Irigasi + APD kacamata"]
],
unitContoh: [
 ["DT-12","Dump Truck","Pit Area"],
 ["EX-04","Excavator","Loading Point"],
 ["LV-004","LV","Kantor"],
 ["BD-02","Bulldozer","Disposal Area"]
],
mcuContoh: [
 ["CONTOH-001","2026-03-10","Fit","2027-03-10"],
 ["CONTOH-002","2026-02-01","Fit with note","2026-08-01"],
 ["CONTOH-003","2025-09-15","Fit","2026-09-15"]
],
sertContoh: [
 ["CONTOH-001","SIO Excavator","SIO-EX-001","2026-12-01"],
 ["CONTOH-002","Simper","SMP-2024-112","2026-10-20"],
 ["CONTOH-003","POP","POP-2023-045","2026-09-25"],
 ["CONTOH-002","KIM","KIM-88","2027-01-05"]
],
mhContoh: [
 ["2026-08",182400,3],
 ["2026-09",90000,0]
],
musterPoints: ["Muster Point Utama (Kantor)", "Muster Point Pit", "Muster Point Workshop", "Muster Point Jetty"],
teleTypes: ["O2 (%)", "CO (ppm)", "H2S (ppm)", "CH4 (%LEL)", "Debu PM10 (µg/m³)", "Kebisingan (dBA)", "Suhu (°C)", "Getaran (mm/s)", "Pencahayaan (lux)"]
};
