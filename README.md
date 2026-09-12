# PRISMA-SAFE v1.1 — PWA Keselamatan & Kesehatan Kerja (K3) Pertambangan

Bukan halaman statis: **Progressive Web App yang dapat dipasang (installable),
bekerja offline, dapat diinput, mengekspor multi-format, dan siap deploy ke Vercel.**
Disarikan dari **3.446 file / 30 kategori** referensi (`D:\ALL ABOUT WORK`).

## Arsitektur

```
Browser (PWA shell + Service Worker + localStorage + mirror IndexedDB)
   │  precache app-shell → offline penuh (input tetap jalan)
   │  SheetJS di-vendor-kan → Excel offline; foto/TTD terkompresi lokal
   ├── Jejak audit hash-chain (tamper-evident) + peran lokal RBAC-lite
   └── Outbox → /api/sync (echo/validator; KV/Postgres = ekstensi sadar-biaya)
Data operasional: 100% lokal di perangkat (privasi site) + Backup/Restore JSON.
```

## Menjalankan lokal

- **Klik ganda** `index.html` — jalan penuh (mode file; SW nonaktif, wajar).
- Atau `npx serve .` lalu buka `http://localhost:3000` — PWA penuh (install + offline).
- Gerbang rilis: `node scripts/check.mjs` (harus `RESULT: PASS`).

## Deploy ke Vercel (2 opsi)

**Opsi A — Dashboard (tanpa CLI):** Push folder ini ke GitHub →
Vercel → *Add New Project* → Import repo → Deploy. Tidak perlu build command
(framework preset: *Other*). `vercel.json` sudah mengatur header, cache & fallback SPA.

**Opsi B — CLI:** `npm i -g vercel` → di folder ini → `vercel` (preview) →
`vercel --prod` (produksi). Uji lokal ala-Vercel: `vercel dev`.

Setelah deploy: buka URL → Chrome/Edge menawarkan **Install** (atau tombol
Install di bar atas) → aplikasi berjalan standalone + offline.
Endpoint kesehatan: `https://<domain>/api/health` → `{"status":"ok"}`.

## 25 modul + analitik SMKP (satu pola input → mudah semua level)

Dashboard KPI + ringkasan eksekutif 1-halaman • Laporan Harian (SFT04) •
Inspeksi SAP/SKAT/APAR/mess/hauling/pit/workshop/ETO-jetty/terencana •
PICA • Insiden & Investigasi (SFT07/09/10) • IBPR + matriks 5×5 otomatis •
JSA • Induksi + Post Test (lulus ≥ 80) • **P2H + checklist interaktif**
(RUSAK → otomatis TIDAK LAYAK) • Permit 9 jenis • Manpower • Klinik •
APD + matriks • Program K3LH (% otomatis) • MoM/P5M • Regulasi
(UU 1/1970, PP 50/2012, ESDM 26/2018, 1827/2018…) • Dokumen (±44 kode form) •
Hazard & Near-Miss + GPS + foto + auto-skor (SFT13) • Unit & Status
(auto-breakdown + cetak tag) • Telemetri + ambang otomatis • Fatigue &
Fit-to-Work pra-shift (otomatis) • MCU + masa berlaku • Sertifikasi/Simper/
KIM/POP/POM/POU + alert H-30 • Manhours • Muster & evakuasi (kode event) •
SOS darurat (tombol mengambang + GPS + bagikan) • SMKP Analytics (LTIFR/
TRIFR/SR, heatmap, matriks kompetensi, paket Kepmen 1827) • Permit +
approval multi-level + TTD digital + LOTO • RCA 5Whys/Fishbone/SCAT-lite.

## Ekspor (rapi & presisi)

CSV (delimiter `;`) • Excel `.xlsx` **penuh offline** (SheetJS di-vendor-kan di
`js/vendor/`, CDN hanya fallback darurat) • Cetak/PDF berkop + tanda tangan •
Lembar per-baris • Backup JSON • Excel semua-modul • Ringkasan eksekutif.

## Berkas & foto

Setiap baris di semua 25 modul punya tombol **Berkas**: unggah foto bukti
(dikompresi otomatis di perangkat), PDF, lembar kerja, video pendek.
Batas aman: 15 MB/berkas, inline ≤700 KB selebihnya ke IndexedDB,
executable (.exe/.bat/.ps1/dsb) ditolak, pagu rekor ~2 MB. Peran Auditor
read-only (boleh membuka/mengunduh, tak boleh menambah/menghapus).

## Struktur berkas

```
index.html  offline.html  manifest.webmanifest  sw.js
vercel.json  package.json  README.md
api/health.js  api/sync.js  scripts/check.mjs
icons/ (192, 512, maskable, apple-touch, favicon)
css/app.css
js/seed.js js/idb.js js/store.js js/audit.js js/rbac.js js/sync.js
js/exports.js js/schema.js js/views.js js/dashboard.js js/hazard.js
js/ptw.js js/rca.js js/smkp.js js/sos.js js/app.js js/pwa.js
js/vendor/xlsx.full.min.js (Excel offline)
```

## Catatan data & batasan jujur

- Baris `CONTOH-…` = data awal untuk latihan; ganti via UI.
- `api/health` = liveness; `api/sync` = echo/validator (durable:false) —
  kebenaran multi-perangkat butuh KV/Postgres (titik ekstensi jelas).
- RBAC lokal = kerapian alur, bukan keamanan server. Audit = tamper-evident,
  bukan tamper-proof.
- SOS tidak terkirim otomatis ke ruang kontrol (tanpa backend) — alur resmi:
  tombol SOS → GPS tersimpan → bagikan/telepon manual.
- Muster memakai kode event (tanpa lib pemindai QR). Telemetri & wearable:
  catat manual + ambang otomatis; sensor live butuh middleware.
- Paket Kepmen 1827 = format bantu — sesuaikan ketentuan regulator terkini
  sebelum diserahkan.
- Nol dependensi jaringan statis: satu-satunya URL absolut adalah fallback
  darurat CDN yang hanya dimuat bila `js/vendor/xlsx.full.min.js` hilang.
