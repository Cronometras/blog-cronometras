// Utility to fetch articles from Firestore collection "articulos_cronometras"
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
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
    // Fallback: use first line or default
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').trim() || 'Artículo sin título';
}

/**
 * Extract description from Markdown content (first paragraph after title)
 */
function extractDescription(content: string): string {
    // Remove the title line
    const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();

    // Find first substantial paragraph (not a heading, not empty)
    const paragraphs = contentWithoutTitle.split('\n\n');
    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && trimmed.length > 50) {
            // Clean up markdown formatting
            return trimmed
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .substring(0, 200) + '...';
        }
    }
    return 'Artículo sobre cronometraje industrial y productividad.';
}

/**
 * Extract category from outline or keywords
 */
function extractCategory(article: FirestoreArticle): string {
    // Default category based on project
    if (article.projectId === 'cronometras') {
        return 'Cronometraje Industrial';
    }
    return 'General';
}

/**
 * Process CTA patterns in content - converts [CTA Text] to clickable demo links
 */
function processCTAs(content: string): string {
    // Pattern to match CTA-like text in square brackets
    // Examples: [Solicitar Demo Técnica], [Prueba Demo Gratis], [Solicitar información]
    const ctaPatterns = [
        /\[([^\]]*(?:Demo|Prueba|Solicitar|CTA)[^\]]*)\]/gi,
        /\*\*([^*]*(?:Demo|Prueba|Solicitar)[^*]*)\*\*/gi, // Also handle bold CTAs
    ];

    let processedContent = content;

    // Replace CTA patterns with links that open demo modal
    processedContent = processedContent.replace(
        /\[([^\]]*(?:Demo|Prueba|Solicitar|Accede|Contacta)[^\]]*)\]/gi,
        '<a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a>'
    );

    // Also handle **CTA Técnico:** patterns
    processedContent = processedContent.replace(
        /\*\*CTA[^:]*:\*\*\s*([^\n]+)/gi,
        '<div class="cta-box my-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent rounded-r-lg"><p class="font-semibold mb-2">¡Actúa ahora!</p><a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a></div>'
    );

    return processedContent;
}

/**
 * Transform Firestore article to blog post format
 */
function transformToBlogPost(article: FirestoreArticle): BlogPost {
    const title = extractTitle(article.content);
    const description = extractDescription(article.content);
    const slug = slugify(article.topic || title);

    // Process CTAs in content
    const processedContent = processCTAs(article.content);

    return {
        id: `firestore-${article.id}`,
        slug: `es/${slug}`, // Spanish articles
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

/**
 * Fetch all articles from Firestore (Spanish only, for internal use)
 */
async function fetchSpanishArticles(): Promise<BlogPost[]> {
    try {
        console.log('Fetching articles from Firestore collection: articulos_cronometras');

        const articlesRef = collection(db, 'articulos_cronometras');
        const q = query(articlesRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const articles: BlogPost[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<FirestoreArticle, 'id'>;
            const article: FirestoreArticle = {
                id: doc.id,
                ...data,
            };

            // Only include completed articles
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

/**
 * Fetch all articles from Firestore
 */
export async function getFirestoreArticles(): Promise<BlogPost[]> {
    return await fetchSpanishArticles();
}

/**
 * Get a single article by slug
 */
export async function getFirestoreArticleBySlug(slug: string): Promise<BlogPost | null> {
    const articles = await getFirestoreArticles();
    const article = articles.find(a => {
        const articleSlug = a.slug.split('/').slice(1).join('/');
        return articleSlug === slug;
    });
    return article || null;
}
