// scripts/merge-old-en-with-translations.js
// FUSIONA los docs antiguos con la info de las traducciones recientes:
// - Mantiene el doc antiguo (más viejo, más largo)
// - Le copia: esSlug, esTopic, description, needsSpanishTranslation=false, isFullTranslation, translationDate
// - Borra el doc nuevo (traducción)
//
// Solo lectura primero para mostrar el plan.

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// IDs de pares: { oldId (KEEP), newId (DELETE) }
// Emparejados por título normalizado durante el análisis previo
const PAIRS = [
  { oldId: "VDV3WNFr5RdboM8PA1nn", newId: "1ZQtufCTBVfGwjdIuTNG", topic: "Machine Time Measurement" },
  { oldId: "MWDNgW6ZXVLt09kE3SvU", newId: "1ad8utBz9G4TxoN05znc", topic: "Work Method Design" },
  { oldId: "leS0FF0LckApMsFD2LNj", newId: "22T01NwgLrQYGMlCrYbV", topic: "Why Are There Delays in Production?" },
  { oldId: "2GH9xPDaDNIG61FkkTrX", newId: "GBUPssjIYXRELTpMc64b", topic: "Stages of Work Methods Study" },
  { oldId: "2nyNHArASdzOtRBTZoHv", newId: "vB53IJM7fiDOYuEsujrV", topic: "Identification of Work to Measure" },
  { oldId: "tQYwnnACg6AL9yRZyYT0", newId: "2vh9muWRPBCRzpJ0BvRn", topic: "Define the Work Method" },
  { oldId: "phhiUyvRDnqTxQk0ZuuW", newId: "41aWSPJrhkCwaBtg1ZQt", topic: "Time Measurement with Stopwatch" },
  { oldId: "aCzrKOwl3kaE1cfuQgM9", newId: "AxiPXXggWPaN9Cu2gs1f", topic: "Line Balancing..." },
  { oldId: "CXbNCsnoyvgLU7iZ7nSM", newId: "IQHhNoruhJ6tBNx7eKAf", topic: "Work Study" },
  { oldId: "Xg8PISIBABUI8iIpZOle", newId: "Ck8OWOMMuShL2RzhBthQ", topic: "Tools Needed for Time Study" },
  { oldId: "NI7vrNaIxMrQAJrkmMsO", newId: "zHpjgwlhTZN02wAsOeyv", topic: "Obeya Room Lean" },
  { oldId: "vnR5aBrQucqP6VlysDlb", newId: "EBy8IsedyCVfYqb2v2hJ", topic: "Application of ILO Allowances" },
  { oldId: "lqujDFf6vJoL0p8sy6XL", newId: "EKeYc9ncHYK9bJi5vhLU", topic: "Prepare Automation" },
  { oldId: "EMslKYEr73i2zKBgccyE", newId: "HtbhttLhBVOf7HLj0BvR", topic: "How to Create a New Work Study" },
  { oldId: "FpGZfBX03udC6gMMQzfe", newId: "x9H88K8xZiWaN9Cu2gs1", topic: "Calculating the Optimal Number..." },
  { oldId: "Gm8gFzj3r3oIlwtRypEl", newId: "rE4plZPvr93hL2RzhBth", topic: "Defining Work Elements..." },
  { oldId: "UXBnUj2OeRcOBrypcpXS", newId: "HN4WV13y5FVfYqb2v2hJ", topic: "Work Time Measurement" },
  { oldId: "tnVVb5oEaQRJbtK3ykKK", newId: "ICf66WY8RT9K9bJi5vhL", topic: "Ergonomics: From Pain to Productivity" },
  { oldId: "wBrRUQg8iu0AcIEkiorU", newId: "ImzHKrSRocOf7HLj0BvR", topic: "Choose How to Measure Work" },
  { oldId: "IvGst6ezC1v3GV3WT9Sk", newId: "JaiKjHAo7QWaN9Cu2gs1", topic: "Methods and Times..." },
  { oldId: "TCRpEPWXy0dZXmjFX8v1", newId: "JwmJQIE9SK3hL2RzhBth", topic: "How to Standardize..." },
  { oldId: "Lg22h7zT5wSFLovCTlGo", newId: "LoCbNoq0rzVfYqb2v2hJ", topic: "Objectives of Work Study" },
  { oldId: "eYit5CgUUeGxbGs9vw2I", newId: "MPAKfDzoJVK9bJi5vhLU", topic: "Comprehensive Time Study Management" },
  { oldId: "Rj1ORthQstWgppHccSQV", newId: "MuEA4i8yEkOf7HLj0BvR", topic: "Accessing the App" },
  { oldId: "QV4HCPzzrMgOy0oQf2qs", newId: "NjsubpwYyyWaN9Cu2gs1", topic: "What Are the Phases..." },
  { oldId: "OYLqosgEiJEzWSywIwkX", newId: "kLRcUA15iI3hL2RzhBth", topic: "Rest at Work..." },
  { oldId: "PknrMKrAOAGr3rEnFufm", newId: "x7r3LgZWBlVfYqb2v2hJ", topic: "Measuring Without Predefined Method..." },
  { oldId: "Q9kDKjuiHsLlPOyi9UP8", newId: "fuvp5Xwhbj9K9bJi5vhLU", topic: "How to Reduce Lead Time..." },
  { oldId: "QfHYMnKlZ2NmHRhwf7Jc", newId: "ig5QZq2GrzOf7HLj0BvR", topic: "What is Time and Motion Study?" },
  { oldId: "WfXb1egAknmDRR6bpTO0", newId: "SPhwbNCHnwWaN9Cu2gs1", topic: "What Types of Stopwatches Exist?" },
  { oldId: "SlkFXKZ6rYRKf9B5ab1w", newId: "pCDk79VYel3hL2RzhBth", topic: "Optimization of Production Systems..." },
  { oldId: "TmLUUkVs8mrnQoTTxqaG", newId: "TqzHzgGI4tVfYqb2v2hJ", topic: "Benefits and Challenges of Lean..." },
  { oldId: "YZZoe6E1mG6bIxCRll6i", newId: "eugrzlgK1kK9bJi5vhLU", topic: "Man-Machine Work..." },
  { oldId: "mPj8aKOIqnBtxFvmLUfW", newId: "jiA5OWRapBOf7HLj0BvR", topic: "Generate Time Study Report" },
  { oldId: "tui7H5svbBn7MA7WdjQo", newId: "k3dAT8EbtnWaN9Cu2gs1", topic: "Bedaux System" },
  { oldId: "mLIQYqlXk7A7deHRJtqS", newId: "vrz3rj50Jz3hL2RzhBth", topic: "What is GSD in Engineering?" },
  { oldId: "velfQnQxMs4JgWBU7wkj", newId: "vVd0y77AWSVfYqb2v2hJ", topic: "How to Improve Efficiency..." },
];

// ES legacy dup
const LEGACY_PAIR = { oldId: "AoN9Cu2gs1fHnpN44YEQ", newId: "3R2ipdZxogo62GpGA4ZP", topic: "Diseño de plantillas..." };

(async () => {
  console.log(`=== VALIDACIÓN DE PARES PARA FUSIÓN ===\n`);
  console.log(`Total pares EN: ${PAIRS.length}`);
  console.log(`Legacy ES dup: 1 par\n`);

  // Verificar cada par
  let validPairs = 0, brokenPairs = 0;
  const mergePlan = [];

  for (const pair of [...PAIRS, LEGACY_PAIR]) {
    const oldDoc = await db.collection("articulos_cronometras").doc(pair.oldId).get();
    const newDoc = await db.collection("articulos_cronometras").doc(pair.newId).get();

    if (!oldDoc.exists) {
      console.log(`  ❌ oldId no existe: ${pair.oldId}`);
      brokenPairs++;
      continue;
    }
    if (!newDoc.exists) {
      console.log(`  ⚠️  newId no existe (ya borrado): ${pair.newId}`);
      brokenPairs++;
      continue;
    }

    const o = oldDoc.data();
    const n = newDoc.data();

    // Verificar que el título coincide
    if ((o.topic || "").toLowerCase().trim() !== (n.topic || "").toLowerCase().trim()) {
      console.log(`  ⚠️  Títulos no coinciden: old="${o.topic}" new="${n.topic}"`);
      brokenPairs++;
      continue;
    }

    validPairs++;
    mergePlan.push({
      oldId: pair.oldId,
      newId: pair.newId,
      topic: pair.topic,
      oldCreatedAt: new Date(o.createdAt).toISOString().slice(0, 10),
      newCreatedAt: new Date(n.createdAt).toISOString().slice(0, 10),
      oldContentLen: (o.content || "").length,
      newContentLen: (n.content || "").length,
      fieldsToCopy: Object.keys(n).filter(k => !o.hasOwnProperty(k) || JSON.stringify(o[k]) !== JSON.stringify(n[k])),
    });
  }

  console.log(`\nPares válidos: ${validPairs}`);
  console.log(`Pares rotos: ${brokenPairs}`);

  if (mergePlan.length > 0) {
    console.log(`\n=== PLAN DE FUSIÓN (${mergePlan.length} pares) ===\n`);
    mergePlan.slice(0, 5).forEach(p => {
      console.log(`  OLD ${p.oldId} (${p.oldCreatedAt}, ${p.oldContentLen}c)`);
      console.log(`  NEW ${p.newId} (${p.newCreatedAt}, ${p.newContentLen}c)`);
      console.log(`  Campos a copiar del NEW al OLD: [${p.fieldsToCopy.slice(0, 5).join(", ")}${p.fieldsToCopy.length > 5 ? `, +${p.fieldsToCopy.length - 5} más` : ""}]`);
      console.log();
    });
    if (mergePlan.length > 5) console.log(`  ... y ${mergePlan.length - 5} pares más\n`);
  }

  fs.writeFileSync("/tmp/merge-plan.json", JSON.stringify(mergePlan, null, 2));
  process.exit(0);
})();
