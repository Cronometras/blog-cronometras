#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

(async () => {
  for (const id of ['PoNPLQRzrJ1cSx2lLL7G', 'kmgE6c7c0cNd5jHGRwvb', '0uqEHTPNek09BbeT80fl']) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    console.log('\n==========', id, '| slug:', d.slug, '| lang:', d.language);
    console.log('TOPIC:', JSON.stringify(d.topic));
    const t = d.content || '';
    let i = t.toLowerCase().indexOf('inteligencia de mercado');
    if (i < 0) i = t.indexOf('Norma OIT');
    if (i < 0) i = 0;
    console.log('--- content @', i, '---');
    console.log(JSON.stringify(t.slice(Math.max(0, i - 400), i + 700)));
    const o = d.outline || '';
    if (o.includes('Norma OIT')) {
      const j = o.indexOf('Norma OIT');
      console.log('--- outline ---');
      console.log(JSON.stringify(o.slice(Math.max(0, j - 300), j + 300)));
    }
  }
  process.exit(0);
})();
