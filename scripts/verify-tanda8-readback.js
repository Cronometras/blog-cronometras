#!/usr/bin/env node
// Read-back: estado de los docs de Firestore de la tanda 8 tras los sync previos.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

// [docId, marcadores que DEBEN estar, marcadores que NO deben estar]
const DOCS = [
  ['es/... takt', null, null], // placeholder removed below
];
const CHECKS = {
  // 4 mdx -> firestore (sync-tanda8-mdx-firestore.js)
  'takt-time-que-es-como-se-calcula-y-como-se-aplica': {
    must: ['50 segundos', '455 / 546', '0,833'],
    mustnot: ['52 segundos', '480/546', '0.879'],
  },
  'tiempo-observado-vs-tiempo-estandar': {
    must: ['Referencia, estándar de rendimiento', 'la referencia que representa'],
    mustnot: ['Benchmark, estándar de rendimiento', 'el benchmark que representa'],
  },
  'toma-de-tiempos-con-cronometro': {
    must: ['una aplicación de cronoanálisis', 'hacemos clic'],
    mustnot: ['App Android de cronometraje', 'hacemos click'],
  },
  'trabajos-hombre-maquina-como-calcular-y-minimizar-las-interferencias': {
    must: ['I = 50 ×', '8,3 %', 'Wright, Duvall y Freeman, 1936', 'ejemplo orientativo'],
    mustnot: ['I = 1 - (1 - x)^N', '47,96', '21,1%', '80,02%'],
  },
  // firestore-only docs (sync-tanda8-firestore.js + fixes)
  'es-d661e14701cbe0a2': { must: ['revision de rigor', 'revisión de rigor'], mustnot: [] },
  'es-7f85665a73d4d4db': { must: [], mustnot: [] },
  'articulo-14-comparativa-pmts-mtm-most-mt': {
    must: ['Maynard, Stegemerten y J. G. Schwab', 'K. B. Zandin'],
    mustnot: ['desarrollado entre 1940 y 1965 por la **MTM Association**', 'H.B. Maynard & Co.** a partir de 1966'],
  },
  'es-bd920342525a8f53': { must: [], mustnot: [] },
  'articulo-7-cronoanalisis-baterias-litio': {
    must: ['cifra orientativa'],
    mustnot: ['**60 % del coste de conversión** de una celda'],
  },
  'articulo-22-cronoanalisis-centros-datos-': { must: [], mustnot: [] },
  // clase fixes
  'articulo-17-cronoanalisis-envasado-bebid': {
    must: ['Caso práctico simulado', 'Caso publicado en la literatura del sector'],
    mustnot: ['Sobre el autor', 'caso anonimizado', 'Caso anonimizado', 'Referencias verificadas', 'Nota editorial'],
  },
  'articulo-19-cronoanalisis-paradas-progra': {
    must: ['Sin aislamiento físico confirmado', 'Se ajusta a los flujos reales'],
    mustnot: ['verificad', 'Sobre el autor', 'caso anonimizado', 'HTTP 200'],
  },
};

(async () => {
  const coll = db.collection('articulos_cronometras');
  const snap = await coll.get();
  const byId = {};
  const bySlugTail = {};
  snap.forEach(d => {
    byId[d.id] = d.data();
    const s = (d.data().slug || '');
    if (s) bySlugTail[s] = d.data();
  });
  console.log('total docs:', snap.size);
  for (const [key, chk] of Object.entries(CHECKS)) {
    let data = byId[key];
    if (!data) {
      // buscar por slug que contenga la key
      for (const [s, dd] of Object.entries(bySlugTail)) {
        if (s.includes(key)) { data = dd; break; }
      }
    }
    if (!data) { console.log('MISSING DOC:', key); continue; }
    const text = [data.content || '', data.description || '', data.excerpt || '', data.topic || ''].join('\n');
    const miss = chk.must.filter(m => !text.includes(m));
    const bad = chk.mustnot.filter(m => text.includes(m));
    console.log((miss.length || bad.length ? 'FAIL' : 'OK  '), key,
      '| must-missing:', miss.length ? miss.join(' ;; ') : '-',
      '| forbidden-present:', bad.length ? bad.join(' ;; ') : '-',
      '| content-len:', (data.content || '').length);
  }
  process.exit(0);
})();
