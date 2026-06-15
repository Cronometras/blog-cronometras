// fix-wpcontent-og-images.js
// Reemplaza URLs /wp-content/ en imageUrl con /images/webp/og-default.png
// en docs de la colección articulos_cronometras.
//
// Uso: node scripts/fix-wpcontent-og-images.js
//      DRY_RUN=1 node scripts/fix-wpcontent-og-images.js  # solo listar

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.env.DRY_RUN === '1';

// Cargar credenciales del archivo de vault
const envContent = fs.readFileSync('/home/ubuntu/.hermes/.env.micaot', 'utf-8');
const start = envContent.indexOf('FIREBASE_SERVICE_ACCOUNT_JSON=') + 'FIREBASE_SERVICE_ACCOUNT_JSON='.length;
let depth = 0, inString = false, escape = false, end = -1;
for (let i = start; i < envContent.length; i++) {
  const ch = envContent[i];
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (ch === '"') { inString = !inString; continue; }
  if (inString) continue;
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
const sa = JSON.parse(envContent.slice(start, end));

initializeApp({ credential: cert(sa) });
const db = getFirestore();

const FALLBACK_IMAGE = '/images/webp/og-default.png';

async function main() {
  console.log(`[fix-wpcontent] Modo: ${DRY_RUN ? 'DRY-RUN' : 'EJECUTAR'}`);
  const snap = await db.collection('articulos_cronometras').get();
  const targets = [];

  snap.forEach(doc => {
    const data = doc.data();
    const iu = String(data.imageUrl || '');
    if (iu.includes('wp-content')) {
      targets.push({ id: doc.id, ...data });
    }
  });

  console.log(`Encontrados: ${targets.length} docs con /wp-content/ en imageUrl\n`);

  if (targets.length === 0) {
    console.log('✅ Nada que arreglar.');
    return;
  }

  for (const t of targets) {
    console.log(`  [${t.lang}] ${t.slug}`);
    console.log(`    id: ${t.id}`);
    console.log(`    title: ${(t.title || t.titulo || '').slice(0, 60)}`);
    console.log(`    OLD imageUrl: ${t.imageUrl}`);
    console.log(`    NEW imageUrl: ${FALLBACK_IMAGE}`);

    if (!DRY_RUN) {
      await db.collection('articulos_cronometras').doc(t.id).update({
        imageUrl: FALLBACK_IMAGE
      });
      console.log(`    ✅ Actualizado`);
    } else {
      console.log(`    🔍 (no aplicado, DRY-RUN)`);
    }
    console.log();
  }

  console.log(DRY_RUN
    ? `🔍 DRY-RUN: ${targets.length} docs serían actualizados`
    : `✅ ${targets.length} docs actualizados con imageUrl → ${FALLBACK_IMAGE}`);
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
