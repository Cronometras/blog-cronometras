#!/usr/bin/env node
// Sync repo .mdx (canonical) -> Firestore articulos_cronometras — tanda 6 (10 artículos ES).
// Same pattern as sync-tanda5-firestore.js: backup previous fields, update
// content/description/keywords (+ topic together with pinned slug — Pitfall O), read-back.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const SLUGS = [
  'la-ergonomia-del-dolor-a-la-productividad',
  'la-importancia-del-estudio-de-tiempos-de-trabajo',
  'la-utilidad-de-los-tiempos-historicos-para-establecer-estandares-de-trabajo',
  'medicion-de-tiempos-de-trabajo',
  'medir-sin-metodo-preestablecido-crono-seguido',
  'mejores-practicas-metodo-trabajo',
  'metodos-y-tiempos-en-la-gestion-empresarial-industrial',
  'numero-de-observaciones-a-realizar-en-un-cronometraje-industrial',
  'obeya-room-lean',
  'objetivos-del-estudio-del-trabajo',
];

const FORBIDDEN = [
  'promedio', 'OLTA', 'OIT v4', 'Tribunal de Arbitraje', 'Sobre el autor', 'Miguel Cano',
  'HTTP 200', 'curl', 'verificad', 'Frontmatter', 'Cross-selling', '19 checks',
  'insights', 'capacitación', 'Capacitación', 'feedback', 'brainstorming',
  'operador promedio', 'Juran', 'Airbus', 'Spotify', 'NIOSH, 2018', 'EU-OSHA, 2019',
  'Karwowski', 'Li et al', 'Battini et al., 2017', 'induly.com/app',
  'ADAPATACIONES', 'inicailes', 'Transtornos', 'Key Citations', 'wasting de materials',
];
const REQUIRED_ANY = [
  'operario medio', 'Caso Práctico Simulado', 'Journal of Safety Research',
  'Journal of Occupational Rehabilitation', 'Takala et al., 2014', 'PERT',
  'Yeow y Sen', 'Battini, Faccio, Persona y Sgarbossa', 'media representativa',
  'MTM-1 (movimientos elementales)', 'app de cronoanálisis', 'apreciaremos el ritmo',
  '¿Cómo editar', 'información valiosa', '4,42', '831,2', 'toques', 'tormenta de ideas',
  'La herramienta nació en Toyota', 'formación y desarrollo', 'retroalimentación constructiva',
  'fiabilidad del 95 %', 'propio sistema de cálculo del número de observaciones',
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
      if (!doc.data().slug) upd.slug = 'es/' + slug;
      upd.topic = title;
    }
    await doc.ref.update(upd);
    updated++;
    touched[doc.id] = slug;
    console.log('updated', doc.id, slug, 'content', body.length, 'chars', upd.topic ? '+ topic/slug' : '');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda6-${stamp}.json`;
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
