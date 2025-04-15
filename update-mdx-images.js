const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para actualizar las referencias a imágenes en archivos MDX
function updateMdxFiles() {
  // Buscar todos los archivos MDX en el directorio de contenido
  const mdxFiles = glob.sync('src/content/**/*.mdx');
  
  console.log(`Encontrados ${mdxFiles.length} archivos MDX para procesar.`);
  
  let updatedFiles = 0;
  
  mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Buscar imágenes en formato Markdown: ![alt](path)
    const markdownImageRegex = /!\[(.*?)\]\((\/images\/.*?\.(?:png|jpg|jpeg|gif))\)/g;
    content = content.replace(markdownImageRegex, (match, alt, src) => {
      return `<WebpImage src="${src}" alt="${alt}" />`;
    });
    
    // Buscar imágenes en formato HTML: <img src="/images/..." alt="..." />
    const htmlImageRegex = /<img\s+src="(\/images\/.*?\.(?:png|jpg|jpeg|gif))"\s+alt="(.*?)".*?>/g;
    content = content.replace(htmlImageRegex, (match, src, alt) => {
      return `<WebpImage src="${src}" alt="${alt}" />`;
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
  console.log(`- Archivos procesados: ${mdxFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Archivos sin cambios: ${mdxFiles.length - updatedFiles}`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  updateMdxFiles();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
