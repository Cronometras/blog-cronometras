// fix-long-descriptions.js
// Trunca descripciones a 110-160 chars (ideal 155) en articulos_cronometras.
// Estrategia: cortar en el último espacio antes de 155 para no dejar palabras cortadas.
// Si el corte cae en medio de palabra, cortar palabra completa + "."
//
// Uso: DRY_RUN=1 node scripts/fix-long-descriptions.js   # solo listar
//      node scripts/fix-long-descriptions.js             # ejecutar

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

const DRY_RUN = process.env.DRY_RUN === '1';
const MAX = 160;
const TARGET = 155;

// Cargar credenciales
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

function smartTruncate(text, target = TARGET, max = MAX) {
  if (!text || text.length <= max) return text;
  // Cortar en target
  let cut = text.slice(0, target);
  // Buscar último espacio para no partir palabra
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 80) {
    cut = cut.slice(0, lastSpace);
  }
  // Quitar puntuación colgante (comas, puntos suspensivos solos)
  cut = cut.replace(/[,;:\s]+$/, '');
  // Añadir punto final si no lo tiene
  if (!/[.!?]$/.test(cut)) cut += '.';
  return cut;
}

async function main() {
  console.log(`[fix-descriptions] Modo: ${DRY_RUN ? 'DRY-RUN' : 'EJECUTAR'}`);
  console.log(`  Target: ${TARGET}c | Max: ${MAX}c\n`);

  const snap = await db.collection('articulos_cronometras').get();
  const targets = [];

  snap.forEach(doc => {
    const data = doc.data();
    const d = data.description;
    if (typeof d === 'string' && d.length > MAX) {
      const lang = (data.slug || '').startsWith('en/') ? 'en' : 'es';
      targets.push({
        id: doc.id,
        slug: data.slug,
        lang,
        oldLen: d.length,
        oldDesc: d,
        newDesc: smartTruncate(d)
      });
    }
  });

  // Distribución por longitud
  const dist = {};
  targets.forEach(t => {
    const bucket = Math.floor(t.oldLen / 20) * 20;
    dist[bucket] = (dist[bucket] || 0) + 1;
  });
  console.log('Distribución de longitudes originales:');
  Object.keys(dist).sort((a, b) => a - b).forEach(b => {
    console.log(`  ${b}-${+b+19}c: ${dist[b]}`);
  });
  console.log();

  console.log(`Encontrados: ${targets.length} docs con description > ${MAX}c\n`);

  if (targets.length === 0) {
    console.log('✅ Nada que arreglar.');
    return;
  }

  // Mostrar muestra
  console.log('Muestra (primeros 8):');
  targets.slice(0, 8).forEach(t => {
    console.log(`  [${t.lang}] ${t.slug}  (${t.oldLen}→${t.newDesc.length}c)`);
    console.log(`    OLD: ${t.oldDesc.slice(0, 100)}...`);
    console.log(`    NEW: ${t.newDesc}`);
    console.log();
  });

  if (!DRY_RUN) {
    console.log('Actualizando...');
    let updated = 0;
    for (const t of targets) {
      await db.collection('articulos_cronometras').doc(t.id).update({
        description: t.newDesc
      });
      updated++;
    }
    console.log(`✅ ${updated} descripciones actualizadas`);
  } else {
    console.log(`🔍 DRY-RUN: ${targets.length} docs serían actualizados`);
  }
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
