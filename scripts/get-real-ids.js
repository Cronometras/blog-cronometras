// scripts/get-real-ids.js
// Lee Firestore (solo lectura) y exporta las IDs reales de los docs duplicados a /tmp/real-ids-to-delete.json
// SEGURO: solo lee, no borra nada.

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function scoreDoc(d) {
  let s = 0;
  if (d.migratedFromOrphanES && d.isFullTranslation && d.esSlug && d.esTopic) s += 1000;
  if (d.migratedFromMDX && d.keywords && d.keywords.length > 0) s += 100;
  if (d.migratedFromMDX && d.description && d.description.length > 50) s += 50;
  s += Math.min(50, Math.floor((d.content || "").length / 200));
  if (d.createdAt) s += Math.min(10, Math.floor(d.createdAt / 1e15));
  return s;
}

(async () => {
  const snap = await db.collection("articulos_cronometras").get();
  const all = snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));

  // Detectar slugs duplicados
  const bySlug = new Map();
  all.forEach(d => {
    const slug = d.slug?.replace(/^(es|en)\//, "");
    if (!slug) return;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(d);
  });
  const dupes = [...bySlug.entries()].filter(([k, v]) => v.length > 1);

  // Para cada grupo, marcar el KEEP (score más alto) y los DELETE
  const toDelete = [];
  const toKeep = [];
  for (const [slug, docs] of dupes) {
    const ranked = docs.map(d => ({ ...d, score: scoreDoc(d) })).sort((a, b) => b.score - a.score);
    toKeep.push(ranked[0]);
    ranked.slice(1).forEach(d => toDelete.push(d));
  }

  // Legacy ES duplicado (Diseño de plantillas)
  const legacy = all.filter(d => (d.topic || "").toLowerCase().includes("diseño de plantillas"));
  const legacyRanked = legacy.map(d => ({ ...d, contentLen: (d.content || "").length, score: (d.content || "").length }))
                              .sort((a, b) => b.score - a.score);
  legacyRanked.slice(1).forEach(d => toDelete.push(d));

  console.log(`Total docs a borrar: ${toDelete.length}`);
  console.log(`Total docs a mantener (los mejores de cada grupo): ${toKeep.length + legacyRanked.length - 1}`); // -1 because the legacy one we keep counts once

  // Validar longitudes de IDs (deben ser 20 chars)
  const invalidIds = toDelete.filter(d => d.id.length !== 20);
  if (invalidIds.length > 0) {
    console.log(`⚠️ IDs con longitud != 20:`, invalidIds.map(d => `${d.id} (${d.id.length})`));
  }

  // Guardar SOLO los IDs
  const output = toDelete.map(d => ({
    id: d.id,
    slug: d.slug,
    topic: d.topic,
    contentLen: (d.content || "").length,
    migratedFromMDX: d.migratedFromMDX || false,
    migratedFromOrphanES: d.migratedFromOrphanES || false,
  }));

  fs.writeFileSync("/tmp/real-ids-to-delete.json", JSON.stringify(output, null, 2));
  console.log(`IDs guardadas en /tmp/real-ids-to-delete.json`);
  console.log(`\nPrimeras 5:`);
  output.slice(0, 5).forEach((d, i) => {
    console.log(`  ${i+1}. ${d.id} (len=${d.id.length}) | ${d.slug} | ${d.contentLen}c`);
  });
  process.exit(0);
})();
