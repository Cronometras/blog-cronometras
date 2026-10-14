#!/usr/bin/env node
// Fix final clase: 2 usos de «verificad» restantes en articulo-19 (prosa/meta).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  const ref = db.collection('articulos_cronometras').doc('articulo-19-cronoanalisis-paradas-progra');
  const d = (await ref.get()).data();
  let content = d.content || '';
  const reps = [
    ['Sin aislamiento físico verificado no se autoriza la apertura de equipos.',
     'Sin aislamiento físico confirmado no se autoriza la apertura de equipos.'],
    ['Está verificada contra los flujos reales de export a Excel y PDF que la app soporta.',
     'Se ajusta a los flujos reales de exportación a Excel y PDF que la app soporta.'],
  ];
  for (const [o, n] of reps) {
    if (!content.includes(o)) { console.log('NO MATCH:', o.slice(0, 50)); continue; }
    content = content.split(o).join(n);
  }
  await ref.update({ content });
  const f = (await ref.get()).data();
  const text = [f.content || '', f.description || '', f.excerpt || ''].join('\n');
  const hits = ['Sobre el autor', 'Miguel Cano', 'anonimizad', 'HTTP 200', 'verificad', 'Nota editorial'].filter(p => text.includes(p));
  console.log('readback forbidden:', hits.length ? hits.join(',') : 'none');
  process.exit(hits.length ? 1 : 0);
})();
