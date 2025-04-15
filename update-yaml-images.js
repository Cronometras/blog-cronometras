const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

// Función para convertir un nombre de archivo con espacios a uno con guiones
function slugify(filename) {
  return filename
    .toLowerCase()
    .replace(/[áàäâãå]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Función para actualizar las imágenes en el frontmatter YAML
function updateYamlImages() {
  // Buscar los archivos de contenido de las páginas principales
  const mainPagesFiles = [
    ...glob.sync('src/content/homepage/*/index.md')
  ];
  
  console.log(`Encontrados ${mainPagesFiles.length} archivos para procesar.`);
  
  let updatedFiles = 0;
  
  mainPagesFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Extraer el frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.log(`No se encontró frontmatter en ${filePath}`);
      return;
    }
    
    const frontmatterContent = frontmatterMatch[1];
    
    // Buscar todas las líneas con imágenes
    const imageLines = frontmatterContent.match(/image:\s*\/images\/[^\n]+/g);
    if (!imageLines) {
      console.log(`No se encontraron imágenes en el frontmatter de ${filePath}`);
      return;
    }
    
    let updatedContent = content;
    
    // Procesar cada línea con imagen
    imageLines.forEach(imageLine => {
      const imagePathMatch = imageLine.match(/image:\s*(\/images\/[^\s]+)/);
      if (!imagePathMatch) return;
      
      const imagePath = imagePathMatch[1];
      
      // Verificar si la imagen ya es WebP
      if (imagePath.endsWith('.webp')) {
        console.log(`  - La imagen ya es WebP: ${imagePath}`);
        return;
      }
      
      // Crear la ruta de la imagen WebP
      const fileName = path.basename(imagePath);
      const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
      const slugifiedName = slugify(fileNameWithoutExt);
      const webpPath = `/images/webp/${slugifiedName}.webp`;
      
      // Reemplazar la referencia
      updatedContent = updatedContent.replace(
        new RegExp(`image:\\s*${imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
        `image: ${webpPath}`
      );
      
      console.log(`  - Reemplazado: ${imagePath} -> ${webpPath}`);
    });
    
    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (updatedContent !== originalContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath}`);
    }
  });
  
  console.log(`\nResumen:`);
  console.log(`- Archivos procesados: ${mainPagesFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Archivos sin cambios: ${mainPagesFiles.length - updatedFiles}`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  updateYamlImages();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
