const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

function walk(obj, prefix, out) {
  if (typeof obj === 'string') { if (obj.includes('images.unsplash.com')) out.push([prefix, obj]); return; }
  if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, prefix + '[' + i + ']', out));
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) walk(v, prefix ? prefix + '.' + k : k, out);
}

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const jobs = [];
  snap.forEach(d => {
    const out = [];
    walk(d.data(), '', out);
    for (const [k, v] of out) {
      const m = v.match(/https:\/\/images\.unsplash\.com\/[^"')\s]+/g) || [];
      for (const u of m) jobs.push({ id: d.id, topic: (d.data().topic || '').slice(0, 55), field: k, url: u });
    }
  });
  const seen = new Set();
  for (const j of jobs) {
    if (seen.has(j.url)) continue;
    seen.add(j.url);
    let st = 'ERR';
    try {
      const r = await fetch(j.url, { method: 'HEAD', redirect: 'follow' });
      st = r.status;
    } catch (e) { st = 'ERR ' + e.message; }
    console.log(st, '|', j.id, '|', j.field, '|', j.topic, '|', j.url.slice(0, 70));
  }
  console.log('unique urls:', seen.size);
})();
