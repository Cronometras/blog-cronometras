#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  for (const id of ['articulo-7-cronoanalisis-baterias-litio', 'articulo-22-cronoanalisis-centros-datos-']) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const t = d.content || '';
    let i = -1;
    while ((i = t.indexOf('GMAO', i + 1)) !== -1) {
      console.log(`--- ${id} @${i} ---`);
      console.log(t.slice(Math.max(0, i - 350), i + 350).replace(/\n/g, ' '));
    }
  }
  process.exit(0);
})();
