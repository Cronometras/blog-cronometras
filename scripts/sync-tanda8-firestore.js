#!/usr/bin/env node
// Sync tanda 8 -> Firestore articulos_cronometras: 4 docs con contenido nuevo
// (files en /tmp/tanda8/new) + 2 docs con reemplazos puntuales. Backup + read-back.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();
const coll = db.collection('articulos_cronometras');

const NOTE = '2026-10-13: revisión de rigor — verdad de producto, aritmética recalculada y limpieza de texto interno.';

const FULL = [
  ['es-d661e14701cbe0a2', '/tmp/tanda8/new/es-d661e14701cbe0a2.md', 'es/analisis-de-video-industrial-y-auditoria-forense-del-tiempo-el-fin-del-cronometro-clasico'],
  ['es-7f85665a73d4d4db', '/tmp/tanda8/new/es-7f85665a73d4d4db.md', 'es/calculo-del-oee-en-lineas-de-produccion-por-que-tu-factor-de-rendimiento-es-falso-sin-ingenieria-de-metodos-analisis-iso-22400'],
  ['es-bd920342525a8f53', '/tmp/tanda8/new/es-bd920342525a8f53.md', 'es/consultoria-de-productividad-industrial-el-enfoque-de-cronometras-hacia-la-excelencia-operacional'],
  ['articulo-22-cronoanalisis-centros-datos-', '/tmp/tanda8/new/articulo-22.md', 'es/cronoanalisis-centros-datos-data-centers-operacion-mantenimiento'],
];

const REPL = {
  'articulo-14-comparativa-pmts-mtm-most-mt': [
    ['MTM fue desarrollado entre 1940 y 1965 por la **MTM Association** (con sede en Hamburgo, Alemania y oficinas en más de 30 países). A partir del sistema base, la asociación ha publicado cuatro variantes oficiales certificadas:',
     'MTM fue desarrollado por **H. B. Maynard, J. L. Stegemerten y J. G. Schwab** en Westinghouse y publicado en 1948 en el libro *Methods-Time Measurement*. Después, la **MTM Association** (con sede en Hamburgo, Alemania y oficinas en más de 30 países) lo ha estandarizado y mantiene. A partir del sistema base se han publicado varias variantes oficiales certificadas:'],
    ['| **MTM-1** | 19 (Reach R, Move M, Turn T, Grasp G, Position P, Release RL, Disengage D, Apply Pressure AP, Crank C, Eye Travel ET, Eye Focus EF, Foot Move FM, Leg Move LM, Bend Stoop BS, Sit S, Stand ST, Kneel KL, etc.) | Análisis forense, puestos con tiempo de ciclo > 1,6 min, fabricación discreta de precisión |',
     '| **MTM-1** | Movimientos básicos detallados (Reach R, Move M, Turn T, Grasp G, Position P, Release RL, Disengage D, Apply Pressure AP, Crank C, Eye Travel ET y movimientos corporales) | Análisis detallado, puestos con tiempo de ciclo > 1,6 min, fabricación discreta de precisión |'],
    ['MOST fue desarrollado por **H.B. Maynard & Co.** a partir de 1966 como sistema de cuarta generación. Utiliza una secuencia simplificada de letras (A, B, C, D, E, F, G, H, I) que codifican movimientos generales. En 1980 se publicaron dos variantes adicionales (verificado en [Wikipedia, MOST](https://en.wikipedia.org/wiki/Maynard_operation_sequence_technique), revisión febrero 2026):',
     'MOST fue desarrollado por **K. B. Zandin** en la división sueca de H.B. Maynard & Co. (1967-1972) y se introdujo en EE. UU. en 1974, como sistema de cuarta generación. No enumera movimientos básicos: codifica la operación con secuencias tipo. Posteriormente se publicaron variantes adicionales (según [Wikipedia, MOST](https://en.wikipedia.org/wiki/Maynard_operation_sequence_technique)):'],
    ['A diferencia de MTM, MOST no enumera 19 movimientos básicos, sino que trabaja con **tres secuencias tipo**:\n\n- **Activity Sequence (A)**: movimiento del cuerpo (caminar, sentarse, levantarse).\n- **Move Sequence (B)**: movimiento de objetos.\n- **Tool Sequence (C)**: uso de herramientas.\n\nCada secuencia combina sub-índices como `A1 B0 C0` para describir una operación completa.',
     'A diferencia de MTM, MOST no enumera movimientos básicos, sino que trabaja con **tres secuencias tipo**:\n\n- **Secuencia de movimiento general** (ABG ABP AB): desplazamiento del cuerpo y de objetos.\n- **Secuencia de movimiento controlado** (ABG Apx Bpx): movimientos guiados hasta una posición.\n- **Secuencia de uso de herramientas** (ABG AB MxI T AB): operaciones con herramienta sobre la pieza.\n\nCada secuencia se codifica con letras e índices numéricos que describen la operación completa.'],
    ['## 5. MTS (Methods Time Measurement) — sistema canadiense',
     '## 5. MTS — sistema canadiense'],
    ['El sistema **MTS** fue desarrollado en Canadá por **G.C. Embry** (1966–1969) y se comercializa hoy por la organización **MTS Canada**. Sus puntos diferenciales:',
     'El sistema **MTS** es un sistema canadiense de tiempos predeterminados orientado a ciclos cortos, mantenido por la organización **MTS Canada**. Sus puntos diferenciales:'],
    ['Diseñado originalmente para la industria maderera y de pasta de papel canadiense, hoy aplicado en alimentación, química y manufactura general.',
     'Diseñado para la industria maderera y de pasta de papel canadiense, se aplica hoy también en alimentación, química y manufactura general.'],
    ['**DMT** es el sistema más reciente y menos extendido. Lo publicó **H.B. Maynard & Co.** en 1989 como evolución de MOST, integrando los principios de MTM en una estructura modular más sencilla.',
     '**DMT** (*Dimensional Motion Times*) es el sistema más reciente y menos extendido del grupo. Es una evolución de MOST que integra los principios de MTM en una estructura modular más sencilla.'],
    ['- **Debilidades**: poca masa crítica de analistas certificados, dependencia casi total de H.B. Maynard.',
     '- **Debilidades**: poca masa crítica de analistas certificados y soporte muy limitado.'],
    ['- **Fortalezas**: análisis 3–5 veces más rápido que MTM-1, cobertura amplia (incluye movimientos corporales completos), curva de aprendizaje moderada.',
     '- **Fortalezas**: análisis 3–5 veces más rápido que MTM-1 (cifra orientativa), cobertura amplia (incluye movimientos corporales completos), curva de aprendizaje moderada.'],
    ['coste de formación elevado (≈ 2.500–4.000 € por analista en curso oficial), data card cerrada',
     'coste de formación elevado (≈ 2.500–4.000 € por analista en curso oficial, cifra orientativa), data card cerrada'],
    ['| Sistema | Movimientos básicos | Tiempo medio de análisis | Coste relativo de formación | Sectores donde domina | Variantes certificadas |',
     '| Sistema | Movimientos básicos | Tiempo medio de análisis (orientativo) | Coste relativo de formación | Sectores donde domina | Variantes certificadas |'],
    ['| **MTM-1** | 19 | 10–20 min/op | Alto | Automoción, hospitals, electrónica, defensa |',
     '| **MTM-1** | detallados | 10–20 min/op | Alto | Automoción, hospitales, electrónica, defensa |'],
    ['**Disponible para formación premium (> 4.000 € por analista)**',
     '**Disponible para formación premium (> 4.000 € por analista, cifra orientativa)**'],
    ['- **Disponible medio (1.500–3.000 €)**: BasicMOST o MTS.',
     '- **Disponible medio (1.500–3.000 €, cifra orientativa)**: BasicMOST o MTS.'],
    ['- **Aeronáutica**: BasicMOST / MaxiMOST (Boeing, Airbus y derivados).',
     '- **Aeronáutica**: BasicMOST / MaxiMOST.'],
    ['- **BasicMOST** es la elección pragmática para empezar: cubre el 70% de los casos de fabricación discreta con 1/3 del tiempo de análisis.',
     '- **BasicMOST** es la elección pragmática para empezar: cubre la mayoría de los casos de fabricación discreta con una fracción del tiempo de análisis.'],
    ['2. Cronometrar la realidad en planta con Cronometras durante 5–10 ciclos → tiempo observado.',
     '2. Cronometrar la realidad en planta con Cronometras, durante los ciclos necesarios → tiempo observado.'],
    ['La app **[Cronometras](https://cronometras.com/es/)** trabaja con tiempos cronometrados en planta y los transforma en tiempos estándar aplicando suplementos y valoraciones del ritmo (Westinghouse, Bedaux).',
     'La app **[Cronometras](https://cronometras.com/es/)** trabaja con tiempos cronometrados en planta y los transforma en tiempos estándar aplicando la apreciación sintética del ritmo y los suplementos OIT y TAL.'],
    ['Esta estandarización es histórica: la familia **MTM** fue la primera en definirla (1955),',
     'Esta estandarización es histórica: la familia **MTM** fue la primera en definirla,'],
    ['Wikipedia, revisión febrero 2026: *Maynard Operation Sequence Technique*.',
     'Wikipedia: *Maynard Operation Sequence Technique*.'],
    ['Wikipedia, revisión abril 2026: *Methods-Time Measurement*.',
     'Wikipedia: *Methods-Time Measurement*.'],
    ['## 12. Referencias y datos verificables', '## 12. Referencias y fuentes'],
    ['con criterios verificables para que la decisión se base en datos y no en inercia.',
     'con criterios contrastables para que la decisión se base en datos y no en inercia.'],
    ['### 3.2. Rango y datos verificables', '### 3.2. Rango y datos del sistema'],
  ],
  'articulo-7-cronoanalisis-baterias-litio': [
    ['| Disponibilidad | 71 % | 84 % | +13 pp |', '| Disponibilidad | 75 % | 84 % | +9 pp |'],
    ['| Rendimiento | 79 % | 85 % | +6 pp |', '| Rendimiento | 81 % | 85 % | +4 pp |'],
    ['en 5 turnos completos × 3 turnos/día', 'en 5 días completos (3 turnos/día)'],
    ['Más del **60 % del coste de conversión** se concentra', 'Más del **60 % del coste de conversión (cifra orientativa)** se concentra'],
    ['puede ser el **5-8 % del coste de conversión**', 'puede ser el **5-8 % del coste de conversión (cifra orientativa)**'],
    ['la mediana de las plantas nuevas europeas está en el 65-70 %, y esta planta pasaría al percentil 75-80—.',
     'en plantas nuevas europeas se manejan valores en el entorno del 65-70 % (cifra orientativa), y esta planta quedaría en la franja alta—.'],
    ['rechazo en cámara —**2-5 %** en una planta sana; por encima del **10 %** indica problema de proceso—, días de inventario en cámara y defectos en cliente —por debajo de **50 ppm** en automoción de primer nivel—.',
     'rechazo en cámara —**2-5 %** en una planta sana y por encima del **10 %** indica problema de proceso (valores orientativos)—, días de inventario en cámara y defectos en cliente —por debajo de **50 ppm** en automoción de primer nivel (valor orientativo)—.'],
    ['los datos son plausibles dentro del rango publicado en la literatura del sector (Hao et al., *Nature Energy* 2022; Wood Mackenzie 2024), pero no son cifras de ninguna planta real.',
     'los datos son plausibles dentro del rango publicado en la literatura técnica del sector, pero no son cifras de ninguna planta real.'],
    ['(referencia: BNEF 2024 para una planta europea en ramp-up)', '(estimación orientativa para una planta europea en ramp-up)'],
    ['cada quick win entra en el presupuesto con su euro estimado y su efecto verificado.',
     'cada quick win entra en el presupuesto con su euro estimado y su efecto esperado.'],
  ],
};

const FIELD_FIX = {
  'articulo-14-comparativa-pmts-mtm-most-mt': {
    keywords: ['MTM', 'MOST', 'PMTS', 'ingenieria de metodos', 'tiempos predeterminados', 'estudio de tiempos', 'productividad industrial'],
    categoria: 'MTM',
    description: 'Comparativa de los sistemas de tiempos predeterminados MTM, MOST, MTS y DMT: detalle, sectores y criterios para elegir el adecuado para su planta.',
    excerpt: 'Comparativa de los sistemas de tiempos predeterminados MTM, MOST, MTS y DMT: detalle, sectores y criterios para elegir el adecuado para su planta.',
  },
  'articulo-7-cronoanalisis-baterias-litio': {
    keywords: ['cronoanalisis', 'baterias de litio', 'gigafactoria', 'formacion electroquimica', 'SEI', 'aging test', 'dry room', 'IEC 62660', 'PowerCo', 'AESC', 'Renault'],
  },
  'articulo-22-cronoanalisis-centros-datos-': {
    keywords: ['cronoanálisis data center', 'CPD centro de datos', 'TIA-942', 'EN 50600', 'Uptime Institute', 'Tier III', 'Tier IV', 'operación 24/7', 'NOC', 'facility management'],
    categoria: 'Cronometraje Industrial',
    description: 'Cronoanálisis en data centers Tier III/IV: taxonomía VA/NVA/IMP, fórmulas de referencia, MTTR/MTBF y checklist de auditoría para operación 24/7.',
    excerpt: 'Cronoanálisis en data centers Tier III/IV: taxonomía VA/NVA/IMP, fórmulas de referencia, MTTR/MTBF y checklist de auditoría para operación 24/7.',
  },
};

const FORBIDDEN = ['OLTA', 'OIT v4', 'Tribunal de Arbitraje', 'Sobre el autor', 'Miguel Cano', 'HTTP 200', 'verificad', 'Frontmatter', 'Cross-selling', '19 checks', 'Salida real verificada', 'Fórmulas verificadas', 'anonimizad', '批准', 'Key Citations', 'ResearchGate', 'LinkedIn Pulse', 'captura automática por evento', 'IEC 62443', 'CronometrasApp Video Analyzer', 'Hao et al', 'computadora'];

(async () => {
  const before = {};
  const touched = {};

  for (const [id, file, slug] of FULL) {
    const doc = await coll.doc(id).get();
    if (!doc.exists) { console.log('MISSING', id); continue; }
    before[id] = doc.data();
    const content = fs.readFileSync(file, 'utf8').trim();
    await doc.ref.update({ content, correctionNote: NOTE });
    touched[id] = slug;
    console.log('updated(full)', id, content.length, 'chars');
  }

  for (const [id, reps] of Object.entries(REPL)) {
    const doc = await coll.doc(id).get();
    if (!doc.exists) { console.log('MISSING', id); continue; }
    before[id] = doc.data();
    let content = doc.data().content || '';
    for (const [oldS, newS] of reps) {
      if (!content.includes(oldS)) { console.log('NO MATCH en', id, ':', oldS.slice(0, 60)); continue; }
      content = content.split(oldS).join(newS);
    }
    await doc.ref.update({ content, correctionNote: NOTE });
    touched[id] = id;
    console.log('updated(repl)', id, content.length, 'chars');
  }

  for (const [id, fields] of Object.entries(FIELD_FIX)) {
    const doc = await coll.doc(id).get();
    if (!doc.exists) { console.log('MISSING', id); continue; }
    if (!before[id]) before[id] = doc.data();
    await doc.ref.update(fields);
    console.log('fields fixed', id, Object.keys(fields).join(','));
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const backupPath = `/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda8-${stamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(before, null, 1));
  console.log('backup ->', backupPath);

  let bad = 0;
  for (const [id, slug] of Object.entries(touched)) {
    const f = (await coll.doc(id).get()).data();
    const text = [f.content || '', f.description || '', f.topic || '', f.excerpt || '', (f.keywords || []).join(' ')].join('\n');
    const hits = FORBIDDEN.filter(p => text.includes(p));
    console.log('readback', id, '| content', (f.content || '').length, 'chars | forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  console.log(bad === 0 ? 'SYNC+READBACK OK' : 'READBACK FAILED: ' + bad);
  process.exit(bad === 0 ? 0 : 1);
})();
