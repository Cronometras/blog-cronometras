#!/usr/bin/env node
// Extrae secciones relevantes de los docs ES (corregidos tanda 8) y sus espejos EN.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

function dumpSection(txt, startPat, endPat, label) {
  const i = txt.search(startPat);
  if (i < 0) { console.log(`\n### ${label}: PATRON NO ENCONTRADO`); return; }
  const j = endPat ? txt.indexOf(endPat, i + 10) : -1;
  const seg = txt.slice(i, j > 0 ? j : Math.min(txt.length, i + 3500));
  console.log(`\n### ${label} (${seg.length} chars)\n${seg}`);
}

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const docs = {};
  snap.forEach(d => docs[d.id] = d.data());

  // 1) man-machine: ES corregido vs EN
  const esMM = Object.values(docs).find(d => (d.slug || '').startsWith('es/') && /trabajos-hombre-maquina/.test(d.slug));
  const enMM = docs['YZZoe6E1mG6bIxCRll6i'];
  console.log('===== ES man-machine:', esMM ? esMM.slug : 'NO ENCONTRADO');
  if (esMM) {
    dumpSection(esMM.content, /Wright|interferencia/i, null, 'ES wright/interferencia');
    console.log('\n--- ES content length', esMM.content.length);
    fs.writeFileSync('/tmp/tanda9/enfix/es-man-machine.txt', esMM.content);
  }
  if (enMM) {
    dumpSection(enMM.content, /Wright|interference/i, null, 'EN wright/interference');
    fs.writeFileSync('/tmp/tanda9/enfix/en-man-machine.txt', enMM.content);
  }

  // 2) takt: EN passage around the calculation
  const enTakt = docs['rBUfBcS6vETmLVgwx4WA'];
  if (enTakt) {
    dumpSection(enTakt.content, /546/, null, 'EN takt calc');
    fs.writeFileSync('/tmp/tanda9/enfix/en-takt.txt', enTakt.content);
  }

  // 3) time-measurement EN: android + description
  const enTM = docs['phhiUyvRDnqTxQk0ZuuW'];
  if (enTM) {
    console.log('\n### EN time-measurement description:', JSON.stringify(enTM.description || ''));
    dumpSection(enTM.content, /Android/, null, 'EN android');
    fs.writeFileSync('/tmp/tanda9/enfix/en-time-measurement.txt', enTM.content);
  }
  process.exit(0);
})();
