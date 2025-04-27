import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import config from '../config/config.json';

export async function GET(context) {
  const blog = await getCollection('blog');

  // Filtrar posts que no son borradores y ordenarlos por fecha de publicación
  const posts = blog
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf());

  return rss({
    title: config.site.title,
    description: 'Blog sobre cronometraje industrial, métodos y tiempos, y productividad',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/${post.slug}/`,
      content: `<img src="${config.site.base_url}${post.data.heroImage}" alt="${post.data.title}" /><p>${post.data.description}</p>`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>es-es</language>`,
  });
}
