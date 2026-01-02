// Translation utility using Gemini API
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API key from environment variable
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;

console.log(`[Gemini] API key present: ${!!GEMINI_API_KEY}, length: ${GEMINI_API_KEY?.length || 0}`);

if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found in environment variables. Translation will be skipped.');
}

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAI) {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return genAI;
}

// Cache for translations to avoid repeated API calls during build
const translationCache = new Map<string, string>();

/**
 * Translate text from Spanish to English using Gemini API
 */
export async function translateToEnglish(spanishText: string): Promise<string | null> {
    // Check cache first
    const cacheKey = spanishText.substring(0, 100); // Use first 100 chars as key
    if (translationCache.has(cacheKey)) {
        console.log('Using cached translation');
        return translationCache.get(cacheKey)!;
    }

    try {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `Translate the following Spanish article to English. 
Keep all Markdown formatting, LaTeX formulas ($$...$$), and HTML tags intact.
Translate the content naturally for a professional industrial engineering audience.
Do not add any explanations or comments, just return the translated text.

Spanish text:
${spanishText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();

        // Cache the result
        translationCache.set(cacheKey, translatedText);

        console.log('Successfully translated article with Gemini');
        return translatedText;
    } catch (error) {
        const fs = await import('fs');
        const logPath = './debug_log.txt';
        const errMsg = error instanceof Error ? error.message : String(error);
        fs.appendFileSync(logPath, `[Gemini] Error translating: ${errMsg}\n`);

        console.error('Error translating with Gemini:', error);

        // Return null instead of original text to indicate failure
        // The caller can check debug_log.txt or the error message if needed
        return null;
    }
}

/**
 * Translate article metadata (title, description, keywords)
 */
export async function translateArticleMetadata(
    title: string,
    description: string,
    keywords: string[]
): Promise<{ title: string; description: string; keywords: string[] } | null> {
    try {
        const ai = getGenAI();
        const model = ai.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `Translate the following from Spanish to English for a professional industrial engineering blog.
Return ONLY a JSON object with the translated values, no markdown or explanation.

Title: ${title}
Description: ${description}
Keywords: ${keywords.join(', ')}

Return format: {"title": "...", "description": "...", "keywords": ["...", "..."]}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let jsonText = response.text().trim();

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '');

        const translated = JSON.parse(jsonText);
        return {
            title: translated.title || title,
            description: translated.description || description,
            keywords: translated.keywords || keywords
        };
    } catch (error) {
        console.error('Error translating metadata:', error);
        return null;
    }
}
