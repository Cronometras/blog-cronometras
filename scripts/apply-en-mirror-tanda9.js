#!/usr/bin/env node
// Aplica las propuestas de espejo EN (Firestore + .mdx) con assert-then-replace y backup.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const PROP_FILES = ['/tmp/tanda9/proposal-EN-D.json', '/tmp/tanda9/proposal-EN-E.json'];
const BACKUP = {};

(async () => {
  let applied = 0, failed = 0;
  const report = [];
  for (const pf of PROP_FILES) {
    const p = JSON.parse(fs.readFileSync(pf, 'utf8'));
    for (const art of p.articles || []) {
      // ---- Firestore ----
      if (art.fixes && art.fixes.length) {
        const ref = db.collection('articulos_cronometras').doc(art.id);
        const snap = await ref.get();
        if (!snap.exists) { console.log('MISSING DOC', art.id); failed += art.fixes.length; }
        else {
          const doc = snap.data();
          BACKUP[art.id] = doc;
          const updates = {};
          const perField = {};
          for (const fx of art.fixes) {
            const field = fx.field || 'content';
            const cur = perField[field] !== undefined ? perField[field] : (doc[field] || '');
            const cnt = cur.split(fx.old).length - 1;
            if (cnt !== 1) { report.push({ id: art.id, surface: 'fs', field, status: `SKIP count=${cnt}`, old: fx.old.slice(0, 70) }); failed++; continue; }
            perField[field] = cur.replace(fx.old, fx.new);
            applied++;
          }
          Object.assign(updates, perField);
          updates.correctionNote = '2026-10-15: espejo EN del fix de rigor (fórmulas, créditos, casos simulados y verdad de producto).';
          await ref.update(updates);
          console.log('FS UPDATED', art.id, Object.keys(perField).join(','));
        }
      }
      // ---- .mdx ----
      for (const fx of (art.mdx_fixes || [])) {
        const f = fx.path;
        if (!fs.existsSync(f)) { report.push({ id: art.id, surface: 'mdx', status: 'FILE_MISSING', path: f }); failed++; continue; }
        const txt = fs.readFileSync(f, 'utf8');
        const cnt = txt.split(fx.old).length - 1;
        if (cnt !== 1) { report.push({ id: art.id, surface: 'mdx', path: path.basename(f), status: `SKIP count=${cnt}`, old: fx.old.slice(0, 70) }); failed++; continue; }
        const bak = '/tmp/tanda9/mdx-backup/' + f.replace(/[/]/g, '__');
        fs.mkdirSync('/tmp/tanda9/mdx-backup', { recursive: true });
        if (!fs.existsSync(bak)) fs.writeFileSync(bak, txt);
        fs.writeFileSync(f, txt.replace(fx.old, fx.new));
        applied++;
      }
      if (art.mdx_fixes && art.mdx_fixes.length) console.log('MDX UPDATED', art.id, art.mdx_fixes.length, 'fixes');
    }
  }
  fs.mkdirSync('/home/ubuntu/.hermes/state', { recursive: true });
  fs.writeFileSync('/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda9-en-2026-10-15.json', JSON.stringify(BACKUP, null, 2));
  fs.writeFileSync('/tmp/tanda9/apply_en_report.json', JSON.stringify(report, null, 2));
  console.log('applied=', applied, 'failed=', failed);
  for (const r of report) console.log(JSON.stringify(r));
  process.exit(0);
})();
