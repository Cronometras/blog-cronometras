#!/usr/bin/env node
// Barrido de clase tanda 11: (a) 16 docs ES con bloque «Nota: La versión completa…» + enlace /en/ roto
// → prosa limpia + /en/blog/; (b) 13 docs EN con enlaces ](/en/<slug>/) rotos → ](/en/blog/<slug>/).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const NOTE_RE = /> \*\*Nota\*\*: La versión completa de este artículo[\s\S]*?\[([^\]]+)\]\(\/en\/([a-z0-9-]+)\/?\)\.?/g;
const LINK_RE = /\]\(\/en\/(?!blog\/)([a-z0-9-]+)\/?\)/g;

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  let fixedNote = 0, fixedLinks = 0, docs = 0;
  const backup = {};
  for (const doc of snap.docs) {
    const d = doc.data();
    let c = d.content || '';
    let changed = false;
    let noteN = 0, linkN = 0;
    // (a) sustituir el bloque nota (solo docs ES)
    if ((d.slug || '').startsWith('es/')) {
      c = c.replace(NOTE_RE, (m, label, slug) => {
        noteN++;
        return `Este artículo también está disponible en inglés: [${label}](/en/blog/${slug}/).`;
      });
    }
    // (b) reparar enlaces ](/en/<slug>/) → ](/en/blog/<slug>/)
    c = c.replace(LINK_RE, (m, slug) => {
      linkN++;
      return `](/en/blog/${slug}/)`;
    });
    if (noteN || linkN) {
      changed = true;
      fixedNote += noteN;
      fixedLinks += linkN;
      docs++;
      backup[doc.id] = d.content || '';
      await doc.ref.update({
        content: c,
        correctionNote2: '2026-10-17 barrido de clase: bloque «Nota: La versión completa…» a prosa limpia y enlaces /en/<slug>/ reparados a /en/blog/<slug>/ (404 verificados).',
      });
      console.log('FIXED', doc.id, (d.slug || '').slice(0, 65), '| notas:', noteN, '| enlaces:', linkN);
    }
  }
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-sweep-t11-2026-10-17.json', JSON.stringify(backup, null, 2));
  console.log(`\ndocs tocados: ${docs} | notas reescritas: ${fixedNote} | enlaces reparados: ${fixedLinks} | backup: ${Object.keys(backup).length} docs`);
  process.exit(0);
})();
