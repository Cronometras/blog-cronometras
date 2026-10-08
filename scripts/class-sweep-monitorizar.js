#!/usr/bin/env node
// Class sweep: ES-ES wording "monitorear/monitoreo" -> "monitorizar/monitorización"
// across articulos_cronometras (content + description only).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const REPL = [
  [/\bMonitorear\b/g, 'Monitorizar'],
  [/\bmonitorear\b/g, 'monitorizar'],
  [/\bmonitorea\b/g, 'monitoriza'],
  [/\bMonitoreo\b/g, 'Monitorización'],
  [/\bmonitoreo\b/g, 'monitorización'],
];

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  let fixed = 0;
  for (const d of snap.docs) {
    const f = d.data();
    const upd = {};
    for (const field of ['content', 'description']) {
      let t = f[field];
      if (typeof t !== 'string') continue;
      const before = t;
      for (const [re, to] of REPL) t = t.replace(re, to);
      if (t !== before) upd[field] = t;
    }
    if (Object.keys(upd).length) {
      console.log('fix', d.id, Object.keys(upd).join(','));
      await d.ref.update(upd);
      fixed++;
    }
  }
  console.log('docs fixed:', fixed);
})();
