#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
const RE = /inteligencia de mercado/gi;
(async () => {
  for (const coll of ['articulos_cronometras', 'articulos_blog_muestreo', 'articulos_fichadas', 'articulos_asetemyt']) {
    const snap = await db.collection(coll).get();
    snap.forEach(d => {
      const dd = d.data();
      for (const f of ['content', 'topic', 'description', 'excerpt', 'outline']) {
        const t = dd[f] || '';
        let m; RE.lastIndex = 0;
        while ((m = RE.exec(t))) {
          console.log(`\n>>> ${coll}/${d.id} [${f}]`);
          console.log(JSON.stringify(t.slice(Math.max(0, m.index - 260), m.index + 300)));
        }
      }
    });
  }
  process.exit(0);
})();
