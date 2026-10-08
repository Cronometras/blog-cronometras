// Extrae los SVG shapes de los iconos Feather usados por el blog.
// Más simple: lee cada archivo, busca líneas con `d:`, `points:`, `cx/cy/r:`, `x1/y1/x2/y2:`
// y las convierte a SVG. Sin parsers complicados.
import fs from 'fs';

const ICON_DIR = '/home/ubuntu/projects/blog-cronometras/node_modules/react-feather/dist/icons/';
const NEEDED = [
  'award', 'book', 'camera', 'clock', 'cloud', 'folder', 'headphones',
  'layers', 'lock', 'mail', 'play', 'shield', 'smartphone', 'users',
  'video', 'zap', 'external-link',
];

const ATTRS_NUM = ['cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2'];
const ATTRS_STR = ['d', 'points'];

function extractIcon(name) {
  const fp = ICON_DIR + name + '.js';
  const src = fs.readFileSync(fp, 'utf8');
  // Buscar la sección con createElement("X", ...) para X != 'svg'.
  // Estrategia: split por "React.createElement(" y procesar cada bloque.
  // El primer bloque contiene "svg"; el resto son los shapes interiores.
  const blocks = src.split('React.createElement(');
  const shapes = [];
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    // Primer match: ("tag", { ... })
    const tagMatch = block.match(/^"([a-z]+)",/);
    if (!tagMatch) continue;
    const tag = tagMatch[1];
    if (tag === 'svg') continue;
    if (!['circle', 'path', 'polyline', 'rect', 'line', 'polygon', 'ellipse'].includes(tag)) continue;
    // Extraer contenido { ... }
    const objMatch = block.match(/\{([\s\S]*?)\}\s*,?\s*\)/);
    if (!objMatch) continue;
    const objText = objMatch[1];
    // Parsear atributos
    const attrs = [];
    const re = /([a-zA-Z][a-zA-Z0-9]*|"[a-zA-Z][a-zA-Z0-9]*")\s*:\s*("([^"]*)"|(\d+(?:\.\d+)?))/g;
    let m;
    while ((m = re.exec(objText)) !== null) {
      const attrName = m[1].replace(/"/g, '');
      const attrValue = m[3] !== undefined ? m[3] : m[4];
      attrs.push(`${attrName}="${attrValue}"`);
    }
    if (attrs.length > 0) {
      shapes.push(`<${tag} ${attrs.join(' ')}/>`);
    } else {
      // Algunos shapes no tienen attrs (raro)
      shapes.push(`<${tag}/>`);
    }
  }
  return { name, svg: shapes.join('') };
}

const results = NEEDED.map(extractIcon);
const ok = results.filter(r => r.svg);
console.log(`Extraídos ${ok.length} / ${NEEDED.length} iconos`);
for (const r of ok) console.log(JSON.stringify(r));
