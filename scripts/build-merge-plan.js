// scripts/build-merge-plan.js
// Solo lectura. Lee TODAS las IDs reales y construye el plan de fusión.

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function normTitle(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

(async () => {
  const snap = await db.collection("articulos_cronometras").get();
  const all = snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));

  // Solo EN
  const enDocs = all.filter(d => d.language === "en");

  // Para cada slug, agrupar
  const bySlug = new Map();
  enDocs.forEach(d => {
    const slug = d.slug?.replace(/^(es|en)\//, "");
    if (!slug) return;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(d);
  });

  const dupes = [...bySlug.entries()].filter(([k, v]) => v.length > 1);
  console.log(`Slugs EN con 2+ docs: ${dupes.length}`);

  // Para cada par, identificar el OLD (createdAt menor) y el NEW (createdAt mayor)
  const pairs = [];
  for (const [slug, docs] of dupes) {
    const sorted = [...docs].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    const oldDoc = sorted[0];
    const newDoc = sorted[1];

    // Verificar que se pueden distinguir por topic
    if (normTitle(oldDoc.topic) !== normTitle(newDoc.topic)) {
      console.log(`  ⚠️ Títulos diferentes en slug "${slug}": OLD="${oldDoc.topic}" NEW="${newDoc.topic}"`);
      continue;
    }

    pairs.push({
      slug,
      oldId: oldDoc.id,
      newId: newDoc.id,
      topic: oldDoc.topic,
      oldCreatedAt: new Date(oldDoc.createdAt).toISOString().slice(0, 10),
      newCreatedAt: new Date(newDoc.createdAt).toISOString().slice(0, 10),
      oldContentLen: (oldDoc.content || "").length,
      newContentLen: (newDoc.content || "").length,
      oldHasEsSlug: !!oldDoc.esSlug,
      newHasEsSlug: !!newDoc.esSlug,
    });
  }

  console.log(`\nPares construidos: ${pairs.length}`);
  console.log(`\nPlan:`);
  pairs.forEach((p, i) => {
    console.log(`${i+1}. ${p.slug}`);
    console.log(`   OLD: ${p.oldId} (${p.oldCreatedAt}, ${p.oldContentLen}c, esSlug=${p.oldHasEsSlug})`);
    console.log(`   NEW: ${p.newId} (${p.newCreatedAt}, ${p.newContentLen}c, esSlug=${p.newHasEsSlug})`);
  });

  // ES legacy
  const legacy = all.filter(d => (d.topic || "").toLowerCase().includes("diseño de plantillas"));
  const legacySorted = [...legacy].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  console.log(`\nLegacy ES dup:`);
  legacySorted.forEach(d => {
    console.log(`  ${d.id} (${new Date(d.createdAt).toISOString().slice(0,10)}, ${(d.content||"").length}c)`);
  });

  fs.writeFileSync("/tmp/real-pairs.json", JSON.stringify({
    pairs,
    legacyPair: {
      oldId: legacySorted[0]?.id,  // Más antiguo
      newId: legacySorted[1]?.id,  // Más nuevo
    }
  }, null, 2));
  console.log(`\nGuardado en /tmp/real-pairs.json`);
  process.exit(0);
})();
