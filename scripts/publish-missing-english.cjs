// Publish a reviewed translation bundle. Never overwrite a source or existing EN article.
// Usage: FIREBASE_SERVICE_ACCOUNT_PATH=/private/sa.json node scripts/publish-missing-english.cjs /private/new-documents.json [--execute]
const fs = require('node:fs');
const crypto = require('node:crypto');
const admin = require('firebase-admin');

async function main() {
  const bundle = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const credentials = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'sa.json', 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(credentials) });
  const db = admin.firestore();
  const collection = db.collection('articulos_cronometras');
  const before = await collection.get();
  const existing = new Map(before.docs.map(doc => [doc.id, doc.data()]));
  const slugOwners = new Map(before.docs.map(doc => [doc.data().slug, doc.id]));
  const pending = [];
  for (const document of bundle) {
    if (document.language !== 'en' || !document.slug.startsWith('en/') || !document.isFullTranslation || !document.content) {
      throw new Error('Invalid translation bundle');
    }
    const source = existing.get(document.translationSourceId);
    const hash = source && crypto.createHash('sha256').update(source.content).digest('hex');
    if (hash !== document.translationSourceHash) throw new Error(`Source changed: ${document.translationSourceId}`);
    const old = existing.get(document.id);
    if (old) {
      if (old.translationSourceHash !== hash || old.content !== document.content || old.slug !== document.slug) {
        throw new Error(`Refusing to replace existing document: ${document.id}`);
      }
      continue;
    }
    if (slugOwners.has(document.slug)) throw new Error(`Slug already published: ${document.slug}`);
    pending.push(document);
    slugOwners.set(document.slug, document.id);
  }
  console.log(JSON.stringify({ reviewed: bundle.length, toCreate: pending.length, unchanged: bundle.length - pending.length }));
  if (!process.argv.includes('--execute')) return;
  if (pending.length) {
    const batch = db.batch();
    for (const { id, ...data } of pending) batch.create(collection.doc(id), data);
    await batch.commit();
  }
  const after = await collection.get();
  const stored = new Map(after.docs.map(doc => [doc.id, doc.data()]));
  for (const [id, original] of existing) {
    if (JSON.stringify(stored.get(id)) !== JSON.stringify(original)) {
      // Verify field equality independently of key enumeration order.
      const a = stored.get(id);
      for (const key of Object.keys(original)) {
        if (JSON.stringify(a?.[key]) !== JSON.stringify(original[key])) throw new Error(`Existing data changed: ${id}/${key}`);
      }
    }
  }
  for (const document of bundle) {
    if (stored.get(document.id)?.content !== document.content) throw new Error(`Read-back failed: ${document.id}`);
  }
  console.log(JSON.stringify({ created: pending.length, originalsPreserved: existing.size, readBackVerified: bundle.length }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
