#!/usr/bin/env node
// Tanda 10: (a) gate de la lista negra sobre los 10 docs revisados,
// (b) barrido de CLASE sobre todos los docs (ES+EN) y .mdx del repo,
// (c) barrido de las mismas clases en las colecciones hermanas.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const T10 = [
  'es-d6fca30a900d697d', 'x7BYen963Eirnxld4diC', 'es-28ef1c9d714c4e4b', 'es-ca9dd8ac5b12900a',
  'es-4b6b36c70025a52c', 'es-8e755e8e4d0ce262', 'es-42b337b47452f0c3', 'es-0ab1469a4870e1eb',
  'es-6f7f676a93cfe11c', 'es-84ab36a51096a354',
];

const BLACKLIST = [
  [/\bverificad[oa]s?\b/gi, 'lista-negra: verificad'],
  [/curl/gi, 'lista-negra: curl'],
  [/HTTP 200/g, 'lista-negra: HTTP 200'],
  [/Cross-selling/gi, 'lista-negra: cross-selling'],
  [/✅|❌/g, 'lista-negra: checks'],
  [/\btrampa\b/gi, 'lista-negra: trampa'],
  [/Frontmatter/gi, 'lista-negra: frontmatter'],
  [/Sobre el autor/gi, 'lista-negra: bio'],
  [/About the Author/gi, 'lista-negra: bio EN'],
  [/fundador de ProdCont/gi, 'lista-negra: fundador'],
  [/Miguel Cano/g, 'lista-negra: nombre autor'],
  [/anonimizad/gi, 'lista-negra: anonimizad'],
  [/\b19 checks\b/gi, 'lista-negra: 19 checks'],
  [/VERIFICACIÓN EJECUTADA/g, 'lista-negra: verif ejecutada'],
  [/OLTA/g, 'P1: OLTA'],
  [/OIT v\.?\s?4/gi, 'terminologia: OIT v4'],
  [/Tribunal de Arbitraje/gi, 'terminologia: expansión TAL'],
  [/Tribunal Arbitral/gi, 'terminologia: expansión TAL'],
  [/Key Citations/gi, 'spam: key citations'],
  [/ResearchGate|LinkedIn Pulse|slideshare|pdfcoffee/gi, 'spam: citations'],
  [/Nota editorial/gi, 'meta: nota editorial'],
  [/caso anonimizado/gi, 'regla 4: caso anonimizado'],
  [/Caso anonimizado/g, 'regla 4: Caso anonimizado'],
  [/integraci[oó]n (nativa|directa).{0,40}(ERP|MES|coste|GMAO|Sage|a3)/gi, 'P1: integración'],
  [/geolocalizaci[oó]n/gi, 'P1: geolocalización'],
  [/API de exportaci[oó]n/gi, 'P1: API exportación'],
  [/\bGMAO\b/g, 'P1?: GMAO'],
  [/\bBMS\b/g, 'P1?: BMS'],
  [/PLC|SCADA/g, 'P1?: PLC/SCADA'],
  [/1\.?111 tomas|400 (observaciones|tomas)/g, 'regla: tomas fijas'],
  [/Westinghouse (aplica|implementa|usa|utiliza)/gi, 'P1: Westinghouse como función'],
  [/valoraci[oó]n sint[eé]tica (inferior|menos)/gi, 'regla: sintética inferior'],
  [/[\u4e00-\u9fff]/g, 'artefacto: caracteres chinos'],
  [/MODAPS/g, 'typo: MODAPS'],
  [/capacitaci[oó]n/gi, 'castellano: capacitación'],
  [/\bvosotros\b|\bPod[eé]is\b/gi, 'castellano: vosotros'],
  [/insights?/gi, 'anglicismo: insights'],
  [/Solicitar Demo|prueba gratuita de 15 días/gi, 'producto: CTA obsoleto'],
  [/induly\.com\/app/g, 'trampa: induly.com/app'],
  [/\bDr\.|\bcatedr[aá]tico\b/gi, 'posible cita sin fuente'],
  [/según (un )?estudios? recientes/gi, 'estadística sin fuente'],
];

const CLASS = [
  [/Cronometras(App)?[^\n]{0,60}Work Sampling/gi, 'clase: Work Sampling como módulo Cronometras'],
  [/Work Sampling[^\n]{0,40}(m[óo]dulo|module)/gi, 'clase: Work Sampling como módulo'],
  [/A \(Activity|B \(Basic Sequence|C \(Concurrent|I \(Indirect|P \(Project/g, 'clase: secuencia MOST inventada'],
  [/5\.?000 (MOST )?TMU/gi, 'clase: 5000 TMU = 1 hora'],
  [/H\.?B\.? Carey/g, 'clase: MOST = Carey'],
  [/900\+ c[óo]digos/gi, 'clase: MTM-1 900+ códigos'],
  [/Inteligencia de Mercado/gi, 'clase: informe inventado Cronometras'],
  [/desarrollado por H\.?B\.? Maynard/gi, 'clase: MOST desarrollado por Maynard'],
  [/MTM-UAS[^\n]{0,80}oficina/gi, 'clase: MTM-UAS para oficinas'],
  [/MTM aplicado a oficinas/gi, 'clase: MTM-UAS para oficinas'],
  [/Habilidad excelente \(operario fuera de serie/gi, 'clase: tabla Westinghouse simplificada'],
  [/Escala de 6 grados/gi, 'clase: Westinghouse 6 grados'],
  [/a saltos de 0[,.]05/gi, 'clase: Westinghouse saltos 0,05'],
  [/\(Norma OIT\)/g, 'clase: Norma OIT en título'],
  [/sub-multiplo de MOST/gi, 'clase: MiniMOST mal descrito'],
  [/Inspecci[oó]n de Trabajo mult[óo]/gi, 'clase: dato Inspección inventado'],
  [/contingencias 4%/gi, 'clase: desglose suplementos inventado'],
  [/Tribunal de Arbitraje|Tribunal Arbitral/gi, 'clase: expansión TAL'],
  [/OIT v\.?\s?4/gi, 'clase: OIT v4'],
  [/OLTA/g, 'clase: OLTA'],
  [/1\.847 empresas/g, 'clase: dato Inspección inventado'],
  [/CronometrasApp Work Sampling/gi, 'clase: Work Sampling como módulo'],
  [/±3% de precisi[óo]n/gi, 'clase: precisión MTM inventada'],
  [/benchmark del sector es del 55%/gi, 'clase: benchmark inventado'],
];

function scan(name, txt, patterns) {
  const hits = [];
  for (const [re, label] of patterns) {
    const m = txt.match(re);
    if (m) hits.push(`${label} x${m.length}`);
  }
  if (hits.length) console.log('⚠', name, '->', hits.join(' | '));
  return hits.length;
}

(async () => {
  const coll = db.collection('articulos_cronometras');
  const snap = await coll.get();
  const docs = [];
  snap.forEach(d => docs.push([d.id, d.data()]));
  console.log('docs en articulos_cronometras:', docs.length);

  console.log('\n=== GATE lista negra (10 docs tanda 10) ===');
  let total = 0;
  for (const id of T10) {
    const d = docs.find(x => x[0] === id);
    if (!d) { console.log('MISSING', id); continue; }
    const txt = [d[1].content || '', d[1].description || '', d[1].excerpt || '', d[1].outline || '', d[1].topic || ''].join('\n');
    total += scan('fs:' + id, txt, BLACKLIST);
  }
  console.log('GATE hits:', total);

  console.log('\n=== CLASE sobre todos los docs (content+topic+description+outline) ===');
  let classHits = 0;
  for (const [id, d] of docs) {
    const txt = [d.content || '', d.topic || '', d.description || '', d.excerpt || ''].join('\n');
    classHits += scan('fs:' + id, txt, CLASS);
  }

  console.log('\n=== CLASE sobre .mdx del repo ===');
  const dirs = ['/home/ubuntu/projects/blog-cronometras/src/content/blog'];
  const files = [];
  const walk = (p) => {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      const f = path.join(p, e.name);
      if (e.isDirectory()) walk(f);
      else if (/\.mdx?$/.test(e.name)) files.push(f);
    }
  };
  dirs.forEach(walk);
  console.log('mdx files:', files.length);
  for (const f of files) {
    classHits += scan('mdx:' + path.basename(f), fs.readFileSync(f, 'utf8'), CLASS);
  }
  console.log('CLASS hits (blog propio):', classHits);

  console.log('\n=== CLASE en colecciones hermanas ===');
  for (const c of ['articulos_blog_muestreo', 'articulos_fichadas', 'articulos_asetemyt']) {
    const s2 = await db.collection(c).get();
    let h = 0, n = 0;
    s2.forEach(d => {
      n++;
      const dd = d.data();
      const txt = JSON.stringify(dd);
      for (const [re, label] of CLASS) {
        const m = txt.match(re);
        if (m) { console.log('⚠', c, d.id, '->', label, 'x' + m.length); h += m.length; }
      }
    });
    console.log(c, 'docs:', n, 'hits:', h);
  }
  process.exit(0);
})();
