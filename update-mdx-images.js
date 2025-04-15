const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para obtener la lista de imágenes disponibles en WebP
function getWebpImages() {
  const webpDir = path.join(__dirname, 'public', 'images', 'webp');
  const webpFiles = fs.readdirSync(webpDir).filter(file => file.endsWith('.webp'));

  // Crear un mapa de nombres de archivo originales a nombres de archivo WebP
  const webpMap = {};
  webpFiles.forEach(webpFile => {
    const baseName = path.basename(webpFile, '.webp');
    webpMap[baseName] = webpFile;
  });

  return webpMap;
}

// Función para actualizar las referencias a imágenes en archivos
function updateImageReferences() {
  // Obtener la lista de imágenes WebP disponibles
  const webpImages = getWebpImages();
  console.log(`Encontradas ${Object.keys(webpImages).length} imágenes WebP disponibles.`);

  // Buscar todos los archivos MDX, MD y Astro en el proyecto
  const mdxFiles = glob.sync('src/content/**/*.mdx');
  const mdFiles = glob.sync('src/content/**/*.md');
  const astroFiles = glob.sync('src/**/*.astro');
  const allFiles = [...mdxFiles, ...mdFiles, ...astroFiles];

  console.log(`Encontrados ${allFiles.length} archivos para procesar:`);
  console.log(`- ${mdxFiles.length} archivos MDX`);
  console.log(`- ${mdFiles.length} archivos MD`);
  console.log(`- ${astroFiles.length} archivos Astro`);

  let updatedFiles = 0;

  allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    const isAstroFile = filePath.endsWith('.astro');
    const isMdFile = filePath.endsWith('.md') || filePath.endsWith('.mdx');

    // Buscar imágenes en formato Markdown: ![alt](path)
    const markdownImageRegex = /!\[(.*?)\]\((\/images\/.*?\.(?:png|jpg|jpeg|gif))\)/g;
    content = content.replace(markdownImageRegex, (match, alt, src) => {
      return `<WebpImage src="${src}" alt="${alt}" />`;
    });

    // Buscar imágenes en formato HTML: <img src="/images/..." alt="..." />
    const htmlImageRegex = /<img\s+src="(\/images\/.*?\.(?:png|jpg|jpeg|gif))"\s+(?:alt="(.*?)")?.*?(?:\/?|><\/img)>/g;
    content = content.replace(htmlImageRegex, (match, src, alt = '') => {
      // Extraer otros atributos como width, height, class, etc.
      const widthMatch = match.match(/width="([^"]*)"/i);
      const heightMatch = match.match(/height="([^"]*)"/i);
      const classMatch = match.match(/class="([^"]*)"/i);
      const styleMatch = match.match(/style="([^"]*)"/i);
      const loadingMatch = match.match(/loading="([^"]*)"/i);

      let props = `src="${src}" alt="${alt}"`;

      if (widthMatch) props += ` width="${widthMatch[1]}"`;
      if (heightMatch) props += ` height="${heightMatch[1]}"`;
      if (classMatch) props += ` class="${classMatch[1]}"`;
      if (styleMatch) props += ` style="${styleMatch[1]}"`;
      if (loadingMatch) props += ` loading="${loadingMatch[1]}"`;

      return `<WebpImage ${props} />`;
    });

    // Buscar imágenes en componentes Image de Astro: <Image src={...} alt="..." />
    const astroImageRegex = /<Image\s+src=\{?"?(\/images\/.*?\.(?:png|jpg|jpeg|gif))"?\}?\s+(?:alt="(.*?)")?.*?(?:\/?|><\/Image)>/g;
    content = content.replace(astroImageRegex, (match, src, alt = '') => {
      // Extraer otros atributos
      const widthMatch = match.match(/width=\{?([^\}\s]*)\}?/i);
      const heightMatch = match.match(/height=\{?([^\}\s]*)\}?/i);
      const classMatch = match.match(/class="([^"]*)"/i);

      let props = `src="${src}" alt="${alt}"`;

      if (widthMatch) props += ` width="${widthMatch[1]}"`;
      if (heightMatch) props += ` height="${heightMatch[1]}"`;
      if (classMatch) props += ` class="${classMatch[1]}"`;

      return `<WebpImage ${props} />`;
    });

    // Si el contenido ha cambiado, añadir la importación del componente WebpImage
    if (content !== originalContent) {
      // Verificar si ya existe la importación
      if (!content.includes("import WebpImage from")) {
        if (isMdFile) {
          // Para archivos MD/MDX, buscar la sección de frontmatter
          const frontmatterEndIndex = content.indexOf("---", 3) + 3;
          if (frontmatterEndIndex > 3) {
            // Insertar la importación después del frontmatter
            content = content.slice(0, frontmatterEndIndex) +
                     "\nimport WebpImage from '@components/WebpImage.astro';\n" +
                     content.slice(frontmatterEndIndex);
          }
        } else if (isAstroFile) {
          // Para archivos Astro, buscar la sección de script
          const scriptEndIndex = content.indexOf("---", 0) > -1 ?
                               content.indexOf("---", content.indexOf("---") + 3) + 3 : 0;

          if (scriptEndIndex > 0) {
            // Insertar la importación dentro de la sección de script
            const scriptSection = content.substring(0, scriptEndIndex);
            const restOfContent = content.substring(scriptEndIndex);

            // Verificar si ya hay imports
            if (scriptSection.includes('import ')) {
              // Añadir después del último import
              const lastImportIndex = scriptSection.lastIndexOf('import ');
              const lastImportEndIndex = scriptSection.indexOf('\n', lastImportIndex) + 1;

              content = scriptSection.substring(0, lastImportEndIndex) +
                       "import WebpImage from '@components/WebpImage.astro';\n" +
                       scriptSection.substring(lastImportEndIndex) +
                       restOfContent;
            } else {
              // Añadir al principio de la sección de script
              content = scriptSection.substring(0, scriptSection.indexOf('---') + 3) +
                       "\nimport WebpImage from '@components/WebpImage.astro';\n" +
                       scriptSection.substring(scriptSection.indexOf('---') + 3) +
                       restOfContent;
            }
          }
        }
      }

      // Guardar el archivo actualizado
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath}`);
    }
  });

  console.log(`\nResumen:`);
  console.log(`- Archivos procesados: ${allFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Archivos sin cambios: ${allFiles.length - updatedFiles}`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  updateImageReferences();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
