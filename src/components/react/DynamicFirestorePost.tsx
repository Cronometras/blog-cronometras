import React, { useEffect, useState, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { marked } from 'marked';
import markedKatex from 'marked-katex-extension';
import { IoLogoFacebook, IoLogoLinkedin, IoLogoWhatsapp, IoLink } from 'react-icons/io5';
import { FaXTwitter } from 'react-icons/fa6';

// Firebase configuration for client-side
// Note: Firebase API keys are public by design - security comes from Firebase Security Rules
const firebaseConfig = {
    apiKey: "AIzaSyAW4z3fkImqMO0MuEXQ92a0Dcw8HrLuiDs",
    authDomain: "micaot-com.firebaseapp.com",
    projectId: "micaot-com",
    storageBucket: "micaot-com.firebasestorage.app",
    messagingSenderId: "948469680704",
    appId: "1:948469680704:web:a9161fb82acd6766ee6da5",
    measurementId: "G-8P8GPHKSQ7"
};

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Configure marked for GitHub Flavored Markdown with KaTeX support
marked.use(markedKatex({
    throwOnError: false
}));
marked.setOptions({
    breaks: true,
    gfm: true,
});

interface FirestoreArticle {
    id: string;
    content: string;
    createdAt: number;
    imageUrl: string;
    keywords: string[];
    topic: string;
    status: string;
}

interface Post {
    id: string;
    title: string;
    description: string;
    content: string;
    pubDate: Date;
    heroImage: string;
    tags: string[];
    author: string;
}

// Utility to create clean slugs
function cleanSlug(text: string = ''): string {
    return text
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9/]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}

// Extract title from Markdown content
function extractTitle(content: string): string {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
        return h1Match[1].trim();
    }
    const firstLine = content.split('\n')[0];
    return firstLine.replace(/^#+\s*/, '').trim() || 'Artículo sin título';
}

// Extract description from content
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

// Process CTAs in content
function processCTAs(content: string): string {
    let processedContent = content;

    processedContent = processedContent.replace(
        /\[([^\]]*(?:Demo|Prueba|Solicitar|Accede|Contacta)[^\]]*)\]/gi,
        '<a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a>'
    );

    processedContent = processedContent.replace(
        /\*\*CTA[^:]*:\*\*\s*([^\n]+)/gi,
        '<div class="cta-box my-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 border-l-4 border-accent rounded-r-lg"><p class="font-semibold mb-2">¡Actúa ahora!</p><a href="#demo" class="cta-link inline-block px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-dark transition-colors cursor-pointer" onclick="if(typeof window.openRequestDemoModal === \'function\') { window.openRequestDemoModal(); return false; }">$1</a></div>'
    );

    return processedContent;
}

// Convert Markdown to HTML
function markdownToHtml(markdown: string): string {
    if (!markdown) return '';
    try {
        const processed = processCTAs(markdown);
        const html = marked.parse(processed);
        return typeof html === 'string' ? html : '';
    } catch (error) {
        console.error('Error parsing markdown:', error);
        return markdown;
    }
}

interface DynamicFirestorePostProps {
    slug: string;
    lang?: string;
}

export default function DynamicFirestorePost({ slug, lang = 'es' }: DynamicFirestorePostProps) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Simple text-to-speech state
    const [isReading, setIsReading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Share Tooltip State
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        async function fetchPost() {
            try {
                setLoading(true);
                console.log(`Fetching post with slug: ${slug}`);

                const articlesRef = collection(db, 'articulos_cronometras');
                const q = query(articlesRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                let foundPost: Post | null = null;

                querySnapshot.forEach((doc) => {
                    const data = doc.data() as Omit<FirestoreArticle, 'id'>;
                    const article: FirestoreArticle = { id: doc.id, ...data };

                    if (article.status === 'completed' && article.content) {
                        const title = extractTitle(article.content);
                        const articleSlug = cleanSlug(article.topic || title);

                        if (articleSlug === slug) {
                            foundPost = {
                                id: doc.id,
                                title,
                                description: extractDescription(article.content),
                                content: article.content,
                                pubDate: new Date(article.createdAt),
                                heroImage: article.imageUrl || '/images/webp/cronometras-app.webp',
                                tags: article.keywords || [],
                                author: 'Cronometras Team',
                            };
                        }
                    }
                });

                if (foundPost) {
                    setPost(foundPost);
                } else {
                    setError(lang === 'es' ? 'Artículo no encontrado' : 'Article not found');
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(lang === 'es' ? 'Error al cargar el artículo' : 'Error loading article');
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchPost();
        }
    }, [slug, lang]);

    // Re-render KaTeX math formulas after content loads
    useEffect(() => {
        if (post && !loading && typeof window !== 'undefined') {
            // Wait for DOM to update, then trigger KaTeX rendering
            setTimeout(() => {
                if ((window as any).renderMathInElement) {
                    (window as any).renderMathInElement(document.body, {
                        delimiters: [
                            { left: '$$', right: '$$', display: true },
                            { left: '$', right: '$', display: false }
                        ],
                        throwOnError: false
                    });
                }
            }, 100);
        }
    }, [post, loading]);

    // Simple text-to-speech functions
    const startReading = () => {
        if (!post || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        // Clean text for reading
        const textToRead = post.content
            .replace(/<[^>]*>/g, '') // Remove HTML
            .replace(/\$\$[\s\S]*?\$\$/g, '') // Remove block LaTeX
            .replace(/\$[^$]*\$/g, '') // Remove inline LaTeX
            .replace(/[#*_`]/g, '') // Remove markdown formatting
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .substring(0, 5000); // Limit length

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = lang === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;

        utterance.onend = () => {
            setIsReading(false);
            setIsPaused(false);
        };

        utterance.onerror = () => {
            setIsReading(false);
            setIsPaused(false);
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
        setIsPaused(false);
    };

    const togglePause = () => {
        if (!isReading) return;

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        } else {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    const stopReading = () => {
        window.speechSynthesis.cancel();
        setIsReading(false);
        setIsPaused(false);
    };

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 2000);
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {error || (lang === 'es' ? 'Artículo no encontrado' : 'Article not found')}
                </h2>
                <a
                    href={`/${lang}/blog`}
                    className="text-accent hover:underline"
                >
                    {lang === 'es' ? '← Volver al blog' : '← Back to blog'}
                </a>
            </div>
        );
    }

    return (
        <article className="mx-auto">
            {/* Hero Image with Overlay */}
            <div className="relative min-h-[400px] md:min-h-[450px] lg:min-h-[500px] w-full overflow-hidden">
                <img
                    src={post.heroImage}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="1200"
                    height="630"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/60"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 container mx-auto">
                    <div className="text-white mb-4 md:mb-8 max-w-4xl mx-auto w-full">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-200 mb-3 md:mb-4 text-sm md:text-base">
                            <time dateTime={post.pubDate.toISOString()} className="font-medium">
                                {post.pubDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </time>
                            {post.author && (
                                <>
                                    <span>•</span>
                                    <span className="font-medium">{post.author}</span>
                                </>
                            )}
                        </div>
                        {post.description && (
                            <p className="text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed">
                                {post.description}
                            </p>
                        )}

                        {/* Simple Text-to-Speech Controls */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {!isReading ? (
                                <button
                                    onClick={startReading}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    {lang === 'es' ? 'Leer en voz alta' : 'Read aloud'}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={togglePause}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        {isPaused ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                </svg>
                                                {lang === 'es' ? 'Continuar' : 'Resume'}
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {lang === 'es' ? 'Pausar' : 'Pause'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={stopReading}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                        </svg>
                                        {lang === 'es' ? 'Detener' : 'Stop'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <section className="section pt-8 pb-8 md:pb-16 bg-white dark:bg-gray-900">
                <div className="container px-4 md:px-8 mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <div
                            className="article-content prose prose-base md:prose-lg dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
                        />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                                    {lang === 'es' ? 'Temas relacionados' : 'Related topics'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag: string, index: number) => (
                                        <a
                                            key={index}
                                            href={`/${lang}/blog/?tag=${encodeURIComponent(tag)}`}
                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-200 border border-accent/20 hover:border-accent"
                                        >
                                            <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {tag}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Buttons */}
                        {post && (
                            <div className="my-10 w-full rounded-2xl bg-gray-50/50 p-6 sm:p-8 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:shadow-sm">
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                        {lang === 'es' ? '¿Te ha parecido útil?' : 'Did you find this useful?'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {lang === 'es' ? 'Comparte este artículo con tu red profesional' : 'Share this article with your professional network'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    {/* LinkedIn */}
                                    <a
                                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(post.description || '')}&source=Cronometras`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-2 rounded-full bg-[#0077b5]/10 px-5 py-2.5 text-[#0077b5] transition-all hover:bg-[#0077b5] hover:text-white dark:bg-[#0077b5]/20"
                                        aria-label="Share on LinkedIn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.open(e.currentTarget.href, 'linkedin-share', 'width=580,height=520,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');
                                        }}
                                    >
                                        <IoLogoLinkedin className="h-5 w-5" />
                                        <span className="font-medium text-sm">LinkedIn</span>
                                    </a>

                                    {/* X (Twitter) */}
                                    <a
                                        href={`https://x.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-black hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white dark:hover:text-black"
                                        aria-label="Share on X"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.open(e.currentTarget.href, 'x-share', 'width=580,height=520,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');
                                        }}
                                    >
                                        <FaXTwitter className="h-4 w-4 md:h-5 md:w-5" />
                                    </a>

                                    {/* Facebook */}
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-[#1877f2] hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-[#1877f2]"
                                        aria-label="Share on Facebook"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.open(e.currentTarget.href, 'fb-share', 'width=580,height=520,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');
                                        }}
                                    >
                                        <IoLogoFacebook className="h-5 w-5 md:h-6 md:w-6" />
                                    </a>

                                    {/* WhatsApp */}
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(post.title)}%20${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-[#25d366] hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-[#25d366]"
                                        aria-label="Share on WhatsApp"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            window.open(e.currentTarget.href, 'wa-share', 'width=580,height=520,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1');
                                        }}
                                    >
                                        <IoLogoWhatsapp className="h-5 w-5 md:h-6 md:w-6 text-current pl-0.5" />
                                    </a>

                                    {/* Copy Link */}
                                    <div className="relative flex items-center mt-2 md:mt-0">
                                        <button
                                            onClick={handleCopyLink}
                                            className="peer flex items-center justify-center h-10 w-10 md:h-11 md:w-11 rounded-full bg-gray-100 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent/50"
                                            aria-label="Copy link"
                                        >
                                            <IoLink className="h-5 w-5" />
                                        </button>
                                        
                                        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 ${showTooltip ? 'bg-green-600 opacity-100' : 'bg-gray-800 opacity-0 peer-hover:opacity-100'} text-white text-xs font-medium rounded shadow-lg transition-opacity pointer-events-none whitespace-nowrap z-10`}>
                                            {showTooltip ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar link' : 'Copy link')}
                                        </div>
                                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 border-4 border-transparent ${showTooltip ? 'border-t-green-600 opacity-100' : 'border-t-gray-800 opacity-0 peer-hover:opacity-100'} transition-opacity pointer-events-none z-10`}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Separator */}
                        <div className="my-12 border-t border-gray-200 dark:border-gray-700"></div>

                        {/* Back to blog link */}
                        <div className="text-center">
                            <a
                                href={`/${lang}/blog`}
                                className="inline-flex items-center text-accent hover:underline font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                {lang === 'es' ? 'Volver al blog' : 'Back to blog'}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </article>
    );
}
