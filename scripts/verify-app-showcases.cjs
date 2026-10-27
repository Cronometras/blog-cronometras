const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { load } = require('cheerio');

const root = path.resolve(__dirname, '..');
const catalog = require('../src/data/app-showcases.json');
const report = require('../output/imagegen/optimization-report.json');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory()
    ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]);
}
let pages = 0, images = 0, originalModals = 0;
const assets = new Set();
for (const file of walk(path.join(root, 'dist')).filter(file => file.endsWith('.html'))) {
  const relative = path.relative(path.join(root, 'dist'), file).replaceAll('\\', '/');
  if (relative.includes('/blog/') || relative.startsWith('blog/')) continue;
  const $ = load(fs.readFileSync(file, 'utf8'));
  const screenshots = $('img[src^="/images/app-showcases/"]');
  if (!screenshots.length) continue;
  pages++;
  const home = /^(es|en)\/index.html$/.test(relative);
  assert.equal($('link[rel="preload"][as="image"][href*="multiplataforma"]').length, home ? 1 : 0, `${relative}: homepage-only preload`);
  screenshots.each((_, element) => {
    const image = $(element); images++;
    assert.ok(image.attr('alt')?.trim() && image.attr('alt') !== 'section-image', `${relative}: descriptive alt`);
    assert.equal(image.attr('width'), '1536', `${relative}: intrinsic width`);
    assert.equal(image.attr('height'), '1024', `${relative}: intrinsic height`);
    assert.ok(image.attr('sizes'), `${relative}: responsive sizes`);
    const srcset = image.attr('srcset') || '';
    for (const width of [320, 640, 960, 1536]) assert.ok(srcset.includes(`${width}w`), `${relative}: ${width}px variant`);
    assert.equal(image.attr('decoding'), 'async');
    const priority = image.attr('fetchpriority');
    const hero = home && image.attr('src').endsWith('/multiplataforma.webp');
    assert.equal(image.attr('loading'), hero ? 'eager' : 'lazy', `${relative}: loading policy`);
    if (hero) assert.equal(priority, 'high');
    else assert.notEqual(priority, 'high', `${relative}: offscreen image must not compete with hero`);
    for (const candidate of srcset.split(',')) {
      const source = candidate.trim().split(/\s+/)[0];
      assert.ok(fs.existsSync(path.join(root, 'public', source)), `${relative}: missing ${source}`);
      assets.add(source);
    }
  });
  $('[onclick]').each((_, element) => {
    const source = ($(element).attr('onclick') || '').match(/openModal\('([^']+)'\)/)?.[1];
    if (source && catalog[source]) {
      assert.ok(fs.existsSync(path.join(root, 'public', source)), `${relative}: missing original ${source}`);
      originalModals++;
    }
  });
}
assert.ok(pages >= 20, 'Spanish and English feature pages must be covered');
for (const image of report) {
  for (const variant of image.variants) {
    assert.ok(variant.bytes <= ({320: 25000, 640: 65000, 960: 120000, 1536: 210000})[variant.width], `${image.src}: oversized ${variant.width}px image`);
  }
}
const average = width => Math.round(report.reduce((sum, image) => sum + image.variants.find(variant => variant.width === width).bytes, 0) / report.length / 1024);
console.log(JSON.stringify({ compositions: report.length, pages, images, responsiveAssets: assets.size, originalModals, averageKB: { mobile: average(640), desktop: average(960), full: average(1536) } }, null, 2));
