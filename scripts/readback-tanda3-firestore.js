#!/usr/bin/env node
// Read-back: verify the 11 synced docs carry the corrected text and none of the
// forbidden patterns. Usage: node scripts/readback-tanda3-firestore.js
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const IDS = {
  'ieS1TDZhOXbCgSO9P7Fp': 'como-estandarizar',
  'u19kQh1535p6d50kroCc': 'simplificacion',
  'S6DhPXc9SBZN9JTogeYc': 'tiempo-entrega',
  'lzqCvIBuEpbQgEPhQJZM': 'estudio-cronometro',
  'c91l2iKaS51Z0Vj64e6M': 'frecuenciales',
  'jiDwAo5t3HfFgWIn5MWG': 'maquina',
  'WQsTRPoA6h5wfhA4FjcQ': 'estandarizacion-procesos',
  'P3qqL31Bp87x2KgEz9Py': 'ciclo-trabajo',
  'eaAf2toXknCJ5ZtvuZvv': 'fases-proceso',
  '3qUocCWQ4oCyjhzFYmL0': 'tecnicas-cronometraje',
  'XiQZf1sYSNt2RY3GQfYc': 'metodos-tiempos-gestion',
};

const FORBIDDEN = [
  'monitorear', 'Monitoreo', 'empacarlo', 'Black & Decker',
  'prueba gratuita de 15', 'todas las ventajas', 'Iniciar Frecuencial',
  'Finalizar Frecuencial', 'armadoras', 'promedio', 'estos tres tiempos',
  'Intenciones de búsqueda', 'GAP', 'aplicación móvil para', 'laactividad',
  'deseamoscalcular', 'capítulo 24', 'teniamos', 'el para acceder',
];
const REQUIRED_ANY = [
  'Caso práctico simulado', 'Detener cronómetro frecuencial', 'tiempos de espera',
  'fabricantes de automóviles', 'valoración sintética del ritmo', 'Monitorización',
  '1/50', 'estos tiempos', 'elementos de tiempo de máquina', 'la segunda etapa es el diseño',
];

(async () => {
  let bad = 0;
  for (const [id, name] of Object.entries(IDS)) {
    const d = await db.collection('articulos_cronometras').doc(id).get();
    if (!d.exists) { console.log('MISSING DOC', id, name); bad++; continue; }
    const f = d.data();
    const text = [f.content || '', f.description || '', (f.keywords || []).join(' ')].join('\n');
    const hits = FORBIDDEN.filter(p => text.includes(p));
    console.log(name, '| content', (f.content || '').length, 'chars | forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  const all = (await db.collection('articulos_cronometras').get()).docs
    .map(d => (d.data().content || ''));
  const joined = all.join('\n');
  console.log('--- required markers (whole collection):');
  for (const p of REQUIRED_ANY) console.log(' ', p, '=>', (joined.split(p).length - 1), 'hits');
  console.log(bad === 0 ? 'READBACK OK' : 'READBACK FAILED: ' + bad + ' docs con patrones prohibidos');
})();
