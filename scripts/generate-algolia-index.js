require('dotenv').config();
const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');

// Configuración de Algolia
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME;

// Verificar que las variables de entorno estén configuradas
if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY || !ALGOLIA_INDEX_NAME) {
  console.error('Error: Variables de entorno de Algolia no configuradas correctamente.');
  console.error('Asegúrate de configurar ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY y ALGOLIA_INDEX_NAME en tu archivo .env');
  process.exit(1);
}

// Inicializar cliente de Algolia
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

// Función para extraer el contenido de texto plano de un archivo markdown
function extractTextContent(content) {
  // Eliminar bloques de código
  content = content.replace(/```[\s\S]*?```/g, '');
  
  // Eliminar imágenes
  content = content.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // Eliminar enlaces pero mantener el texto
  content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Eliminar encabezados pero mantener el texto
  content = content.replace(/#{1,6}\s+(.+)/g, '$1');
  
  // Eliminar énfasis y negritas pero mantener el texto
  content = content.replace(/(\*\*|__)(.*?)\1/g, '$2');
  content = content.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Eliminar HTML
  content = content.replace(/<[^>]*>/g, '');
  
  // Eliminar espacios en blanco múltiples
  content = content.replace(/\s+/g, ' ');
  
  return content.trim();
}

async function generateAlgoliaIndex() {
  try {
    console.log('Generando índice de Algolia...');
    
    // Buscar todos los archivos MDX en el directorio de contenido del blog
    const blogFiles = globSync('src/content/blog/**/*.mdx');
    
    const records = [];
    
    for (const filePath of blogFiles) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        // Extraer el idioma y el slug del path del archivo
        const pathParts = filePath.split(path.sep);
        const lang = pathParts[pathParts.length - 2]; // Asume que el idioma es el penúltimo segmento
        const fileName = path.basename(filePath, '.mdx');
        
        // Extraer el contenido de texto plano
        const textContent = extractTextContent(content);
        
        // Crear el registro para Algolia
        const record = {
          objectID: `${lang}-${fileName}`,
          title: data.title,
          description: data.description,
          content: textContent.substring(0, 5000), // Limitar el tamaño del contenido
          category: data.category,
          tags: data.tags || [],
          pubDate: data.pubDate ? new Date(data.pubDate).toISOString() : null,
          slug: fileName,
          lang: lang,
          heroImage: data.heroImage || null
        };
        
        records.push(record);
        console.log(`Procesado: ${filePath}`);
      } catch (error) {
        console.error(`Error al procesar el archivo ${filePath}:`, error);
      }
    }
    
    if (records.length === 0) {
      console.log('No se encontraron archivos para indexar.');
      return;
    }
    
    // Configurar la configuración del índice
    await index.setSettings({
      searchableAttributes: [
        'title',
        'description',
        'content',
        'category',
        'tags'
      ],
      attributesForFaceting: [
        'lang',
        'category',
        'tags'
      ],
      customRanking: [
        'desc(pubDate)'
      ]
    });
    
    // Guardar los registros en Algolia
    const { objectIDs } = await index.saveObjects(records);
    
    console.log(`Indexación completada. ${objectIDs.length} registros indexados en Algolia.`);
  } catch (error) {
    console.error('Error al generar el índice de Algolia:', error);
    process.exit(1);
  }
}

generateAlgoliaIndex();
