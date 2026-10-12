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
  let docs = 0;
  snap.forEach(d => {
    const out = [];
    walk(d.data(), '', out);
    if (out.length) {
      docs++;
      const f = d.data();
      console.log('DOC', d.id, '| slug=', f.slug || '(none)', '| topic=', (f.topic || f.titulo || '').slice(0, 60));
      for (const [k, v] of out) {
        const m = v.match(/https:\/\/images\.unsplash\.com\/[^"')\s]+/g) || [];
        console.log('   field:', k, '->', m.map(u => u.slice(0, 90)).join(' ; '));
      }
    }
  });
  console.log('docs with unsplash:', docs);
})();
