#!/usr/bin/env node
// Escaneo de errores de CLASE en los docs EN de articulos_cronometras
// (espejos de los fixes de la tanda 8). Solo lectura.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PATTERNS = [
  ['wright_bad', /I\s*=\s*1\s*[-−]\s*\(\s*1\s*[-−]/],
  ['wright_variante', /\(\s*1\s*[-−]\s*x\s*\)\s*\^?\s*N/i],
  ['takt_52', /52\s*(seconds|s\b|sec)/i],
  ['mtm_assoc', /MTM Association/i],
  ['mtm_1940_1965', /1940\s*(and|to|-|–|y)\s*1965/i],
  ['most_maynard_1966', /Maynard[^.]{0,80}1966|1966[^.]{0,80}Maynard/i],
  ['most_seqs_bad', /Activity\s*\/\s*Move\s*\/\s*Tool/i],
  ['embry', /Embry/i],
  ['anonymized', /Anonymiz|Anonymis|anonymiz|anonymis/i],
  ['author_block', /About the Author/i],
  ['meta_verified', /verified (in|with) Python|Verified HTTP|HTTP 200|curl -/i],
  ['checkmarks', /[✅❌]/],
  ['olta', /OLTA/i],
  ['tribunal_exp', /Tribunal (de|of) Arbitra/i],
  ['oitv4_article', /OIT v4|ILO v4/i],
  ['android', /Android/i],
  ['benchmark', /benchmark/i],
  ['westinghouse_app', /(Cronometras|CronometrasApp|the app|application)[^.]{0,60}(applies|uses|implements|aplica)[^.]{0,40}Westinghouse/i],
  ['synthetic_inferior', /(inferior|worse|less accurate|outdated)[^.]{0,60}(synthetic|apreciaci|sintéti)|synthetic[^.]{0,40}(inferior|outdated)/i],
  ['fixed_tomas', /1[.,]?111\s*(observations|tomas|takes)|400\s*(observations|tomas)/i],
  ['gen_4796', /47[.,]96|80[.,]02|21[.,]1\s*%/],
];

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
  console.log('total docs', docs.length);
  const en = docs.filter(d => (d.slug || '').startsWith('en/') || (d.lang === 'en'));
  console.log('EN docs (por slug en/ o lang=en):', en.length);
  const out = [];
  for (const d of docs) {
    const fields = ['content', 'topic', 'description', 'excerpt', 'outline', 'researchData'];
    const hits = {};
    for (const f of fields) {
      const v = d[f];
      if (typeof v !== 'string') continue;
      for (const [name, re] of PATTERNS) {
        const m = v.match(re);
        if (m) {
          const i = v.search(re);
          (hits[f] = hits[f] || []).push({ pat: name, snippet: v.slice(Math.max(0, i - 90), i + 110).replace(/\n/g, ' ') });
        }
      }
    }
    if (Object.keys(hits).length) {
      out.push({ id: d.id, slug: d.slug || '', topic: (d.topic || '').slice(0, 80), hits });
    }
  }
  fs.writeFileSync('/tmp/scan_en_clase.json', JSON.stringify(out, null, 2));
  console.log('docs con matches:', out.length);
  for (const o of out) {
    console.log('\n=== ', o.id, '|', o.slug, '|', o.topic);
    for (const [f, arr] of Object.entries(o.hits)) {
      for (const h of arr) console.log(`   [${f}] ${h.pat}: ...${h.snippet}...`);
    }
  }
  process.exit(0);
})();
