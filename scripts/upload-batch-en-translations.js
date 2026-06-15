// scripts/upload-batch-en-translations.js
// Sube traducciones EN completas (no resúmenes) desde archivos .mdx a Firestore.
// Idempotente: detecta docs existentes por el campo `enSlug` y los omite.

const admin = require("/home/ubuntu/projects/blog-cronometras/node_modules/firebase-admin");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const sa = JSON.parse(fs.readFileSync("/home/ubuntu/projects/blog-cronometras/sa.json", "utf8"));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const TRANSLATIONS_DIR = process.argv[2] || "/tmp/translation-work/batch1-en-translations";
const ES_SOURCE_DIR = "/home/ubuntu/projects/blog-cronometras/src/content/blog/es";

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);
  if (!m) throw new Error("Invalid frontmatter");
  const fmBlock = m[1];
  const body = m[2].trim();

  // Simple YAML parser for our limited needs
  const fm = {};
  let currentArray = null;
  let currentKey = null;

  fmBlock.split("\n").forEach(line => {
    if (line.match(/^tags:\s*\[/)) {
      const arr = line.match(/\[(.*?)\]/);
      fm.tags = arr ? arr[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")) : [];
    } else if (line.match(/^[a-zA-Z_]+:/)) {
      const m2 = line.match(/^([a-zA-Z_]+):\s*(.*?)$/);
      if (m2) {
        const key = m2[1];
        let val = m2[2].trim();
        if (val === '""' || val === "''") val = "";
        // Quoted string
        if (val.match(/^["'].*["']$/)) {
          val = val.slice(1, -1);
        }
        fm[key] = val;
      }
    }
  });

  return { frontmatter: fm, body };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function main() {
  const mode = process.argv.includes("--execute") ? "execute" : "dry-run";
  console.log(`=== Modo: ${mode} ===`);
  console.log(`=== Directorio: ${TRANSLATIONS_DIR} ===\n`);

  const files = fs.readdirSync(TRANSLATIONS_DIR).filter(f => f.endsWith(".mdx"));
  console.log(`Archivos .mdx a procesar: ${files.length}\n`);

  // 1) Listar docs existentes en Firestore (language='en' con campo esSlug)
  const allEn = await db.collection("articulos_cronometras")
    .where("language", "==", "en")
    .get();
  const existingEsSlugs = new Set(
    allEn.docs
      .map(d => d.data().esSlug)
      .filter(Boolean)
  );
  console.log(`Docs EN existentes con esSlug: ${existingEsSlugs.size}\n`);

  let uploaded = 0, skipped = 0, errors = 0;
  const results = [];

  for (const file of files) {
    try {
      const filepath = path.join(TRANSLATIONS_DIR, file);
      const content = fs.readFileSync(filepath, "utf8");
      const { frontmatter, body } = parseFrontmatter(content);

      // Buscar el ES original en MDX por nombre de archivo
      // (es probable que el archivo EN se llame igual que el ES)
      const esFile = path.join(ES_SOURCE_DIR, file);
      let esSlug = null;
      let esTopic = null;
      if (fs.existsSync(esFile)) {
        const esContent = fs.readFileSync(esFile, "utf8");
        const esParsed = parseFrontmatter(esContent);
        esTopic = esParsed.frontmatter.title;
        esSlug = slugify(file.replace(/\.mdx$/, ""));
      } else {
        // Fallback: usar el slug del archivo EN
        esSlug = slugify(file.replace(/\.mdx$/, ""));
      }

      const enSlug = slugify(frontmatter.title);

      if (existingEsSlugs.has(esSlug)) {
        console.log(`⏭️  SKIP ${file}: ya existe EN para esSlug="${esSlug}"`);
        skipped++;
        results.push({ file, status: "skipped", reason: "already-exists" });
        continue;
      }

      // Construir el doc
      const topicId = crypto.createHash("sha1").update(`${enSlug}-en-translation`).digest("hex").slice(0, 16);
      const now = Date.now();

      const doc = {
        status: "completed",
        categoria: frontmatter.category || "Engineering",
        draft: false,
        projectId: "cronometras",
        topicId,
        topic: frontmatter.title,
        content: body,
        language: "en",
        slug: enSlug,
        esSlug: esSlug,
        esTopic: esTopic,
        migratedFromOrphanES: true,
        needsSpanishTranslation: false,
        isFullTranslation: true,
        translationDate: now,
        keywords: frontmatter.tags || [],
        description: frontmatter.description || "",
        imageUrl: frontmatter.heroImage || "/images/webp/og-default.png",
        pubDate: frontmatter.pubDate || null,
        author: frontmatter.author || "CRONOMETRAS Team",
        createdAt: now,
      };

      console.log(`📝 ${file}`);
      console.log(`   title: ${frontmatter.title.slice(0, 60)}`);
      console.log(`   esSlug: ${esSlug}`);
      console.log(`   enSlug: ${enSlug}`);
      console.log(`   body length: ${body.length} chars`);

      if (mode === "execute") {
        await db.collection("articulos_cronometras").add(doc);
        console.log(`   ✅ uploaded\n`);
        uploaded++;
      } else {
        console.log(`   🔍 (dry-run, no upload)\n`);
      }
      results.push({ file, status: mode === "execute" ? "uploaded" : "dry-run", enSlug, esSlug });
    } catch (err) {
      console.log(`❌ ERROR en ${file}: ${err.message}`);
      errors++;
      results.push({ file, status: "error", error: err.message });
    }
  }

  console.log(`\n=== RESUMEN ===`);
  console.log(`Total procesados: ${files.length}`);
  console.log(`Subidos: ${uploaded}`);
  console.log(`Omitidos: ${skipped}`);
  console.log(`Errores: ${errors}`);

  fs.writeFileSync("/tmp/batch-upload-report.json", JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
