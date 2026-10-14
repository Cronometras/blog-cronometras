#!/usr/bin/env node
// Fix único: marcador orientativo en el 60% del coste de conversión (doc baterías).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  const ref = db.collection('articulos_cronometras').doc('articulo-7-cronoanalisis-baterias-litio');
  const d = (await ref.get()).data();
  let content = d.content || '';
  const oldS = 'Más del **60 % del coste de conversión** de una celda se concentra';
  const newS = 'Más del **60 % del coste de conversión (cifra orientativa)** de una celda se concentra';
  if (!content.includes(oldS)) { console.log('NO MATCH'); process.exit(1); }
  content = content.split(oldS).join(newS);
  await ref.update({ content });
  const f = (await ref.get()).data();
  const n = (f.content.split('cifra orientativa').length - 1);
  console.log('OK, "cifra orientativa" hits:', n, '| forbidden 60%-sin-marca presente:', f.content.includes('**60 % del coste de conversión** de una celda'));
  process.exit(0);
})();
