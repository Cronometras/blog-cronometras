const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

// 5 docs con hero Unsplash muerto (404) -> imagen local tematica
const FIX = {
  'BJukvsv7aY1Tp9PaICoz': '/images/webp/implementar-el-lean-manufacturing.webp', // Sistema Kanban (herramienta lean)
  'H2VVqYmToTVQHH0SrE54': '/images/webp/errores-cronometraje.webp',              // Poka-Yoke (dispositivos anti-error)
  'articulo-17-cronoanalisis-envasado-bebid': '/images/blog/envasado-bebidas-linea.png',
  'articulo-19-cronoanalisis-paradas-progra': '/images/blog/refineria-paradas-turnaround.png',
  'articulo-22-cronoanalisis-centros-datos-': '/images/blog/centros-datos-data-center.png',
};
const FIELDS = ['imageUrl', 'coverImage', 'heroImage'];
const BACKUP = path.join(__dirname, '..', 'backup-unsplash-dead-2026-10-12.json');

(async () => {
  const backup = {};
  for (const [id, img] of Object.entries(FIX)) {
    const ref = db.collection('articulos_cronometras').doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING DOC', id); continue; }
    const data = snap.data();
    backup[id] = Object.fromEntries(FIELDS.filter(f => data[f] !== undefined).map(f => [f, data[f]]));
    const upd = {};
    for (const f of FIELDS) {
      if (typeof data[f] === 'string' && data[f].includes('images.unsplash.com')) upd[f] = img;
    }
    if (Object.keys(upd).length === 0) { console.log('NO UNSPLASH FIELD', id); continue; }
    await ref.update(upd);
    console.log('FIXED', id, '->', img, Object.keys(upd).join(','));
  }
  fs.writeFileSync(BACKUP, JSON.stringify(backup, null, 2));
  console.log('backup ->', BACKUP);
  // read-back
  for (const id of Object.keys(FIX)) {
    const d = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const left = FIELDS.filter(f => typeof d[f] === 'string' && d[f].includes('unsplash'));
    const now = FIELDS.filter(f => d[f] !== undefined).map(f => f + '=' + d[f]).join(' | ');
    console.log('readback', id, 'unsplash-left:', left.join(',') || 'none', '|', now.slice(0, 120));
  }
})();
