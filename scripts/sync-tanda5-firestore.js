#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras — tanda 5 (10 artículos ES).
// Updates content / description / keywords; updates topic only together with a
// pinned slug field (Pitfall O: a doc without `slug` derives its URL from slugify(topic)).
// Backup of previous field values -> /home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda5-*.json
// Then read-back each doc: forbidden patterns must be 0.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const SLUGS = [
  'gestion-integral-estudios',
  'guia-paso-a-paso-como-realizar-un-estudio-de-tiempos-y-movimientos-eficaz',
  'herramientas-necesarias-para-realizar-un-estudio-de-tiempos',
  'identificacion-del-trabajo-a-medir',
  'importancia-del-estudio-de-metodos-y-tiempos-de-trabajo',
  'importancia-tiempo-estandar-productividad-rentabilidad',
  'introduccion-al-cronometraje-industrial',
  'introduccion-cronometras',
  'introduccion-mtm-most-metodologias-avanzadas',
  'la-apreciacion-de-la-actividad-en-el-cronometraje-industrial',
];

const FORBIDDEN = [
  'Integración con otras herramientas', 'se puede integrar con otras herramientas',
  'operador promedio', 'estás quedan', 'creando 1 más', 'crono análisis',
  'Obten el informe', 'insights', '1960-70', 'Kjell Zandin', '< 10-15 segundos',
  'Escalas BSI', 'normal (90)', 'decayó', 'habrá decayó', 'expertise', 'puntaje',
  'videos predeterminados', '1 trabajador', 'Clipboard', 'fumbles', 'offline',
  'El autor confía', 'promedio', 'Promedio', 'Benchmark', 'conectan directamente',
  'OIT v4', 'OLTA', 'Tribunal de Arbitraje', '100-140', '75-100', 'subjetiva',
];
const REQUIRED_ANY = [
  'Midvale', 'operario medio', 'portafolios', 'errores de manipulación',
  'fiabilidad del 95 %', 'Tiempo Medio Observado', 'Exportación de datos estructurados',
  'PDF, Excel y JSON', 'ID de la pieza', 'Vídeo complementario', 'creando uno más eficaz',
  'número de máquinas', 'añaden valor', 'haciéndolo más seguro', 'Punto de Referencia',
  'aportan datos', 'cronoanálisis', 'Obtén el informe', 'información valiosa',
  'Westinghouse, 1948', 'Kjell B. Zandin', '1.500 veces por semana',
  'menos de 150 veces por semana', '7,98', '4,5 km/h', '6,4 km/h', 'habrá decaído',
  'Esperamos que estas claves',
];

function parseMdx(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('no frontmatter: ' + file);
  const fm = m[1];
  const body = m[2].trim();
  const get = (key) => {
    const r = new RegExp('^' + key + ':\\s*"?(.*?)"?\\s*$', 'm').exec(fm);
    return r ? r[1].replace(/^"|"$/g, '') : null;
  };
  const title = get('title');
  const desc = get('description');
  let keywords = null;
  const kr = /^tags:\s*\[([\s\S]*?)\]\s*$/m.exec(fm);
  if (kr) {
    keywords = kr[1].trim()
      ? kr[1].replace(/^"/, '').replace(/"$/, '').split('","').map(s => s.trim().replace(/^"|"$/g, ''))
      : [];
  }
  return { body, desc, keywords, title };
}

const slugify = (s) => (s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

(async () => {
  const before = {};
  const coll = db.collection('articulos_cronometras');
  const snap = await coll.get();
  const docs = [];
  snap.forEach(d => docs.push(d));

  let updated = 0;
  const missing = [];
  const touched = {};
  for (const slug of SLUGS) {
    const file = path.join(__dirname, '..', 'src/content/blog/es', slug + '.mdx');
    const { body, desc, keywords, title } = parseMdx(file);
    const doc = docs.find(d => {
      const f = d.data();
      const s = (f.slug || '').replace(/^es\//, '');
      return s === slug || slugify(f.topic) === slug || slugify(f.topic) === slugify(title);
    });
    if (!doc) { missing.push(slug); continue; }
    before[doc.id] = doc.data();
    const upd = { content: body };
    if (desc) upd.description = desc;
    if (keywords) upd.keywords = keywords;
    if (title && title !== doc.data().topic) {
      // Pitfall O: pin the URL before touching topic when slug is absent.
      if (!doc.data().slug) upd.slug = 'es/' + slug;
      upd.topic = title;
    }
    await doc.ref.update(upd);
    updated++;
    touched[doc.id] = slug;
    console.log('updated', doc.id, slug, 'content', body.length, 'chars', upd.topic ? '+ topic/slug' : '');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda5-${stamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 1));
  console.log('backup ->', backupPath);

  // ---- read-back ----
  let bad = 0;
  const freshTexts = [];
  for (const [id, slug] of Object.entries(touched)) {
    const f = (await coll.doc(id).get()).data();
    const text = [f.content || '', f.description || '', (f.keywords || []).join(' '), f.topic || ''].join('\n');
    freshTexts.push(f.content || '');
    const hits = FORBIDDEN.filter(p => text.includes(p));
    console.log('readback', id, slug, '| content', (f.content || '').length, 'chars | forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  const joinedAll = freshTexts.join('\n');
  console.log('--- required markers (colección completa):');
  for (const p of REQUIRED_ANY) console.log(' ', p, '=>', (joinedAll.split(p).length - 1), 'hits');
  console.log('updated:', updated, 'missing:', missing);
  console.log(bad === 0 ? 'SYNC+READBACK OK' : 'READBACK FAILED: ' + bad);
})();
