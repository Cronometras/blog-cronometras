#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
(async () => {
  for (const id of ['articulo-22-cronoanalisis-centros-datos-', 'articulo-7-cronoanalisis-baterias-litio', 'es-7f85665a73d4d4db']) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const t = d.content || '';
    console.log('=====', id);
    for (const p of ['Caso práctico simulado', 'caso práctico simulado', 'Simulad', 'simulad', 'didácticos']) {
      const n = t.split(p).length - 1;
      if (n) {
        const i = t.indexOf(p);
        console.log(`  [${p}] x${n} :: ...${t.slice(Math.max(0, i - 120), i + 160).replace(/\n/g, ' ')}...`);
      }
    }
    // ¿tiene tabla de resultados con cifras concretas sin disclaimer?
    if (/Resultados/.test(t) && !/simulad|didáctic/i.test(t)) console.log('  ⚠ tiene «Resultados» pero NO disclaimer simulado');
  }
  // aritmética tabla articulo-22
  console.log('--- aritmética ---');
  console.log('MTTR 142->71:', 142 / 2, '(esperado -50%)');
  console.log('AE con MTBF=?, MTTR=142 min: solo forma');
  process.exit(0);
})();
