#!/usr/bin/env node
// Lista docs EN de articulos_cronometras (id, slug, topic) y busca contrapartes
// de los artículos de la tanda 8 por frases distintivas.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const NEEDLES = {
  comparativa_pmts: [/PMTS/i, /predetermined/i],
  consultoria: [/consult/i],
  baterias: [/batter/i, /lithium/i],
  centros_datos: [/data cent/i],
  oee_22400: [/ISO 22400/i],
  video: [/video/i, /vídeo/i],
};

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
  const en = docs.filter(d => (d.slug || '').startsWith('en/'));
  const rows = en.map(d => ({ id: d.id, slug: d.slug, topic: (d.topic || '').slice(0, 90), len: (d.content || '').length }));
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  fs.writeFileSync('/tmp/en_docs_list.json', JSON.stringify(rows, null, 2));
  console.log('EN docs:', rows.length);
  for (const r of rows) console.log(r.id, '|', r.slug, '|', r.topic, '|', r.len);
  console.log('\n--- contrapartes por frase distintiva (en content de docs EN) ---');
  for (const [name, res] of Object.entries(NEEDLES)) {
    const found = en.filter(d => res.every(re => re.test(d.content || '')));
    console.log(name, '→', found.map(d => d.slug + ' (' + d.id + ')').join(' ; ') || 'SIN CONTRAPARTE EN');
  }
  process.exit(0);
})();
