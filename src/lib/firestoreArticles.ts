// Utility to fetch articles from Firestore collection "articulos_cronometras"
// Uses firebase-admin (server-side, build-time). The previous firebase client SDK
// raised INVALID_ARGUMENT during Astro SSR because it tries to keep a gRPC Listen
// stream open — not viable in a build context.
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

function transformToBlogPost(article: FirestoreArticle): BlogPost {
    const title = extractTitle(article.content);
    const description = extractDescription(article.content);
    const slug = slugify(article.topic || title);
    const processedContent = processCTAs(article.content);

    return {
        id: `firestore-${article.id}`,
        slug: `es/${slug}`,
        data: {
            title,
            description,
            pubDate: new Date(article.createdAt),
            heroImage: article.imageUrl || '/images/webp/cronometras-app.webp',
            category: extractCategory(article),
            tags: article.keywords || [],
            author: 'Cronometras Team',
            draft: article.status !== 'completed',
        },
        body: processedContent,
        source: 'firestore',
    };
}

async function fetchSpanishArticles(): Promise<BlogPost[]> {
    try {
        console.log('Fetching articles from Firestore collection: articulos_cronometras (admin SDK)');

        const db = getAdminFirestore();
        const snapshot = await db.collection('articulos_cronometras')
                                .orderBy('createdAt', 'desc')
                                .get();

        const articles: BlogPost[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data() as Omit<FirestoreArticle, 'id'>;
            const article: FirestoreArticle = { id: doc.id, ...data };
            if (article.status === 'completed' && article.content) {
                articles.push(transformToBlogPost(article));
            }
        });

        console.log(`Loaded ${articles.length} Spanish articles from Firestore`);
        return articles;
    } catch (error) {
        console.error('Error fetching Firestore articles:', error);
        return [];
    }
}

export async function getFirestoreArticles(): Promise<BlogPost[]> {
    return await fetchSpanishArticles();
}

export async function getFirestoreArticleBySlug(slug: string): Promise<BlogPost | null> {
    const articles = await getFirestoreArticles();
    const article = articles.find(a => {
        const articleSlug = a.slug.split('/').slice(1).join('/');
        return articleSlug === slug;
    });
    return article || null;
}
