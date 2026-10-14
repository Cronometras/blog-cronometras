#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras — tanda 8 (4 ES).
// Pattern of sync-tanda7-firestore.js: backup previous fields, update
// content/description/keywords (+ topic together with pinned slug — Pitfall O), read-back.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const DOCS = [
  ['es', 'takt-time-que-es-como-se-calcula-y-como-se-aplica'],
  ['es', 'tiempo-observado-vs-tiempo-estandar'],
  ['es', 'toma-de-tiempos-con-cronometro'],
  ['es', 'trabajos-hombre-maquina-como-calcular-y-minimizar-las-interferencias-guia-practica-y-metodos-eficaces'],
];

const FORBIDDEN = [
  'OLTA', 'OIT v4', 'Tribunal de Arbitraje', 'Sobre el autor', 'Miguel Cano',
  'HTTP 200', 'curl', 'verificad', 'Frontmatter', 'Cross-selling', '19 checks',
  'Key Citations', 'ResearchGate', 'LinkedIn Pulse', 'anonimizad', '批准',
  'induly.com/app', 'Westinghouse)', 'I = 1 - (1 - x)^N', '47,96', '21,1%',
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
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda8-mdx-${stamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 1));
  console.log('backup ->', backupPath);

  let bad = 0;
  for (const [id, slug] of Object.entries(touched)) {
    const f = (await coll.doc(id).get()).data();
    const text = [f.content || '', f.description || '', (f.keywords || []).join(' '), f.topic || ''].join('\n');
    const hits = FORBIDDEN.filter(p => text.includes(p));
    console.log('readback', id, slug, '| content', (f.content || '').length, 'chars | forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  console.log('updated:', updated, 'missing:', missing.join(',') || 'none');
  console.log(bad === 0 ? 'SYNC+READBACK OK' : 'READBACK FAILED: ' + bad);
  process.exit(bad === 0 ? 0 : 1);
})();
