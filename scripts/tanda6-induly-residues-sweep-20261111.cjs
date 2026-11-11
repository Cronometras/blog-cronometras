#!/usr/bin/env node
// Tanda 6 induly (b): fixes de residuos + barrido de clases sobre los 73 docs de articulos_fichadas.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const OPS = [
  { id: 'tgCX32sDOIWwJFPIW6Ut', field: 'content', old: '**el coste de la hora efectiva de trabajo aumentará automáticamente un 6,25%**', new: '**el coste de la hora efectiva de trabajo aumentará automáticamente en torno a un 6,67 %**' },
  { id: '2KMWJicdQ4gJi5hNg7WK', field: 'descripcion', old: '5 pasos, caso práctico y cumplimiento de la Ley 4/2023.', new: '5 pasos y un caso práctico, y por qué todo empieza en un registro de jornada fiable.' },
  { id: 'BLJcwzqU072BvT9pRkYM', field: 'content', old: '2. Definir el radio de tolerancia por ubicación.', new: '2. Comprobar que la geolocalización está activada para los centros de trabajo que interese.' },
  { id: 'BLJcwzqU072BvT9pRkYM', field: 'descripcion', old: 'verificar la ubicación real de cada trabajador al fichar', new: 'dejar constancia de la ubicación de cada trabajador al fichar' },
];

// Clases a barrer en TODA la colección (patrones de error de clase detectados hoy)
const CLASS_PATTERNS = [
  'Ley 4/2023', 'radio de tolerancia', 'radio de metros', 'ubicación fuera de rango',
  'para cada evento de fichaje', 'Mapa en tiempo real', 'firma digital de supervisor',
  'geofence', 'Radio recomendado', 'tracking continuo', 'código de invitación',
  'caso anonimizado', 'Anonymized', 'OLTA', 'Tribunal de Arbitraje', 'OIT v4',
  'induly.com/app', 'Sobre el autor', 'verificado con curl', 'HTTP 200', 'Verificación ejecutada',
];

(async () => {
  // 1) fixes de residuos
  let ok = 0, fail = 0;
  const byDoc = {};
  for (const op of OPS) {
    const ref = db.collection('articulos_fichadas').doc(op.id);
    const snap = await ref.get();
    const d = snap.data();
    const cur = d[op.field] || '';
    if (!cur.includes(op.old)) { console.log('OP-FAIL', op.id, op.field, JSON.stringify(op.old.slice(0, 60))); fail++; continue; }
    if (!byDoc[op.id]) byDoc[op.id] = {};
    byDoc[op.id][op.field] = (byDoc[op.id][op.field] ?? cur).replace(op.old, op.new);
    ok++;
  }
  for (const id of Object.keys(byDoc)) {
    await db.collection('articulos_fichadas').doc(id).update(byDoc[id]);
    console.log('updated', id, Object.keys(byDoc[id]).join(','));
  }
  console.log(`residuos: ${ok} aplicadas, ${fail} sin match`);

  // 2) read-back de los 4
  for (const op of OPS) {
    const d = (await db.collection('articulos_fichadas').doc(op.id).get()).data();
    const t = d[op.field] || '';
    console.log(t.includes(op.new) ? 'readback OK' : 'READBACK FAIL', op.id, op.field);
  }

  // 3) barrido de clases sobre la colección completa
  const all = await db.collection('articulos_fichadas').get();
  let hits = 0;
  all.forEach(x => {
    const d = x.data();
    const fields = ['content', 'descripcion', 'description', 'topic', 'titulo', 'outline'];
    for (const f of fields) {
      const t = d[f];
      if (typeof t !== 'string') continue;
      for (const p of CLASS_PATTERNS) {
        if (t.includes(p)) {
          const i = t.indexOf(p);
          console.log('CLASS-HIT |', x.id, '|', f, '|', p, '|', JSON.stringify(t.slice(Math.max(0, i - 60), i + 80)));
          hits++;
        }
      }
    }
  });
  console.log('barrido clases: total hits =', hits, '(docs:', all.size, ')');
  process.exit(0);
})();
