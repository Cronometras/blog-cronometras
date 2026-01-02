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
 * Fetch all articles from Firestore (both Spanish and English)
 */
export async function getFirestoreArticles(): Promise<BlogPost[]> {
    const spanishArticles = await fetchSpanishArticles();

    // Import translation utilities dynamically to avoid circular deps
    const { translateToEnglish, translateArticleMetadata } = await import('./geminiTranslate');
    const fs = await import('fs');
    const logPath = './debug_log.txt';

    const allArticles: BlogPost[] = [...spanishArticles];

    // Generate English translations
    const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

    fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - Key check: present=${!!GEMINI_API_KEY}, length=${GEMINI_API_KEY?.length || 0}\n`);

    if (GEMINI_API_KEY) {
        console.log('Generating English translations for Firestore articles...');
        const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Load cache from file if it exists
        const cacheFilePath = './src/lib/translationCache.json';
        let cache: Record<string, any> = {};
        if (fs.existsSync(cacheFilePath)) {
            try {
                cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
                console.log(`Loaded ${Object.keys(cache).length} cached translations`);
            } catch (e) {
                console.error('Error loading translation cache:', e);
            }
        }

        for (const article of spanishArticles) {
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;

            while (retryCount <= maxRetries && !success) {
                try {
                    // Check if we have this article cached
                    if (cache[article.id]) {
                        const cached = cache[article.id];
                        const englishArticle: BlogPost = {
                            ...cached,
                            data: {
                                ...cached.data,
                                pubDate: new Date(cached.data.pubDate) // Convert back to Date object
                            }
                        };
                        allArticles.push(englishArticle);
                        console.log(`Using cached translation for: ${article.data.title}`);
                        success = true;
                        continue;
                    }

                    fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - Processing: ${article.data.title} (${article.id})\n`);

                    // Wait to avoid rate limits - increased to 2s
                    await sleep(2000);

                    // Translate content
                    const translatedContent = await translateToEnglish(article.body);
                    if (!translatedContent) {
                        // Check if it was a rate limit in the log
                        const logs = fs.readFileSync(logPath, 'utf8');
                        const lastLines = logs.split('\n').slice(-10).join('\n');
                        if (lastLines.includes('429') || lastLines.toLowerCase().includes('rate limit')) {
                            throw new Error('429 Rate Limit detected');
                        }

                        fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - SKIP: ${article.data.title} - Content translation failed permanently\n`);
                        console.log(`Skipping article ${article.id} due to content translation failure`);
                        success = true; // Mark as done to avoid infinite loop
                        break;
                    }

                    // Wait between calls for same article
                    await sleep(1000);

                    // Translate metadata
                    const translatedMeta = await translateArticleMetadata(
                        article.data.title,
                        article.data.description,
                        article.data.tags
                    );

                    if (!translatedMeta) {
                        fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - SKIP: ${article.data.title} - Metadata translation failed permanently\n`);
                        console.log(`Skipping article ${article.id} due to metadata translation failure`);
                        success = true; // Mark as done
                        break;
                    }

                    // Create English version
                    const englishArticle: BlogPost = {
                        id: article.id.replace('firestore-', 'firestore-en-'),
                        slug: article.slug.replace('es/', 'en/'),
                        data: {
                            ...article.data,
                            title: translatedMeta.title,
                            description: translatedMeta.description,
                            tags: translatedMeta.keywords,
                        },
                        body: translatedContent,
                        source: 'firestore',
                    };

                    // Save to cache
                    cache[article.id] = englishArticle;
                    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2));

                    allArticles.push(englishArticle);
                    fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - SUCCESS: ${translatedMeta.title}\n`);
                    console.log(`Translated article to English: ${translatedMeta.title}`);
                    success = true;
                } catch (error) {
                    const errMsg = error instanceof Error ? error.message : String(error);
                    fs.appendFileSync(logPath, `[Firestore] ${new Date().toISOString()} - ERROR translating ${article.id}: ${errMsg}\n`);
                    console.error(`Error translating article ${article.id}:`, error);

                    if (errMsg.includes('429') || errMsg.toLowerCase().includes('rate limit')) {
                        retryCount++;
                        if (retryCount <= maxRetries) {
                            console.log(`Rate limit hit for ${article.id}, pausing for 30s before retry ${retryCount}...`);
                            await sleep(30000);
                        } else {
                            console.error(`Max retries reached for ${article.id} due to rate limits.`);
                        }
                    } else {
                        // Non-rate-limit error
                        success = true; // Don't retry
                        break;
                    }
                }
            }
        }

        console.log(`Total articles (ES + EN): ${allArticles.length}`);

        // Debug: Log all article slugs
        allArticles.forEach(a => {
            console.log(`  - ${a.slug}: ${a.data.title.substring(0, 50)}...`);
        });
    } else {
        console.warn('GEMINI_API_KEY not set. Skipping English translations.');
    }

    return allArticles;
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
