#!/usr/bin/env node
// Fix de clase en articulo-17 (envasado) y articulo-19 (paradas): bloques de
// autor, «caso anonimizado», meta-editorial y «HTTP 200» en referencias.
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const SA = JSON.parse(fs.readFileSync(path.join('/home/ubuntu/projects/blog-cronometras', 'sa.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(SA) });
const db = admin.firestore();

const NOTE = '2026-10-13: fix de clase — bloque de autor eliminado, «caso anonimizado» → «caso práctico simulado», limpieza de meta-editorial.';

function stripAuthorBlock(c) {
  // Elimina "## Sobre el autor" / "**Sobre el autor**" con su bloque hasta el separador siguiente
  c = c.replace(/\n(##|\*\*)\s*Sobre el autor[\s\S]{0,700}?\n---\n/g, '\n');
  return c;
}

(async () => {
  const out = {};
  const before = {};

  // ---------- articulo-17 ----------
  {
    const id = 'articulo-17-cronoanalisis-envasado-bebid';
    const ref = db.collection('articulos_cronometras').doc(id);
    const d = (await ref.get()).data();
    before[id] = d;
    let content = d.content || '';
    content = content.replace(
      '> **Caso anonimizado verificado**: una planta de cerveza industrial en España redujo sus cambios de formato de 87 a 22 minutos en 6 meses aplicando SMED con soporte MTM. El OEE pasó del 62 % al 74 % (+12 puntos), equivalente a unas 14.000 cajas adicionales/mes (datos agregados, no atribuibles a planta específica — fuente: caso publicado por [iLEAN sobre cerveza industrial](https://www.ilean.ai/es/sectores/alimentaria/cerveza-industrial-edge-cambio-marca-formato/)).',
      '> **Caso publicado en la literatura del sector**: una planta de cerveza industrial en España redujo sus cambios de formato de 87 a 22 minutos en 6 meses aplicando SMED. El OEE pasó del 62 % al 74 % (+12 puntos), equivalente a unas 14.000 cajas adicionales/mes (datos agregados según el [caso publicado por iLEAN sobre cerveza industrial](https://www.ilean.ai/es/sectores/alimentaria/cerveza-industrial-edge-cambio-marca-formato/)).');
    content = content.replace('## 5. Caso anonimizado: auditoría 360° en una planta multiproducto',
      '## 5. Caso práctico simulado: auditoría 360° en una planta multiproducto');
    content = content.replace('Una planta de bebidas multiproducto del centro de España (anonimizada como "Planta B") con dos líneas operativas:',
      'Una planta de bebidas multiproducto del centro de España (caso práctico simulado, "Planta B") con dos líneas operativas:');
    content = content.replace('## Referencias verificadas', '## Referencias y fuentes');
    content = content.replace(/(> \*\*Nota editorial\*\*:)[\s\S]*?\n/,
      '> **Caso práctico simulado.** Ejemplo construido con fines didácticos a partir de parámetros plausibles del sector. No corresponde a una implantación real de Cronometras ni a un cliente concreto: las cifras (Planta B, OEE del 64 % al 73 %, payback de 25 días) son una composición de rangos publicados en la literatura abierta, no atribuibles a una planta específica. Toda mención de empresas del sector (Mahou San Miguel, Damm, Hijos de Rivera, Heineken, Krones, Sidel, SÜKAT/Sunswell, Co.Mac., Leybold) se refiere a su presencia pública en el sector, no a una relación comercial con ProdCont.\n');
    content = content.replace('Si quieres profundizar en cómo CronometrasApp soporta estas metodologías o necesitas un caso aplicado a tu planta concreta,',
      'Si quieres profundizar en cómo aplicar este marco o necesitas un caso aplicado a tu planta concreta,');
    content = stripAuthorBlock(content);
    content = content.split('caso anonimizado').join('caso práctico simulado');
    const upd = { content, correctionNote: NOTE };
    upd.description = (d.description || '').split('caso anonimizado').join('caso práctico simulado');
    upd.excerpt = (d.excerpt || '').split('caso anonimizado').join('caso práctico simulado');
    await ref.update(upd);
    out[id] = upd;
    console.log('fixed', id, content.length, 'chars');
  }

  // ---------- articulo-19 ----------
  {
    const id = 'articulo-19-cronoanalisis-paradas-progra';
    const ref = db.collection('articulos_cronometras').doc(id);
    const d = (await ref.get()).data();
    before[id] = d;
    let content = d.content || '';
    content = content.replace('## 6. Caso anonimizado: parada de una unidad FCC de 90 kt/año',
      '## 6. Caso práctico simulado: parada de una unidad FCC de 90 kt/año');
    content = content.replace('> **Nota**: los datos siguientes son un caso anonimizado basado en la casuística pública del sector. Las cifras son **plausibles y verosímiles**, no corresponden a una planta real identificada.',
      '> **Caso práctico simulado.** Ejemplo construido con fines didácticos a partir de la casuística pública del sector. No corresponde a una implantación real de Cronometras ni a un cliente concreto: las cifras son plausibles, pero no corresponden a una planta real identificada.');
    content = content.replace('control horario y cumplimiento NIS2 del log de auditoría de la app,',
      'control horario y trazabilidad documental,');
    content = content.replace('### Fuentes verificadas', '### Fuentes');
    content = content.split(' — HTTP 200, ').join(' — ');
    content = content.split('— HTTP 200, ').join('— ');
    content = content.split('HTTP 200').join('');
    content = stripAuthorBlock(content);
    content = content.split('caso anonimizado').join('caso práctico simulado');
    const upd = { content, correctionNote: NOTE };
    upd.description = (d.description || '').split('caso anonimizado').join('caso práctico simulado');
    upd.excerpt = (d.excerpt || '').split('caso anonimizado').join('caso práctico simulado');
    await ref.update(upd);
    out[id] = upd;
    console.log('fixed', id, content.length, 'chars');
  }

  const stamp = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(`/home/ubuntu/.hermes/state/backup-articulos_cronometras-tanda8-clase-${stamp}.json`, JSON.stringify(before, null, 1));
  console.log('backup ->', `backup-articulos_cronometras-tanda8-clase-${stamp}.json`);
  // Read-back
  let bad = 0;
  for (const id of Object.keys(out)) {
    const f = (await db.collection('articulos_cronometras').doc(id).get()).data();
    const text = [f.content || '', f.description || '', f.excerpt || ''].join('\n');
    const hits = ['Sobre el autor', 'Miguel Cano', 'anonimizad', 'HTTP 200', 'verificad', 'Nota editorial', 'Ingeniero industrial y fundador'].filter(p => text.includes(p));
    console.log('readback', id, '| content', (f.content || '').length, '| forbidden:', hits.length ? hits.join(',') : 'none');
    if (hits.length) bad++;
  }
  console.log(bad === 0 ? 'CLASE FIX OK' : 'CLASE FIX FAILED');
  process.exit(bad === 0 ? 0 : 1);
})();
