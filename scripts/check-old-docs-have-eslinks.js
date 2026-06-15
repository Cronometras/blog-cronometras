// scripts/check-old-docs-have-eslinks.js
// Verifica si los docs antiguos (que se mantendrán) tienen esSlug/esTopic
// para no perder el link EN→ES

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// IDs de los docs ANTIGUOS (los que ahora serían KEEP)
const OLD_KEEP_IDS = [
  "VDV3WNFr5RdboM8PA1nn",
  "MWDNgW6ZXVLt09kE3SvU",
  "leS0FF0LckApMsFD2LNj",
  "2GH9xPDaDNIG61FkkTrX",
  "2nyNHArASdzOtRBTZoHv",
  "tQYwnnACg6AL9yRZyYT0",
  "phhiUyvRDnqTxQk0ZuuW",
  "aCzrKOwl3kaE1cfuQgM9",
  "CXbNCsnoyvgLU7iZ7nSM",
  "Xg8PISIBABUI8iIpZOle",
  "NI7vrNaIxMrQAJrkmMsO",
  "vnR5aBrQucqP6VlysDlb",
  "lqujDFf6vJoL0p8sy6XL",
  "EMslKYEr73i2zKBgccyE",
  "FpGZfBX03udC6gMMQzfe",
  "Gm8gFzj3r3oIlwtRypEl",
  "UXBnUj2OeRcOBrypcpXS",
  "tnVVb5oEaQRJbtK3ykKK",
  "wBrRUQg8iu0AcIEkiorU",
  "IvGst6ezC1v3GV3WT9Sk",
  "TCRpEPWXy0dZXmjFX8v1",
  "Lg22h7zT5wSFLovCTlGo",
  "eYit5CgUUeGxbGs9vw2I",
  "Rj1ORthQstWgppHccSQV",
  "QV4HCPzzrMgOy0oQf2qs",
  "OYLqosgEiJEzWSywIwkX",
  "PknrMKrAOAGr3rEnFufm",
  "Q9kDKjuiHsLlPOyi9UP8",
  "QfHYMnKlZ2NmHRhwf7Jc",
  "WfXb1egAknmDRR6bpTO0",
  "SlkFXKZ6rYRKf9B5ab1w",
  "TmLUUkVs8mrnQoTTxqaG",
  "YZZoe6E1mG6bIxCRll6i",
  "mPj8aKOIqnBtxFvmLUfW",
  "tui7H5svbBn7MA7WdjQo",
  "mLIQYqlXk7A7deHRJtqS",
  "velfQnQxMs4JgWBU7wkj",
];

(async () => {
  const results = [];
  for (const id of OLD_KEEP_IDS) {
    const doc = await db.collection("articulos_cronometras").doc(id).get();
    if (!doc.exists) {
      results.push({ id, exists: false });
      continue;
    }
    const d = doc.data();
    results.push({
      id,
      topic: (d.topic || "").slice(0, 50),
      slug: d.slug,
      contentLen: (d.content || "").length,
      createdAt: new Date(d.createdAt).toISOString().slice(0, 10),
      hasEsSlug: !!d.esSlug,
      hasEsTopic: !!d.esTopic,
      hasKeywords: !!(d.keywords && d.keywords.length > 0),
      hasDescription: !!(d.description && d.description.length > 50),
      migratedFromMDX: d.migratedFromMDX || false,
    });
  }

  const totalWithEsLink = results.filter(r => r.hasEsSlug || r.hasEsTopic).length;
  const totalWithKeywords = results.filter(r => r.hasKeywords).length;
  const totalWithDescription = results.filter(r => r.hasDescription).length;
  const avgContentLen = Math.round(results.reduce((s, r) => s + (r.contentLen || 0), 0) / results.length);

  console.log(`=== ANÁLISIS DE 37 DOCS ANTIGUOS (que serían KEEP) ===\n`);
  console.log(`Total docs: ${results.length}`);
  console.log(`Con esSlug o esTopic: ${totalWithEsLink} / ${results.length}`);
  console.log(`Con keywords: ${totalWithKeywords} / ${results.length}`);
  console.log(`Con description: ${totalWithDescription} / ${results.length}`);
  console.log(`Content length promedio: ${avgContentLen}c`);

  console.log(`\n=== DETALLE ===`);
  results.forEach((r, i) => {
    const flags = [
      r.hasEsSlug ? "esSlug✓" : "esSlug✗",
      r.hasEsTopic ? "esTopic✓" : "esTopic✗",
      r.hasKeywords ? "kw✓" : "kw✗",
      r.hasDescription ? "desc✓" : "desc✗",
    ].join(" ");
    console.log(`${i+1}. ${r.id} | ${r.contentLen}c | ${r.createdAt} | ${flags} | ${r.topic}`);
  });

  // Muestra 3 docs con TODO para ver estructura
  console.log(`\n=== ESTRUCTURA COMPLETA DE 3 DOCS MUESTRA ===`);
  for (const id of OLD_KEEP_IDS.slice(0, 3)) {
    const doc = await db.collection("articulos_cronometras").doc(id).get();
    if (doc.exists) {
      console.log(`\n--- ${id} ---`);
      const d = doc.data();
      Object.keys(d).forEach(k => {
        const v = d[k];
        if (typeof v === "string") console.log(`  ${k}: ${v.slice(0, 80)}`);
        else if (Array.isArray(v)) console.log(`  ${k}: [${v.length} items]`);
        else if (typeof v === "object" && v !== null) console.log(`  ${k}: {object}`);
        else console.log(`  ${k}: ${v}`);
      });
    }
  }

  process.exit(0);
})();
