#!/usr/bin/env node
// Contexto de los hits de clase para decidir reales vs falsos positivos.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const TARGETS = {
  articulos_cronometras: ['0uqEHTPNek09BbeT80fl', '3NEcAGMaEpkNU2C9bA88', 'PoNPLQRzrJ1cSx2lLL7G', 'YZZoe6E1mG6bIxCRll6i', 'fLErumHubC9eIb248i1m', 'kmgE6c7c0cNd5jHGRwvb'],
  articulos_blog_muestreo: ['7kU2Fh6IzJFCUsskqqKH', 'AmBfKSSUKhLf7ldwBC6N', 'PEx3uf7sjgAvF3yUE6Qm', 'Txt7rsVZGff0RAyi6bUv', 'articulo-18-work-sampling-centros-distri', 'articulo-2-work-sampling-construccion-in', 'articulo-21-work-sampling-plantas-modulo', 'articulo-3-work-sampling-parques-maquina', 'articulo-4-six-sigma-dmaic-vs-muestreo-d', 'cmCjDZDXN03LyQnjeRVI', 'hLoc8ZuLvbBN33CYY7a9'],
  articulos_fichadas: ['2KMWJicdQ4gJi5hNg7WK', '5e4BRLJr72Oqf7XWjKXu', 'BJrgIpTUsdIuUA7Hv0it', 'Bjhktt98Oz77Rp6McryA', 'DR6rmZoeqTGHUJqnW0GZ', 'FDCON677a6tjgMRM9GLY', 'IDXrFVlWXTviuARDCV5x', 'NJrQdbOZrE5N71XbkwWm', 'OIwjLCLVbU8YVw4ug1Tn', 'QFZFtWOlxhT8Qxk38Y3X', 'ZV5pnMVSUeJvEJTsSiGj', 'pGTi93gK9aYFicsd5SDP'],
  articulos_asetemyt: ['dCnrpOJKqAhbEMppjvwV'],
};

const RE = /Cronometras(App)?[^\n]{0,60}Work Sampling|Work Sampling[^\n]{0,40}(m[óo]dulo|module)|Inteligencia de Mercado|desarrollado por H\.?B\.? Maynard|±3% de precisi[óo]n|\(Norma OIT\)|OIT v\.?\s?4/gi;

(async () => {
  for (const [coll, ids] of Object.entries(TARGETS)) {
    for (const id of ids) {
      let snap = await db.collection(coll).doc(id).get();
      if (!snap.exists) {
        const all = await db.collection(coll).get();
        let found = null;
        all.forEach(d => { if (!found && d.id.includes(id)) found = d; });
        snap = found;
      }
      if (!snap || !snap.exists) { console.log('?? missing', coll, id); continue; }
      const d = snap.data();
      for (const field of ['content', 'topic', 'description', 'outline']) {
        const t = d[field] || '';
        let m;
        RE.lastIndex = 0;
        while ((m = RE.exec(t))) {
          const s = Math.max(0, m.index - 110), e = Math.min(t.length, m.index + m[0].length + 110);
          console.log(`\n### ${coll}/${snap.id} [${field}] «${m[0]}»`);
          console.log('   ...' + t.slice(s, e).replace(/\n/g, ' ') + '...');
        }
      }
    }
  }
  process.exit(0);
})();
