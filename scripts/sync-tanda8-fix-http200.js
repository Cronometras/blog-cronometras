#!/usr/bin/env node
// Fix de clase (eco): marcadores de verificación «HTTP 200 / Verificado / verified»
// en citas de fuentes de articulo-18 (worksamp, ES+EN) y articulo-20 (induly).
// Los «1.111» de worksamp se conservan: son la fórmula Tippett N=4p(1-p)/e².
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const TARGETS = [
  ['articulos_blog_muestreo', 'articulo-18-work-sampling-centros-distri'],
  ['articulos_blog_muestreo', 'articulo-21-work-sampling-plantas-modulo'],
  ['articulos_fichadas', 'articulo-20-fichaje-hospitales-centros-s'],
];

// orden importante: de lo más específico a lo más genérico
const REGEX = [
  [/Verificado HTTP 200\.\s*/g, ''],
  [/HTTP 200 verified\.\s*/g, ''],
  [/\(HTTP 200,\s*/g, '('],
  [/, HTTP 200; /g, '; '],
  [/, HTTP 200\)/g, ')'],
  [/\s*\(HTTP 200\)/g, ''],
  [/\(HTTP 200\)/g, ''],
  [/HTTP 200/g, ''],
];

(async () => {
  let failed = 0;
  for (const [coll, id] of TARGETS) {
    const ref = db.collection(coll).doc(id);
    const d = (await ref.get()).data();
    const upd = {};
    for (const f of ['content', 'description', 'excerpt', 'topic']) {
      if (typeof d[f] === 'string' && /HTTP 200|Verificado HTTP|HTTP 200 verified/.test(d[f])) {
        let t = d[f];
        for (const [re, n] of REGEX) t = t.replace(re, n);
        upd[f] = t;
      }
    }
    if (d._en && typeof d._en.content_en === 'string' && /HTTP 200|verified/.test(d._en.content_en)) {
      let t = d._en.content_en;
      for (const [re, n] of REGEX) t = t.replace(re, n);
      upd['_en.content_en'] = t;
    }
    if (Object.keys(upd).length) {
      await ref.update(upd);
      console.log('updated', coll, id, '->', Object.keys(upd).join(','));
    } else console.log('clean  ', coll, id);
    // read-back
    const f = (await ref.get()).data();
    const text = [f.content || '', f.description || '', f.excerpt || '', f.topic || '', f._en?.content_en || ''].join('\n');
    const bad = ['HTTP 200', 'Verificado HTTP', 'curl', 'Sobre el autor', 'About the Author', 'caso anonimizado', 'Anonymized Case'].filter(p => text.includes(p));
    if (bad.length) { console.log('  READBACK FAIL:', bad.join(',')); failed++; }
    else console.log('  readback OK');
  }
  process.exit(failed ? 1 : 0);
})();
