/* PRISMA-SAFE — serverless sync endpoint (Vercel).
   Menerima batch outbox, memvalidasi struktur, mengembalikan tanda terima.
   Batas jujur: ECHO + VALIDATOR saja — tidak menyimpan ke database tahan lama.
   Untuk kebenaran multi-perangkat, sambungkan ke Vercel KV/Postgres di sini. */
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if(req.method !== "POST"){
    res.status(405).json({ app: "PRISMA-SAFE", status: "error", msg: "Gunakan POST JSON {batch:[...]}." });
    return;
  }
  var b = (req.body && req.body.batch) || null;
  if(!Array.isArray(b)){
    res.status(400).json({ app: "PRISMA-SAFE", status: "error", msg: "batch harus array." });
    return;
  }
  var ops = {};
  b.forEach(function(x){ if(x && x.op) ops[x.op] = (ops[x.op] || 0) + 1; });
  res.status(200).json({
    app: "PRISMA-SAFE", version: "1.1.0", status: "ok",
    received: b.length, ops: ops, durable: false,
    note: "Echo rujukan. Sambungkan KV/Postgres untuk penyimpanan tahan lama.",
    time: new Date().toISOString()
  });
};
