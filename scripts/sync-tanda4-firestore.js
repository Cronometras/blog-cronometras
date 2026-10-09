#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras — tanda 4 (10 artículos ES).
// Updates content / description / keywords; updates topic only together with a
// pinned slug field (Pitfall O: a doc without `slug` derives its URL from slugify(topic)).
// Backup of previous field values -> /home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda4-*.json
// Then read-back each doc: forbidden patterns must be 0.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const SLUGS = [
  'define-el-metodo-de-trabajo',
  'delimitar-los-elementos-de-trabajo-en-un-estudio-de-tiempos-con-cronometro',
  'descanso-en-el-trabajo-un-enfoque-integral',
  'diseno-del-metodo-de-trabajo',
  'el-estudio-del-trabajo',
  'el-muestreo-del-trabajo-una-herramienta-estadistica-para-la-gestion-eficiente',
  'elige-como-vas-a-medir-el-trabajo',
  'etapas-del-estudio-de-metodos-de-trabajo',
  'etapas-del-estudio-de-tiempos-en-un-cronometraje-industrial',
  'generar-informe-de-estudio-de-tiempos',
];

const FORBIDDEN = [
  'Contactar con el profesor', 'se graduó en la Universidad de Harvard',
  'fallecieron en 1924 y 1925', 'muestreo de alta frecuencia', 'En base a',
  'computadora', 'subjetiva', 'por qie', 'quiero otra persona', 'fecuenciales',
  'panatalla', 'datalle', 'visializar', 'solcitará', 'se paciente', 'cáculo',
  'deslizamos el dedo', '8 fases', '100-140', 'Elige como vas', 'Porque utilizar',
  '385 momentos al azar dentro de estos intervalos', 'Black & Decker', 'promedio',
  'monitorear', 'resarcirse', 'menudo tostón....', 'norma británica',
];
const REQUIRED_ANY = [
  'Phillips Exeter', 'Lillian', '1972', 'Highland Park', '480 intervalos',
  'Por qué utilizar', 'cómo vas a medir', '¿Por qué él?', 'valoración sintética',
  'valor minuto', 'escala de valoración aplicada', 'opción de eliminar',
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
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda4-${stamp}.json`;
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
