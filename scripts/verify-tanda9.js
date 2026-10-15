#!/usr/bin/env node
// Read-back tanda 9 + barrido de clase sobre TODOS los docs (ES+EN).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = [
  'articulo-27-cronoanalisis-cooperativas-a', 'articulo-8-cronoanalisis-mantenimiento-s',
  'articulo-17-cronoanalisis-envasado-bebid', 'articulo-5-cronoanalisis-mantenimiento-a',
  'articulo-6-cronoanalisis-mantenimiento-f', 'articulo-19-cronoanalisis-paradas-progra',
  'es-61d83b28a4e19514', 'es-9072627a5c8d598e', 'es-516d621d0343c3c6', 'es-91bd9e5fbb40eae7',
];

const CLASS_PATTERNS = [
  ['tal_expansion', /(Tribunal de Arbitraje|Tribunal Arbitral|Tribunal of Arbitra)/i],
  ['oit_v4', /OIT v4|ILO v4/],
  ['mtm_hfk', /MTM-HFK/],
  ['meta_verificable', /Dato clave verificable/],
  ['modulo_inventado', /Frecuencial Module|Layout Analyzer/],
  ['tablas_dinamicas', /tablas dinámicas|PivotTable|pivot table/i],
  ['wright_bad', /I\s*=\s*1\s*[-−]\s*\(\s*1\s*[-−]/],
  ['westinghouse_field', /Skill\s*[×x\*]\s*Effort/],
  ['android_app', /Android/i],
  ['caso_anonimizado', /caso anonimizado|Anonymized Case|Anonymised Case|anonymized case/i],
  ['autor_block', /Sobre el autor|About the Author/i],
  ['mtm_assoc_1940', /MTM Association[^.]{0,60}1940|1940[^.]{0,60}MTM Association/],
  ['maynard_solo', /H\.?\s?B\.?\s*Maynard,\s*1948/],
];

(async () => {
  // ---- Read-back de los 10 docs ----
  let okDocs = 0;
  for (const id of IDS) {
    const snap = await db.collection('articulos_cronometras').doc(id).get();
    const d = snap.data();
    const problems = [];
    for (const [name, re] of CLASS_PATTERNS) {
      for (const f of ['content', 'description', 'excerpt', 'topic']) {
        const v = d[f];
        if (typeof v === 'string' && re.test(v)) problems.push(`${name}@${f}`);
      }
    }
    if (problems.length === 0) { okDocs++; console.log('OK  ', id); }
    else console.log('WARN', id, problems.join(', '));
  }
  console.log('docs limpios:', okDocs, '/', IDS.length);

  // ---- Barrido de clase sobre todos los docs ----
  const snap = await db.collection('articulos_cronometras').get();
  const hits = [];
  snap.forEach(doc => {
    const d = doc.data();
    for (const [name, re] of CLASS_PATTERNS) {
      for (const f of ['content', 'description', 'excerpt', 'topic']) {
        const v = d[f];
        if (typeof v !== 'string') continue;
        const m = v.match(re);
        if (m) {
          const i = v.search(re);
          hits.push({ id: doc.id, slug: d.slug || '', pat: name, field: f, snippet: v.slice(Math.max(0, i - 70), i + 90).replace(/\n/g, ' ') });
        }
      }
    }
  });
  console.log('\n=== BARRIDO DE CLASE (todos los docs) ===');
  console.log('hits:', hits.length);
  for (const h of hits) console.log(`- ${h.pat} | ${h.id} | ${h.slug} | ${h.field} | ...${h.snippet}...`);
  fs.writeFileSync('/tmp/tanda9/class_sweep_after.json', JSON.stringify(hits, null, 2));
  process.exit(0);
})();
