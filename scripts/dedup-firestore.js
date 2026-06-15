// scripts/dedup-firestore.js
// Script idempotente de limpieza de duplicados en Firestore.
// FASE 1: Borra 37 EN duplicados de MIGRATION
// FASE 2: Borra 1 ES legacy duplicado
//
// IDs generadas desde /tmp/duplicates-analysis.json (sesión 2026-06-15)
//
// Uso:
//   node scripts/dedup-firestore.js --dry-run    # Solo muestra el plan
//   node scripts/dedup-firestore.js --execute    # Borra con verificación previa
//   node scripts/dedup-firestore.js --phase=1    # Solo fase 1
//   node scripts/dedup-firestore.js --phase=2    # Solo fase 2

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// IDs REALES (20 chars) - leídas de Firestore via scripts/get-real-ids.js
const TO_DELETE = {
  phase1: [
    // 37 EN migrados duplicados (verificados de Firestore)
    { id: "VDV3WNFr5RdboM8PA1nn", slug: "en/machine-time-measurement" },
    { id: "MWDNgW6ZXVLt09kE3SvU", slug: "en/work-method-design" },
    { id: "leS0FF0LckApMsFD2LNj", slug: "en/why-are-there-delays-in-production" },
    { id: "2GH9xPDaDNIG61FkkTrX", slug: "en/stages-of-work-methods-study" },
    { id: "2nyNHArASdzOtRBTZoHv", slug: "en/identification-of-work-to-measure" },
    { id: "tQYwnnACg6AL9yRZyYT0", slug: "en/define-the-work-method" },
    { id: "phhiUyvRDnqTxQk0ZuuW", slug: "en/time-measurement-with-stopwatch" },
    { id: "aCzrKOwl3kaE1cfuQgM9", slug: "en/line-balancing-optimizing-efficiency-in-manufacturing-processes" },
    { id: "CXbNCsnoyvgLU7iZ7nSM", slug: "en/work-study" },
    { id: "Xg8PISIBABUI8iIpZOle", slug: "en/tools-needed-for-time-study" },
    { id: "NI7vrNaIxMrQAJrkmMsO", slug: "en/obeya-room-lean" },
    { id: "vnR5aBrQucqP6VlysDlb", slug: "en/application-of-ilo-allowances" },
    { id: "lqujDFf6vJoL0p8sy6XL", slug: "en/prepare-automation" },
    { id: "EMslKYEr73i2zKBgccyE", slug: "en/how-to-create-a-new-work-study" },
    { id: "FpGZfBX03udC6gMMQzfe", slug: "en/calculating-the-optimal-number-of-machines-for-an-operator" },
    { id: "Gm8gFzj3r3oIlwtRypEl", slug: "en/defining-work-elements-in-a-time-study-with-stopwatch" },
    { id: "UXBnUj2OeRcOBrypcpXS", slug: "en/work-time-measurement" },
    { id: "tnVVb5oEaQRJbtK3ykKK", slug: "en/ergonomics-from-pain-to-productivity" },
    { id: "wBrRUQg8iu0AcIEkiorU", slug: "en/choose-how-to-measure-work" },
    { id: "IvGst6ezC1v3GV3WT9Sk", slug: "en/methods-and-times-in-industrial-business-management" },
    { id: "TCRpEPWXy0dZXmjFX8v1", slug: "en/how-to-standardize-work-times-in-industry" },
    { id: "Lg22h7zT5wSFLovCTlGo", slug: "en/objectives-of-work-study" },
    { id: "eYit5CgUUeGxbGs9vw2I", slug: "en/comprehensive-time-study-management" },
    { id: "Rj1ORthQstWgppHccSQV", slug: "en/accessing-the-app" },
    { id: "QV4HCPzzrMgOy0oQf2qs", slug: "en/what-are-the-phases-of-an-industrial-process" },
    { id: "OYLqosgEiJEzWSywIwkX", slug: "en/rest-at-work-a-comprehensive-approach" },
    { id: "PknrMKrAOAGr3rEnFufm", slug: "en/measuring-without-predefined-method-continuous-timing" },
    { id: "Q9kDKjuiHsLlPOyi9UP8", slug: "en/how-to-reduce-lead-time-to-improve-productivity-competitiveness-and-efficiency-of-your-company" },
    { id: "QfHYMnKlZ2NmHRhwf7Jc", slug: "en/what-is-time-and-motion-study" },
    { id: "WfXb1egAknmDRR6bpTO0", slug: "en/what-types-of-stopwatches-exist" },
    { id: "SlkFXKZ6rYRKf9B5ab1w", slug: "en/optimization-of-production-systems-key-to-industrial-efficiency" },
    { id: "TmLUUkVs8mrnQoTTxqaG", slug: "en/benefits-and-challenges-of-implementing-lean-manufacturing-in-your-company" },
    { id: "YZZoe6E1mG6bIxCRll6i", slug: "en/man-machine-work-how-to-calculate-and-minimize-interferences-practical-guide-and-effective-methods" },
    { id: "mPj8aKOIqnBtxFvmLUfW", slug: "en/generate-time-study-report" },
    { id: "tui7H5svbBn7MA7WdjQo", slug: "en/bedaux-system" },
    { id: "mLIQYqlXk7A7deHRJtqS", slug: "en/what-is-gsd-in-engineering" },
    { id: "velfQnQxMs4JgWBU7wkj", slug: "en/how-to-improve-efficiency-and-effectiveness-of-industrial-process-through-task-simplification" },
  ],
  phase2: [
    // 1 ES legacy duplicado (7039c, regenerado 2026-01-28)
    // Mantener: AoN9Cu2gs1fHnpN44YEQ (8663c, 2026-01-15, más completo)
    { id: "3R2ipdZxogo62GpGA4ZP", slug: "(no slug)" },
  ],
};

async function verify(docRef) {
  const doc = await docRef.get();
  if (!doc.exists) return { exists: false };
  const data = doc.data();
  return {
    exists: true,
    topic: data.topic,
    slug: data.slug,
    contentLen: (data.content || "").length,
    migratedFromMDX: data.migratedFromMDX || false,
    migratedFromOrphanES: data.migratedFromOrphanES || false,
  };
}

async function runPhase(phaseName, items) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`=== FASE ${phaseName.toUpperCase()}: ${items.length} docs a borrar ===`);
  console.log("=".repeat(70));

  let deleted = 0, skipped = 0, errors = 0;
  const results = [];

  for (const item of items) {
    const docRef = db.collection("articulos_cronometras").doc(item.id);
    const v = await verify(docRef);

    if (!v.exists) {
      console.log(`  ⏭️  ${item.id} (${item.slug}): no existe, ya borrado`);
      skipped++;
      results.push({ ...item, status: "skipped-already-deleted" });
      continue;
    }

    // SAFETY CHECK: nunca borrar una traducción reciente
    if (v.migratedFromOrphanES) {
      console.log(`  🚨 SAFETY: ${item.id} es una traducción reciente, ABORTO`);
      errors++;
      results.push({ ...item, status: "BLOCKED-safety", verified: v });
      continue;
    }

    console.log(`  📄 ${item.id} | "${(v.topic || "").slice(0, 50)}" | ${v.contentLen}c | MDX=${v.migratedFromMDX}`);

    if (process.argv.includes("--execute")) {
      try {
        await docRef.delete();
        console.log(`     ✅ BORRADO`);
        deleted++;
        results.push({ ...item, status: "deleted", verified: v });
      } catch (err) {
        console.log(`     ❌ ERROR: ${err.message}`);
        errors++;
        results.push({ ...item, status: "error", error: err.message });
      }
    } else {
      console.log(`     🔍 (dry-run, no delete)`);
      results.push({ ...item, status: "dry-run", verified: v });
    }
  }

  console.log(`\n  Resumen Fase ${phaseName}: deleted=${deleted} skipped=${skipped} errors=${errors}`);
  return results;
}

async function main() {
  const isExecute = process.argv.includes("--execute");
  const phaseArg = process.argv.find(a => a.startsWith("--phase="));
  const phase = phaseArg ? phaseArg.split("=")[1] : null;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`DEDUP FIRESTORE - ${isExecute ? "🚨 EXECUTE MODE 🚨" : "DRY-RUN MODE"}`);
  console.log(`${"=".repeat(70)}\n`);

  const allResults = [];

  if (!phase || phase === "1") {
    const r1 = await runPhase("1", TO_DELETE.phase1);
    allResults.push(...r1);
  }

  if (!phase || phase === "2") {
    const r2 = await runPhase("2", TO_DELETE.phase2);
    allResults.push(...r2);
  }

  // Guardar reporte
  const report = {
    timestamp: new Date().toISOString(),
    mode: isExecute ? "execute" : "dry-run",
    total: allResults.length,
    byStatus: allResults.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {}),
    details: allResults,
  };
  fs.writeFileSync("/tmp/dedup-report.json", JSON.stringify(report, null, 2));
  console.log(`\nReporte guardado en /tmp/dedup-report.json`);

  if (isExecute) {
    console.log(`\n${"!".repeat(70)}`);
    console.log(`🚨 EXECUTE COMPLETADO: ${allResults.filter(r => r.status === "deleted").length} docs BORRADOS`);
    console.log(`${"!".repeat(70)}`);
  } else {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`DRY-RUN COMPLETADO. Para ejecutar, añade --execute.`);
    console.log(`Para ejecutar solo fase 1: --phase=1 --execute`);
    console.log(`Para ejecutar solo fase 2: --phase=2 --execute`);
    console.log(`${"=".repeat(70)}`);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
