#!/usr/bin/env node
// Dump de los 10 docs de la tanda 6 induly (indices 50-59 de plan_induly) a ficheros locales.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const OUT = '/home/ubuntu/.hermes/cache/scratch/tanda6-induly-20261111';
const DOCS = [
  ['OIwjLCLVbU8YVw4ug1Tn', 'teletrabajo-control-horario'],
  ['tgCX32sDOIWwJFPIW6Ut', 'tiempo-efectivo-vs-presencia'],
  ['Cbpik2GXviOwzLZI074z', 'tiempos-estandar-vs-reales'],
  ['ZV5pnMVSUeJvEJTsSiGj', 'validacion-de-piezas'],
  ['articulo-39-tacografo-registro-jornada-t', 'tacografo'],
  ['2KMWJicdQ4gJi5hNg7WK', 'bonos-productividad-draft'],
  ['4B3VAygb3wJfFh9aaaeJ', 'analisis-ejecutivo-draft'],
  ['7ZOh8NeRtEOmpabynsu5', 'modulo-tareas-draft'],
  ['8JwMOIIHkhA00EHHlrdY', 'configuracion-inicial-draft'],
  ['BLJcwzqU072BvT9pRkYM', 'fichaje-gps-draft'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [id, name] of DOCS) {
    const snap = await db.collection('articulos_fichadas').doc(id).get();
    if (!snap.exists) { console.log('MISSING', id); continue; }
    const d = snap.data();
    fs.writeFileSync(path.join(OUT, `${name}.fields.json`), JSON.stringify(d, null, 1));
    for (const f of ['content', 'outline', 'description', 'descripcion', 'researchData', 'topic', 'titulo']) {
      if (typeof d[f] === 'string' && d[f].length) {
        fs.writeFileSync(path.join(OUT, `${name}.${f}.txt`), d[f]);
      }
    }
    console.log(id, name, 'status=' + (d.status || '-'), 'words=' + (d.content ? d.content.split(/\s+/).length : 0), 'fields=' + Object.keys(d).join(','));
  }
  // conteo global de la colección y de status=completed (detección de artículos nuevos)
  const all = await db.collection('articulos_fichadas').get();
  let completed = 0; const ids = [];
  all.forEach(x => { const dd = x.data(); if (dd.status === 'completed') { completed++; ids.push(x.id); } });
  fs.writeFileSync(path.join(OUT, 'collection-ids.json'), JSON.stringify(ids, null, 1));
  console.log('coleccion total=' + all.size + ' completed=' + completed);
  process.exit(0);
})();
