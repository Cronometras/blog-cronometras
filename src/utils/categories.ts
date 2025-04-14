import { getCollection } from 'astro:content';

// Función para obtener todas las categorías únicas de los artículos del blog
export async function getAllCategories(lang: string): Promise<string[]> {
  const allPosts = await getCollection('blog');
  
  // Filtrar por idioma y que no sean borradores
  const langPosts = allPosts.filter(post => {
    const postLang = post.slug.split('/')[0];
    return postLang === lang && !post.data.draft;
  });
  
  // Extraer todas las categorías y eliminar duplicados
  const categoriesSet = new Set<string>();
  
  langPosts.forEach(post => {
    if (post.data.category && typeof post.data.category === 'string' && post.data.category !== 'blog') {
      categoriesSet.add(post.data.category);
    }
  });
  
  // Convertir el Set a un array y ordenar alfabéticamente
  return Array.from(categoriesSet).sort();
}

// Función para normalizar el nombre de una categoría para usar en URLs
export function normalizeCategoryName(category: string): string {
  return category.toLowerCase().replace(/ /g, '-');
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
