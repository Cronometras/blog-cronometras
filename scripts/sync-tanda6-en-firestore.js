#!/usr/bin/env node
// Sync EN .mdx mirrors -> Firestore articulos_cronometras (docs slug en/*) — tanda 6 (3 artículos EN).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const SLUGS = [
  'ergonomics-from-pain-to-productivity',
  'number-of-observations-required-in-industrial-time-study',
  'obeya-room-lean',
];

const FORBIDDEN = [
  'NIOSH, 2018', 'EU-OSHA, 2019', 'Karwowski et al', 'Li et al', 'Battini et al., 2017',
  'J.M. Juran', 'Airbus', 'Spotify', 'Toyota¹', 'Key Citations', 'ILO formula',
  'used in the CronometrasApp', '50 cycles', '830.4', '19.53',
];
const REQUIRED_ANY = [
  'Journal of Safety Research', 'Journal of Occupational Rehabilitation', 'Takala et al., 2014',
  'Yeow and Sen', 'Battini, Faccio, Persona, and Sgarbossa', 'born at Toyota',
  'own system for calculating the number of observations', '831.2', '19.54',
  'close to one third',
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
    const file = path.join(__dirname, '..', 'src/content/blog/en', slug + '.mdx');
    const { body, desc, keywords, title } = parseMdx(file);
    const doc = docs.find(d => {
      const f = d.data();
      const s = (f.slug || '').replace(/^en\//, '');
      return (f.slug || '').startsWith('en/') && (s === slug || slugify(f.topic) === slug);
    });
    if (!doc) { missing.push(slug); continue; }
    before[doc.id] = doc.data();
    const upd = { content: body };
    if (desc) upd.description = desc;
    if (keywords) upd.keywords = keywords;
    if (title && title !== doc.data().topic) {
      if (!doc.data().slug) upd.slug = 'en/' + slug;
      upd.topic = title;
    }
    await doc.ref.update(upd);
    updated++;
    touched[doc.id] = slug;
    console.log('updated', doc.id, slug, 'content', body.length, 'chars');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda6-en-${stamp}.json`;
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
  console.log('--- required markers:');
  for (const p of REQUIRED_ANY) console.log(' ', p, '=>', (joinedAll.split(p).length - 1), 'hits');
  console.log('updated:', updated, 'missing:', missing);
  console.log(bad === 0 ? 'SYNC+READBACK OK' : 'READBACK FAILED: ' + bad);
})();
