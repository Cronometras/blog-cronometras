#!/usr/bin/env node
// Exporta los 10 artículos de la tanda 10 (plan 80-89) a /tmp/tanda10/<id>.json
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = [
  'es-d6fca30a900d697d',
  'x7BYen963Eirnxld4diC',
  'es-28ef1c9d714c4e4b',
  'es-ca9dd8ac5b12900a',
  'es-4b6b36c70025a52c',
  'es-8e755e8e4d0ce262',
  'es-42b337b47452f0c3',
  'es-0ab1469a4870e1eb',
  'es-6f7f676a93cfe11c',
  'es-84ab36a51096a354',
];

(async () => {
  fs.mkdirSync('/tmp/tanda10', { recursive: true });
  const index = [];
  const backup = {};
  for (const id of IDS) {
    const ref = db.collection('articulos_cronometras').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING', id); continue; }
    const d = snap.data();
    fs.writeFileSync(`/tmp/tanda10/${id}.json`, JSON.stringify(d, null, 2));
    backup[id] = d;
    index.push({ id, slug: d.slug || '', topic: d.topic || '', len: (d.content || '').length });
    console.log(id, '|', d.slug, '|', (d.content || '').length, 'chars | outline:', (d.outline || '').length, '| research:', (d.researchData || '').length);
  }
  fs.writeFileSync('/tmp/tanda10/_index.json', JSON.stringify(index, null, 2));
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda10-2026-10-16.json', JSON.stringify(backup, null, 2));
  console.log('backup guardado, docs:', Object.keys(backup).length);
  process.exit(0);
})();
