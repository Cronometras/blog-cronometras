// Utility to fetch articles from Firestore collection "articulos_cronometras"
// Uses firebase-admin (server-side, build-time). The previous firebase client SDK
// raised INVALID_ARGUMENT during Astro SSR because it tries to keep a gRPC Listen
// stream open — not viable in a build context.
//
// i18n: each doc has a `language` field ('es' | 'en'). We fetch and return
// only docs for the requested language. The `slug` field is the canonical
// slug (e.g. "es/5-metodos-de-medicion-del-trabajo" or "en/5-work-measurement-methods").
// When the `slug` field is missing (legacy docs from the generator), we fall
// back to slugify(topic) for ES only.
import { getAdminFirestore } from "./firebase-admin";
import { slugify } from "@/utils/slugify";

// Type definition for Firestore article
export interface FirestoreArticle {
    id: string;
    content: string;
    createdAt: number;
    imageUrl: string;
    keywords: string[];
    outline: string;
    projectId: string;
    researchData: string;
    status: string;
    topic: string;
    topicId: string;
    // Custom fields (may be missing on legacy docs from the generator)
    language?: 'es' | 'en';
    slug?: string;
    migratedFromMDX?: boolean;
    needsSpanishTranslation?: boolean;
    categoria?: string;
    draft?: boolean;
}

// Type definition for blog post format (compatible with Astro content collection)
export interface BlogPost {
    id: string;
    slug: string;
    data: {
        title: string;
        description: string;
        pubDate: Date;
        heroImage: string;
        category: string;
        tags: string[];
        author: string;
        draft: boolean;
        canonical_url?: string;
        noindex?: boolean;
    };
    body: string;
    source: 'firestore' | 'mdx';
    render?: () => Promise<{ Content: any }>;
}

/**
 * Extract title from Markdown content (first H1 heading)
 */
function extractTitle(content: string): string {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        return h1Match[1].trim();
    }
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').trim() || 'Artículo sin título';
}

/**
 * Extract description from Markdown content (first paragraph after title)
 */
function extractDescription(content: string): string {
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
    const paragraphs = contentWithoutTitle.split('\n\n');
    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && trimmed.length > 50) {
            return trimmed
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .substring(0, 200) + '...';
        }
    }
    return 'Artículo sobre cronometraje industrial y productividad.';
}

function extractCategory(article: FirestoreArticle): string {
    // Prefer the explicit `categoria` field (Spanish), then fall back to
    // legacy projectId-based default.
    if (article.categoria) return article.categoria;
    if (article.projectId === 'cronometras') {
        return 'Cronometraje Industrial';
    }
    return 'General';
}

function processCTAs(content: string): string {
    const processedContent = content.replace(
        /\[([^\]]*(?:Demo|Prueba|Solicitar|Accede|Contacta)[^\]]*)\]/gi,
        '<a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a>'
    );
    return processedContent.replace(
        /\*\*CTA[^:]*:\*\*\s*([^\n]+)/gi,
        '<div class="cta-box my-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent rounded-r-lg"><p class="font-semibold mb-2">¡Actúa ahora!</p><a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a></div>'
    );
}

function transformToBlogPost(article: FirestoreArticle, lang: 'es' | 'en'): BlogPost {
    const title = extractTitle(article.content);
    const description = extractDescription(article.content);
    // Use the explicit `slug` field if present (migrated MDX have it),
    // otherwise fall back to slugify(topic) and prefix with the language.
    const slug = article.slug
        ? article.slug
        : `${lang}/${slugify(article.topic || title)}`;
    const processedContent = processCTAs(article.content);

    return {
        id: `firestore-${article.id}`,
        slug,
        data: {
            title,
            description,
            pubDate: new Date(article.createdAt),
            heroImage: article.imageUrl || '/images/webp/cronometras-app.webp',
            category: extractCategory(article),
            tags: article.keywords || [],
            author: 'Cronometras Team',
            draft: article.draft !== undefined ? article.draft : article.status !== 'completed',
        },
        body: processedContent,
        source: 'firestore',
    };
}

async function fetchArticlesByLang(lang: 'es' | 'en'): Promise<BlogPost[]> {
    try {
        console.log(`Fetching articles from Firestore collection: articulos_cronometras (admin SDK) [lang=${lang}]`);

        const db = getAdminFirestore();
        // NOTE: we don't use .orderBy() here because the query
        // (where language == X, orderBy createdAt) requires a composite index
        // that we don't have on articulos_cronometras. The result is sorted
        // by createdAt DESC client-side below (cheap for ~150 docs).
        //
        // For Spanish, we ALSO include legacy docs from the generator that
        // don't have a `language` field (they were created before i18n support).
        // For English, only docs with language='en' exist.
        let snapshot;
        if (lang === 'es') {
            const [snapEs, snapAll] = await Promise.all([
                db.collection('articulos_cronometras').where('language', '==', 'es').get(),
                db.collection('articulos_cronometras').get(),
            ]);
            // Filter legacy docs (no `language` field) client-side
            const legacyDocs = snapAll.docs.filter(d => {
                const data = d.data();
                return data.language === undefined && data.status === 'completed' && !data.draft && data.content;
            });
            // Build a "fake" QuerySnapshot that supports forEach by extending the original
            // We need an object with forEach — easiest is to create one that wraps a merged array
            const allDocs = [...snapEs.docs, ...legacyDocs];
            snapshot = {
                forEach: (cb) => allDocs.forEach(cb),
                size: allDocs.length,
                docs: allDocs,
            };
        } else {
            snapshot = await db.collection('articulos_cronometras')
                                    .where('language', '==', lang)
                                    .get();
        }

        const articles: BlogPost[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as Omit<FirestoreArticle, 'id'>;
            const article: FirestoreArticle = { id: doc.id, ...data };
            // Only include completed, non-draft posts
            if (article.status === 'completed' && !article.draft && article.content) {
                articles.push(transformToBlogPost(article, lang));
            }
        });

        // Sort by createdAt DESC in JS (avoiding the need for a composite index)
        articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

        console.log(`Loaded ${articles.length} ${lang.toUpperCase()} articles from Firestore`);
        return articles;
    } catch (error) {
        console.error(`Error fetching Firestore articles (lang=${lang}):`, error);
        return [];
    }
}

// Backward-compatible default: Spanish (used by the legacy routing path)
export async function getFirestoreArticles(lang: 'es' | 'en' = 'es'): Promise<BlogPost[]> {
    return await fetchArticlesByLang(lang);
}

export async function getFirestoreArticleBySlug(slug: string, lang: 'es' | 'en' = 'es'): Promise<BlogPost | null> {
    const articles = await getFirestoreArticles(lang);
    const article = articles.find(a => {
        // Accept slugs with or without the language prefix
        const aSlug = a.slug.split('/').slice(1).join('/');
        const requested = slug.split('/').slice(-1)[0];
        return aSlug === requested;
    });
    return article || null;
}
