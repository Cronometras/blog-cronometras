#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
const id = 'articulo-26-muestreo-del-trabajo-en-data';
const FIXES = []; // se rellenan tras ver contexto si el patrón es claro
(async () => {
  const ref = db.collection('articulos_blog_muestreo').doc(id);
  const d = (await ref.get()).data();
  const fields = { content: d.content || '', description: d.description || '', topic: d.topic || '' };
  if (d._en && d._en.content_en) fields['_en.content_en'] = d._en.content_en;
  for (const [f, t] of Object.entries(fields)) {
    let i = -1;
    while ((i = t.indexOf('verificad', i + 1)) !== -1) {
      console.log(`--- ${f} @${i} ---`);
      console.log(JSON.stringify(t.slice(Math.max(0, i - 200), i + 200)));
    }
  }
  process.exit(0);
})();
