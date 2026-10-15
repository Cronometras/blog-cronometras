#!/usr/bin/env node
// Segunda pasada: restos de strings LMS (2 líneas) + «Blue Card» como capacidado personal inventado.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const RES = [
  [/\n[ \t]*(?:See|View) questionnaire[ \t]*\n[ \t]*Complete lesson[ \t]*(?=\n)/g, '\n'],
  [/\n[ \t]*(?:See|View) questionnaire[ \t]*(?=\n)/g, '\n'],
  [/\n[ \t]*Complete lesson[ \t]*(?=\n)/g, '\n'],
  [/un Analista Senior "Blue Card" realiza la valoración y codificación \(Fase 2\) sin pisar la planta/g,
   'un analista experimentado realiza la valoración y codificación (Fase 2) sin pisar la planta'],
];

(async () => {
  let nFs = 0, nMdx = 0;
  const snap = await db.collection('articulos_cronometras').get();
  for (const doc of snap.docs) {
    let content = doc.data().content || '';
    const before = content;
    for (const [re, rep] of RES) content = content.replace(re, rep);
    if (content !== before) {
      await doc.ref.update({ content });
      nFs++;
      console.log('FS FIXED', doc.id);
    }
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
  console.log('pass2: fs', nFs, 'mdx', nMdx);
  process.exit(0);
})();
