#!/usr/bin/env node
// Read-back tanda 11: marcadores nuevos presentes, patrones viejos a 0, gate lista negra §6.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = ['es-6c8468fcce6eeb55', 'es-50b8d2f80d3359b6', 'es-cb24a8fce215dab0',
  'es-90878dc9750e99ce', 'es-30426082d9951457', 'es-d6b19578b49a9a2e'];

const OLD_PATTERNS = ['安全事故', 'James H. Ashcroft', 'Posición imposible', 'Posición imposible (IF)',
  'Caso típico', 'La versión completa de este artículo', '> **Nota**', 'e-motion',
  'Secuencia simplificada B', 'Mínimo de', '(MTTR, Mean Time To Repair/Resolve)',
  '/en/smed-', '/en/ashcroft-', '/en/specialized-technique-13-', '/en/specialized-technique-14-',
  '/en/specialized-technique-18-', '/en/assembly-line-balancing-'];
const NEW_MARKERS = ['prodcont.com', '/en/blog/'];
const CASE_MARKERS = ['Caso práctico simulado', 'no corresponde a una implantación real'];
const NO_CASE = new Set(['es-30426082d9951457']); // sin sección de caso: no exige marcadores de caso
const BLACKLIST = ['verificad', 'verificado con curl', 'HTTP 200', 'Cross-selling', '✅', '❌',
  'trampa', 'Frontmatter', 'Sobre el autor', 'fundador de ProdCont', 'Miguel Cano', 'anonimizad',
  '19 checks', 'OIT v4', 'VERIFICACIÓN EJECUTADA', 'Tribunal de Arbitraje',
  'Modo MTM', 'fuente verificada'];
const BLACKLIST_SENSITIVE = ['OLTA']; // case-sensitive + bordes de palabra (evita «Soltar»)

(async () => {
  let bad = 0;
  for (const id of IDS) {
    const snap = await db.collection('articulos_cronometras').doc(id).get();
    const d = snap.data();
    const txt = [d.content || '', d.topic || '', d.description || ''].join('\n');
    const probs = [];
    for (const p of OLD_PATTERNS) {
      const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const n = (txt.match(re) || []).length;
      if (n > 0) probs.push(`residual '${p}' x${n}`);
    }
    for (const m of NEW_MARKERS) {
      if (!txt.includes(m)) probs.push(`marcador ausente: ${m}`);
    }
    if (!NO_CASE.has(id)) {
      for (const m of CASE_MARKERS) {
        if (!txt.includes(m)) probs.push(`marcador caso ausente: ${m}`);
      }
    }
    for (const p of BLACKLIST) {
      const re = new RegExp(p, 'gi');
      const n = (txt.match(re) || []).length;
      if (n > 0) probs.push(`lista negra: ${p} x${n}`);
    }
    for (const p of BLACKLIST_SENSITIVE) {
      const re = new RegExp(`\\b${p}\\b`, 'g');
      const n = (txt.match(re) || []).length;
      if (n > 0) probs.push(`lista negra: ${p} x${n}`);
    }
    // aritmetica TMU
    if ((d.content || '').includes('1 TMU = 0,036 s')) {
      if (Math.abs(1250 * 0.036 - 45) > 0.001) probs.push('aritmetica TMU incoherente');
    }
    if (probs.length) { bad++; console.log('FAIL', id, '|', probs.join(' ;; ')); }
    else console.log('OK  ', id, '|', (d.slug || '').slice(0, 60), '|', (d.content || '').length, 'chars');
  }
  console.log(bad === 0 ? '\nGATE CONTENT: PASS (0 problemas)' : `\nGATE CONTENT: ${bad} docs con problemas`);
  process.exit(0);
})();
