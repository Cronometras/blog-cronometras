/** Keep one entry per language/slug; callers put the served source first. */
export function uniqueBlogPosts(posts) {
  const seen = new Set();
  return posts.filter(post => {
    const key = (post.slug || post.id || '').replace(/^\/+|\/+$/g, '').normalize('NFC');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
