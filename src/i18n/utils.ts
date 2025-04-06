import { ui, defaultLang, showDefaultLang } from './ui';

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
  return function translatePath(path: string, l: string = lang) {
    // Remove trailing slashes and ensure path starts with /
    const cleanPath = path.replace(/^\/|\/$/g, '');
    
    // Special handling for blog URLs
    if (cleanPath === 'blog' || cleanPath.startsWith('blog/')) {
      return `/${l}/${cleanPath}`;
    }

    return !showDefaultLang && l === defaultLang 
      ? `/${cleanPath}` 
      : `/${l}${cleanPath ? `/${cleanPath}` : ''}`;
  }
}

export function getPathWithoutLang(pathname: string) {
  const [, ...rest] = pathname.split('/');
  if (rest[0] in ui) rest.shift();
  return rest.length > 0 ? `/${rest.join('/')}` : '';
}
