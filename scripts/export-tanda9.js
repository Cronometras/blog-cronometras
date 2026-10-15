#!/usr/bin/env node
// Exporta los 10 artículos de la tanda 9 (plan 70-79) a /tmp/tanda9/<id>.json
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = [
  'articulo-27-cronoanalisis-cooperativas-a',
  'articulo-8-cronoanalisis-mantenimiento-s',
  'articulo-17-cronoanalisis-envasado-bebid',
  'articulo-5-cronoanalisis-mantenimiento-a',
  'articulo-6-cronoanalisis-mantenimiento-f',
  'articulo-19-cronoanalisis-paradas-progra',
  'es-61d83b28a4e19514',
  'es-9072627a5c8d598e',
  'es-516d621d0343c3c6',
  'es-91bd9e5fbb40eae7',
];

(async () => {
  fs.mkdirSync('/tmp/tanda9', { recursive: true });
  const index = [];
  for (const id of IDS) {
    const ref = db.collection('articulos_cronometras').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING', id); continue; }
    const d = snap.data();
    fs.writeFileSync(`/tmp/tanda9/${id}.json`, JSON.stringify(d, null, 2));
    index.push({ id, slug: d.slug || '', topic: d.topic || '', len: (d.content || '').length, desc: (d.description || '').slice(0, 120) });
    console.log(id, '|', d.slug, '|', (d.content || '').length, 'chars');
  }
  fs.writeFileSync('/tmp/tanda9/_index.json', JSON.stringify(index, null, 2));
  // Backup completo previo (patrón de las tandas anteriores)
  const backup = {};
  for (const id of IDS) {
    const snap = await db.collection('articulos_cronometras').doc(id).get();
    if (snap.exists) backup[id] = snap.data();
  }
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda9-2026-10-15.json', JSON.stringify(backup, null, 2));
  console.log('backup guardado, docs:', Object.keys(backup).length);
  process.exit(0);
})();
