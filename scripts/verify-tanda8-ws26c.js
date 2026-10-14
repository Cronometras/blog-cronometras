#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  const d = (await db.collection('articulos_blog_muestreo').doc('articulo-26-muestreo-del-trabajo-en-data').get()).data();
  const t = [d.content || '', d.description || ''].join('\n');
  for (const p of ['curl', '1.111']) {
    let i = -1;
    while ((i = t.indexOf(p, i + 1)) !== -1) {
      console.log(`--- [${p}] @${i} ---`);
      console.log(JSON.stringify(t.slice(Math.max(0, i - 250), i + 250)));
    }
  }
  process.exit(0);
})();
