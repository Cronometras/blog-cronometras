require('dotenv').config();
// Importar algoliasearch correctamente
const algoliasearchModule = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');
const cheerio = require('cheerio');

console.log('Módulos cargados correctamente');
console.log(`algoliasearch module keys: ${Object.keys(algoliasearchModule)}`);

// Usar la función algoliasearch del módulo
const algoliasearchFunc = algoliasearchModule.algoliasearch;

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
console.log(`Usando Algolia App ID: ${ALGOLIA_APP_ID}`);
console.log(`Usando índice: ${ALGOLIA_INDEX_NAME}`);
console.log(`algoliasearchFunc: ${typeof algoliasearchFunc}`);

const client = algoliasearchFunc(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);
console.log(`client type: ${typeof client}`);
console.log(`client methods: ${Object.keys(client)}`);

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

// Función para extraer contenido de archivos de colección (homepage, features, etc.)
function extractCollectionContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Extraer el idioma del path del archivo
    const pathParts = filePath.split(path.sep);
    const lang = pathParts[pathParts.length - 2]; // Asume que el idioma es el penúltimo segmento
    
    // Construir un texto combinado con toda la información relevante
    let combinedContent = '';
    
    // Añadir título y descripción si existen
    if (data.title) combinedContent += data.title + ' ';
    if (data.description) combinedContent += data.description + ' ';
    
    // Añadir contenido de secciones si existen
    if (data.sections) {
      data.sections.forEach(section => {
        if (section.title) combinedContent += section.title + ' ';
        if (section.content) combinedContent += section.content + ' ';
      });
    }
    
    // Añadir contenido de características si existen
    if (data.features) {
      if (data.features.title) combinedContent += data.features.title + ' ';
      if (data.features.description) combinedContent += data.features.description + ' ';
      
      if (data.features.feature_list) {
        data.features.feature_list.forEach(feature => {
          if (feature.title) combinedContent += feature.title + ' ';
          if (feature.content) combinedContent += feature.content + ' ';
        });
      }
    }
    
    // Añadir contenido de how_it_works si existe
    if (data.how_it_works) {
      if (data.how_it_works.title) combinedContent += data.how_it_works.title + ' ';
      if (data.how_it_works.description) combinedContent += data.how_it_works.description + ' ';
      
      if (data.how_it_works.steps) {
        data.how_it_works.steps.forEach(step => {
          if (step.title) combinedContent += step.title + ' ';
          if (step.description) combinedContent += step.description + ' ';
        });
      }
    }
    
    // Añadir contenido de call_to_action si existe
    if (data.call_to_action) {
      if (data.call_to_action.title) combinedContent += data.call_to_action.title + ' ';
      if (data.call_to_action.description) combinedContent += data.call_to_action.description + ' ';
    }
    
    // Añadir el contenido markdown si existe
    if (content) {
      combinedContent += content + ' ';
    }
    
    // Extraer el texto plano
    const textContent = extractTextContent(combinedContent);
    
    // Determinar el tipo de página basado en la ruta
    const pageType = filePath.includes('/homepage/') ? 'homepage' : 
                    filePath.includes('/features/') ? 'features' : 
                    filePath.includes('/about/') ? 'about' : 'page';
    
    // Crear el registro para Algolia
    return {
      objectID: `${lang}-${pageType}-${path.basename(filePath, path.extname(filePath))}`,
      title: data.title || `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
      description: data.description || '',
      content: textContent.substring(0, 5000), // Limitar el tamaño del contenido
      type: pageType,
      lang: lang,
      url: `/${lang}/${pageType === 'homepage' ? '' : pageType}`
    };
  } catch (error) {
    console.error(`Error al procesar el archivo de colección ${filePath}:`, error);
    return null;
  }
}

async function generateAlgoliaIndex() {
  try {
    console.log('Generando índice de Algolia...');
    
    const records = [];
    
    // 1. Indexar artículos del blog
    const blogFiles = globSync('src/content/blog/**/*.mdx');
    
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
          objectID: `${lang}-blog-${fileName}`,
          title: data.title,
          description: data.description,
          content: textContent.substring(0, 5000), // Limitar el tamaño del contenido
          category: data.category,
          tags: data.tags || [],
          pubDate: data.pubDate ? new Date(data.pubDate).toISOString() : null,
          slug: fileName,
          lang: lang,
          type: 'blog',
          url: `/${lang}/blog/${fileName}`,
          heroImage: data.heroImage || null
        };

        records.push(record);
        console.log(`Procesado blog: ${filePath}`);
      } catch (error) {
        console.error(`Error al procesar el archivo de blog ${filePath}:`, error);
      }
    }
    
    // 2. Indexar páginas de colecciones (homepage, features, about, etc.)
    const collectionFolders = [
      'src/content/homepage/**/*.md',
      'src/content/features/**/*.md',
      'src/content/about/**/*.md',
      'src/content/terms/**/*.md',
      'src/content/faq/**/*.md'
    ];
    
    for (const pattern of collectionFolders) {
      const files = globSync(pattern);
      
      for (const filePath of files) {
        const record = extractCollectionContent(filePath);
        if (record) {
          records.push(record);
          console.log(`Procesado colección: ${filePath}`);
        }
      }
    }

    if (records.length === 0) {
      console.log('No se encontraron archivos para indexar.');
      return;
    }

    // Configurar la configuración del índice
    await client.setSettings({
      indexName: ALGOLIA_INDEX_NAME,
      indexSettings: {
        searchableAttributes: [
          'title',
          'description',
          'content',
          'category',
          'tags'
        ],
        attributesForFaceting: [
          'lang',
          'type',
          'category',
          'tags'
        ],
        customRanking: [
          'desc(pubDate)'
        ]
      }
    });

    // Guardar los registros en Algolia
    const result = await client.saveObjects({
      indexName: ALGOLIA_INDEX_NAME,
      objects: records
    });

    console.log(`Indexación completada. ${records.length} registros indexados en Algolia.`);
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error al generar el índice de Algolia:', error);
    process.exit(1);
  }
}

generateAlgoliaIndex();
