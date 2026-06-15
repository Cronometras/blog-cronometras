#!/usr/bin/env node
/**
 * Backfill the `language` field on every doc in articulos_cronometras that
 * doesn't have one. Uses a simple Spanish-vs-English heuristic on the first
 * 500 chars of `content` (falls back to `topic`).
 *
 * Usage:
 *   node scripts/backfill-language.js              # dry-run (default)
 *   node scripts/backfill-language.js --execute   # real update
 *   node scripts/backfill-language.js --force=es   # skip detection, set all to 'es'
 *   node scripts/backfill-language.js --force=en   # skip detection, set all to 'en'
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SA_PATH = path.join(PROJECT_ROOT, 'sa.json');
const COLLECTION = 'articulos_cronometras';

const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const forceArg = args.find(a => a.startsWith('--force='));
const forceLang = forceArg ? forceArg.split('=')[1] : null;

if (!fs.existsSync(SA_PATH)) {
  console.error(`❌ No se encontró ${SA_PATH}`);
  process.exit(1);
}
const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Spanish markers: very common words and diacritics that don't exist in English
const ES_MARKERS = [' de ', ' la ', ' el ', ' los ', ' las ', ' que ', ' con ', ' para ',
  ' por ', ' del ', ' una ', ' en ', ' es ', ' se ', ' no ', ' un ', ' al ', ' lo ',
  ' cómo ', ' más ', ' qué ', ' cuáles ', ' cuáles ', ' también ', ' años ', ' desde ',
  ' hasta ', ' sobre ', ' entre ', ' cuando ', ' donde ', ' muy ', ' sin ', ' pero ',
  ' artículo ', ' sección ', ' capítulo ', ' continuación ', ' aquí ', ' véase ',
  'cronometras', 'método', 'métodos', 'estudio', 'estudios', 'tiempo', 'tiempos',
  'industrial', 'industriales', 'cronometraje', 'cronometrajes', 'trabajo', 'producción',
  'operación', 'proceso', 'procesos', 'ingeniería', 'medición', 'cálculo', 'análisis',
  'herramienta', 'herramientas', 'técnica', 'técnicas', 'sistema', 'sistemas',
  'rendimiento', 'eficiencia', 'productividad', 'optimización', 'mejora'];
const EN_MARKERS = [' the ', ' and ', ' of ', ' to ', ' in ', ' is ', ' it ', ' for ',
  ' with ', ' on ', ' that ', ' as ', ' are ', ' be ', ' this ', ' have ', ' has ',
  ' from ', ' by ', ' you ', ' your ', ' we ', ' our ', ' they ', ' their ',
  ' how ', ' what ', ' which ', ' when ', ' where ', ' why ', ' who ',
  ' study ', ' studies ', ' work ', ' method ', ' methods ', ' time ', ' times ',
  ' industrial ', ' engineering ', ' measurement ', ' analysis ', ' process ', ' processes ',
  ' calculation ', ' tool ', ' tools ', ' technique ', ' techniques ', ' system ', ' systems ',
  ' efficiency ', ' productivity ', ' optimization ', ' improvement '];

function detectLang(text) {
  if (!text) return 'es'; // default to ES (safer for cronometras)
  const sample = text.toLowerCase().substring(0, 500);
  let esScore = 0, enScore = 0;
  for (const m of ES_MARKERS) if (sample.includes(m)) esScore++;
  for (const m of EN_MARKERS) if (sample.includes(m)) enScore++;
  if (forceLang === 'es') return 'es';
  if (forceLang === 'en') return 'en';
  // If very close, default to 'es' for cronometras
  if (enScore > esScore + 1) return 'en';
  return 'es';
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(` Backfill language field en ${COLLECTION}`);
  console.log(` Modo: ${isExecute ? '🔴 EXECUTE' : '🟢 DRY-RUN'}`);
  if (forceLang) console.log(` Force: ${forceLang}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const all = await db.collection(COLLECTION).get();
  console.log(`Total docs: ${all.size}`);

  const toUpdate = [];
  const skipped = [];

  for (const doc of all.docs) {
    const d = doc.data();
    if (d.language !== undefined) {
      skipped.push({ id: doc.id, current: d.language });
      continue;
    }
    const sample = (d.content || d.topic || '').substring(0, 100).replace(/\n/g, ' ');
    const detected = detectLang(d.content || d.topic || '');
    toUpdate.push({ id: doc.id, detected, topic: (d.topic || '').substring(0, 50), sample });
  }

  console.log(`\n✓ Docs con language ya definido: ${skipped.length}`);
  console.log(`✓ Docs a actualizar: ${toUpdate.length}\n`);

  // Distribución
  const byLang = {};
  for (const u of toUpdate) byLang[u.detected] = (byLang[u.detected] || 0) + 1;
  console.log('Distribución detectada:');
  for (const [l, n] of Object.entries(byLang)) console.log(`  ${l}: ${n}`);
  console.log('');

  // Mostrar muestra
  console.log('Sample (10 aleatorios):');
  const sample10 = toUpdate.sort(() => Math.random() - 0.5).slice(0, 10);
  for (const u of sample10) {
    console.log(`  [${u.detected}] ${u.topic}`);
    console.log(`    ${u.sample}...`);
  }
  console.log('');

  if (!isExecute) {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(' 🟢 DRY-RUN: nada escrito. Para ejecutar: --execute');
    console.log('═══════════════════════════════════════════════════════════════════');
    process.exit(0);
  }

  console.log('Ejecutando update...');
  let ok = 0, fail = 0;
  for (const u of toUpdate) {
    try {
      await db.collection(COLLECTION).doc(u.id).update({ language: u.detected });
      ok++;
    } catch (e) {
      console.log(`  ❌ ${u.id}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\n✅ Actualizados: ${ok}  ❌ Fallos: ${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error('💥', e); process.exit(1); });
