const fs = require('fs');
const dir = '/tmp/tanda10';
const index = JSON.parse(fs.readFileSync(`${dir}/_index.json`, 'utf8'));
for (const e of index) {
  const d = JSON.parse(fs.readFileSync(`${dir}/${e.id}.json`, 'utf8'));
  let out = `# DOC ${e.id}\nSLUG: ${d.slug || '(sin slug)'}\nTOPIC: ${d.topic || ''}\n`;
  out += `DESCRIPTION: ${d.description || '(vacío)'}\n`;
  out += `KEYWORDS: ${JSON.stringify(d.keywords || d.palabras_clave || null)}\n`;
  out += `CATEGORIA: ${d.categoria || '(vacío)'}\n`;
  out += `IMAGEURL: ${d.imageUrl || d.coverImage || '(vacío)'}\n`;
  out += `CAMPOS: ${Object.keys(d).join(', ')}\n\n=== OUTLINE ===\n${d.outline || '(vacío)'}\n\n=== RESEARCHDATA ===\n${d.researchData || '(vacío)'}\n\n=== CONTENT ===\n${d.content || '(vacío)'}\n`;
  fs.writeFileSync(`${dir}/${e.id}.txt`, out);
  console.log(e.id, '->', out.length, 'chars txt');
}
