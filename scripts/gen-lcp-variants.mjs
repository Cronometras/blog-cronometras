import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';

const SRC = 'public/images/webp/adaptada-a-moviles-tablets-y-pc.webp';
const OUT_DIR = 'public/images/webp/lcp';
const SIZES = [320, 640, 960, 1280];

const meta = await sharp(SRC).metadata();
console.log('Original:', meta.width, 'x', meta.height, 'format=', meta.format);

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

for (const w of SIZES) {
  // AVIF (mejor compresión, ~30% menos que webp)
  await sharp(SRC)
    .resize({ width: w, withoutEnlargement: true })
    .avif({ quality: 55, effort: 6 })
    .toFile(`${OUT_DIR}/adaptada-${w}.avif`);
  // WebP fallback
  await sharp(SRC)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(`${OUT_DIR}/adaptada-${w}.webp`);
}

console.log('Done. Generadas 8 variantes en', OUT_DIR);
