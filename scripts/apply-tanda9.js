#!/usr/bin/env node
// Aplica las propuestas de tanda 9 a articulos_cronometras (assert-then-replace por fix).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PROP_FILES = ['/tmp/tanda9/proposal-A.json', '/tmp/tanda9/proposal-B.json', '/tmp/tanda9/proposal-C.json'];

(async () => {
  const report = [];
  let applied = 0, failed = 0;
  for (const pf of PROP_FILES) {
    const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
    for (const art of p.articles) {
      const ref = db.collection('articulos_cronometras').doc(art.id);
      const snap = await ref.get();
      if (!snap.exists) { console.log('MISSING DOC', art.id); failed++; continue; }
      const doc = snap.data();
      const updates = {};
      const perField = {};
      for (const fx of art.fixes) {
        const field = fx.field || 'content';
        const cur = perField[field] !== undefined ? perField[field] : (doc[field] || '');
        const cnt = cur.split(fx.old).length - 1;
        if (cnt !== 1) {
          report.push({ id: art.id, field, status: `SKIP count=${cnt}`, old: fx.old.slice(0, 60) });
          failed++;
          continue;
        }
        perField[field] = cur.replace(fx.old, fx.new);
        applied++;
      }
      for (const [field, val] of Object.entries(perField)) updates[field] = val;
      updates.correctionNote = '2026-10-15: revisión de rigor tanda 9 — aritmética, fuentes, verdad de producto y casos simulados.';
      await ref.update(updates);
      console.log('UPDATED', art.id, Object.keys(perField).join(','));
    }
  }
  fs.writeFileSync('/tmp/tanda9/apply_report.json', JSON.stringify(report, null, 2));
  console.log('applied=', applied, 'failed=', failed);
  if (report.length) console.log(JSON.stringify(report, null, 2));
  process.exit(0);
})();
