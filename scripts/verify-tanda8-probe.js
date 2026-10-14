#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  for (const id of ['es-d661e14701cbe0a2', 'articulo-14-comparativa-pmts-mtm-most-mt']) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const t = d.content || '';
    console.log('=====', id, 'len', t.length, 'slug:', d.slug, '| correctionNote:', (d.correctionNote || '').slice(0, 80));
    // marcadores del nuevo contenido
    const probes = ['Maynard', 'Stegemerten', 'Schwab', 'Zandin', '1948', 'Westinghouse'];
    for (const p of probes) {
      const n = t.split(p).length - 1;
      if (n) {
        // mostrar primer contexto
        const i = t.indexOf(p);
        console.log(`  [${p}] x${n} :: ...${t.slice(Math.max(0, i - 70), i + 70).replace(/\n/g, ' ')}...`);
      }
    }
  }
  process.exit(0);
})();
