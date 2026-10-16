#!/usr/bin/env node
// Barrido de CLASE tanda 10 (fuentes inventadas "informes de inteligencia de mercado",
// etiqueta "(Norma OIT)", "OIT v4") sobre el ecosistema: assert-then-replace por fix.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const FIXES = [
  {
    coll: 'articulos_cronometras', id: '0uqEHTPNek09BbeT80fl', field: 'content',
    old: 'Según nuestros últimos informes de inteligencia de mercado (2024), el **65% de las pérdidas de OEE** en el sector industrial español (Metalmecánica e Inyección) provienen de tiempos de cambio no estandarizados y microparadas asociadas al arranque.',
    new: 'Como ejemplo orientativo, buena parte de las pérdidas de OEE en sectores de alta cadencia (metalmecánica e inyección) proviene de tiempos de cambio no estandarizados y microparadas asociadas al arranque.',
  },
  {
    coll: 'articulos_cronometras', id: '3NEcAGMaEpkNU2C9bA88', field: 'content',
    old: 'Según el informe técnico de investigación proyectado al escenario 2025 por el Departamento de Inteligencia de Mercado de **Cronometras**, existe una disonancia crítica entre la capacidad instalada y el rendimiento real.',
    new: 'Sin un trabajo previo de ingeniería de métodos es frecuente que exista una disonancia entre la capacidad instalada y el rendimiento real.',
  },
  {
    coll: 'articulos_cronometras', id: 'PoNPLQRzrJ1cSx2lLL7G', field: 'content',
    old: 'Según informes técnicos de inteligencia de mercado (2023-2025), la industria española enfrenta un "Gap de Registro" considerable:',
    new: 'La industria española enfrenta con frecuencia un "Gap de Registro" considerable (cifras orientativas a continuación):',
  },
  {
    coll: 'articulos_cronometras', id: 'PoNPLQRzrJ1cSx2lLL7G', field: 'content',
    old: '*   **Sobreestimación:** El rendimiento reportado suele ser un factor de **1.20 superior al real** debido a estándares de tiempo laxos.',
    new: '*   **Sobreestimación:** el rendimiento reportado puede superar al real (en torno a un factor 1,2) debido a estándares de tiempo laxos (ejemplo orientativo).',
  },
  {
    coll: 'articulos_cronometras', id: 'PoNPLQRzrJ1cSx2lLL7G', field: 'content',
    old: '*   **Peso de las Micro-paradas:** En líneas de alta cadencia (envasado, automoción), las micro-paradas representan entre el **40% y el 60%** del total de pérdidas de rendimiento.',
    new: '*   **Peso de las Micro-paradas:** en líneas de alta cadencia (envasado, automoción), las micro-paradas pueden representar una parte muy importante del total de pérdidas de rendimiento (según el tipo de línea; ejemplo orientativo).',
  },
  {
    coll: 'articulos_cronometras', id: 'PoNPLQRzrJ1cSx2lLL7G', field: 'content',
    old: '*   **Fatiga y Velocidad:** Se ha detectado una correlación directa entre la fatiga no gestionada y la caída de velocidad. La eficiencia operativa en puestos manuales cae un **15% en las últimas dos horas del turno**.',
    new: '*   **Fatiga y Velocidad:** hay correlación entre la fatiga no gestionada y la caída de velocidad; la eficiencia operativa en puestos manuales tiende a caer conforme avanza el turno (ejemplo orientativo).',
  },
  {
    coll: 'articulos_cronometras', id: 'kmgE6c7c0cNd5jHGRwvb', field: 'content',
    old: 'Guía de Precisión Estadística y Optimización de Procesos (Norma OIT)',
    new: 'Guía de Precisión Estadística y Optimización de Procesos',
  },
  {
    coll: 'articulos_cronometras', id: 'kmgE6c7c0cNd5jHGRwvb', field: 'outline',
    old: 'Guía de Precisión Estadística y Optimización de Procesos (Norma OIT)',
    new: 'Guía de Precisión Estadística y Optimización de Procesos',
  },
  {
    coll: 'articulos_blog_muestreo', id: 'articulo-3-work-sampling-parques-maquina', field: 'content',
    old: 'donde se aplican los suplementos OIT v4 y la valoración sintética del ritmo',
    new: 'donde se aplican los suplementos OIT y la valoración sintética del ritmo',
  },
  {
    coll: 'articulos_fichadas', id: '2KMWJicdQ4gJi5hNg7WK', field: 'content',
    old: 'necesidades personales y contingencias (tablas OIT v4)',
    new: 'necesidades personales y contingencias (tablas OIT)',
  },
  {
    coll: 'articulos_fichadas', id: '5e4BRLJr72Oqf7XWjKXu', field: 'content',
    old: 'Según recientes investigaciones de inteligencia de mercado en entornos industriales, **el 68% de las desviaciones en los plazos de entrega** provienen de una mala alineación',
    new: 'Como ejemplo orientativo, **una gran parte de las desviaciones en los plazos de entrega** proviene de una mala alineación',
  },
  {
    coll: 'articulos_fichadas', id: 'BJrgIpTUsdIuUA7Hv0it', field: 'content',
    old: 'Basándonos en informes recientes de inteligencia de mercado (proyección 2025), la dispersión de rendimiento entre turnos es alarmante en los sectores metalúrgico y de automoción.',
    new: 'La dispersión de rendimiento entre turnos puede ser considerable en los sectores metalúrgico y de automoción.',
  },
  {
    coll: 'articulos_fichadas', id: 'IDXrFVlWXTviuARDCV5x', field: 'content',
    old: 'Los datos de inteligencia de mercado son contundentes: mientras muchos gerentes estiman sus costes de mano de obra basándose únicamente en el salario bruto más seguridad social, el **"Coste por Minuto" real en un entorno industrial oscila frecuentemente entre 0,75 € y 1,00 €**.',
    new: 'Otro error frecuente es estimar los costes de mano de obra únicamente con el salario bruto más la seguridad social, cuando el **"Coste por Minuto" real en un entorno industrial puede ser sensiblemente mayor** (ejemplo orientativo: 0,75-1,00 € por minuto, según planta y convenio).',
  },
];

(async () => {
  let ok = 0, fail = 0;
  for (const fx of FIXES) {
    const ref = db.collection(fx.coll).doc(fx.id);
    const snap = await ref.get();
    if (!snap.exists) { console.log('MISSING', fx.coll, fx.id); fail++; continue; }
    const cur = snap.get(fx.field) || '';
    const cnt = cur.split(fx.old).length - 1;
    if (cnt !== 1) { console.log(`SKIP ${fx.coll}/${fx.id} [${fx.field}] count=${cnt}`); fail++; continue; }
    await ref.update({ [fx.field]: cur.replace(fx.old, fx.new) });
    console.log(`OK ${fx.coll}/${fx.id} [${fx.field}]`);
    ok++;
  }
  console.log('class-fix ok=', ok, 'fail=', fail);
  process.exit(0);
})();
