import { uniqueBlogPosts } from '@/lib/uniqueBlogPosts.mjs';
import { getCollection } from 'astro:content';
import { getFirestoreArticles } from '@/lib/firestoreArticles';

// Función para obtener todas las categorías únicas de los artículos del blog
export async function getAllCategories(lang: string): Promise<string[]> {
  const allPosts = uniqueBlogPosts([...await getFirestoreArticles(lang === 'en' ? 'en' : 'es'), ...await getCollection('blog')]);
  
  // Filtrar por idioma y que no sean borradores
  const langPosts = allPosts.filter(post => {
    const slugValue = post.slug || post.id || '';
    const postLang = slugValue.split('/')[0];
    return postLang === lang && !post.data.draft && !post.data.noindex;
  });
  
  // Extraer todas las categorías y eliminar duplicados
  const categoriesSet = new Set<string>();
  
  langPosts.forEach(post => {
    if (post.data.category && typeof post.data.category === 'string' && post.data.category !== 'blog') {
      categoriesSet.add(post.data.category);
    }
  });
  
  // Convertir el Set a un array y ordenar alfabéticamente
  return Array.from(new Map(Array.from(categoriesSet).map(category => [normalizeCategoryName(category), category])).values()).sort();
}

// Función para normalizar el nombre de una categoría para usar en URLs
export function normalizeCategoryName(category: string): string {
  return category.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Función para desnormalizar el nombre de una categoría para mostrar
export function denormalizeCategoryName(normalizedCategory: string): string {
  // Esta función es más compleja porque necesitaríamos un mapeo de nombres normalizados a originales
  // Por ahora, simplemente reemplazamos guiones por espacios y capitalizamos cada palabra
  return normalizedCategory
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
