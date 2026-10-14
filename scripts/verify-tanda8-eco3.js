#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
const TARGETS = [
  ['articulos_blog_muestreo', 'articulo-18-work-sampling-centros-distri', ['HTTP 200', '1.111']],
  ['articulos_blog_muestreo', 'articulo-21-work-sampling-plantas-modulo', ['1.111']],
  ['articulos_fichadas', 'articulo-20-fichaje-hospitales-centros-s', ['HTTP 200']],
];
(async () => {
  for (const [coll, id, pats] of TARGETS) {
    const d = (await db.collection(coll).doc(id).get()).data();
    const fields = { content: d.content || '', description: d.description || '', topic: d.topic || '' };
    if (d._en && d._en.content_en) fields['_en.content_en'] = d._en.content_en;
    for (const [f, t] of Object.entries(fields)) {
      for (const p of pats) {
        let i = -1;
        while ((i = t.indexOf(p, i + 1)) !== -1) {
          console.log(`--- ${coll}/${id} [${f}] [${p}] @${i} ---`);
          console.log(JSON.stringify(t.slice(Math.max(0, i - 220), i + 220)));
        }
      }
    }
  }
  process.exit(0);
})();
