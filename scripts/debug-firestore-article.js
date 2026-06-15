// debug-firestore-article.js
// Debug profundo: leer artículo exacto de Firestore
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const env = fs.readFileSync('/home/ubuntu/.hermes/.env.micaot', 'utf-8');
const start = env.indexOf('FIREBASE_SERVICE_ACCOUNT_JSON=') + 'FIREBASE_SERVICE_ACCOUNT_JSON='.length;
let depth = 0, inString = false, escape = false, end = -1;
for (let i = start; i < env.length; i++) {
  const ch = env[i];
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (ch === '"') { inString = !inString; continue; }
  if (inString) continue;
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
const sa = JSON.parse(env.slice(start, end));

initializeApp({ credential: cert(sa) });
const db = getFirestore();

(async () => {
  const slug = 'en/stages-of-work-methods-study';
  const snap = await db.collection('articulos_cronometras').where('slug', '==', slug).limit(1).get();
  const d = snap.docs[0].data();
  console.log('All fields of this doc:');
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === 'string') {
      console.log(`  ${k} [${v.length}c]: ${v.slice(0, 100)}`);
    } else {
      console.log(`  ${k}: ${JSON.stringify(v).slice(0, 100)}`);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
