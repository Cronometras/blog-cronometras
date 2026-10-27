import catalog from '../data/app-showcases.json';

export interface AppShowcase {
  src: string;
  width: number;
  height: number;
  altEs: string;
  altEn: string;
}

const showcases: Record<string, AppShowcase> = catalog;
const byOutput = new Map(Object.values(showcases).map(image => [image.src, image]));

// Both original PNG/JPEG references and WebP references share the same output.
export function normalizeScreenshotSource(source: string): string {
  if (!source) return '';
  let pathname = source;
  if (/^https?:\/\//.test(source)) {
    const url = new URL(source);
    if (!['cronometras.com', 'www.cronometras.com'].includes(url.hostname)) return source;
    pathname = url.pathname;
  }
  try { pathname = decodeURIComponent(pathname.split(/[?#]/)[0]); } catch { return source; }
  if (pathname.startsWith('/images/webp/') || pathname.startsWith('/images/app-showcases/')) return pathname;
  if (!pathname.startsWith('/images/')) return source;
  const filename = pathname.split('/').pop()!.replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9.]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `/images/webp/${filename}.webp`;
}

export function getAppShowcaseData(source: string): AppShowcase | undefined {
  const normalized = normalizeScreenshotSource(source);
  return showcases[normalized] || byOutput.get(normalized);
}

export function getAppShowcase(source: string): string | undefined {
  return getAppShowcaseData(source)?.src;
}

export function getAppShowcaseSrcset(source: string): string | undefined {
  const image = getAppShowcaseData(source);
  return image ? [320, 640, 960, 1536].map(width =>
    `${width === 1536 ? image.src : image.src.replace('.webp', `-${width}.webp`)} ${width}w`
  ).join(', ') : undefined;
}
