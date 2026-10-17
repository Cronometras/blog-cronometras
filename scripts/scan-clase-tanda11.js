#!/usr/bin/env node
// Barrido de clase sobre articulos_cronometras: patrones corregidos hoy en la tanda 11.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PATTERNS = [
  '安全事故', 'Posición imposible', 'James H. Ashcroft',
  'Caso típico', 'La versión completa de este artículo',
  'Secuencia simplificada B', '(e-motion)',
];

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  console.log('docs en coleccion:', snap.size);
  const hits = {};
  let es = 0, en = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const lang = (d.slug || '').startsWith('en/') ? 'en' : ((d.slug || '').startsWith('es/') ? 'es' : '?');
    if (lang === 'en') en++; else es++;
    const fields = { content: d.content || '', topic: d.topic || '', description: d.description || '', outline: d.outline || '' };
    for (const p of PATTERNS) {
      for (const [f, v] of Object.entries(fields)) {
        const n = v.split(p).length - 1;
        if (n > 0) {
          hits[p] = hits[p] || [];
          hits[p].push({ id: doc.id, slug: d.slug, field: f, n, lang });
        }
      }
    }
    // enlaces rotos /en/<slug>/ sin /blog/
    const m = (fields.content.match(/\]\(\/en\/(?!blog\/)[a-z0-9-]+\/?\)/g) || []);
    if (m.length) {
      hits['enlace /en/ sin /blog/'] = hits['enlace /en/ sin /blog/'] || [];
      hits['enlace /en/ sin /blog/'].push({ id: doc.id, slug: d.slug, n: m.length, lang });
    }
  }
  console.log('docs es:', es, '| docs en:', en);
  for (const [p, arr] of Object.entries(hits)) {
    console.log(`\n== ${p} -> ${arr.length} docs`);
    for (const h of arr) console.log('   ', h.lang, h.id, (h.slug || '').slice(0, 70), '|', h.field, 'x' + h.n);
  }
  process.exit(0);
})();
