const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

// Función para renombrar las imágenes WebP
function renameWebpImages() {
  const webpDir = path.join(__dirname, 'public', 'images', 'webp');
  const files = fs.readdirSync(webpDir);
  
  console.log(`Encontradas ${files.length} imágenes WebP para procesar.`);
  
  const renameMap = {};
  let renamedFiles = 0;
  
  // Renombrar las imágenes
  files.forEach(file => {
    if (file.includes(' ')) {
      const oldPath = path.join(webpDir, file);
      const newFilename = slugify(file);
      const newPath = path.join(webpDir, newFilename);
      
      // Guardar el mapeo para actualizar las referencias
      renameMap[file] = newFilename;
      
      // Renombrar el archivo
      fs.renameSync(oldPath, newPath);
      renamedFiles++;
      console.log(`Renombrado: ${file} -> ${newFilename}`);
    }
  });
  
  console.log(`\nResumen de renombrado:`);
  console.log(`- Imágenes procesadas: ${files.length}`);
  console.log(`- Imágenes renombradas: ${renamedFiles}`);
  
  // Actualizar las referencias en los archivos MDX
  const mdxFiles = glob.sync('src/content/pages/**/*.mdx');
  
  console.log(`\nEncontrados ${mdxFiles.length} archivos MDX para actualizar referencias.`);
  
  let updatedFiles = 0;
  
  mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let updated = false;
    
    // Actualizar las referencias en los componentes Section
    Object.keys(renameMap).forEach(oldFilename => {
      const oldPath = `/images/webp/${oldFilename}`;
      const newPath = `/images/webp/${renameMap[oldFilename]}`;
      
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        updated = true;
      }
    });
    
    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath}`);
    }
  });
  
  console.log(`\nResumen de actualización de referencias:`);
  console.log(`- Archivos procesados: ${mdxFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Archivos sin cambios: ${mdxFiles.length - updatedFiles}`);
  
  // Crear un archivo de mapeo para referencia futura
  const mapContent = JSON.stringify(renameMap, null, 2);
  fs.writeFileSync('webp-rename-map.json', mapContent, 'utf8');
  console.log(`\nCreado archivo de mapeo: webp-rename-map.json`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  renameWebpImages();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
