#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
const TARGETS = [
  ['articulos_blog_muestreo', 'articulo-18-work-sampling-centros-distri'],
  ['articulos_blog_muestreo', 'articulo-21-work-sampling-plantas-modulo'],
  ['articulos_blog_muestreo', 'articulo-26-muestreo-del-trabajo-en-data'],
  ['articulos_fichadas', 'articulo-20-fichaje-hospitales-centros-s'],
];
const FORB = ['Sobre el autor', 'About the Author', 'caso anonimizado', 'Caso anonimizado',
  'Anonymized Case', 'Datos anonimizados', 'Anonymized data', 'verificad', 'Key Citations',
  'Cross-selling ecosystem', 'Fórmulas verificadas con Python', 'Calculos verificados',
  'HTTP 200', 'HTTP 403', 'curl', 'Estado HTTP', '1.111', 'Cloudflare Challenge'];
(async () => {
  for (const [coll, id] of TARGETS) {
    const d = (await db.collection(coll).doc(id).get()).data();
    const text = [d.content || '', d._en?.content_en || '', d.description || '', d.topic || ''].join('\n');
    const bad = FORB.filter(p => text.includes(p));
    console.log((bad.length ? 'FAIL' : 'OK  '), coll, id, '| forbidden:', bad.join(',') || '-');
    if (id.includes('26')) {
      const i = text.indexOf('El dato del 55 % Madrid');
      console.log('   flujo:', JSON.stringify(text.slice(i - 80, i + 220)));
    }
  }
  process.exit(0);
})();
