#!/usr/bin/env node
// Fix articulo-26 (articulos_blog_muestreo): meta-editorial («verificado en Python»,
// columna Estado HTTP/curl), cifras del bloque de cálculo inconsistentes con la
// fórmula (384 -> 385; «1.111 corrección finita» sin fuente -> fuera) y description.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const NOTE = '2026-10-14: fix de clase — meta-editorial (verificaciones/Estado HTTP) eliminada, cifras del ejemplo recalculadas con la fórmula.';

const REPL = [
  ['**Cálculo verificado en Python** (los números son los que importan al blog, NO las instrucciones):\n\n```python\nimport math\ndef n_tippett(p, e, z=1.96):\n    return math.ceil(z*z * p * (1-p) / (e*e))\n\n# Errores típicos en producción\nprint(f"±5% p=0.5 → n = {n_tippett(0.5, 0.05)}")    # → 384\nprint(f"±3% p=0.5 → n = {n_tippett(0.5, 0.03)}")    # → 1.067 → redondeado 1.111 (con corrección finita)\nprint(f"±2% p=0.5 → n = {n_tippett(0.5, 0.02)}")    # → 2.401\nprint(f"±1% p=0.5 → n = {n_tippett(0.5, 0.01)}")    # → 9.604\n```',
   '**Cálculo del ejemplo** (p = 0,5, la proporción de máxima variabilidad; z = 1,96 para un 95 % de confianza):\n\n| Error admisible | Observaciones |\n|---|---|\n| ±5 % | 385 |\n| ±3 % | ≈1.067 |\n| ±2 % | 2.401 |\n| ±1 % | 9.604 |'],
  ['Para un data center con ±3 % de error → **mínimo 1.067 observaciones** (1.111 aplicando la corrección por población finita para N pequeño).',
   'Para un data center con ±3 % de error, el cálculo da **unas 1.067 observaciones**: es la cifra del ejemplo, no un requisito fijo — el número de observaciones se dimensiona según la fiabilidad que se busque y la variabilidad real del proceso.'],
  ['Cada uno de los enlaces anteriores dirige a una URL HTTP 200 verificada con curl a fecha 2026-09-21.',
   'Fuentes consultadas a fecha de la revisión (septiembre de 2026).'],
  ['## Referencias verificadas\n\n| # | Fuente | URL | Estado HTTP (2026-09-21) |\n|---|---|---|---|',
   '## Referencias y fuentes\n\n| # | Fuente | URL |\n|---|---|---|'],
  [' | 200 OK |', ' |'],
  [' | (no curl — referencia agregadora) |', ' |'],
  [' | (no curl — referencia de socios) |', ' |'],
  [' | dato recogido vía fuente secundaria (ref. 3) |', ' |'],
  ['Caso práctico simulado, fórmulas verificadas y checklist de auditoría.',
   'Caso práctico simulado, fórmulas de referencia y checklist de auditoría.'],
];

(async () => {
  const ref = db.collection('articulos_blog_muestreo').doc('articulo-26-muestreo-del-trabajo-en-data');
  const d = (await ref.get()).data();
  let content = d.content || '';
  let desc = d.description || '';
  let applied = 0, missing = [];
  for (const [o, n] of REPL) {
    if (content.includes(o)) { content = content.split(o).join(n); applied++; }
    else if (desc.includes(o)) { desc = desc.split(o).join(n); applied++; }
    else missing.push(o.slice(0, 60));
  }
  await ref.update({ content, description: desc, correctionNote: NOTE });
  const f = (await ref.get()).data();
  const text = [f.content || '', f.description || ''].join('\n');
  const forb = ['verificad', 'HTTP 200', 'curl', 'Estado HTTP', '1.111', '→ 384', 'Python'].filter(p => text.includes(p));
  console.log('applied:', applied, '/', REPL.length);
  if (missing.length) console.log('NO MATCH:', missing.join(' ;; '));
  console.log('readback forbidden:', forb.length ? forb.join(',') : 'none');
  console.log('markers: tabla-calculo:', text.includes('| ±3 % | ≈1.067 |'), '| refs:', text.includes('## Referencias y fuentes'));
  process.exit(forb.length ? 1 : 0);
})();
