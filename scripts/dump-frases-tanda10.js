#!/usr/bin/env node
// Vuelca frases exactas con 'inteligencia de mercado' / 'OIT v4' en todas las colecciones.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const RE = /[^.\n]{0,200}inteligencia de mercado[^.\n]{0,250}\./gi;
const RE2 = /[^.\n]{0,120}OIT v\.?\s?4[^.\n]{0,120}\./gi;

(async () => {
  for (const coll of ['articulos_cronometras', 'articulos_blog_muestreo', 'articulos_fichadas', 'articulos_asetemyt']) {
    const snap = await db.collection(coll).get();
    snap.forEach(d => {
      const dd = d.data();
      for (const f of ['content', 'topic', 'description', 'outline']) {
        const t = dd[f] || '';
        for (const re of [RE, RE2]) {
          re.lastIndex = 0;
          let m;
          while ((m = re.exec(t))) {
            console.log(`\n>>> ${coll}/${d.id} [${f}]`);
            console.log(JSON.stringify(m[0].trim()));
          }
        }
      }
    });
  }
  process.exit(0);
})();
