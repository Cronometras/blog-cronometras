// Article translations may use different slugs. Never invent an alternate URL
// merely by replacing /es/ with /en/ on an article route.
export function getLanguagePaths(pathname, articlePairs) {
  const path = pathname.replace(/\/+$/, '') + '/';
  const pair = articlePairs.find(pair => pair.es === path || pair.en === path);
  if (pair) return { es: pair.es, en: pair.en };
  const article = path.match(/^\/(es|en)\/blog\/(.+)\/$/);
  if (article && !/^(category|tag|page)\//.test(article[2])) {
    return { [article[1]]: path };
  }
  const withoutLanguage = path.replace(/^\/(es|en)(?=\/)/, '') || '/';
  return { es: `/es${withoutLanguage}`, en: `/en${withoutLanguage}` };
}
