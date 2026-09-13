/* PRISMA-SAFE release gate — `npm run check`.
   Memvalidasi: sintaks JS, manifest, precache SW vs file nyata,
   vercel.json, package.json, dan handler api/health. Keluar != 0 bila gagal. */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;
const ok = (m) => console.log("  PASS " + m);
const bad = (m) => { console.log("  FAIL " + m); fail++; };

// 1. Sintaks semua JS aplikasi
console.log("[1] node --check");
for (const f of ["js/seed.js","js/icons.js","js/idb.js","js/store.js","js/audit.js","js/rbac.js","js/sync.js","js/exports.js","js/schema.js","js/views.js","js/dashboard.js","js/hazard.js","js/ptw.js","js/rca.js","js/smkp.js","js/sos.js","js/files.js","js/notify.js","js/import.js","js/app.js","js/pwa.js","sw.js","api/health.js","api/sync.js"]) {
  try { execSync(`node --check "${join(ROOT, f)}"`, { stdio: "pipe" }); ok(f); }
  catch { bad(f + " (syntax)"); }
}

// 2. Manifest valid + ikon ada
console.log("[2] manifest");
try {
  const m = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
  (m.icons || []).forEach((i) => {
    const p = join(ROOT, i.src.replace(/^\//, ""));
    if (!existsSync(p)) bad("icon hilang: " + i.src); else ok("icon " + i.sizes + " " + (i.purpose || "any"));
  });
  if (!m.start_url || !m.display || !m.name) bad("manifest tak lengkap");
  else ok("manifest lengkap (" + m.short_name + ")");
} catch (e) { bad("manifest.webmanifest: " + e.message); }

// 3. Precache SW cocok dengan file nyata (anti-404 offline)
console.log("[3] sw precache");
try {
  const sw = readFileSync(join(ROOT, "sw.js"), "utf8");
  const list = [...sw.matchAll(/"(\/[^"]*)"/g)].map((x) => x[1]).filter((u) => !u.startsWith("/api/"));
  const missing = list.filter((u) => {
    const rel = u === "/" ? "index.html" : u.replace(/^\//, "");
    return !existsSync(join(ROOT, rel));
  });
  if (missing.length) bad("precache hilang: " + missing.join(", "));
  else ok(list.length + " entri precache semuanya ada");
} catch (e) { bad("sw.js: " + e.message); }

// 4. Konfigurasi deploy valid
console.log("[4] konfigurasi");
for (const f of ["vercel.json", "package.json", "index.html", "offline.html"]) {
  try {
    const t = readFileSync(join(ROOT, f), "utf8");
    if (f.endsWith(".json")) JSON.parse(t);
    if (f === "index.html") {
      const pwa = readFileSync(join(ROOT, "js/pwa.js"), "utf8");
      const wired = t.includes("manifest.webmanifest") && t.includes("js/pwa.js") &&
        pwa.includes("serviceWorker") && pwa.includes("sw.js");
      if (!wired) bad("index.html belum terhubung PWA");
      else ok(f + " terhubung PWA (manifest + pwa.js + registrasi SW)");
    } else ok(f);
  } catch (e) { bad(f + ": " + e.message); }
}

// 5. Dependensi vendor lokal (Excel 100% offline)
console.log("[5] vendor xlsx");
try {
  const require2 = createRequire(import.meta.url);
  const X = require2(join(ROOT, "js/vendor/xlsx.full.min.js"));
  const wb = X.utils.book_new();
  X.utils.book_append_sheet(wb, X.utils.json_to_sheet([{ uji: "PRISMA-SAFE" }]), "T1");
  const buf = X.write(wb, { type: "buffer", bookType: "xlsx" });
  if (buf && buf.length > 1000) ok("xlsx vendor termuat + menulis .xlsx (" + buf.length + " byte)");
  else bad("xlsx vendor menulis berkas tak wajar");
} catch (e) { bad("js/vendor/xlsx.full.min.js: " + e.message); }

// 6. Handler api/health berperilaku benar
console.log("[6] api/health");
try {
  const require = createRequire(import.meta.url);
  const handler = require(join(ROOT, "api/health.js"));
  let code = 0, body = null;
  handler({}, { setHeader() {}, status(c) { code = c; return { json(o) { body = o; } }; } });
  if (code === 200 && body && body.status === "ok" && body.app === "PRISMA-SAFE") ok("health 200 + kontrak benar");
  else bad("health merespons tak sesuai kontrak");
} catch (e) { bad("api/health.js: " + e.message); }
try {
  const require = createRequire(import.meta.url);
  const sync = require(join(ROOT, "api/sync.js"));
  let code = 0, body = null;
  const res = { setHeader() {}, status(c) { code = c; return { json(o) { body = o; } }; } };
  sync({ method: "GET" }, res);
  const get405 = code === 405;
  sync({ method: "POST", body: { batch: [{ op: "put" }, { op: "del" }] } }, res);
  if (get405 && code === 200 && body && body.status === "ok" && body.received === 2 && body.durable === false)
    ok("sync: 405 non-POST + 200 echo jujur (durable:false)");
  else bad("sync merespons tak sesuai kontrak");
} catch (e) { bad("api/sync.js: " + e.message); }

// 7. UI bebas emoji (ikon SVG dipakai; glyph teks trispesifik dikecualikan; vendor lib dikecualikan)
console.log("[7] UI bebas emoji");
try {
  const allow = new Set([0x2630, 0x2713, 0x2714]);
  const files = ["index.html", "offline.html", "css/app.css", "manifest.webmanifest", "README.md",
    "js/seed.js", "js/icons.js", "js/idb.js", "js/store.js", "js/audit.js", "js/rbac.js", "js/sync.js",
    "js/exports.js", "js/schema.js", "js/views.js", "js/dashboard.js", "js/hazard.js", "js/ptw.js",
    "js/rca.js", "js/smkp.js", "js/sos.js", "js/files.js", "js/notify.js", "js/import.js", "js/app.js", "js/pwa.js", "sw.js"];
  const rx = new RegExp("[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\uFF0B]", "u");
  const hit = [];
  for (const f of files) {
    const t = readFileSync(join(ROOT, f), "utf8");
    const m = t.match(rx);
    if (m && !allow.has(m[0].codePointAt(0))) hit.push(f + ":U+" + m[0].codePointAt(0).toString(16).toUpperCase());
  }
  hit.length ? bad("emoji di UI: " + hit.join(", ")) : ok(files.length + " berkas UI bebas emoji");
} catch (e) { bad("emoji gate: " + e.message); }

console.log(fail ? `\nRESULT: FAIL (${fail})` : "\nRESULT: PASS — siap deploy");
process.exit(fail ? 1 : 0);
