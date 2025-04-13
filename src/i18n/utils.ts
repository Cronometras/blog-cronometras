import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, targetLang: keyof typeof ui = lang) {
    // Caso especial para la página de inicio
    if (path === '' || path === '/') {
      return `/${targetLang}`;
    }

    return `/${targetLang}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

export function getPathWithoutLang(path: string) {
  const [, , ...rest] = path.split('/');
  return '/' + rest.join('/');
}
