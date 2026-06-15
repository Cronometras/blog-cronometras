// scripts/cleanup-orphan-translations.js
// BORRA los 28 docs con migratedFromOrphanES=true que NUNCA se han publicado
// (no aparecen en sitemap, sus URLs devuelven 404).
//
// Safety check: verifica en tiempo real que el doc:
//   1. Existe
//   2. Tiene migratedFromOrphanES=true (NO toca docs mergedFromTranslation, MDX, etc.)
//   3. Su slug NO está en el sitemap actual de producción
//
// Si cualquiera falla, ABORTA para ese doc individual.
//
// IDs verificadas: 2026-06-15 vía /tmp/orphan-check.json (todos no indexados)
//
// Uso:
//   node scripts/cleanup-orphan-translations.js --dry-run    # Solo verifica
//   node scripts/cleanup-orphan-translations.js --execute    # Borra con safety

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// IDs verificadas (28 docs huérfanos sin publicar)
const TO_DELETE = [
  "4qDhZ2UL9j3xx87ctFob", // 7 Common Mistakes When Conducting Industrial Time Studies
  "6nDE1zGjRJL1NJubMcrn", // The Vital Importance of Standard Time Calculation
  "7l6kyb7fdoySMsFRtmo0", // Complete Guide to ILO Fatigue Allowances
  "7uGuk13GiUqLJbThn9vo", // Introduction to Industrial Timekeeping
  "AiRMpjadS8Gez2ALr4IX", // Stages of Time Study in Industrial Timekeeping
  "E9rp4Z4EIU5I70OrCPGC", // Takt Time
  "EUqCORpL1BHFrfxOUOqD", // Optimize Business Productivity
  "HGzQqUzV9iT9u7HQqDGE", // Observed Time vs. Standard Time
  "Hwsss2IJsmev6KPFG1X7", // Introduction to MTM and MOST
  "Iv5tT9jqj7lLqAZzliYV", // Introduction to CRONOMETRAS
  "MXRFEOhRxLud7tVYONim", // Usefulness of Historical Times
  "Mv3HVR8jAYQ4duDDDF2y", // Number of Observations Required
  "NsIhfMBy3rxOzwZWD7LO", // Work Allowance Calculation
  "OwVkLlszgQNwkpchPsJj", // Industrial Timekeeping Techniques
  "UCscaujntEhn2f30JNcI", // Timing the Main Work Cycle
  "WqDcQWms9l6jpIdoPjvo", // 5 Most Used Work Measurement Methods
  "bUP7RnJe9kryUm2FCeAa", // ILO Allowances Application
  "hmzWDmIOSvfS5ZRdKp9M", // Activity Rating in Industrial Timekeeping
  "i6Vbf9BzLqGzLGbgMXwo", // Timekeeping and Process Standardization
  "izJ5H6GOc9oA4CAIntYM", // Importance of Methods and Time Study
  "o05HtRHuMsAG6aHFKuLj", // Saturation Calculation in a Time Study
  "o7OjoEUZEG3Z8jS0tiIm", // The Importance of Work Time Study
  "pTV3X75upygqEYHY2e49", // What is Industrial Timekeeping?
  "qPRotMvvoH6mh2gkFhN7", // How is a Time and Motion Study Conducted with Stopwatch
  "vBNl8RWciqlj72kHZVFh", // Work Sampling: A Statistical Tool
  "vJtM36lCtFrBBkD4s12v", // Best Practices for Work Method Definition
  "zHpjgwlhTZN02wAsOeyv", // Obeya Room: Lean Management Visual System
  "zcjisqvg95KXgPi8Rbxx", // Frequency Element Timing
];

async function fetchSitemap() {
  const res = await fetch("https://cronometras.com/sitemap-0.xml");
  if (!res.ok) throw new Error(`Sitemap HTTP ${res.status}`);
  return await res.text();
}

async function run() {
  const isExecute = process.argv.includes("--execute");
  console.log(`\n${"=".repeat(70)}`);
  console.log(`CLEANUP ORPHAN TRANSLATIONS - ${isExecute ? "🚨 EXECUTE" : "DRY-RUN"}`);
  console.log(`${"=".repeat(70)}\n`);

  // Fetch sitemap una sola vez
  let sitemap = "";
  try {
    sitemap = await fetchSitemap();
    console.log(`Sitemap fetched: ${sitemap.length} bytes`);
  } catch (err) {
    console.log(`⚠️ No pude obtener sitemap, continúo sin esa verificación: ${err.message}`);
  }

  let deleted = 0, skipped = 0, errors = 0, blocked = 0;
  const results = [];

  for (const id of TO_DELETE) {
    const docRef = db.collection("articulos_cronometras").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.log(`  ⏭️  ${id}: ya no existe`);
      skipped++;
      results.push({ id, status: "skipped-already-gone" });
      continue;
    }

    const d = doc.data();
    const slug = d.slug || "";
    const expectedUrl = `https://cronometras.com/en/blog/${slug}/`;

    // Safety 1: debe ser migratedFromOrphanES
    if (!d.migratedFromOrphanES) {
      console.log(`  🚨 SAFETY: ${id} NO es migratedFromOrphanES (es ${d.migratedFromOrphanES ? "true" : "false"}). ABORTO para este doc.`);
      blocked++;
      results.push({ id, status: "BLOCKED-not-orphan", data: { topic: d.topic, slug: d.slug } });
      continue;
    }

    // Safety 2: NO debe estar en el sitemap (NO debe estar indexado)
    if (sitemap && sitemap.includes(expectedUrl)) {
      console.log(`  🚨 SAFETY: ${id} (${slug}) está en el sitemap de producción. NO borro.`);
      blocked++;
      results.push({ id, status: "BLOCKED-indexed", data: { topic: d.topic, slug: d.slug, url: expectedUrl } });
      continue;
    }

    // Safety 3: NO debe tener mergedFromTranslation (eso indica que se fusionó con otro)
    if (d.mergedFromTranslation) {
      console.log(`  🚨 SAFETY: ${id} tiene mergedFromTranslation=true (es un OLD fusionado, no un huérfano). ABORTO.`);
      blocked++;
      results.push({ id, status: "BLOCKED-merged", data: { topic: d.topic, slug: d.slug } });
      continue;
    }

    console.log(`  📄 ${id} | "${(d.topic || "").slice(0, 50)}" | ${(d.content || "").length}c | slug=${slug.slice(0, 50)}`);

    if (isExecute) {
      try {
        await docRef.delete();
        console.log(`     ✅ BORRADO`);
        deleted++;
        results.push({ id, status: "deleted", data: { topic: d.topic, slug: d.slug, contentLen: (d.content || "").length } });
      } catch (err) {
        console.log(`     ❌ ERROR: ${err.message}`);
        errors++;
        results.push({ id, status: "error", error: err.message });
      }
    } else {
      console.log(`     🔍 (dry-run, no delete)`);
      results.push({ id, status: "dry-run", data: { topic: d.topic, slug: d.slug, contentLen: (d.content || "").length } });
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`RESUMEN: deleted=${deleted} skipped=${skipped} blocked=${blocked} errors=${errors}`);
  console.log(`${"=".repeat(70)}`);

  const totalCharsDeleted = results
    .filter(r => r.status === "deleted")
    .reduce((s, r) => s + (r.data?.contentLen || 0), 0);
  console.log(`Total chars eliminados: ${totalCharsDeleted}`);

  fs.writeFileSync("/tmp/orphan-cleanup-report.json", JSON.stringify({
    timestamp: new Date().toISOString(),
    mode: isExecute ? "execute" : "dry-run",
    summary: { deleted, skipped, blocked, errors, totalCharsDeleted },
    details: results,
  }, null, 2));
  console.log(`Reporte guardado en /tmp/orphan-cleanup-report.json`);

  if (isExecute) {
    console.log(`\n${"!".repeat(70)}`);
    console.log(`🚨 EXECUTE COMPLETADO: ${deleted} docs BORRADOS`);
    console.log(`${"!".repeat(70)}`);
  } else {
    console.log(`\nPara ejecutar: añade --execute`);
  }
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
