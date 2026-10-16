#!/usr/bin/env node
// Aplica las correcciones de tanda 10 (plan 80-89) a articulos_cronometras (assert-then-replace por fix).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PROP_FILES = fs.readdirSync('/tmp/tanda10')
  .filter(f => /^fix-\d+.*\.json$/.test(f))
  .sort()
  .map(f => path.join('/tmp/tanda10', f));
console.log('propuestas:', PROP_FILES.map(p => path.basename(p)).join(', '));

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
        if (fx.set_field) {
          updates[field] = fx.new;
          report.push({ id: art.id, field, status: 'SET_FIELD' });
          applied++;
          continue;
        }
        const cur = perField[field] !== undefined ? perField[field] : (doc[field] || '');
        const cnt = cur.split(fx.old).length - 1;
        if (cnt !== 1) {
          report.push({ id: art.id, field, status: `SKIP count=${cnt}`, old: fx.old.slice(0, 80) });
          failed++;
          continue;
        }
        perField[field] = cur.replace(fx.old, fx.new);
        applied++;
      }
      for (const [field, val] of Object.entries(perField)) updates[field] = val;
      updates.correctionNote = '2026-10-16: revisión de rigor tanda 10 — verdad de producto (work sampling = WorkSamp), créditos MTM/MOST, coeficientes Westinghouse canónicos, cifras sin fuente y casos simulados.';
      await ref.update(updates);
      console.log('UPDATED', art.id, Object.keys(perField).concat(Object.keys(updates).filter(k => k !== 'correctionNote' && !(k in perField))).join(','));
    }
  }
  fs.writeFileSync('/tmp/tanda10/apply_report.json', JSON.stringify(report, null, 2));
  console.log('applied=', applied, 'failed=', failed);
  for (const r of report) if (String(r.status).startsWith('SKIP')) console.log('FAIL:', r.id, r.field, r.status, '|', r.old);
  process.exit(0);
})();
