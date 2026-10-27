const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const fsSync = require('node:fs');
const initial = require('../output/imagegen/app-showcases.json');
const saturation = require('../output/imagegen/saturation.json');
const root = path.resolve(__dirname, '..');
const initialSources = [
  'adaptada-a-moviles-tablets-y-pc', 'cronometro-repetitivos',
  'calculo-de-tomas-restantes', 'resultados-en-tiempo-real',
  'gestion-integral-de-estudios', 'informe-pdf',
];
const aliases = {
  'organizacion-en-carpetas': 'dashboard-estudios',
  'info-screen': 'info', 'method-screen': 'reordena-el-metodo-de-trabajo',
  'repetitive-screen': 'cronometraje-elementos-encadenados',
  'continuous-screen': 'pantalla-de-cronometraje-continuo',
  'frequency-screen': 'cronometraje-elementos-frecuenciales',
  'machine-screen': 'cronometro-maquina',
  'supplements-screen': 'suplementos-oit-fatiga',
  'report-screen': 'informe-automatizado',
};
const widths = [320, 640, 960, 1536];
const budgets = { 320: 18000, 640: 45000, 960: 85000, 1536: 160000 };

function readRecords() {
  const directory = path.join(root, 'output/imagegen/screens');
  const additional = fsSync.existsSync(directory)
    ? fsSync.readdirSync(directory).filter(file => file.endsWith('.json')).map(file => JSON.parse(fsSync.readFileSync(path.join(directory, file), 'utf8')))
    : [];
  return [
    ...initial.images.map((image, i) => ({ ...image, source: `/images/webp/${initialSources[i]}.webp` })),
    ...saturation.images.map(image => ({ ...image, source: '/images/webp/saturation-study.webp' })),
    ...additional.filter(image => ![14, 16, 37, 55].includes(image.id)),
  ];
}

function describe(image, language) {
  for (const location of image.locations || []) {
    if (!location.replaceAll('\\', '/').includes(`/${language}/`)) continue;
    const content = fsSync.readFileSync(path.join(root, location), 'utf8');
    const index = content.indexOf(image.source);
    if (index < 0) continue;
    const match = content.slice(index, index + 400).match(/alt:\s*["']([^"']+)["']/);
    if (match && !match[1].includes('interface for verbal comments')) return match[1];
  }
  const subject = image.slug.replaceAll('-', ' ');
  return language === 'es' ? `Pantalla de ${subject} en Cronometras` : `Cronometras app — ${subject}`;
}

async function main() {
  const destination = path.join(root, 'public/images/app-showcases');
  await fs.mkdir(destination, { recursive: true });
  const cache = path.join(root, 'output/imagegen/optimized');
  await fs.mkdir(cache, { recursive: true });
  const catalog = {};
  const report = [];
  for (const image of readRecords()) {
    const variants = [];
    for (const width of widths) {
      const suffix = width === 1536 ? '' : `-${width}`;
      const file = path.join(destination, `${image.slug}${suffix}.webp`);
      const stamp = path.join(cache, `${image.slug}${suffix}.stamp`);
      // Skip previous passes: generation can finish while this script runs.
      if (!fsSync.existsSync(stamp)) {
        let buffer;
        for (const quality of [82, 78, 74]) {
          buffer = await sharp(image.generatedPath).resize({ width }).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
          if (buffer.length <= budgets[width]) break;
        }
        await fs.writeFile(file, buffer);
        await fs.writeFile(stamp, 'WebP q82/78/74; max1536; v2');
      }
      variants.push({ width, bytes: (await fs.stat(file)).size, budget: budgets[width] });
    }
    const src = `/images/app-showcases/${image.slug}.webp`;
    catalog[image.source] = { src, width: 1536, height: 1024, altEs: describe(image, 'es'), altEn: describe(image, 'en') };
    const originalFile = path.join(root, 'public', image.source);
    report.push({ source: image.source, src, originalBytes: fsSync.existsSync(originalFile) ? (await fs.stat(originalFile)).size : null, variants });
  }
  for (const [alias, slug] of Object.entries(aliases)) {
    const image = Object.values(catalog).find(item => item.src === `/images/app-showcases/${slug}.webp`);
    if (image) catalog[`/images/webp/${alias}.webp`] = image;
  }
  await fs.mkdir(path.join(root, 'src/data'), { recursive: true });
  await fs.writeFile(path.join(root, 'src/data/app-showcases.json'), JSON.stringify(catalog, null, 2) + '\n');
  await fs.writeFile(path.join(root, 'output/imagegen/optimization-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`${report.length} compositions optimized; ${Object.keys(catalog).length} screenshot references mapped.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
