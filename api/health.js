/* PRISMA-SAFE — serverless health endpoint (Vercel).
   Semantik: liveness aplikasi (apakah deployment melayani),
   BUKAN klaim kebenaran data (data operasional tetap lokal di perangkat). */
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    app: "PRISMA-SAFE",
    version: "1.1.0",
    status: "ok",
    runtime: "vercel-serverless",
    scope: "liveness-only",
    time: new Date().toISOString()
  });
};
