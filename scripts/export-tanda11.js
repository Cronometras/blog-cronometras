#!/usr/bin/env node
// Exporta los 6 artículos de la tanda 11 (plan 90-95) a /tmp/tanda11/<id>.json + backup de estado.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = [
  'es-6c8468fcce6eeb55',
  'es-50b8d2f80d3359b6',
  'es-cb24a8fce215dab0',
  'es-90878dc9750e99ce',
  'es-30426082d9951457',
  'es-d6b19578b49a9a2e',
];

(async () => {
  fs.mkdirSync('/tmp/tanda11', { recursive: true });
  const index = [];
  const backup = {};
  for (const id of IDS) {
    const ref = db.collection('articulos_cronometras').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING', id); continue; }
    const d = snap.data();
    fs.writeFileSync(`/tmp/tanda11/${id}.json`, JSON.stringify(d, null, 2));
    fs.writeFileSync(`/tmp/tanda11/${id}.txt`, d.content || '');
    backup[id] = d;
    index.push({ id, slug: d.slug || '', topic: d.topic || '', len: (d.content || '').length });
    console.log(id, '|', d.slug, '|', (d.content || '').length, 'chars | outline:', (d.outline || '').length, '| research:', (d.researchData || '').length);
  }
  fs.writeFileSync('/tmp/tanda11/_index.json', JSON.stringify(index, null, 2));
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda11-2026-10-17.json', JSON.stringify(backup, null, 2));
  console.log('backup guardado, docs:', Object.keys(backup).length);
  process.exit(0);
})();
