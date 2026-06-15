#!/usr/bin/env node
/**
 * Upload the 22 translated EN orphan articles to Firestore as new ES docs.
 * Each ES doc is linked to its EN original via `enSlug` field.
 *
 * Usage:
 *   node scripts/upload-es-translations.js
 *   node scripts/upload-es-translations.js --dry-run
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SA_PATH = path.join(__dirname, '..', 'sa.json');
const TRANSLATIONS_PATH = '/tmp/translations_to_upload.json';

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const sa = require(SA_PATH);
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  const db = admin.firestore();

  const translations = JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf-8'));
  console.log(`📝 Cargadas ${translations.length} traducciones`);
  if (DRY_RUN) console.log('🟢 DRY-RUN: no se escribe nada\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const t of translations) {
    // Determinar el ID: usar hash estable basado en el slug ES
    const topicId = 'es-' + require('crypto')
      .createHash('sha1')
      .update('migrated-mdx:es:' + t.es_slug)
      .digest('hex')
      .substring(0, 16);

    // Verificar si ya existe
    const existing = await db.collection('articulos_cronometras')
      .where('slug', '==', t.es_slug)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`  ⏭️  Ya existe: ${t.es_slug}`);
      skipped++;
      continue;
    }

    // Construir el doc
    const doc = {
      status: 'completed',
      categoria: 'Técnicas especializadas y metodologías avanzadas',
      draft: false,
      projectId: 'cronometras',
      topicId: topicId,
      topic: t.es_topic,
      outline: '# Traducido y resumido del artículo original en inglés (huérfano i18n).',
      createdAt: Date.now(),
      imageUrl: '/images/webp/og-default.png',
      keywords: [],
      researchData: `# Traducido del original en inglés\n\nSlug EN original: ${t.en_slug}\n\nEste artículo es un resumen técnico en español del artículo completo en inglés. Se ha generado automáticamente a partir del contenido original para garantizar que el blog tenga cobertura en ambos idiomas.`,
      content: t.es_content,
      // ── Custom fields (no chocan con los del generador) ──
      migratedFromMDX: true,
      migratedFromOrphanEN: true,
      language: 'es',
      slug: t.es_slug,
      enSlug: t.en_slug,
      needsSpanishTranslation: false,
      isTranslationSummary: true,
    };

    if (DRY_RUN) {
      console.log(`  [DRY] Crearía: ${t.es_slug}`);
      console.log(`         topic: ${t.es_topic.substring(0, 60)}...`);
      console.log(`         content: ${t.es_content.length} chars`);
    } else {
      try {
        await db.collection('articulos_cronometras').doc(topicId).set(doc);
        console.log(`  ✅ Creado: ${t.es_slug}`);
        created++;
      } catch (e) {
        console.log(`  ❌ Error: ${t.es_slug} - ${e.message}`);
        errors++;
      }
    }
  }

  console.log('\n═══════════════════════════════════════');
  if (DRY_RUN) {
    console.log(` DRY-RUN SUMMARY:`);
    console.log(`   Total: ${translations.length}`);
    console.log(`   To create: ${translations.length - skipped}`);
    console.log(`   Already exist: ${skipped}`);
  } else {
    console.log(` UPLOAD SUMMARY:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Errors: ${errors}`);
  }
  console.log('═══════════════════════════════════════');

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
