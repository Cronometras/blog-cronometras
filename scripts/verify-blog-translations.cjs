const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const pairs = JSON.parse(fs.readFileSync('src/data/blog-translations.json', 'utf8'));
let checked = 0;
for (const pair of pairs) {
  for (const language of ['es', 'en']) {
    const file = path.join('dist', pair[language], 'index.html');
    assert.ok(fs.existsSync(file), `Missing built article: ${pair[language]}`);
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.equal($('html').attr('lang'), language, `Wrong HTML language: ${file}`);
    assert.ok($('title').text().trim(), `Missing title: ${file}`);
    assert.equal($('h1').length, 1, `Expected one page title: ${file}`);
    assert.ok($('.article-content').text().trim().length > 400, `Empty article: ${file}`);
    for (const targetLanguage of ['es', 'en']) {
      const expected = new URL(pair[targetLanguage], 'https://cronometras.com').href;
      assert.equal($(`link[rel="alternate"][hreflang="${targetLanguage}"]`).attr('href'), expected, `Wrong hreflang: ${file}`);
      assert.equal($(`#language-menu a[href="${pair[targetLanguage]}"]`).length, 1, `Wrong language picker: ${file}`);
    }
    assert.equal($('link[rel="canonical"]').attr('href')?.replace(/\/+$/, ''), `https://cronometras.com${pair[language]}`.replace(/\/+$/, ''), `Wrong canonical: ${file}`);
    for (const script of $('script[type="application/ld+json"]').toArray()) JSON.parse($(script).html());
    checked++;
  }
}
const builtSpanish = fs.readdirSync('dist/es/blog').filter(name => fs.existsSync(path.join('dist/es/blog', name, 'index.html')))
  .filter(name => {
    const $ = cheerio.load(fs.readFileSync(path.join('dist/es/blog', name, 'index.html'), 'utf8'));
    return $('meta[property="og:type"][content="article"]').length > 0;
  });
assert.equal(builtSpanish.length, pairs.length, 'Some Spanish articles have no translation pair');
const sitemap = fs.readFileSync('dist/sitemap-0.xml', 'utf8');
for (const pair of pairs) for (const lang of ['es', 'en']) {
  assert.ok(sitemap.includes(`https://cronometras.com${pair[lang]}`), `Missing sitemap entry: ${pair[lang]}`);
}
console.log(JSON.stringify({ pairs: pairs.length, pagesVerified: checked, spanishArticlesCovered: builtSpanish.length }));
