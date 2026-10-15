#!/usr/bin/env node
// Barrido mecánico: (1) strings LMS filtrados en artículos EN; (2) marcas de
// herramientas ajenas presentadas como práctica propia (genericizar).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const LMS_RE = /\n[ \t]*(?:See|View) questionnaire[ \t]*\n[ \t]*Complete lesson[ \t]*\n[ \t]*Restart lesson[ \t]*(?=\n)/g;
const LMS_RE2 = /\n[ \t]*Restart lesson[ \t]*(?=\n)/g;
const BRAND_FIXES = [
  [/\(tipo \*Timer Pro\* o \*AviX\*\)/g, '(videoanálisis)'],
  [/\(like \*Timer Pro\* or \*AviX\*\)/g, '(video analysis)'],
  [/como \*AVIX\* o \*Timer Pro Professional\*/g, 'de videoanálisis'],
  [/like \*AVIX\* or \*Timer Pro Professional\*/g, 'such as video analysis platforms'],
];

(async () => {
  let nFs = 0, nMdx = 0;
  // Firestore
  const snap = await db.collection('articulos_cronometras').get();
  for (const doc of snap.docs) {
    const d = doc.data();
    let content = d.content || '';
    const before = content;
    content = content.replace(LMS_RE, '\n');
    content = content.replace(LMS_RE2, '\n');
    for (const [re, rep] of BRAND_FIXES) content = content.replace(re, rep);
    if (content !== before) {
      await doc.ref.update({ content, correctionNote: '2026-10-15: barrido de clase — artefactos LMS y marcas de herramientas ajenas retiradas.' });
      nFs++;
      console.log('FS FIXED', doc.id, d.slug || '');
    }
  }
  // .mdx
  const dirs = ['/home/ubuntu/projects/blog-cronometras/src/content/blog/es', '/home/ubuntu/projects/blog-cronometras/src/content/blog/en'];
  for (const dir of dirs) {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
      const p = path.join(dir, f);
      const txt = fs.readFileSync(p, 'utf8');
      let out = txt.replace(LMS_RE, '\n').replace(LMS_RE2, '\n');
      for (const [re, rep] of BRAND_FIXES) out = out.replace(re, rep);
      if (out !== txt) {
        fs.mkdirSync('/tmp/tanda9/mdx-backup', { recursive: true });
        const bak = '/tmp/tanda9/mdx-backup/' + p.replace(/[/]/g, '__');
        if (!fs.existsSync(bak)) fs.writeFileSync(bak, txt);
        fs.writeFileSync(p, out);
        nMdx++;
        console.log('MDX FIXED', f);
      }
    }
  }
  console.log('firestore docs fixed:', nFs, '| mdx fixed:', nMdx);
  process.exit(0);
})();
