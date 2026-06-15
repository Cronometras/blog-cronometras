// scripts/dedup-firestore.js
// FUSIÓN + limpieza de duplicados en Firestore.
// ESTRATEGIA: "mantén siempre los más antiguos" (instrucción de Micaot).
//
// Para cada par:
//   - OLD (más antiguo, más largo) se mantiene
//   - NEW (más reciente, con esSlug/esTopic) se fusiona en OLD:
//       1. Copia campos del NEW que OLD no tiene: esSlug, esTopic, description, isFullTranslation
//       2. Marca OLD con mergedFromTranslation: true, mergedAt: <now>
//       3. Borra NEW
//
// Resultado: 302 → 266 docs (37 fusiones, -36 docs neto)
//
// Uso:
//   node scripts/dedup-firestore.js --dry-run    # Solo muestra el plan
//   node scripts/dedup-firestore.js --execute    # Fusiona con verificación previa
//   node scripts/dedup-firestore.js --phase=1    # Solo fase 1 (EN)
//   node scripts/dedup-firestore.js --phase=2    # Solo fase 2 (ES legacy)

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Cargar plan verificado de /tmp/real-pairs.json
const plan = JSON.parse(fs.readFileSync("/tmp/real-pairs.json", "utf8"));

async function getDoc(id) {
  const doc = await db.collection("articulos_cronometras").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ref: doc.ref, ...doc.data() };
}

// Campos a copiar del NEW al OLD si OLD no los tiene
const FIELDS_TO_MERGE = ["esSlug", "esTopic", "description", "imageUrl", "author", "pubDate", "keywords"];

async function runMerge(phaseName, pairs) {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`=== FASE ${phaseName.toUpperCase()}: ${pairs.length} fusiones ===`);
  console.log("=".repeat(70));

  let merged = 0, deleted = 0, skipped = 0, errors = 0;
  const results = [];

  for (const pair of pairs) {
    const oldDoc = await getDoc(pair.oldId);
    const newDoc = await getDoc(pair.newId);

    if (!oldDoc && !newDoc) {
      console.log(`  ⏭️  ${pair.slug || pair.topic}: ambos ya borrados`);
      skipped++;
      results.push({ ...pair, status: "skipped-both-deleted" });
      continue;
    }
    if (!newDoc) {
      console.log(`  ⏭️  ${pair.slug || pair.topic}: NEW (${pair.newId}) ya borrado, nada que fusionar`);
      skipped++;
      results.push({ ...pair, status: "skipped-new-deleted" });
      continue;
    }
    if (!oldDoc) {
      console.log(`  ❌ ${pair.slug || pair.topic}: OLD (${pair.oldId}) no existe!`);
      errors++;
      results.push({ ...pair, status: "ERROR-old-missing" });
      continue;
    }

    // Calcular campos a copiar
    const updates = {};
    const fieldsCopied = [];
    for (const field of FIELDS_TO_MERGE) {
      const oldVal = oldDoc[field];
      const newVal = newDoc[field];
      // Solo copiar si OLD no tiene el campo o está vacío, y NEW sí lo tiene
      if ((oldVal === undefined || oldVal === null || oldVal === "" || (Array.isArray(oldVal) && oldVal.length === 0))
          && newVal !== undefined && newVal !== null && newVal !== "" && !(Array.isArray(newVal) && newVal.length === 0)) {
        updates[field] = newVal;
        fieldsCopied.push(field);
      }
    }

    // Marcar OLD con metadatos de fusión
    updates.mergedFromTranslation = true;
    updates.mergedAt = Date.now();
    updates.mergedFromNewId = pair.newId;
    updates.needsSpanishTranslation = false;  // NEW era español → ES, OLD ya no necesita traducción

    console.log(`  📄 ${pair.slug || pair.topic}`);
    console.log(`     OLD: ${pair.oldId} (${(oldDoc.content||"").length}c, ${new Date(oldDoc.createdAt).toISOString().slice(0,10)})`);
    console.log(`     NEW: ${pair.newId} (${(newDoc.content||"").length}c, ${new Date(newDoc.createdAt).toISOString().slice(0,10)})`);
    console.log(`     Campos a copiar: [${fieldsCopied.join(", ") || "(ninguno)"}]`);

    if (process.argv.includes("--execute")) {
      try {
        // 1. Actualizar OLD
        await oldDoc.ref.update(updates);
        merged++;
        console.log(`     ✅ OLD actualizado`);

        // 2. Borrar NEW
        await newDoc.ref.delete();
        deleted++;
        console.log(`     ✅ NEW borrado`);

        results.push({ ...pair, status: "merged+deleted", fieldsCopied, updates: Object.keys(updates) });
      } catch (err) {
        console.log(`     ❌ ERROR: ${err.message}`);
        errors++;
        results.push({ ...pair, status: "error", error: err.message });
      }
    } else {
      console.log(`     🔍 (dry-run, no modifications)`);
      results.push({ ...pair, status: "dry-run", fieldsCopied });
    }
  }

  console.log(`\n  Resumen Fase ${phaseName}: merged=${merged} deleted=${deleted} skipped=${skipped} errors=${errors}`);
  return results;
}

async function main() {
  const isExecute = process.argv.includes("--execute");
  const phaseArg = process.argv.find(a => a.startsWith("--phase="));
  const phase = phaseArg ? phaseArg.split("=")[1] : null;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`DEDUP FIRESTORE (FUSION) - ${isExecute ? "🚨 EXECUTE MODE 🚨" : "DRY-RUN MODE"}`);
  console.log(`Estrategia: "mantén siempre los más antiguos"`);
  console.log(`${"=".repeat(70)}\n`);

  const allResults = [];

  if (!phase || phase === "1") {
    // Fase 1: pares EN
    const enPairs = plan.pairs.map(p => ({
      oldId: p.oldId, newId: p.newId, slug: p.slug, topic: p.topic,
    }));
    const r1 = await runMerge("1", enPairs);
    allResults.push(...r1);
  }

  if (!phase || phase === "2") {
    // Fase 2: legacy ES dup
    if (plan.legacyPair.oldId && plan.legacyPair.newId) {
      const r2 = await runMerge("2", [{
        oldId: plan.legacyPair.oldId,
        newId: plan.legacyPair.newId,
        slug: "(no slug)",
        topic: "Diseño de plantillas..."
      }]);
      allResults.push(...r2);
    }
  }

  // Reporte
  const report = {
    timestamp: new Date().toISOString(),
    mode: isExecute ? "execute" : "dry-run",
    strategy: "merge+delete (mantén siempre los más antiguos)",
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
    console.log(`🚨 EXECUTE COMPLETADO:`);
    console.log(`   ${allResults.filter(r => r.status === "merged+deleted").length} fusiones realizadas`);
    console.log(`   ${allResults.filter(r => r.status === "merged+deleted").length} docs borrados (los NEW)`);
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
