// check-current-state.js
// Debug: verificar el estado actual de los 4 docs modificados
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
  const slugs = [
    'es/la-utilidad-de-los-tiempos-historicos-para-establecer-estandares-de-trabajo',
    'en/rest-at-work-a-comprehensive-approach',
    'en/usefulness-of-historical-times-for-establishing-work-standards',
    'es/descanso-en-el-trabajo-un-enfoque-integral',
    'en/stages-of-work-methods-study',
    'en/how-to-create-a-new-work-study',
    'en/accessing-the-app',
    'en/what-is-gsd-in-engineering',
    'en/choose-how-to-measure-work',
  ];
  for (const slug of slugs) {
    const snap = await db.collection('articulos_cronometras').where('slug', '==', slug).limit(1).get();
    if (snap.empty) {
      console.log(`❌ ${slug}: no encontrado`);
      continue;
    }
    const d = snap.docs[0].data();
    console.log(`\n${slug}`);
    console.log(`  imageUrl: ${d.imageUrl || '(none)'}`);
    console.log(`  description: ${(d.description || '').slice(0, 80)}...`);
    console.log(`  description length: ${(d.description || '').length}c`);
  }
})().catch(e => { console.error(e); process.exit(1); });
