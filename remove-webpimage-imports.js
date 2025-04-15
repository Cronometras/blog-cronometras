const fs = require('fs');
const path = require('path');

// Función para obtener todos los archivos MDX en un directorio y sus subdirectorios
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (path.extname(file) === '.mdx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Función para eliminar las importaciones de WebpImage en los archivos MDX
function removeWebpImageImports() {
  // Buscar todos los archivos MDX en el directorio de contenido
  const mdxFiles = getAllFiles(path.join(__dirname, 'src', 'content'));
  
  console.log(`Encontrados ${mdxFiles.length} archivos MDX para procesar.`);
  
  let updatedFiles = 0;
  
  mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Buscar importaciones de WebpImage (incluyendo comentadas)
    const importRegex = /\/\/?\s*import\s+WebpImage\s+from\s+['"]@components\/WebpImage\.astro['"];?/g;
    
    // Eliminar las importaciones de WebpImage
    content = content.replace(importRegex, '');
    
    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (content !== originalContent) {
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

// Ejecutar la función
removeWebpImageImports();
