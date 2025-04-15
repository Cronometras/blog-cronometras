const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Función para actualizar las imágenes en los componentes Section
function updateSectionComponents() {
  // Buscar todos los archivos MDX en el directorio de contenido de páginas
  const pageFiles = glob.sync('src/content/pages/**/*.mdx');

  console.log(`Encontrados ${pageFiles.length} archivos de páginas para procesar.`);

  let updatedFiles = 0;

  pageFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Buscar componentes Section con imágenes
    const sectionRegex = /<Section\s+section={{\s+title:\s+"([^"]+)",\s+content:\s+"([^"]+)",\s+image:\s+"(\/images\/[^"]+)",\s+imageClasses:\s+"([^"]+)",\s+alt:\s+"([^"]+)"\s+}}\s*\/>/g;

    content = content.replace(sectionRegex, (match, title, contentText, imagePath, imageClasses, alt) => {
      // Verificar si la imagen ya es WebP
      let newImagePath;
      if (imagePath.endsWith('.webp')) {
        newImagePath = imagePath;
      } else {
        // Crear la ruta de la imagen WebP
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        newImagePath = `/images/webp/${fileNameWithoutExt}.webp`;
      }

      // Crear el nuevo componente Section con WebpImage
      return `<Section
  section={{
    title: "${title}",
    content: "${contentText}",
    image: "${newImagePath}",
    imageClasses: "${imageClasses}",
    alt: "${alt}"
  }}
/>`;
    });

    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (content !== originalContent) {
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
  updateSectionComponents();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
