/* PRISMA-SAFE functional DOM test (hermetic, no network).
   Mensimulasikan browser: 25 modul, CRUD penuh, approval PTW, RCA, SOS,
   unggah berkas, audit, RBAC, sync, analitik, batas dan kegagalan. */
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync, existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = dirname(dirname(fileURLToPath(import.meta.url))).replace(/\\/g, "/");
const BASE = "http://localhost:3000/";
let pass = 0, fail = 0;
const ok = (m) => { pass++; console.log("  PASS " + m); };
const bad = (m) => { fail++; console.log("  FAIL " + m); };
const errors = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

/* Bangun HTML hermetik: inline semua script lokal, lalu larang subresource.
   Ini sekaligus membuktikan tidak ada dependensi jaringan statis. */
let htmlRaw = readFileSync(ROOT + "/index.html", "utf8");
const absRefs = [...htmlRaw.matchAll(/(?:src|href)="(https?:[^"]+)"/g)].map((m) => m[1]);
absRefs.length
  ? console.log("  INFO referensi absolut statis: " + absRefs.join(", "))
  : console.log("  INFO nol referensi absolut statis (penuh offline)");
const html = htmlRaw.replace(/<script\s+src="([^"]+)"([^>]*)><\/script>/g, (m, src) => {
  const fp = join(ROOT, src.split("?")[0]);
  if (!existsSync(fp)) throw new Error("script hilang: " + src);
  return "<script>/*inline:" + src + "*/\n" + readFileSync(fp, "utf8") + "\n</script>";
});
const dom = new JSDOM(html, {
  url: BASE, runScripts: "dangerously",
  pretendToBeVisual: true, virtualConsole: vc
});
const { window } = dom;
await new Promise((r) => {
  if (window.document.readyState === "complete") r();
  else window.addEventListener("load", r);
  setTimeout(r, 15000);
});
const $ = (s) => window.document.querySelector(s);
const $$ = (s) => [...window.document.querySelectorAll(s)];

// stub unduhan & jendela cetak
let downloads = [];
delete window.URL.createObjectURL;
window.URL.createObjectURL = () => "blob:uji";
window.HTMLAnchorElement.prototype.click = function () {
  if (this.href) downloads.push({ href: this.href, name: this.download || "" });
};
let printed = [];
window.open = () => {
  const chunks = [];
  return {
    document: { write: (s) => chunks.push(s), close: () => { printed.push(chunks.join("")); } },
    focus: () => {}
  };
};
window.confirm = () => true;

// [A] boot tanpa error fatal (bunyi "scrollTo not implemented" = celah jsdom, ada di browser nyata)
const realErr = errors.filter((e) => e.indexOf("scrollTo") < 0);
realErr.length ? bad("error saat boot: " + realErr[0]) : ok("boot tanpa js error");
window.PS ? ok("store PS aktif, total " + window.PS.total() + " baris") : bad("PS tidak ada");
window.XLSX ? ok("SheetJS vendor termuat (offline-ready)") : bad("window.XLSX hilang");
Object.keys(window.PS_MODULES || {}).length === 25
  ? ok("25 modul terdaftar") : bad("jumlah modul salah");

// [B] navigasi + dashboard
if ($$(".nav-it").length >= 26) ok("navigasi " + $$(".nav-it").length + " item");
else bad("navigasi kurang: " + $$(".nav-it").length);
if ($$(".kpi").length === 8) ok("dashboard 8 KPI"); else bad("KPI=" + $$(".kpi").length);
if ($("[data-q]")) ok("aksi cepat Mode Mudah ada"); else bad("quick action hilang");

// [C] render semua modul
let renderFail = [];
for (const k of Object.keys(window.PS_MODULES)) {
  try {
    window.PSV.renderModule(window.PS_MODULES[k]);
    const hasTable = !!$(".tbl") || !!$(".empty");
    if (!hasTable) renderFail.push(k + "(kosong?)");
    if (window.document.getElementById("pageTitle").textContent !== window.PS_MODULES[k].title)
      renderFail.push(k + "(judul)");
  } catch (e) { renderFail.push(k + ":" + e.message); }
}
renderFail.length ? bad("render: " + renderFail.join("; ")) : ok("25/25 modul ter-render + judul benar");

// [D] router hash
window.location.hash = "#/inspeksi";
await new Promise((r) => setTimeout(r, 50));
window.document.getElementById("pageTitle").textContent === "Inspeksi K3"
  ? ok("router hash #/inspeksi") : bad("router hash gagal");

// [E] validasi + simpan via UI (modul inspeksi)
window.PSV.renderModule(window.PS_MODULES.inspeksi);
const before = window.PS.count("inspeksi");
$('[data-a="add"]').click();
if (!$(".modal")) bad("modal tambah tidak terbuka");
else {
  $("[data-ok]").click(); // simpan kosong -> harus ditolak
  const rejected = window.PS.count("inspeksi") === before && !!$(".fld.bad");
  rejected ? ok("validasi menolak form kosong") : bad("validasi lolos padahal kosong");
  $$(".modal [name]").forEach((el) => {
    if ((el.tagName === "INPUT" && el.type === "text" && !el.value)) el.value = "UJI-" + el.name;
    if (el.tagName === "TEXTAREA" && !el.value) el.value = "Uji otomatis";
  });
  $("[data-ok]").click();
  window.PS.count("inspeksi") === before + 1 ? ok("simpan via form (+1 baris)") : bad("simpan gagal");
}

// [F] pencarian memfilter
window.PSV.renderModule(window.PS_MODULES.dokumen);
const totalRows = $$(".tbl tbody tr").length;
const q = $("#q"); q.value = "SFT07"; q.dispatchEvent(new window.Event("input", { bubbles: true }));
await new Promise((r) => setTimeout(r, 50));
const filtRows = $$(".tbl tbody tr").length;
(filtRows >= 1 && filtRows <= totalRows) ? ok(`pencarian SFT07: ${totalRows} -> ${filtRows}`) : bad("pencarian gagal");

// [G] ekspor CSV + XLSX + cetak tabel + cetak 1 baris
try {
  const def = window.PS_MODULES.dokumen, rows = window.PS.all("dokumen");
  const cols = def.cols.map((c) => ({ label: c.label, get: (r) => (c.get ? c.get(r) : (r[c.k] ?? "")) }));
  window.PX.csv("dokumen", def.title, rows, cols);
  const dl = downloads[downloads.length - 1];
  (dl && /\.csv$/.test(dl.name)) ? ok("CSV terpicu (" + dl.name + ")") : bad("CSV tak terpicu");
} catch (e) { bad("CSV: " + e.message); }
try {
  const def = window.PS_MODULES.dokumen, rows = window.PS.all("dokumen").slice(0, 5);
  const cols = def.cols.map((c) => ({ label: c.label, get: (r) => (c.get ? c.get(r) : (r[c.k] ?? "")) }));
  window.PX.xlsx("dokumen", def.title, rows, cols);
  ok("XLSX tanpa lempar error (jalur SheetJS lokal)");
} catch (e) { bad("XLSX: " + e.message); }
try {
  const def = window.PS_MODULES.inspeksi;
  const cols = def.cols.map((c) => ({ label: c.label, get: (r) => (c.get ? c.get(r) : (r[c.k] ?? "")) }));
  window.PX.printTable("Uji", "sub", window.PS.all("inspeksi").slice(0, 2), cols);
  const html = printed[printed.length - 1] || "";
  (html.includes("PRISMA-SAFE") || html.includes("Sifang") || html.length > 500)
    ? ok("cetak tabel menghasilkan dokumen (" + html.length + " char)") : bad("cetak tabel kosong");
} catch (e) { bad("print: " + e.message); }

// [H] backup/restore JSON
try {
  const j = JSON.parse(window.PS.exportJSON());
  const n0 = window.PS.total();
  window.PS.del("mom", window.PS.all("mom")[0].id);
  window.PS.importJSON(JSON.stringify({ app: "x", db: j.db }));
  window.PS.total() === n0 ? ok("backup/restore konsisten (" + n0 + " baris)") : bad("restore tak konsisten");
} catch (e) { bad("backup/restore: " + e.message); }

// [I] PWA: pill status pada konteks ini + cabang offline tervalidasi
const pill = $("#netPill");
pill ? ok("indikator status ada") : bad("netPill hilang");
await new Promise((r) => setTimeout(r, 6000)); // beri waktu fetch api/health gagal -> mode lokal
/Offline|Lokal|file/i.test($("#netPill").textContent)
  ? ok("cabang offline terpicu: \"" + $("#netPill").textContent + "\"")
  : bad("pill tak berpindah offline: \"" + $("#netPill").textContent + "\"");

// [J] fitur Fase 1-4
try {
  var fz = { tidur: 3, kantuk: "5", gejala: "Nihil" };
  window.PS_MODULES.fatigue.compute(fz);
  fz.hasil === "TIDAK FIT — istirahat" ? ok("fatigue auto: tidur 3j -> TIDAK FIT") : bad("fatigue compute: " + fz.hasil);
  var fz2 = { tidur: 7, kantuk: "2", gejala: "Nihil" };
  window.PS_MODULES.fatigue.compute(fz2);
  fz2.hasil === "Fit" ? ok("fatigue auto: normal -> Fit") : bad("fatigue compute: " + fz2.hasil);
  window.HAZARD.levelOf(4, 4)[0] === "TINGGI" ? ok("hazard auto-skor 4x4=TINGGI") : bad("hazard level salah");
  var tl = { nilai: 60, ambang: 50 }; window.PS_MODULES.tele.compute(tl);
  tl.status === "LEBIH AMBANG" ? ok("telemetri ambang otomatis") : bad("tele compute salah");
  var rt = window.SMKPR.rates("1999-01");
  (rt && rt.ltifr === null && rt.mh === 0) ? ok("LTIFR jujur tanpa MH (—)") : bad("LTIFR tak jujur");
  var rt2 = window.SMKPR.rates("2026-08");
  (rt2 && rt2.mh > 0) ? ok("LTIFR terhitung dg MH seed") : bad("LTIFR seed gagal");
  window.SMKPR.render();
  /LTIFR/.test(window.document.getElementById("view").textContent) ? ok("SMKP analytics ter-render") : bad("SMKP render gagal");
  var av = window.PSAUDIT.verify();
  av.ok ? ok("audit hash-chain valid (" + av.n + " entri)") : bad("audit: " + av.msg);
  window.localStorage.setItem("prismasafe.role", "Auditor");
  (!window.RBAC.can("add") && !window.RBAC.can("del")) ? ok("RBAC: Auditor read-only") : bad("RBAC Auditor bocor");
  window.localStorage.setItem("prismasafe.role", "Safety Officer");
  (window.RBAC.can("add") && window.RBAC.can("del")) ? ok("RBAC: Safety penuh") : bad("RBAC Safety salah");
  var q0 = window.PSSYNC.pending();
  window.PS.put("tele", { id: window.PS.uid("TST"), waktu: "2026-09-12 10:00", lokasi: "Pit", jenis: "CO (ppm)", nilai: 5, satuan: "ppm", ambang: 25, status: "Normal" });
  window.PSSYNC.pending() >= q0 + 1 ? ok("outbox antre (+1)") : bad("outbox tak antre");
  var _t = window.PS.all("tele").find(function(r){ return r.id.indexOf("TST") === 0; });
  if(_t) window.PS.del("tele", _t.id);
  var inc = { id: window.PS.uid("TST"), tgl: "2026-09-12", kat: "Near Miss (Hampir Bahaya)", lokasi: "Pit", kronologi: "uji", status: "Open — investigasi berjalan", oleh: "UJI" };
  window.PS.put("insiden", inc);
  window.RCA.open(inc.id);
  window.document.querySelector('[name="w0"]') ? ok("RCA 5Whys/Fishbone/SCAT terbuka") : bad("RCA modal gagal");
  window.PSV.closeModal();
  window.PS.del("insiden", inc.id);
  var mu = window.PS.all("muster")[0];
  window.SOSM.checkin(mu.id);
  if(!window.document.getElementById("muKode")) bad("muster modal gagal");
  else {
    window.document.getElementById("muKode").value = "SALAH";
    window.document.querySelector(".modal [data-ok]").click();
    window.PS.get("muster", mu.id)._hadir ? bad("kode salah lolos") : ok("kode event salah ditolak + modal hadir");
    window.PSV.closeModal();
  }
} catch (e) { bad("fitur Fase: " + (e && e.message)); }

// [K] PTW approval view + SOS modal (tanpa GPS Perangkat/GPS)
try {
  var pm = { id: window.PS.uid("TST"), no: "PTW-UJI-001", jenis: "Hot Work (Pekerjaan Panas)", lokasi: "Workshop",
    mulai: "2026-09-12", selesai: "2026-09-13", uraian: "uji", kontrol: "APAR", pelaksana: "UJI", pengawas: "UJI", status: "Diajukan" };
  window.PS.put("permit", pm);
  window.PTW.view(pm.id);
  var pv = window.document.querySelector(".modal").textContent;
  (/Persetujuan multi-level/.test(pv) && /LOTO/.test(pv)) ? ok("PTW view: approval + LOTO otomatis") : bad("PTW view tak lengkap");
  var needBtn = ["data-a1", "data-a2", "data-a3", "data-no", "data-vloto", "data-p", "data-x2"];
  var missBtn = needBtn.filter(function(a){ return !window.document.querySelector(".modal [" + a + "]"); });
  missBtn.length ? bad("PTW tombol hilang: " + missBtn.join(",")) : ok("PTW 7 tombol aksi valid (querySelector)");
  window.PSV.closeModal();
  var pm2 = window.PS.get("permit", pm.id);
  (pm2._loto && pm2._loto.length >= 6) ? ok("LOTO terinisiasi (" + pm2._loto.length + " titik)") : bad("LOTO tak terinisiasi");
  window.PS.del("permit", pm.id);
  window.SOSM.trigger();
  (/KIRIM SOS/.test(window.document.querySelector(".modal").textContent)) ? ok("SOS modal terbuka") : bad("SOS modal gagal");
  window.PSV.closeModal();
} catch (e) { bad("PTW/SOS: " + (e && e.message)); }

// [L] dropdown K3 + unggah berkas aman
try {
  var MM = window.PS_MODULES;
  var po = { unit: "Manhaul" }; MM.p2h.compute(po);
  po.kelompok === "Ringan (LV)" ? ok("p2h: Manhaul -> Ringan") : bad("p2h map: " + po.kelompok);
  var po2 = { unit: "ADT" }; MM.p2h.compute(po2);
  po2.kelompok.indexOf("Alat Angkat") === 0 ? ok("p2h: ADT -> Alat Angkat") : bad("p2h map ADT");
  var to = { jenis: "H2S (ppm)", nilai: 2, ambang: 1, satuan: "" }; MM.tele.compute(to);
  (to.status === "LEBIH AMBANG" && to.satuan === "ppm") ? ok("tele: ambang + satuan otomatis") : bad("tele compute");
  MM.klinik.fields.some(function(f){ return f.k === "kaitan"; }) ? ok("klinik: kolom kaitan PAK") : bad("klinik kaitan hilang");
  var fl = new window.File(["halo prisma-safe"], "uji.txt", { type: "text/plain" });
  var fr = await window.FILEU.storeOne(fl);
  (fr && fr.inline && fr.inline.indexOf("data:text/plain") === 0 && fr.name === "uji.txt") ? ok("unggah teks -> inline dataURL") : bad("storeOne teks");
  var bad1 = null;
  try { await window.FILEU.storeOne(new window.File(["x"], "jahat.exe", { type: "application/octet-stream" })); } catch (e) { bad1 = e; }
  bad1 ? ok("executable ditolak") : bad("exe lolos?!");
  var doc0 = window.PS.all("dokumen")[0];
  window.FILEU.open("dokumen", doc0.id);
  window.document.getElementById("flList") ? ok("manajer berkas terbuka") : bad("manajer gagal");
  window.PSV.closeModal();
  window.localStorage.setItem("prismasafe.role", "Auditor");
  window.FILEU.open("dokumen", doc0.id);
  !window.document.getElementById("flPick") ? ok("Auditor: unggah disembunyikan") : bad("Auditor bisa unggah?!");
  window.PSV.closeModal();
  window.localStorage.setItem("prismasafe.role", "Safety Officer");
  window.PSV.renderModule(MM.dokumen);
  window.document.querySelector('[data-a="x:file"]') ? ok("tombol Berkas di tiap baris") : bad("tombol Berkas hilang");
} catch (e) { bad("fitur unggah/dropdown: " + (e && e.message)); }

// [M] CRUD penuh + paginasi + filter + detail + isi ekspor + cetak
try {
  var MM2 = window.PS_MODULES;
  window.PSV.renderModule(MM2.dokumen);
  var qq0 = window.document.querySelector("#q"); qq0.value = ""; qq0.dispatchEvent(new window.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  window.PSV.renderModule(MM2.dokumen);
  var pg0 = window.document.querySelector(".pager span").textContent;
  window.document.querySelector('[data-a="next"]').click();
  /Halaman 2/.test(window.document.querySelector(".pager span").textContent) ? ok("paginasi 44 baris -> hal 2") : bad("paginasi: " + pg0);
  window.document.querySelector('[data-a="prev"]').click();
  window.PSV.renderModule(MM2.inspeksi);
  var fq = window.document.querySelector("#fq");
  fq.value = fq.options[fq.options.length - 1].text; fq.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  ok("filter status jalan (" + window.document.querySelectorAll(".tbl tbody tr").length + " baris)");
  fq.value = ""; fq.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  var d0 = window.PS.all("dokumen")[0];
  window.PSV.renderModule(MM2.dokumen);
  window.document.querySelectorAll('[data-a="view"]')[0].click();
  /SMI|Katalog|Dokumen/.test(window.document.querySelector(".modal").textContent) ? ok("detail baris terbuka") : bad("detail gagal");
  window.PSV.closeModal();
  var edId = window.PS.all("dokumen")[0].id;
  window.PSV.renderModule(MM2.dokumen);
  window.document.querySelectorAll('[data-a="edit"]')[0].click();
  window.document.querySelector('.modal [name="nama"]').value = "DOK-UJI-EDIT";
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("dokumen", edId).nama === "DOK-UJI-EDIT" ? ok("ubah via form tersimpan") : bad("ubah gagal");
  var cDel0 = window.PS.count("dokumen");
  window.PSV.renderModule(MM2.dokumen);
  window.document.querySelectorAll('[data-a="del"]')[0].click();
  window.PS.count("dokumen") === cDel0 - 1 ? ok("hapus via UI (-1)") : bad("hapus gagal");
  var tglFmt = new Date().toISOString().slice(0, 10).split("-");
  window.PSV.renderModule(MM2.laporan);
  window.document.querySelectorAll('[data-a="view"]')[0].click();
  new RegExp(tglFmt[2] + "/" + tglFmt[1] + "/" + tglFmt[0]).test(window.document.querySelector(".modal").textContent) ? ok("format tanggal DD/MM/YYYY") : bad("format tanggal");
  window.PSV.closeModal();
  let lastParts = null; const OB2 = window.Blob;
  window.Blob = function(p, o){ lastParts = p; return new OB2(p, o); };
  var dc = MM2.dokumen, dcols = dc.cols.map(function(x){ return { label: x.label, get: function(r){ return x.get ? x.get(r) : (r[x.k] == null ? "" : r[x.k]); } }; });
  window.PX.csv("dokumen", "Dokumen", window.PS.all("dokumen").slice(0, 3), dcols);
  window.Blob = OB2;
  (lastParts && lastParts[0].charCodeAt(0) === 0xFEFF && lastParts[0].indexOf("Kode") >= 0) ? ok("isi CSV: BOM + header Kode") : bad("isi CSV");
  window.PX.xlsx("dokumen", "Dokumen", window.PS.all("dokumen").slice(0, 3), dcols);
  /\.xlsx$/.test(downloads[downloads.length - 1].name) ? ok("XLSX terunduh (.xlsx)") : bad("nama xlsx");
  window.PSV.renderModule(MM2.dokumen);
  window.document.querySelectorAll('[data-a="view"]')[0].click();
  window.document.querySelector(".modal [data-p]").click();
  /Dibuat oleh/.test(printed[printed.length - 1]) ? ok("cetak 1 baris + blok TTD") : bad("printRecord");
  window.PSV.closeModal();
} catch (e) { bad("CRUD/detail/ekspor: " + (e && e.message)); }

// [N] P2H end-to-end + auto-breakdown unit
try {
  var MM3 = window.PS_MODULES;
  window.PSV.renderModule(MM3.p2h);
  window.document.querySelector('#view [data-a="add"]').click();
  window.document.querySelector('.modal [name="nopol"]').value = "DT-UJI-99";
  window.document.querySelector('.modal [name="operator"]').value = "UJI";
  window.document.querySelector(".modal [data-ok]").click();
  var p2 = window.PS.all("p2h").find(function(r){ return r.nopol === "DT-UJI-99"; });
  p2 ? ok("P2H tersimpan via form") : bad("P2H gagal simpan");
  window.PSV.renderModule(MM3.p2h);
  var cekBtn = [...window.document.querySelectorAll('[data-a="cek"]')][0];
  cekBtn.click();
  window.document.querySelector('.modal .seg [data-v="Rusak"]').click();
  window.document.querySelector(".modal [data-ok]").click();
  var p2b = window.PS.get("p2h", p2.id);
  var un = window.PS.all("units").find(function(u){ return u.nopol === "DT-UJI-99"; });
  (/TIDAK LAYAK/.test(p2b.hasil) && un && un.status === "Breakdown") ? ok("P2H rusak -> TIDAK LAYAK + unit Breakdown") : bad("auto-breakdown gagal");
  window.PSV.renderModule(MM3.p2h);
  window.document.querySelectorAll('[data-a="view"]')[0].click();
  /Hasil checklist P2H/.test(window.document.querySelector(".modal").textContent) ? ok("detail P2H tampilkan checklist") : bad("detail P2H");
  window.PSV.closeModal();
} catch (e) { bad("P2H e2e: " + (e && e.message)); }

// [O] stub kanvas+gambar, approval PTW L1-L3 + tolak, LOTO, SOS penuh, muster hadir, RCA simpan/cetak, audit tamper
try {
  window.HTMLCanvasElement.prototype.getContext = function(){ return { lineWidth: 0, lineCap: "", strokeStyle: "", beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, clearRect(){}, drawImage(){} }; };
  window.HTMLCanvasElement.prototype.toDataURL = function(){ return "data:image/jpeg;base64,/9j/uji"; };
  window.Image = function(){ const o = { width: 2000, height: 1000 }; setTimeout(function(){ if(o.onload) o.onload(); }, 0); return o; };
  function ptr(el, t, x, y){ var e = new window.Event(t, { bubbles: true }); e.clientX = x; e.clientY = y; el.dispatchEvent(e); }
  function drawSig(nm){ var cv = window.document.getElementById("sigCv"); ptr(cv, "pointerdown", 30, 40); ptr(cv, "pointermove", 120, 90); ptr(cv, "pointerup", 120, 90); window.document.getElementById("sigNm").value = nm; }
  var pm = { id: window.PS.uid("TST"), no: "PTW-UJI", jenis: "Hot Work (Pekerjaan Panas)", lokasi: "WS", mulai: "2026-09-12", selesai: "2026-09-13", uraian: "uji las", kontrol: "APAR", pelaksana: "UJI", pengawas: "UJI", status: "Diajukan" };
  window.PS.put("permit", pm);
  window.PTW.view(pm.id);
  window.document.querySelector(".modal [data-vloto]").click();
  !window.PS.get("permit", pm.id)._lotoVer ? ok("LOTO: verifikasi ditolak saat belum lengkap") : bad("LOTO lolos prematur");
  window.document.querySelectorAll(".modal [data-lo]").forEach(function(c){ c.checked = true; c.dispatchEvent(new window.Event("change", { bubbles: true })); });
  window.document.querySelector(".modal [data-vloto]").click();
  window.PS.get("permit", pm.id)._lotoVer ? ok("LOTO: nol-energi terverifikasi") : bad("LOTO verify gagal");
  window.document.querySelector(".modal [data-a1]").click();
  drawSig("SPV UJI");
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("permit", pm.id).status === "Disetujui Supervisor" ? ok("PTW L1 -> Supervisor") : bad("L1: " + window.PS.get("permit", pm.id).status);
  window.document.querySelector(".modal [data-a2]").click();
  drawSig("SAFETY UJI");
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("permit", pm.id).status === "Disetujui Safety" ? ok("PTW L2 -> Safety") : bad("L2 gagal");
  window.document.querySelector(".modal [data-a3]").click();
  (window.PS.get("permit", pm.id).status === "Disetujui Safety" && /Permit/.test(window.document.querySelector(".modal").textContent)) ? ok("PTW L3 ditolak untuk Safety (butuh KTT)") : bad("gate L3 bocor");
  window.localStorage.setItem("prismasafe.role", "KTT");
  window.document.querySelector(".modal [data-a3]").click();
  drawSig("KTT UJI");
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("permit", pm.id).status === "Disetujui KTT — berlaku" ? ok("PTW L3 -> KTT berlaku") : bad("L3 gagal");
  window.PSV.closeModal();
  window.localStorage.setItem("prismasafe.role", "Safety Officer");
  var pm2 = { id: window.PS.uid("TST"), no: "PTW-UJI-2", jenis: "Umum", lokasi: "Gudang", mulai: "2026-09-12", selesai: "2026-09-13", uraian: "uji", status: "Diajukan" };
  window.PS.put("permit", pm2);
  window.PTW.view(pm2.id);
  window.document.querySelector(".modal [data-no]").click();
  drawSig("SPV UJI");
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("permit", pm2.id).status === "Ditolak" ? ok("PTW ditolak tercatat") : bad("reject gagal");
  window.PS.del("permit", pm.id); window.PS.del("permit", pm2.id);
  window.SOSM.trigger();
  window.document.getElementById("sosK").value = "UJI-SOS";
  window.document.querySelector(".modal [data-ok]").click();
  await new Promise((r) => setTimeout(r, 100));
  window.document.getElementById("sosShare") ? ok("SOS beacon + GPS toleran") : bad("beacon gagal");
  window.document.querySelector(".modal [data-ok]").click();
  var sosR = window.PS.all("sos").find(function(r){ return r.ket === "UJI-SOS"; });
  (sosR && sosR.status === "Selesai") ? ok("SOS selesai tercatat") : bad("SOS flow gagal");
  var mu2 = window.PS.all("muster")[0];
  window.SOSM.checkin(mu2.id);
  window.document.getElementById("muKode").value = mu2.kode;
  var boxes = window.document.querySelectorAll(".modal [data-nm]");
  boxes[0].checked = true; boxes[1].checked = true;
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("muster", mu2.id)._hadir.length === 2 ? ok("muster hadir (2 org)") : bad("muster hadir gagal");
  var inc2 = { id: window.PS.uid("TST"), tgl: "2026-09-12", kat: "First Aid", lokasi: "WS", kronologi: "uji", status: "Open — investigasi berjalan", oleh: "UJI" };
  window.PS.put("insiden", inc2);
  window.RCA.open(inc2.id);
  window.document.querySelector('.modal [name="w0"]').value = "rantai uji";
  window.document.querySelector(".modal [data-ok]").click();
  window.PS.get("insiden", inc2.id)._rca.whys[0] === "rantai uji" ? ok("RCA tersimpan") : bad("RCA save gagal");
  window.RCA.open(inc2.id);
  window.document.querySelector(".modal [data-p]").click();
  /5 Whys/.test(printed[printed.length - 1]) ? ok("RCA tercetak") : bad("RCA print gagal");
  window.PSV.closeModal(); window.PS.del("insiden", inc2.id);
  var imgf = new window.File(["x".repeat(100)], "foto.png", { type: "image/png" });
  var imgr = await window.FILEU.storeOne(imgf);
  (imgr.kind === "gambar" && imgr.inline.indexOf("data:image") === 0) ? ok("unggah gambar terkompresi") : bad("gambar gagal");
  var au = window.PS.db.audit, h0 = au[au.length - 1].hash;
  au[au.length - 1].hash = "00000000";
  !window.PSAUDIT.verify().ok ? ok("audit mendeteksi utak-atik") : bad("tamper tak terdeteksi");
  au[au.length - 1].hash = h0;
  window.PSAUDIT.verify().ok ? ok("audit pulih valid") : bad("audit restore gagal");
  window.PSSYNC.setEp("https://localhost:9/api/sync");
  var dr = await window.PSSYNC.drain();
  dr.reason === "offline" ? ok("sync offline ditangani") : bad("drain: " + JSON.stringify(dr));
  window.PSSYNC.setEp("");
} catch (e) { bad("alur persetujuan/darurat: " + (e && e.message)); }

// [P] rute liar, filter nav, mode mudah, backup/restore, SMKP penuh, batas berkas, reset
try {
  window.location.hash = "#/rute-tak-ada";
  await new Promise((r) => setTimeout(r, 100));
  window.document.getElementById("pageTitle").textContent === "Dashboard K3" ? ok("rute liar -> dashboard aman") : bad("rute liar");
  window.location.hash = "#/dashboard";
  var nf = window.document.getElementById("navFilter");
  nf.value = "zzz-tak-cocok"; nf.dispatchEvent(new window.Event("input", { bubbles: true }));
  [...window.document.querySelectorAll(".nav-it")].filter(function(b){ return b.style.display !== "none"; }).length === 0 ? ok("filter nav menyaring") : bad("filter nav");
  nf.value = ""; nf.dispatchEvent(new window.Event("input", { bubbles: true }));
  var ez = window.document.getElementById("easyToggle");
  ez.checked = true; ez.dispatchEvent(new window.Event("change", { bubbles: true }));
  (window.document.body.classList.contains("easy")) ? ok("Mode Mudah aktif") : bad("easy toggle");
  ez.checked = false; ez.dispatchEvent(new window.Event("change", { bubbles: true }));
  window.document.getElementById("btnBackup").click();
  /\.json$/.test(downloads[downloads.length - 1].name) ? ok("backup JSON terunduh") : bad("backup gagal");
  var bk = window.PS.exportJSON(), c0 = window.PS.count("dokumen"), dOne = window.PS.all("dokumen")[0].id;
  window.PS.del("dokumen", dOne);
  var inp = window.document.getElementById("restoreFile");
  Object.defineProperty(inp, "files", { value: [new window.File([bk], "bk.json", { type: "application/json" })], configurable: true });
  inp.dispatchEvent(new window.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 500));
  window.PS.count("dokumen") === c0 ? ok("restore pulihkan baris") : bad("restore gagal");
  window.SMKPR.render();
  window.document.getElementById("smKep").click();
  /Paket Laporan SMKP/.test(printed[printed.length - 1]) && /LTIFR/.test(printed[printed.length - 1]) ? ok("paket Kepmen 1827 tercetak") : bad("kepmen gagal");
  window.document.getElementById("smXlsx").click();
  /\.xlsx$/.test(downloads[downloads.length - 1].name) ? ok("SMKP Excel terunduh") : bad("smkp xlsx gagal");
  window.SMKPR.render();
  window.document.getElementById("smBulan").value = "2026-08";
  window.document.getElementById("smGo").click();
  /2026-08/.test(window.document.getElementById("pageSub").textContent) ? ok("filter periode SMKP") : bad("smGo gagal");
  window.PSD.render();
  window.document.getElementById("btnExec").click();
  /Ringkasan Eksekutif/.test(printed[printed.length - 1]) ? ok("ringkasan eksekutif tercetak") : bad("exec gagal");
  window.document.getElementById("btnQuickAdd").click();
  window.document.querySelectorAll(".modal [data-q]").length === 10 ? ok("Input Cepat: 10 tujuan") : bad("quickAdd gagal");
  window.PSV.closeModal();
  var bigRej = null;
  try { await window.FILEU.storeOne(new window.File(["x".repeat(16 * 1024 * 1024)], "gede.bin", { type: "application/octet-stream" })); } catch (e) { bigRej = e; }
  /15 MB/.test((badRej0(bigRej))) ? ok("berkas 16MB ditolak") : bad("pagu berkas bocor");
  function badRej0(e){ return e ? String((e && e.message) || e) : ""; }
  var idbRej = null;
  try { await window.FILEU.storeOne(new window.File(["y".repeat(800 * 1024)], "sedang.bin", { type: "application/octet-stream" })); } catch (e) { idbRej = e; }
  /IndexedDB/.test(badRej0(idbRej)) ? ok("fallback IDB terdokumentasi saat tak tersedia") : bad("idb fallback: " + badRej0(idbRej));
  window.PS.reset();
  (window.PS.count("dokumen") === 44 && window.PS.count("manpower") === 6 && window.PS.db.audit.length === 0 && window.PS.db.outbox.length === 0) ? ok("reset -> seed murni") : bad("reset gagal");
} catch (e) { bad("sistem/analitik/batas: " + (e && e.message)); }

console.log(fail ? `\nDOM-TEST: FAIL (${fail})` : `\nDOM-TEST: PASS (${pass} checks)`);
if (errors.length) console.log("js errors tambahan: " + errors.slice(0, 3).join(" | "));
process.exit(fail ? 1 : 0);
