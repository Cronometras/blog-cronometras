import { GoogleGenAI } from "@google/genai";
import type { GroundingSource } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateArticle(topic: string): Promise<{ title: string, content: string; sources: GroundingSource[] }> {
  const model = 'gemini-3-flash-preview';
  const prompt = `
    Tu tarea es actuar como un experto en SEO y redactor de contenidos con una personalidad única. Vas a generar un artículo de blog sobre el tema: "${topic}".
    Tu objetivo es crear el mejor y más completo recurso sobre este tema en internet, optimizado para la intención de búsqueda principal y que aporte un valor inmenso al lector.

    **Estilo y Tono de Escritura (MUY IMPORTANTE):**
    - **Confianza de Experto:** Escribe con la autoridad de alguien que domina el tema por completo gracias a años de experiencia práctica. Usa un lenguaje directo y seguro.
    - **Ingenioso y Ácido:** Tu escritura debe ser entretenida. Utiliza un humor agudo, un poco de sarcasmo y sé provocador cuando critiques mitos o malas prácticas comunes en el sector.
    - **Práctico y Realista:** Basa tus explicaciones en ejemplos concretos, anécdotas o analogías que demuestren experiencia real, no solo conocimiento teórico.

    **Regla CRÍTICA ABSOLUTA:**
    Bajo NINGUNA circunstancia debes hacer referencia a tu propio estilo de escritura o personalidad dentro del artículo. La personalidad debe ser IMPLÍCITA y sentirse en cada palabra, no anunciarse.
    
    **PROHIBIDO escribir frases como:**
    - "Vamos a hablar sin tapujos..."
    - "Con la dosis justa de cinismo..."
    - "...la experiencia de quien ya ha visto..."
    - "Te lo digo como un veterano..."
    - "Prepárate para una dosis de sarcasmo..."
    - Cualquier frase que describa el tono, la voz o la manera en que estás presentando la información.
    
    Simplemente escribe con esa personalidad, no hables sobre ella.

    **Instrucciones de Estructura y Contenido:**
    1. **Investigación Profunda:** Utiliza tu acceso a la búsqueda para realizar una investigación exhaustiva. Identifica la intención de búsqueda principal (¿el usuario quiere aprender, comprar, comparar?) y los subtemas clave que deben cubrirse. Tu artículo debe responder a todas las preguntas posibles que un usuario pueda tener sobre el tema.
    2. **Título (Primera línea):** Escribe un título de blog magnético, optimizado para SEO y que refleje la personalidad descrita. No uses ningún formato como "#". Debe ser una única línea.
    3. **Separador (Segunda línea):** Escribe este separador exacto: "---ARTICLE_CONTENT---".
    4. **Contenido del Artículo (A partir de la tercera línea):**
        - **Longitud y Profundidad:** El artículo debe ser excepcionalmente extenso y profundo, superando las 2000 palabras. Ve más allá de la información superficial.
        - **Introducción Disruptiva:** Comienza con una introducción que rompa esquemas, capte la atención inmediatamente y prometa una perspectiva única.
        - **Estructura del Contenido y SEO:**
            - No incluyas el título principal de nuevo dentro del contenido (sin H1).
            - **Subtítulos Optimizados para SEO:** Utiliza una estructura jerárqu-ica clara con subtítulos (H2, H3, H4). Cada subtítulo debe ser descriptivo, atractivo y, fundamentalmente, incluir palabras clave que respondan a la intención de búsqueda específica que esa sección cubre.
            - **Formato para Legibilidad:** Utiliza negritas para resaltar conceptos clave, listas (numeradas o con viñetas) para facilitar la lectura de datos o pasos, y tablas si es apropiado para estructurar la información.
        - **Conclusión y Llamada a la Acción:** En lugar de un resumen aburrido, finaliza con una conclusión provocadora que resuma tu punto de vista ácido y autoritario. Luego, plantea una pregunta abierta y desafiante para fomentar los comentarios y el debate.

    **Formato Final:**
    Tu respuesta final debe contener únicamente el título, el separador y el contenido del artículo en formato Markdown, siguiendo el orden y las reglas especificadas. No añadas ninguna nota o introducción tuya.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const rawText = response.text;
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const sources = groundingMetadata?.groundingChunks || [];

  const parts = rawText.split('---ARTICLE_CONTENT---');
  
  if (parts.length < 2) {
    console.warn("Model did not return the expected separator. Using a fallback method.");
    // Fallback: Assume first line is title, rest is content. Clean any potential markdown from title.
    const lines = rawText.trim().split('\n');
    const title = lines[0].replace(/^#\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    return { title, content, sources };
  }

  const title = parts[0].trim();
  const content = parts[1].trim();

  return { title, content, sources };
}

export async function createImagePrompt(articleContent: string): Promise<string> {
    const textModel = 'gemini-2.5-flash';

    const promptCreationPrompt = `
        Basado en el siguiente artículo, crea un prompt conciso y visualmente descriptivo para un generador de imágenes de IA.
        El prompt debe capturar el tema principal del artículo y sugerir una imagen visualmente atractiva, relevante y de alta calidad.
        El prompt debe estar en español.
        Artículo: """${articleContent.substring(0, 2000)}"""
    `;
    const response = await ai.models.generateContent({
        model: textModel,
        contents: promptCreationPrompt,
    });
    // FIX: Corrected variable name from `promptResponse` to `response`.
    return response.text.trim();
}

export async function generateImage(prompt: string): Promise<string> {
    const imageModel = 'imagen-4.0-generate-001';

    const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    return imageResponse.generatedImages[0].image.imageBytes;
}

export async function generatePodcastScript(articleContent: string, chapterNumber: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Tu tarea es actuar como un guionista de podcasts experto y creativo para el podcast "ProdCont Podcast", alojado en ProdCont.com. Transforma el siguiente artículo de blog en un guion de podcast de un solo presentador de entre 10 y 15 minutos.
    ${chapterNumber ? `\n**Número de Capítulo:** ${chapterNumber}\n` : ''}
    **Artículo Original:**
    """
    ${articleContent}
    """

    **Instrucciones para el Guion:**
    1.  **Tono y Personalidad:** Mantén el tono original del artículo: experto, ingenioso, un poco ácido y muy práctico. El presentador debe sonar como una autoridad carismática que no tiene miedo de decir las cosas como son.
    2.  **Estructura del Guion:**
        -   **Intro (30-60 segundos):** Comienza con un gancho potente. Incluye una sugerencia para una sintonía de entrada (ej. "[MÚSICA: Electrónica, optimista y con un toque de misterio, sube y luego baja a fondo]"). ${chapterNumber ? `Anuncia el nombre del podcast, "ProdCont Podcast", y el número de capítulo. ` : 'Anuncia el nombre del podcast, "ProdCont Podcast". '}Preséntate de forma breve y carismática, plantea el problema o la idea principal que se abordará y menciona que para cualquier consulta o servicio pueden visitar ProdCont.com.
        -   **Cuerpo Principal:** Divide el contenido en 2-3 segmentos claros. No leas el artículo palabra por palabra; tradúcelo a un lenguaje conversacional. Usa pausas, preguntas retóricas y un ritmo dinámico. Indica dónde irían efectos de sonido relevantes para enfatizar puntos clave (ej. "[SFX: Sonido de caja registradora]" o "[SFX: Sonido de látigo]").
        -   **Outro (30-60 segundos):** Resume las ideas clave con una conclusión contundente y memorable que refleje la personalidad del presentador. Haz una llamada a la acción clara pidiendo que se suscriban y que dejen un comentario en Spotify. Finaliza recordando que pueden contactar y encontrar más contenido en ProdCont.com y con una sugerencia para la sintonía de salida (ej. "[MÚSICA: Sube para finalizar]").
    3.  **Formato:**
        -   Utiliza Markdown para dar formato al guion.
        -   Indica claramente el nombre del presentador (ej. "PRESENTADOR:").
        -   Las acotaciones para música y efectos de sonido deben ir entre corchetes y en mayúsculas.

    Genera únicamente el guion del podcast en formato Markdown. No incluyas ninguna introducción o nota tuya fuera del propio guion.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return response.text.trim();
}

export async function generatePodcastAudio(script: string): Promise<string> {
    // Note: This uses the Google Cloud Text-to-Speech API, which is the correct tool for high-quality speech synthesis.
    // It is separate from the Gemini API but uses the same API key system.
    const ttsEndpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.API_KEY}`;

    // Clean the script by removing markdown for audio cues like [MUSIC...] or [SFX...]
    const cleanScript = script.replace(/\[(MÚSICA|SFX|MUSIC|SOUND EFFECT):.*?\]/gi, '');

    const requestBody = {
      input: {
        text: cleanScript,
      },
      // Using a high-quality Studio voice for a professional podcast sound.
      voice: {
        languageCode: 'es-US',
        name: 'es-US-Studio-B',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.05,
        pitch: -2.0,
      },
    };

    const response = await fetch(ttsEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Text-to-Speech API Error:", errorData);
        throw new Error(`Error al generar el audio: ${errorData.error.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    return data.audioContent; // This is a base64 encoded string
}
