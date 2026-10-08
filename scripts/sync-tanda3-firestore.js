#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras for the articles
// revised in this batch. Updates content / description / keywords where present.
// Usage: node scripts/sync-tanda3-firestore.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const SLUGS = [
  'como-estandarizar-los-tiempos-de-trabajo-en-la-industria',
  'como-mejorar-la-eficiencia-y-la-eficacia-del-proceso-industrial-mediante-la-simplificacion-de-tareas',
  'como-reducir-el-tiempo-de-entrega-para-mejorar-la-productividad-competitividad-y-eficiencia-de-su-empresa',
  'como-se-realiza-un-estudio-de-tiempos-y-movimientos-con-cronometro',
  'cronometraje-de-elementos-frecuenciales',
  'cronometraje-de-tiempos-de-maquina',
  'cronometraje-y-la-estandarizacion-de-procesos',
  'cronometrando-el-ciclo-de-trabajo',
  'cuales-son-las-fases-de-un-proceso-industrial',
  'cuales-son-las-tecnicas-de-cronometraje-industrial',
  'metodos-y-tiempos-en-la-gestion-empresarial-industrial',
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

  let updated = 0, missing = [];
  for (const slug of SLUGS) {
    const file = path.join(__dirname, '..', 'src/content/blog/es', slug + '.mdx');
    const { body, desc, keywords, title } = parseMdx(file);
    const doc = docs.find(d => {
      const f = d.data();
      const s = (f.slug || '').replace(/^es\//, '');
      return s === slug || f.topic === title || slugify(f.topic) === slug || slugify(f.topic) === slugify(title);
    });
    if (!doc) { missing.push(slug); continue; }
    before[doc.id] = doc.data();
    const upd = { content: body };
    if (desc) upd.description = desc;
    if (keywords) upd.keywords = keywords;
    await doc.ref.update(upd);
    updated++;
    console.log('updated', doc.id, slug, 'content', body.length, 'chars');
  }
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda3-2026-10-08.json', JSON.stringify(before, null, 1));
  console.log('updated:', updated, 'missing:', missing);
})();
