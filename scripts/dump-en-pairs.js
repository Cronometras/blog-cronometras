#!/usr/bin/env node
// Volcado de pares ES/EN para los espejos EN pendientes (solo lectura).
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const WANT = {
  'oee-iso22400': { es: /es\/calculo-del-oee-en-lineas-de-produccion-por-que/, en: ['3O4DZ3Q2F1cFgdT7WX4E', 'vTzZY5Yo8vV7MJY767dZ'] },
  'video': { es: /es\/analisis-de-video-industrial/, en: ['m3KIpDQhV1si5nAi9DbD'] },
  'consultoria': { es: /es\/consultoria-de-productividad-industrial/, en: ['jSpkx0prU3TBYs6ZYt6j'] },
  'takt': { es: /es\/takt-time/, en: ['rBUfBcS6vETmLVgwx4WA'] },
  'tiempo-observado': { es: /es\/tiempo-observado/, en: ['k7Lvr6okv3qJCdk6zsRK'] },
  'toma-tiempos': { es: /es\/toma-de-tiempos/, en: ['phhiUyvRDnqTxQk0ZuuW'] },
  'hombre-maquina': { es: /es\/trabajos-hombre-maquina/, en: ['YZZoe6E1mG6bIxCRll6i'] },
};

(async () => {
  const snap = await db.collection('articulos_cronometras').get();
  const docs = [];
  snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
  fs.mkdirSync('/tmp/tanda9/enfix', { recursive: true });
  for (const [name, cfg] of Object.entries(WANT)) {
    const es = docs.find(d => cfg.es.test(d.slug || ''));
    if (es) {
      fs.writeFileSync(`/tmp/tanda9/enfix/PAIR-${name}-ES.json`, JSON.stringify({ id: es.id, slug: es.slug, topic: es.topic, description: es.description, content: es.content }, null, 2));
      console.log(name, 'ES ->', es.id, es.slug);
    } else console.log(name, 'ES NO ENCONTRADO');
    for (const enId of cfg.en) {
      const d = docs.find(x => x.id === enId);
      if (d) {
        fs.writeFileSync(`/tmp/tanda9/enfix/PAIR-${name}-EN-${enId}.json`, JSON.stringify({ id: d.id, slug: d.slug, topic: d.topic, description: d.description, content: d.content }, null, 2));
        console.log(name, 'EN ->', d.id, d.slug);
      } else console.log(name, 'EN MISSING', enId);
    }
  }
  // Listado de .mdx EN espejo existentes
  const mdxDir = '/home/ubuntu/projects/blog-cronometras/src/content/blog/en';
  const mdx = fs.readdirSync(mdxDir).filter(f => f.endsWith('.mdx'));
  fs.writeFileSync('/tmp/tanda9/enfix/en_mdx_list.txt', mdx.join('\n'));
  console.log('mdx EN:', mdx.length);
  process.exit(0);
})();
