#!/usr/bin/env node
// Barrido final tanda 8: lista negra §6 + verdad de producto + artefactos,
// sobre los 4 .mdx (60-63) y los 6 docs Firestore (64-69).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const MDX = [
  'takt-time-que-es-como-se-calcula-y-como-se-aplica',
  'tiempo-observado-vs-tiempo-estandar',
  'toma-de-tiempos-con-cronometro',
  'trabajos-hombre-maquina-como-calcular-y-minimizar-las-interferencias-guia-practica-y-metodos-eficaces',
];
const FDOCS = [
  'es-d661e14701cbe0a2',
  'es-7f85665a73d4d4db',
  'articulo-14-comparativa-pmts-mtm-most-mt',
  'es-bd920342525a8f53',
  'articulo-7-cronoanalisis-baterias-litio',
  'articulo-22-cronoanalisis-centros-datos-',
];

// [regex, etiqueta]
const PATTERNS = [
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
  [/Pre-flight/gi, 'lista-negra: pre-flight'],
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

(async () => {
  const texts = [];
  for (const s of MDX) {
    const f = path.join('/home/ubuntu/projects/blog-cronometras/src/content/blog/es', s + '.mdx');
    if (!fs.existsSync(f)) { console.log('MDX MISSING:', s); continue; }
    texts.push(['mdx:' + s, fs.readFileSync(f, 'utf8')]);
  }
  const coll = db.collection('articulos_cronometras');
  const snap = await coll.get();
  const byId = {}; snap.forEach(d => byId[d.id] = d.data());
  for (const id of FDOCS) {
    let d = byId[id];
    if (!d) { for (const [k, v] of Object.entries(byId)) if (k.includes(id)) { d = v; break; } }
    if (!d) { console.log('DOC MISSING:', id); continue; }
    texts.push(['fs:' + id, [d.content || '', d.description || '', d.excerpt || '', d.outline || ''].join('\n')]);
  }
  let total = 0;
  for (const [name, txt] of texts) {
    const hits = [];
    for (const [re, label] of PATTERNS) {
      const m = txt.match(re);
      if (m) hits.push(`${label} x${m.length}`);
    }
    if (hits.length) { total += hits.length; console.log('⚠', name, '->', hits.join(' | ')); }
    else console.log('OK', name);
  }
  console.log('TOTAL HITOS:', total);
  process.exit(0);
})();
