// Local replacements for unavailable article covers. Shared by the article,
// blog cards and social metadata through transformToBlogPost.
const replacements: Record<string, string> = {
  'photo-1518709268805-4e9042af2176': '/images/blog/refineria-turnaround.webp',
  'photo-1558494949-ef010cbd1c1a': '/images/blog/centros-datos.webp',
  'photo-1568093377303-46d0e76f8d8d': '/images/blog/envasado-bebidas.webp',
  '/assets/blog/comparativa-pmts-og.png': '/images/blog/comparativa-pmts.webp',
};

export function resolveArticleImage(imageUrl: string): string {
  for (const [missingImage, replacement] of Object.entries(replacements)) {
    if (imageUrl?.includes(missingImage)) return replacement;
  }
  return imageUrl || '/images/webp/cronometras-app.webp';
}
