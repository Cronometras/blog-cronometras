const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para actualizar las imágenes en los archivos de contenido de las páginas
function updatePageImages() {
  // Buscar todos los archivos MDX en el directorio de contenido de páginas
  const pageFiles = glob.sync('src/content/pages/**/*.mdx');
  
  console.log(`Encontrados ${pageFiles.length} archivos de páginas para procesar.`);
  
  let updatedFiles = 0;
  
  pageFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Buscar imágenes en formato Markdown: ![alt](path)
    const markdownImageRegex = /!\[(.*?)\]\((\/images\/.*?\.(?:png|jpg|jpeg|gif))\)/g;
    content = content.replace(markdownImageRegex, (match, alt, src) => {
      // Crear la ruta de la imagen WebP
      const fileName = path.basename(src);
      const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
      const webpPath = `/images/webp/${fileNameWithoutExt}.webp`;
      
      return `<WebpImage src="${src}" alt="${alt}" />`;
    });
    
    // Buscar imágenes en formato HTML: <img src="/images/..." alt="..." />
    const htmlImageRegex = /<img\\s+src="(\/images\/.*?\\.(?:png|jpg|jpeg|gif))"\\s+(?:alt="(.*?)")?.*?(?:\\/?|><\\/img)>/g;
    content = content.replace(htmlImageRegex, (match, src, alt = '') => {
      // Extraer otros atributos como width, height, class, etc.
      const widthMatch = match.match(/width="([^"]*)"/i);
      const heightMatch = match.match(/height="([^"]*)"/i);
      const classMatch = match.match(/class="([^"]*)"/i);
      const styleMatch = match.match(/style="([^"]*)"/i);
      
      let props = `src="${src}" alt="${alt}"`;
      
      if (widthMatch) props += ` width="${widthMatch[1]}"`;
      if (heightMatch) props += ` height="${heightMatch[1]}"`;
      if (classMatch) props += ` class="${classMatch[1]}"`;
      if (styleMatch) props += ` style="${styleMatch[1]}"`;
      
      return `<WebpImage ${props} />`;
    });
    
    // Si el contenido ha cambiado, añadir la importación del componente WebpImage
    if (content !== originalContent) {
      // Verificar si ya existe la importación
      if (!content.includes("import WebpImage from")) {
        // Buscar la sección de frontmatter
        const frontmatterEndIndex = content.indexOf("---", 3) + 3;
        
        // Insertar la importación después del frontmatter
        content = content.slice(0, frontmatterEndIndex) + 
                 "\nimport WebpImage from '@components/WebpImage.astro';\n" + 
                 content.slice(frontmatterEndIndex);
      }
      
      // Guardar el archivo actualizado
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath}`);
    }
  });
  
  console.log(`\nResumen:`);
  console.log(`- Archivos procesados: ${pageFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Archivos sin cambios: ${pageFiles.length - updatedFiles}`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  updatePageImages();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
