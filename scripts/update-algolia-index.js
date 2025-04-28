require('dotenv').config();
// Importar algoliasearch correctamente
const algoliasearchModule = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { globSync } = require('glob');
const cheerio = require('cheerio');

console.log('Iniciando actualización del índice de Algolia...');
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
console.log(`client methods: ${Object.keys(client).join(', ').substring(0, 300)}...`);

// Función para extraer contenido de archivos MDX del blog
function extractBlogContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Determinar el idioma basado en la ruta del archivo
    const pathParts = filePath.split(path.sep);
    const lang = pathParts.includes('es') ? 'es' : 'en';

    // Extraer el slug del nombre del archivo
    const slug = path.basename(filePath, path.extname(filePath));

    // Crear un ID único para evitar duplicados
    const objectID = `${lang}-blog-${slug}`;

    // Limpiar el contenido MDX para obtener solo texto
    let cleanContent = content
      .replace(/import\s+.*?from\s+['"].*?['"]/g, '') // Eliminar importaciones
      .replace(/<.*?>/g, '') // Eliminar etiquetas HTML
      .replace(/\{.*?\}/g, '') // Eliminar expresiones JSX
      .replace(/\s+/g, ' ') // Eliminar espacios múltiples
      .trim();

    // Crear el registro para Algolia
    return {
      objectID,
      title: data.title || 'Sin título',
      description: data.description || '',
      content: cleanContent.substring(0, 5000), // Limitar el tamaño del contenido
      category: data.category || '',
      tags: data.tags || [],
      pubDate: data.pubDate ? new Date(data.pubDate).toISOString() : null,
      lang,
      type: 'blog',
      slug: slug, // Añadir el slug como campo separado
      url: `/${lang}/blog/${slug}` // Corregir el formato de la URL
    };
  } catch (error) {
    console.error(`Error al procesar el archivo de blog ${filePath}:`, error);
    return null;
  }
}

// Función para extraer contenido de archivos de colecciones
function extractCollectionContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    // Determinar el tipo de página y el idioma basado en la ruta del archivo
    const pathParts = filePath.split(path.sep);
    const collectionIndex = pathParts.indexOf('content');
    const pageType = pathParts[collectionIndex + 1] || 'unknown';
    const lang = pathParts.includes('es') ? 'es' : pathParts.includes('en') ? 'en' : 'unknown';

    // Extraer el contenido HTML si existe
    let textContent = '';
    if (data.sections) {
      textContent = data.sections.map(section => {
        return `${section.title || ''} ${section.content || ''}`;
      }).join(' ');
    } else if (data.content) {
      textContent = data.content;
    }

    // Limpiar el contenido HTML
    if (textContent.includes('<')) {
      const $ = cheerio.load(textContent);
      textContent = $.text();
    }

    // Crear un ID único para evitar duplicados
    const objectID = `${lang}-${pageType}-${path.basename(filePath, path.extname(filePath))}`;

    // Extraer el slug del nombre del archivo
    const slug = path.basename(filePath, path.extname(filePath));

    // Crear el registro para Algolia
    return {
      objectID,
      title: data.title || `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
      description: data.description || '',
      content: textContent.substring(0, 5000), // Limitar el tamaño del contenido
      type: pageType,
      lang,
      slug: slug, // Añadir el slug como campo separado
      url: `/${lang}/${pageType === 'homepage' ? '' : pageType}`
    };
  } catch (error) {
    console.error(`Error al procesar el archivo de colección ${filePath}:`, error);
    return null;
  }
}

// Función para extraer contenido de páginas MDX
function extractPageContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Determinar el tipo de página y el idioma basado en la ruta del archivo
    const pathParts = filePath.split(path.sep);
    const pagesIndex = pathParts.indexOf('pages');
    const pageType = pathParts[pagesIndex + 2] || pathParts[pagesIndex + 1] || 'unknown';
    const lang = pathParts.includes('es') ? 'es' : pathParts.includes('en') ? 'en' : 'unknown';

    // Limpiar el contenido MDX para obtener solo texto
    let cleanContent = content
      .replace(/import\s+.*?from\s+['"].*?['"]/g, '') // Eliminar importaciones
      .replace(/<.*?>/g, '') // Eliminar etiquetas HTML
      .replace(/\{.*?\}/g, '') // Eliminar expresiones JSX
      .replace(/\s+/g, ' ') // Eliminar espacios múltiples
      .trim();

    // Crear un ID único para evitar duplicados
    const objectID = `${lang}-page-${pageType}-${path.basename(filePath, path.extname(filePath))}`;

    // Extraer el slug del nombre del archivo
    const slug = path.basename(filePath, path.extname(filePath));

    // Crear el registro para Algolia
    return {
      objectID,
      title: data.title || data.document_title || `${pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page`,
      description: data.description || data.meta_description || '',
      content: cleanContent.substring(0, 5000), // Limitar el tamaño del contenido
      type: 'page',
      lang,
      slug: slug, // Añadir el slug como campo separado
      url: `/${lang}/${pageType}`
    };
  } catch (error) {
    console.error(`Error al procesar la página ${filePath}:`, error);
    return null;
  }
}

async function updateAlgoliaIndex() {
  try {
    console.log('Limpiando índice existente...');

    // Limpiar el índice existente
    try {
      await client.clearObjects(ALGOLIA_INDEX_NAME);
      console.log('Índice limpiado correctamente.');
    } catch (error) {
      console.error('Error al limpiar el índice:', error);
      console.log('Intentando eliminar objetos por lotes...');

      try {
        // Obtener todos los objectIDs existentes
        const { hits } = await client.search({
          indexName: ALGOLIA_INDEX_NAME,
          query: '',
          params: {
            hitsPerPage: 1000,
            attributesToRetrieve: ['objectID']
          }
        });

        if (hits.length > 0) {
          const objectIDs = hits.map(hit => hit.objectID);
          await client.deleteObjects({
            indexName: ALGOLIA_INDEX_NAME,
            objectIDs
          });
          console.log(`Eliminados ${objectIDs.length} objetos existentes.`);
        }
      } catch (deleteError) {
        console.error('Error al eliminar objetos existentes:', deleteError);
      }

      console.log('Continuando con la indexación...');
    }

    const records = [];
    const processedIds = new Set(); // Para evitar duplicados

    // 1. Indexar artículos del blog
    console.log('Indexando artículos del blog...');
    const blogFiles = globSync('src/content/blog/**/*.mdx');

    for (const filePath of blogFiles) {
      const record = extractBlogContent(filePath);
      if (record && !processedIds.has(record.objectID)) {
        records.push(record);
        processedIds.add(record.objectID);
        console.log(`Procesado blog: ${filePath} (ID: ${record.objectID})`);
      }
    }

    // 2. Indexar páginas de colecciones (homepage, features, about, etc.)
    console.log('Indexando páginas de colecciones...');
    const collectionPatterns = [
      'src/content/homepage/**/*.md',
      'src/content/features/**/*.md',
      'src/content/about/**/*.md',
      'src/content/terms/**/*.md',
      'src/content/faq/**/*.md',
      'src/content/pages/**/*.mdx'
    ];

    for (const pattern of collectionPatterns) {
      const files = globSync(pattern);

      for (const filePath of files) {
        let record;

        if (filePath.includes('content/pages')) {
          record = extractPageContent(filePath);
        } else {
          record = extractCollectionContent(filePath);
        }

        if (record && !processedIds.has(record.objectID)) {
          records.push(record);
          processedIds.add(record.objectID);
          console.log(`Procesada colección: ${filePath} (ID: ${record.objectID})`);
        }
      }
    }

    if (records.length === 0) {
      console.log('No se encontraron archivos para indexar.');
      return;
    }

    // Configurar la configuración del índice
    console.log('Configurando ajustes del índice...');
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
    console.log(`Guardando ${records.length} registros en Algolia...`);

    // Dividir los registros en lotes de 1000 (límite de Algolia)
    const chunkSize = 1000;
    let result;

    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      console.log(`Guardando lote ${Math.floor(i / chunkSize) + 1}/${Math.ceil(records.length / chunkSize)} (${chunk.length} registros)...`);
      result = await client.saveObjects({
        indexName: ALGOLIA_INDEX_NAME,
        objects: chunk
      });
    }

    console.log(`Indexación completada. ${records.length} registros indexados en Algolia.`);
    console.log(`Registros por tipo:`);
    const typeCount = {};
    records.forEach(record => {
      typeCount[record.type] = (typeCount[record.type] || 0) + 1;
    });
    console.log(typeCount);

    console.log(`Registros por idioma:`);
    const langCount = {};
    records.forEach(record => {
      langCount[record.lang] = (langCount[record.lang] || 0) + 1;
    });
    console.log(langCount);

    console.log('Resultado de la operación:', result);
  } catch (error) {
    console.error('Error al actualizar el índice de Algolia:', error);
    process.exit(1);
  }
}

updateAlgoliaIndex();
