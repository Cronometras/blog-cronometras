const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para actualizar las imágenes heroImage en archivos MDX
function updateHeroImages() {
  // Buscar todos los archivos MDX en el directorio de contenido
  const mdxFiles = glob.sync('src/content/**/*.mdx');
  const mdFiles = glob.sync('src/content/**/*.md');
  const allFiles = [...mdxFiles, ...mdFiles];
  
  console.log(`Encontrados ${allFiles.length} archivos para procesar.`);
  
  let updatedFiles = 0;
  
  allFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Buscar heroImage en el frontmatter
    const heroImageRegex = /(heroImage:\s*"\/images\/.*?\.(?:png|jpg|jpeg|gif)")/g;
    content = content.replace(heroImageRegex, (match) => {
      // Extraer la ruta de la imagen
      const imagePath = match.match(/"(\/images\/.*?)"/)[1];
      const fileName = path.basename(imagePath);
      const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
      
      // Crear la nueva ruta con WebP
      const webpPath = `/images/webp/${fileNameWithoutExt}.webp`;
      
      return `heroImage: "${webpPath}"`;
    });
    
    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado heroImage en: ${filePath}`);
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
  updateHeroImages();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
