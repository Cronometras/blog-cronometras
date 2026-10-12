const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const OUR_SLUGS = [
  'la-ergonomia-del-dolor-a-la-productividad', 'la-importancia-del-estudio-de-tiempos-de-trabajo',
  'la-utilidad-de-los-tiempos-historicos-para-establecer-estandares-de-trabajo',
  'medicion-de-tiempos-de-trabajo', 'medir-sin-metodo-preestablecido-crono-seguido',
  'mejores-practicas-metodo-trabajo', 'metodos-y-tiempos-en-la-gestion-empresarial-industrial',
  'numero-de-observaciones-a-realizar-en-un-cronometraje-industrial', 'obeya-room-lean',
  'objetivos-del-estudio-del-trabajo', 'ergonomics-from-pain-to-productivity',
  'number-of-observations-required-in-industrial-time-study', 'obeya-room-lean',
];

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const hits = [];
  snap.forEach(d => {
    const f = d.data();
    const s = (f.slug || '').replace(/^(es|en)\//, '');
    if (!OUR_SLUGS.includes(s)) return;
    for (const [k, v] of Object.entries(f)) {
      if (typeof v === 'string' && v.includes('images.unsplash.com')) hits.push([d.id, s, k, v]);
    }
  });
  console.log('unsplash fields in our docs:', hits.length);
  for (const h of hits) console.log(h[0], h[1], h[2], h[3]);
  // fix: imageUrl/coverImage -> local themed image
  const REPL = {
    'metodos-y-tiempos-en-la-gestion-empresarial-industrial': '/images/webp/metodos-y-tiempos.webp',
    'obeya-room-lean': '/images/webp/obeya-room-lean.webp',
    'ergonomics-from-pain-to-productivity': '/images/webp/la-ergonomia-del-dolor-a-la-productividad.webp',
    'la-ergonomia-del-dolor-a-la-productividad': '/images/webp/la-ergonomia-del-dolor-a-la-productividad.webp',
  };
  for (const [id, slug, key, val] of hits) {
    if ((key === 'imageUrl' || key === 'coverImage' || key === 'heroImage') && REPL[slug]) {
      await db.collection('articulos_cronometras').doc(id).update({ [key]: REPL[slug] });
      console.log('fixed', id, slug, key, '->', REPL[slug]);
    } else {
      console.log('NOT FIXED (needs decision):', id, slug, key, val.slice(0, 80));
    }
  }
  // read-back
  for (const [id, slug] of new Set(hits.map(h => [h[0], h[1]]))) {
    const f = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const still = Object.entries(f).filter(([k, v]) => typeof v === 'string' && v.includes('images.unsplash.com'));
    console.log('readback', id, slug, 'unsplash left:', still.map(x => x[0]).join(',') || 'none');
  }
})();
