// sync-descriptions-from-mdx.js
// Para los 3 docs de Firestore sin `description`, añadir una curada.
// Source: MDX frontmatter o nueva descripción si MDX no la tiene.
//
// Slugs:
//   es/la-utilidad-de-los-tiempos-historicos-para-establecer-estandares-de-trabajo
//   en/usefulness-of-historical-times-for-establishing-work-standards
//   es/descanso-en-el-trabajo-un-enfoque-integral
//
// Uso: DRY_RUN=1 node scripts/sync-descriptions-from-mdx.js
//      node scripts/sync-descriptions-from-mdx.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const DRY_RUN = process.env.DRY_RUN === '1';

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

// Descriptions curadas (max 160c, ideal 145c)
const descriptions = {
  'es/la-utilidad-de-los-tiempos-historicos-para-establecer-estandares-de-trabajo':
    'Método de tiempos históricos para establecer estándares de tiempo en tareas repetitivas: ventajas, desventajas y aplicaciones en manufactura y servicios.',
  'en/usefulness-of-historical-times-for-establishing-work-standards':
    'Determining time standards for repetitive tasks is crucial. Use of historical time data from past work is one of the simplest approaches to measuring work.',
  'es/descanso-en-el-trabajo-un-enfoque-integral':
    'Importancia del descanso laboral para productividad, salud y seguridad. Marco normativo, criterios técnicos NTP 916 y gestión integral en Cronometras.',
};

(async () => {
  console.log(`[sync-descriptions] Modo: ${DRY_RUN ? 'DRY-RUN' : 'EJECUTAR'}\n`);

  for (const [slug, desc] of Object.entries(descriptions)) {
    if (desc.length > 160) {
      console.error(`  ❌ description > 160c (${desc.length}c) para ${slug}: ${desc}`);
      continue;
    }
    const snap = await db.collection('articulos_cronometras').where('slug', '==', slug).limit(1).get();
    if (snap.empty) {
      console.log(`  ❌ No encontrado: ${slug}`);
      continue;
    }
    const doc = snap.docs[0];
    const oldDesc = doc.data().description || '(empty)';
    console.log(`  ${slug}`);
    console.log(`    id: ${doc.id}`);
    console.log(`    OLD description: ${oldDesc.length}c "${oldDesc.slice(0, 60)}..."`);
    console.log(`    NEW description: ${desc.length}c "${desc}"`);

    if (!DRY_RUN) {
      await doc.ref.update({ description: desc });
      console.log(`    ✅ Actualizado`);
    } else {
      console.log(`    🔍 (no aplicado, DRY-RUN)`);
    }
    console.log();
  }

  console.log(DRY_RUN
    ? `🔍 DRY-RUN: 3 docs serían actualizados`
    : `✅ 3 docs actualizados con description curada`);
})().catch(e => { console.error('❌ Error:', e); process.exit(1); });
