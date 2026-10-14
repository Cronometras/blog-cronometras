#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  const d = (await db.collection('articulos_blog_muestreo').doc('articulo-26-muestreo-del-trabajo-en-data').get()).data();
  const t = d.content || '';
  // región del cálculo Python
  const i = t.indexOf('Cálculo verificado en Python');
  console.log('=== REGION CALC ===');
  console.log(JSON.stringify(t.slice(i - 100, i + 1400)));
  // región referencias
  const j = t.indexOf('## Referencias verificadas');
  console.log('=== REGION REFS ===');
  console.log(JSON.stringify(t.slice(j, j + 1600)));
  // _en presente?
  console.log('=== EN FIELD ===', !!d._en, d._en ? Object.keys(d._en) : '');
  if (d._en && d._en.content_en) {
    const e = d._en.content_en;
    for (const p of ['verificad', 'verified', 'HTTP 200', 'curl', 'Python']) {
      const n = e.split(p).length - 1;
      if (n) console.log(`  EN [${p}] x${n}`);
    }
  }
  process.exit(0);
})();
