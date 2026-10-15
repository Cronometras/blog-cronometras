#!/usr/bin/env node
// Barrido final de clase: Firestore (todos los docs) + .mdx del repo.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PATTERNS = [
  ['wright_bad', /I\s*=\s*1\s*[-−]\s*\(\s*1\s*[-−]/],
  ['wright_bad2', /√\s*\(\s*1\s*\+\s*x\s*\)\s*\^?\s*2\s*\+\s*2\s*\*\s*\(\s*N\s*-\s*1\s*\)/],
  ['takt_52', /takt time will be 52|takt.{0,40}52 seconds/i],
  ['android_app', /Android/i],
  ['lms_strings', /See questionnaire|Complete lesson|Restart lesson/],
  ['invented_caps', /Legal Compliance Kit|Timer Pro|AVIX|Blue Card/i],
  ['mtm_hfk', /MTM-HFK/],
  ['tal_expansion', /(Tribunal de Arbitraje|Tribunal Arbitral|Tribunal of Arbitra)/i],
  ['oit_v4', /OIT v4|ILO v4/],
  ['caso_anonimizado', /caso anonimizado|Anonymized Case|Anonymised Case|anonymized case/i],
  ['autor_block', /Sobre el autor|About the Author/i],
  ['meta_verified', /verified (in|with) Python|Verificado HTTP|HTTP 200/i],
];

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const hits = [];
  snap.forEach(doc => {
    const d = doc.data();
    for (const [name, re] of PATTERNS) {
      for (const f of ['content', 'description', 'excerpt', 'topic']) {
        const v = d[f];
        if (typeof v !== 'string') continue;
        const i = v.search(re);
        if (i >= 0) hits.push({ surface: 'fs', id: doc.id, slug: d.slug || '', pat: name, field: f, snippet: v.slice(Math.max(0, i - 60), i + 80).replace(/\n/g, ' ') });
      }
    }
  });
  console.log('=== FIRESTORE hits:', hits.length);
  for (const h of hits) console.log(`- ${h.pat} | ${h.id} | ${h.slug} | ${h.field} | ...${h.snippet}...`);

  // .mdx sweep
  const dirs = ['/home/ubuntu/projects/blog-cronometras/src/content/blog/es', '/home/ubuntu/projects/blog-cronometras/src/content/blog/en'];
  const mdxHits = [];
  for (const dir of dirs) {
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
      const txt = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const [name, re] of PATTERNS) {
        const i = txt.search(re);
        if (i >= 0) mdxHits.push({ surface: 'mdx', file: f, pat: name, snippet: txt.slice(Math.max(0, i - 60), i + 80).replace(/\n/g, ' ') });
      }
    }
  }
  console.log('\n=== MDX hits:', mdxHits.length);
  for (const h of mdxHits) console.log(`- ${h.pat} | ${h.file} | ...${h.snippet}...`);
  fs.writeFileSync('/tmp/tanda9/final_sweep.json', JSON.stringify({ fs: hits, mdx: mdxHits }, null, 2));
  process.exit(0);
})();
