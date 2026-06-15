// check-slug-mdx-vs-fs.js
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
  for (const slug of ['en/usefulness-of-historical-times-for-establishing-work-standards', 'en/rest-at-work-a-comprehensive-approach']) {
    const snap = await db.collection('articulos_cronometras').where('slug', '==', slug).limit(1).get();
    if (snap.empty) {
      console.log(`${slug}: NOT FOUND in Firestore`);
    } else {
      const d = snap.docs[0].data();
      console.log(`${slug}:`);
      console.log(`  Firestore slug: ${d.slug}`);
      console.log(`  description: [${(d.description || '').length}c] ${(d.description || '').slice(0, 100)}`);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
