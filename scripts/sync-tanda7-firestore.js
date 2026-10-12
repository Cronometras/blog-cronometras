#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras — tanda 7 (10 ES + 1 EN).
// Pattern of sync-tanda6-firestore.js: backup previous fields, update
// content/description/keywords (+ topic together with pinned slug — Pitfall O), read-back.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const DOCS = [
  ['es', 'suplementos-fatiga-oit'],
  ['es', 'sistema-bedaux'],
  ['es', 'que-es-gsd-en-ingenieria'],
  ['es', 'que-tipos-de-cronometros-existen'],
  ['es', 'que-es-el-cronometraje-industrial'],
  ['es', 'optimiza-la-productividad-empresarial-con-el-control-de-tiempos-y-el-cronometraje-industrial'],
  ['es', 'por-que-hay-retrasos-en-la-produccion'],
  ['es', 'optimizacion-de-sistemas-productivos-clave-para-la-eficiencia-industrial'],
  ['es', 'prepara-la-automatizacion'],
  ['es', 'que-es-el-estudio-de-tiempos-y-movimientos'],
  ['en', 'ilo-fatigue-allowances-guide'],
];

const FORBIDDEN = [
  'OLTA', 'OIT v4', 'Tribunal de Arbitraje', 'Sobre el autor', 'Miguel Cano',
  'HTTP 200', 'curl', 'verificad', 'Frontmatter', 'Cross-selling', '19 checks',
  'insights', 'capacitación', 'Capacitación', 'promedio', 'computadora', 'Computadora',
  'Key Citations', 'ResearchGate', 'YourArticleLibrary', 'LinkedIn Pulse', 'clubensayos',
  'Yunior', 'High Grade International', 'hermanos Maynard', 'Gilbreth en 1912',
  'Financial Times', 'Bedaux Consulting Company', 'ADAPATACIONES', 'induly.com/app',
  'Nota Detallada', 'Contactar con el profesor', 'YA ESTÁ OBSOLETO', 'wasting',
];
const REQUIRED_ANY = [
  'apreciación sintética', 'apreciaremos el ritmo', 'app de cronoanálisis',
  'Quick, Duncan y Malcolm', 'Chris Heyde', 'General Sewing Data',
  'Maynard, Stegemerten y Schwab', 'Kjell B. Zandin', 'operario medio',
  'fiabilidad del 95 %', 'TS = TN × (1 + Σ suplementos)', 'Caso histórico',
  'version 1', 'PDF, Excel and JSON', 'PDF, Excel o JSON',
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
  for (const [lang, slug] of DOCS) {
    const file = path.join(__dirname, '..', 'src/content/blog', lang, slug + '.mdx');
    const { body, desc, keywords, title } = parseMdx(file);
    const doc = docs.find(d => {
      const f = d.data();
      const s = (f.slug || '').replace(/^(es|en)\//, '');
      return (f.slug === lang + '/' + slug) || s === slug
        || slugify(f.topic) === slug || slugify(f.topic) === slugify(title);
    });
    if (!doc) { missing.push(lang + '/' + slug); continue; }
    before[doc.id] = doc.data();
    const upd = { content: body };
    if (desc) upd.description = desc;
    if (keywords) upd.keywords = keywords;
    if (title && title !== doc.data().topic) {
      if (!doc.data().slug) upd.slug = lang + '/' + slug;
      upd.topic = title;
    }
    await doc.ref.update(upd);
    updated++;
    touched[doc.id] = lang + '/' + slug;
    console.log('updated', doc.id, lang + '/' + slug, 'content', body.length, 'chars', upd.topic ? '+ topic/slug' : '');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda7-${stamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 1));
  console.log('backup ->', backupPath);

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
  console.log('--- required markers (docs tocados):');
  for (const p of REQUIRED_ANY) console.log(' ', p, '=>', (joinedAll.split(p).length - 1), 'hits');
  console.log('updated:', updated, 'missing:', missing);
  console.log(bad === 0 ? 'SYNC+READBACK OK' : 'READBACK FAILED: ' + bad);
})();
