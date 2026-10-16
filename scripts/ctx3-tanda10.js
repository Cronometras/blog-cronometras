#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  for (const id of ['3NEcAGMaEpkNU2C9bA88']) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    console.log('TOPIC:', d.topic, '| slug:', d.slug, '| lang:', d.language);
    const t = d.content || '';
    for (const kw of ['+200', 'ROI', 'Departamento', 'inteligencia', '90 segundos', '20% (OIT', 'Suplementos OIT aplicados']) {
      const i = t.indexOf(kw);
      if (i >= 0) console.log(`\n[${kw}]`, JSON.stringify(t.slice(Math.max(0, i - 150), i + 250)));
    }
  }
  process.exit(0);
})();
