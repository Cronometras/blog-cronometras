const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { load } = require('cheerio');

// Inspect the generated HTML, including duplicates split across pagination.
const groups = new Map();
let pages = 0;
for (const lang of ['es', 'en']) {
  const root = path.join('dist', lang, 'blog');
  for (const file of fs.readdirSync(root, { recursive: true })) {
    const relative = file.replaceAll('\\', '/');
    if (!/^(index\.html|page\/\d+\/index\.html|category\/[^/]+\/(?:page\/\d+\/)?index\.html)$/.test(relative)) continue;
    const $ = load(fs.readFileSync(path.join(root, file), 'utf8'));
    const urls = $('a.block').filter((i, el) => $(el).find('h2').length)
      .map((i, el) => $(el).attr('href').replace(/\/+$/, '')).get();
    const group = `${lang}/${relative.replace(/(?:page\/\d+\/)?index\.html$/, '')}`;
    const seen = groups.get(group) || new Set();
    for (const url of urls) {
      assert.ok(!seen.has(url), `Duplicate article ${url} in ${group}`);
      assert.ok(fs.existsSync(path.join('dist', url, 'index.html')), `Missing article ${url}`);
      seen.add(url);
    }
    groups.set(group, seen);
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      const schema = JSON.parse($(el).html());
      if (schema['@type'] === 'ItemList') {
        const items = schema.itemListElement.map(item => item.url || item.item?.url);
        assert.equal(items.length, new Set(items).size, `Duplicate structured data in ${relative}`);
      }
    }
    pages++;
  }
}
console.log(JSON.stringify({ listingPages: pages, listingGroups: groups.size, duplicates: 0 }));
