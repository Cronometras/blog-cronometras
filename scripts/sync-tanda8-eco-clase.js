#!/usr/bin/env node
// Fix de clase P1 en docs del ecosistema (worksamp/induly): bloques de autor
// (ES+EN), casos presentados como reales («caso anonimizado»), meta-editorial.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const TARGETS = [
  ['articulos_blog_muestreo', 'articulo-18-work-sampling-centros-distri'],
  ['articulos_blog_muestreo', 'articulo-21-work-sampling-plantas-modulo'],
  ['articulos_blog_muestreo', 'articulo-26-muestreo-del-trabajo-en-data'],
  ['articulos_fichadas', 'articulo-20-fichaje-hospitales-centros-s'],
];

const REGEX = [
  [/\n#{1,4}\s*(?:\d+\.\s*)?Sobre el autor[\s\S]{0,1400}?(?=\n---\n|\n#{1,3}\s|\n\*\*Fuentes|\n###\s|$)/g, '\n'],
  [/\n#{1,4}\s*(?:\d+\.\s*)?About the Author[\s\S]{0,1400}?(?=\n---\n|\n#{1,3}\s|\n##\s|$)/g, '\n'],
];

const STR = [
  ['los datos siguientes son de una planta real anonimizada conforme a cláusula de confidencialidad. Los nombres, ubicaciones y magnitudes absolutas han sido alterados, pero las **proporciones y las conclusiones operativas son representativas** del sector FV europeo.',
   'los datos siguientes son un caso práctico simulado construido con fines didácticos a partir de parámetros plausibles del sector FV europeo. No corresponde a una implantación real de WorkSamp ni a un cliente concreto.'],
  ['📋 **Datos anonimizados** — planta real auditada en 2025, identificadores omitidos por confidencialidad.',
   '📋 **Caso práctico simulado** — ejemplo construido con fines didácticos; no corresponde a una implantación real de WorkSamp ni a un cliente concreto.'],
  ['**Anonymized data** — real plant audited in 2025, identifiers omitted for confidentiality.',
   '**Simulated practical example** — built with didactic purposes from plausible sector parameters; it does not correspond to a real implementation or to a specific client.'],
  ['## 6. Anonymized Case:', '## 6. Simulated Practical Case:'],
  ['Anonymized Case', 'Simulated Practical Case'],
  ['caso anonimizado compuesto', 'caso compuesto'],
  ['Caso anonimizado', 'Caso práctico simulado'],
  ['caso anonimizado', 'caso práctico simulado'],
  ['Métricas redondeadas para preservar la anonimización.', 'Métricas redondeadas, de forma orientativa.'],
  ['(similar al modelo operativo de Inditex, sinclaim de affiliation)', '(similar al modelo operativo de una cadena de moda de gran volumen)'],
  ['Dato sectorial verificado: según', 'Según'],
  ['La trampa más frecuente (verificada en auditorías reales) es usar', 'La trampa más frecuente es usar'],
  ['Valores precalculados (verificados con Python):', 'Valores del ejemplo:'],
  ['**Aleatoriedad verificada**', '**Aleatoriedad del plan**'],
  ['organización industrial verificados en España y LATAM', 'organización industrial en España y LATAM'],
  ['## Referencias verificadas (septiembre 2026)', '## Referencias (septiembre 2026)'],
  ['## Fuentes y referencias verificadas', '## Fuentes y referencias'],
  ['### Fuentes verificadas', '### Fuentes'],
  ['## Calculos verificados con Python', '## Cálculos del ejemplo'],
  ['## 5. Fórmulas verificadas y tamaño de muestra', '## 5. Fórmulas y tamaño de muestra'],
  ['## Fórmulas verificadas con Python', '## Cálculos del ejemplo'],
  ['## Cross-selling ecosystem (todos HTTP 200 verificados)', '## Enlaces de interés'],
  ['Fuentes verificadas con curl a las URL oficiales antes de redactar:', 'Fuentes consultadas:'],
  ['Caso anonimizado, fórmulas verificadas y checklist de auditoría.', 'Caso práctico simulado, fórmulas de referencia y checklist de auditoría.'],
  ['dirige a una URL HTTP 200 verificada con curl a fecha de 2026-09-21.', 'dirige a una URL activa del ecosistema.'],
  ['⚠️ 403 CF — dato verificado vía fuente secundaria (ref. 3)', 'dato recogido vía fuente secundaria (ref. 3)'],
  ['**Caso práctico simulado**: hospital comarcal de 320 camas, servicio de Urgencias, 14 facultativos en plantilla.',
   '**Caso práctico simulado**: hospital comarcal de 320 camas, servicio de Urgencias, 14 facultativos en plantilla (ejemplo construido con fines didácticos: no corresponde a una implantación real ni a un cliente concreto).'],
];

function walk(obj, fn) {
  if (typeof obj === 'string') return fn(obj);
  if (Array.isArray(obj)) return obj.map(v => walk(v, fn));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = walk(v, fn);
    return out;
  }
  return obj;
}

function transform(s) {
  let t = s;
  for (const [re, rep] of REGEX) t = t.replace(re, rep);
  for (const [o, n] of STR) t = t.split(o).join(n);
  return t;
}

(async () => {
  const before = {};
  const stamp = new Date().toISOString().slice(0, 10);
  for (const [coll, id] of TARGETS) {
    const ref = db.collection(coll).doc(id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING', coll, id); continue; }
    before[coll + '/' + id] = snap.data();
    const upd = walk(snap.data(), transform);
    await ref.set(upd);
    console.log('fixed', coll, id);
  }
  fs.writeFileSync(`/home/ubuntu/.hermes/state/backup-ecosistema-clase-${stamp}.json`, JSON.stringify(before, null, 1));
  console.log('backup ->', `backup-ecosistema-clase-${stamp}.json`);

  let bad = 0;
  for (const [coll, id] of TARGETS) {
    const f = (await db.collection(coll).doc(id).get()).data();
    const text = JSON.stringify(f);
    const hits = ['Sobre el autor', 'Miguel Cano', 'About the Author', 'anonimizad', 'Anonymized', 'Ingeniero industrial y fundador', 'ingeniero industrial y fundador'].filter(p => text.includes(p));
    console.log('readback', id, '| forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  console.log(bad === 0 ? 'ECO CLASE FIX OK' : 'ECO CLASE FIX FAILED');
  process.exit(bad === 0 ? 0 : 1);
})();
