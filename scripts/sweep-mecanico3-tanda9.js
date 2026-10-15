#!/usr/bin/env node
// Tercera pasada: genericar marcas de herramientas del sector (competidores) en
// descripciones educativas — AviX / Siemens Tecnomatix.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const RES = [
  [/\(como Siemens Tecnomatix o AviX\)/g, ''],
  [/\(like Siemens Tecnomatix or AviX\)/g, ''],
  [/\*\*AviX:\*\* Video-análisis que genera bloques MTM semiautomáticos\./g, '**Video-análisis:** genera bloques MTM semiautomáticos.'],
];

(async () => {
  let nFs = 0, nMdx = 0;
  const snap = await db.collection('articulos_cronometras').get();
  for (const doc of snap.docs) {
    let content = doc.data().content || '';
    const before = content;
    for (const [re, rep] of RES) content = content.replace(re, rep);
    if (content !== before) { await doc.ref.update({ content }); nFs++; console.log('FS FIXED', doc.id); }
  }
  const dirs = ['/home/ubuntu/projects/blog-cronometras/src/content/blog/es', '/home/ubuntu/projects/blog-cronometras/src/content/blog/en'];
  for (const dir of dirs) {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
      const p = path.join(dir, f);
      const txt = fs.readFileSync(p, 'utf8');
      let out = txt;
      for (const [re, rep] of RES) out = out.replace(re, rep);
      if (out !== txt) { fs.writeFileSync(p, out); nMdx++; console.log('MDX FIXED', f); }
    }
  }
  console.log('pass3: fs', nFs, 'mdx', nMdx);
  process.exit(0);
})();
