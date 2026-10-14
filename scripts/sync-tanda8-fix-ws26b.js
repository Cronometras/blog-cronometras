#!/usr/bin/env node
// Fix 2 articulo-26: nota meta HTTP 403/curl + cifra derivada 1.111 -> ≈1.067 (coherente con la tabla).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const REPL = [
  ['- Tamaño de muestra: para ±3 % de error con p=0,5 → **1.111 observaciones** (fórmula clásica de Tippett, verificable abajo).',
   '- Tamaño de muestra: para ±3 % de error con p=0,5 → **unas 1.067 observaciones** (fórmula clásica de Tippett, que vemos más abajo).'],
  ['**Nota sobre la fuente iberdrolaespana.com**: la página original devuelve HTTP 403 con Cloudflare Challenge (CDN bloquea a curl sin cookies de sesión). El dato está citado de forma independiente por [techshowmadrid.es](https://www.techshowmadrid.es/en/noticias/informe-centro-datos-2026) sobre el mismo informe Spain DC + Pb7 Research, por lo que el dato del 55 % Madrid se',
   'El dato del 55 % Madrid se'],
];

(async () => {
  const ref = db.collection('articulos_blog_muestreo').doc('articulo-26-muestreo-del-trabajo-en-data');
  const d = (await ref.get()).data();
  let content = d.content || '';
  let applied = 0, missing = [];
  for (const [o, n] of REPL) {
    if (content.includes(o)) { content = content.split(o).join(n); applied++; }
    else missing.push(o.slice(0, 60));
  }
  await ref.update({ content });
  const f = (await ref.get()).data();
  const text = [f.content || '', f.description || ''].join('\n');
  const forb = ['verificad', 'HTTP 200', 'HTTP 403', 'curl', 'Estado HTTP', '1.111', '→ 384', 'Cloudflare Challenge'].filter(p => text.includes(p));
  console.log('applied:', applied, '/', REPL.length);
  if (missing.length) console.log('NO MATCH:', missing.join(' ;; '));
  console.log('readback forbidden:', forb.length ? forb.join(',') : 'none');
  process.exit(forb.length ? 1 : 0);
})();
