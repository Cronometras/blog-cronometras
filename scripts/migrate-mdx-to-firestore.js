#!/usr/bin/env node
/**
 * Migrate MDX files from src/content/blog/{es,en}/ to Firestore collection
 * 'articulos_cronometras' in project 'micaot-com'.
 *
 * Usage:
 *   node scripts/migrate-mdx-to-firestore.js              # dry-run (default)
 *   node scripts/migrate-mdx-to-firestore.js --execute   # real upload
 *   node scripts/migrate-mdx-to-firestore.js --lang=es    # only one language
 *   node scripts/migrate-mdx-to-firestore.js --help
 *
 * Idempotent: skips docs whose topicId already exists in Firestore.
 * Run --execute multiple times safely.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

// ============================================================================
// CLI args
// ============================================================================
const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const isHelp = args.includes('--help') || args.includes('-h');
const langArg = args.find(a => a.startsWith('--lang='));
const onlyLang = langArg ? langArg.split('=')[1] : null;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'src/content/blog');
const SA_PATH = path.join(PROJECT_ROOT, 'sa.json');
const COLLECTION = 'articulos_cronometras';

if (isHelp) {
  console.log(`
MDX → Firestore migrator

Usage:
  node scripts/migrate-mdx-to-firestore.js              # dry-run (default)
  node scripts/migrate-mdx-to-firestore.js --execute   # real upload
  node scripts/migrate-mdx-to-firestore.js --lang=es    # only one language
  node scripts/migrate-mdx-to-firestore.js --help       # this help

Dry-run prints the diff without touching Firestore. Use --execute to actually write.
`);
  process.exit(0);
}

// ============================================================================
// Parse one MDX file
// ============================================================================
function parseMDX(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const lines = raw.split('\n');

  // Find first --- (opening) and second --- (closing)
  let openIdx = -1, closeIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 50); i++) {
    if (lines[i].trim() === '---') {
      if (openIdx === -1) openIdx = i;
      else { closeIdx = i; break; }
    }
  }
  if (openIdx === -1 || closeIdx === -1) {
    return { error: 'no se encontró frontmatter válido (--- ... ---)' };
  }

  const fmText = lines.slice(openIdx + 1, closeIdx).join('\n');
  const body = lines.slice(closeIdx + 1).join('\n').trim();

  // Parse YAML manually (simple key: value, no nested structures except tags)
  const data = {};
  let i = 0;
  const fmLines = fmText.split('\n');
  while (i < fmLines.length) {
    const line = fmLines[i];
    const m = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      // Quoted string?
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      } else if (val.startsWith('[')) {
        // List - collect until ]
        const items = [];
        let acc = val;
        while (!acc.includes(']') && i < fmLines.length - 1) {
          i++;
          acc += '\n' + fmLines[i];
        }
        const inner = acc.slice(1, acc.indexOf(']'));
        items.push(...inner.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean));
        val = items;
      }
      data[key] = val;
    }
    i++;
  }

  return { data, body, raw };
}

// ============================================================================
// Topic ID: stable hash from lang + slug
// ============================================================================
function topicIdFor(lang, slug) {
  return crypto.createHash('sha1').update(`migrated-mdx:${lang}:${slug}`).digest('hex').substring(0, 16);
}

// ============================================================================
// Build the Firestore doc from MDX
// ============================================================================
function buildDoc(lang, slug, mdx) {
  const { data, body } = mdx;
  const topic = data.title || slug;
  // Use slug as base for slugify-like. The existing Firestore articles use slugify(topic).
  // For migrated MDX we want to PRESERVE the existing URL (which uses the MDX filename).
  // So we use the MDX filename as the slug suffix.
  const fecha = data.pubDate ? new Date(data.pubDate) : new Date();
  const createdAt = isNaN(fecha.getTime()) ? Date.now() : fecha.getTime();

  // Map MDX fields to Firestore schema
  return {
    status: 'completed',
    categoria: data.category || 'General',
    draft: false,
    projectId: 'cronometras',
    topicId: topicIdFor(lang, slug),
    topic,
    outline: `# Outline (migrated from MDX)\n\n## H1: ${topic}\n\n## Meta description\n${data.description || ''}\n\n## Fuente\nMigrado desde src/content/blog/${lang}/${slug}.mdx`,
    createdAt,
    imageUrl: data.heroImage || '/images/webp/cronometras-app.webp',
    keywords: Array.isArray(data.tags) ? data.tags : [],
    researchData: `# Migrado desde MDX local\n\nSlug: ${lang}/${slug}\nFecha original: ${data.pubDate || 'desconocida'}`,
    content: body,
    // ─── Custom fields (no chocan con los del generador) ───
    migratedFromMDX: true,
    language: lang,
    slug: `${lang}/${slug}`,
    needsSpanishTranslation: lang === 'en' && false, // se actualiza después
  };
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(` MDX → Firestore migrator`);
  console.log(` Modo: ${isExecute ? '🔴 EXECUTE (escribe en Firestore)' : '🟢 DRY-RUN (solo muestra diff)'}`);
  console.log(` Colección: ${COLLECTION}`);
  console.log(` Idioma: ${onlyLang || 'TODOS (es + en)'}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // 1. Load Firebase Admin
  if (!fs.existsSync(SA_PATH)) {
    console.error(`❌ No se encontró ${SA_PATH}`);
    process.exit(1);
  }
  const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  console.log(`✓ Service account: ${sa.project_id} (${sa.client_email})`);

  if (isExecute) {
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  } else {
    // En dry-run no inicializamos el SDK completo (es pesado). Usamos un mock.
    // Pero para listar existentes SÍ lo necesitamos. Lo inicializamos siempre.
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  const db = admin.firestore();

  // 2. List existing docs in collection (to be idempotent)
  const existingSnap = await db.collection(COLLECTION).get();
  const existingByTopicId = new Map();
  for (const doc of existingSnap.docs) {
    const d = doc.data();
    if (d.topicId) existingByTopicId.set(d.topicId, doc.id);
  }
  console.log(`✓ Docs existentes en ${COLLECTION}: ${existingSnap.size}`);
  console.log(`  Con topicId conocido: ${existingByTopicId.size}\n`);

  // 3. Find all MDX files
  const langs = onlyLang ? [onlyLang] : ['es', 'en'];
  const mdxFiles = [];
  for (const lang of langs) {
    const dir = path.join(BLOG_DIR, lang);
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  No existe directorio ${dir}`);
      continue;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).sort();
    for (const f of files) {
      mdxFiles.push({ lang, slug: f.replace(/\.mdx$/, ''), path: path.join(dir, f) });
    }
  }
  console.log(`✓ MDX encontrados: ${mdxFiles.length} (${langs.join(' + ')})\n`);

  // 4. First pass: parse all MDX to extract titles
  for (const m of mdxFiles) {
    const mdx = parseMDX(m.path);
    if (!mdx.error) {
      m._title = mdx.data.title || m.slug;
    }
  }

  // 5. Cross-reference: detect EN orphans (no ES pair).
  // Strategy: compare by normalized title (first 5 significant words, lowercase, no accents)
  // since EN and ES have different (translated) slugs but similar titles.
  // NOTE: This is a HEURISTIC. Cross-language title similarity is imperfect. The
  // flagged 'orphans' are CANDIDATES for translation. After migration, review
  // the list in Firestore console and set needsSpanishTranslation correctly
  // for any false positives.
  function normalizeForCompare(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'how', 'what', 'que', 'los', 'las', 'del', 'una', 'por', 'con', 'para', 'sobre', 'from'].includes(w))
      .slice(0, 5)
      .join(' ');
  }
  const esTitles = new Set(
    mdxFiles.filter(f => f.lang === 'es').map(f => normalizeForCompare(f._title || ''))
  );
  for (const f of mdxFiles) {
    if (f.lang === 'en' && f._title && !esTitles.has(normalizeForCompare(f._title))) {
      f.isOrphan = true;
    }
  }
  const orphans = mdxFiles.filter(f => f.isOrphan);
  console.log(`✓ EN huérfanos (sin par ES por título normalizado): ${orphans.length}`);
  for (const o of orphans) {
    console.log(`    - ${o.lang}/${o.slug}.mdx  ("${o._title}")`);
  }
  console.log('');

  // 6. Second pass: process each MDX
  const results = { toCreate: [], toSkip: [], errors: [] };
  for (const m of mdxFiles) {
    const mdx = parseMDX(m.path);
    if (mdx.error) {
      results.errors.push({ ...m, error: mdx.error });
      continue;
    }
    const doc = buildDoc(m.lang, m.slug, mdx);
    if (m.isOrphan) doc.needsSpanishTranslation = true;

    if (existingByTopicId.has(doc.topicId)) {
      const existingId = existingByTopicId.get(doc.topicId);
      results.toSkip.push({ ...m, topicId: doc.topicId, existingDocId: existingId });
    } else {
      results.toCreate.push({ ...m, doc });
    }
  }

  // 6. Print summary
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(' RESUMEN');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(` Total MDX procesados:     ${mdxFiles.length}`);
  console.log(`   - ES:                  ${mdxFiles.filter(m => m.lang === 'es').length}`);
  console.log(`   - EN:                  ${mdxFiles.filter(m => m.lang === 'en').length}`);
  console.log(`   - EN huérfanos (candidatos para traducir):  ${orphans.length}`);
  console.log(` Errores de parseo:        ${results.errors.length}`);
  console.log(` Ya existen en Firestore:  ${results.toSkip.length}  (no se tocan)`);
  console.log(` A crear en Firestore:     ${results.toCreate.length}`);
  console.log(` Distribución por idioma de los que se crearán:`);
  const toCreateByLang = {};
  for (const c of results.toCreate) toCreateByLang[c.lang] = (toCreateByLang[c.lang] || 0) + 1;
  for (const [l, n] of Object.entries(toCreateByLang)) console.log(`   - ${l}: ${n}`);
  console.log('');

  if (results.errors.length) {
    console.log('─── ERRORES DE PARSEO ───');
    for (const e of results.errors) {
      console.log(`  ❌ ${e.lang}/${e.slug}.mdx: ${e.error}`);
    }
    console.log('');
  }

  if (results.toSkip.length) {
    console.log('─── YA EXISTEN (se omiten) ───');
    for (const s of results.toSkip) {
      console.log(`  ⏭  ${s.lang}/${s.slug}.mdx  →  doc existente: ${s.existingDocId}`);
    }
    console.log('');
  }

  // 7. Show first 3 docs in detail (sample)
  if (results.toCreate.length) {
    console.log('─── SAMPLE DE 3 DOCS QUE SE CREARÍAN ───');
    for (const c of results.toCreate.slice(0, 3)) {
      console.log(`\n  📄 ${c.lang}/${c.slug}.mdx → docId auto (Firestore lo asigna)`);
      const d = { ...c.doc };
      // Truncar campos largos para legibilidad
      if (d.content && d.content.length > 200) d.content = d.content.substring(0, 200) + '... [' + d.content.length + ' chars]';
      if (d.outline && d.outline.length > 200) d.outline = d.outline.substring(0, 200) + '... [' + d.outline.length + ' chars]';
      if (d.researchData && d.researchData.length > 200) d.researchData = d.researchData.substring(0, 200) + '... [' + d.researchData.length + ' chars]';
      console.log('     ' + JSON.stringify(d, null, 2).split('\n').join('\n     '));
    }
    console.log('\n  ... y ' + (results.toCreate.length - 3) + ' más.\n');
  }

  // 8. Execute
  if (isExecute) {
    if (results.toCreate.length === 0) {
      console.log('✅ Nada que crear. Ya estaban todos subidos.');
      process.exit(0);
    }
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(` 🚀 EJECUTANDO: subiendo ${results.toCreate.length} docs a Firestore...`);
    console.log('═══════════════════════════════════════════════════════════════════\n');

    let created = 0, failed = 0;
    for (const c of results.toCreate) {
      try {
        const ref = await db.collection(COLLECTION).add(c.doc);
        console.log(`  ✅ ${c.lang}/${c.slug}.mdx → ${ref.id}`);
        created++;
      } catch (e) {
        console.log(`  ❌ ${c.lang}/${c.slug}.mdx → ERROR: ${e.message}`);
        failed++;
      }
    }
    console.log(`\n✅ Creados: ${created}  ❌ Fallos: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
  } else {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(' 🟢 DRY-RUN: no se ha escrito nada en Firestore.');
    console.log(' Para ejecutar de verdad, pasa --execute');
    console.log('═══════════════════════════════════════════════════════════════════');
    process.exit(0);
  }
}

main().catch(e => {
  console.error('💥 Error fatal:', e);
  process.exit(1);
});
