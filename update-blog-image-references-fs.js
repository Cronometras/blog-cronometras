const fs = require('fs');
const path = require('path');

// Función para convertir un nombre de archivo con espacios a uno con guiones (slugify)
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

// Función para actualizar las referencias a imágenes en los archivos del blog
function updateBlogImageReferences() {
  // Buscar todos los archivos MDX en el directorio del blog
  const blogFiles = getAllFiles(path.join(__dirname, 'src', 'content', 'blog'));
  
  console.log(`Encontrados ${blogFiles.length} archivos de blog para procesar.`);
  
  let updatedFiles = 0;
  let updatedReferences = 0;
  
  blogFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileUpdated = false;
    
    // 1. Buscar imágenes en el frontmatter (heroImage)
    const heroImageRegex = /heroImage:\s*"(\/images\/webp\/[^"]+)"/g;
    let match;
    while ((match = heroImageRegex.exec(content)) !== null) {
      const [fullMatch, imagePath] = match;
      
      // Obtener el nombre del archivo de la ruta
      const fileName = path.basename(imagePath);
      
      // Slugificar el nombre del archivo
      const slugifiedFileName = slugify(fileName);
      
      // Si el nombre del archivo ya está slugificado, continuar con el siguiente
      if (fileName === slugifiedFileName) {
        continue;
      }
      
      // Crear la nueva ruta de la imagen
      const newImagePath = imagePath.replace(fileName, slugifiedFileName);
      
      // Reemplazar la referencia en el contenido
      content = content.replace(
        fullMatch,
        `heroImage: "${newImagePath}"`
      );
      
      fileUpdated = true;
      updatedReferences++;
      console.log(`  - Actualizada heroImage en ${filePath}:`);
      console.log(`    De: ${imagePath}`);
      console.log(`    A:  ${newImagePath}`);
    }
    
    // 2. Buscar imágenes en el componente WebpImage
    const webpImageRegex = /<WebpImage\s+src="(\/images\/[^"]+)"/g;
    while ((match = webpImageRegex.exec(content)) !== null) {
      const [fullMatch, imagePath] = match;
      
      // Verificar si la imagen ya está en formato WebP
      if (imagePath.endsWith('.webp')) {
        // La imagen ya está en formato WebP, solo necesitamos slugificar el nombre
        const fileName = path.basename(imagePath);
        const slugifiedFileName = slugify(fileName);
        
        // Si el nombre del archivo ya está slugificado, continuar con el siguiente
        if (fileName === slugifiedFileName) {
          continue;
        }
        
        // Crear la nueva ruta de la imagen
        const newImagePath = imagePath.replace(fileName, slugifiedFileName);
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `<WebpImage src="${newImagePath}"`
        );
      } else {
        // La imagen no está en formato WebP, necesitamos convertirla
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        const slugifiedFileName = slugify(fileNameWithoutExt) + '.webp';
        
        // Crear la nueva ruta de la imagen
        const newImagePath = `/images/webp/${slugifiedFileName}`;
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `<WebpImage src="${newImagePath}"`
        );
      }
      
      fileUpdated = true;
      updatedReferences++;
      console.log(`  - Actualizada WebpImage en ${filePath}:`);
      console.log(`    De: ${imagePath}`);
      console.log(`    A:  ${newImagePath}`);
    }
    
    // 3. Buscar imágenes en formato Markdown: ![alt](path)
    const markdownImageRegex = /!\[(.*?)\]\((\/images\/[^)]+)\)/g;
    while ((match = markdownImageRegex.exec(content)) !== null) {
      const [fullMatch, alt, imagePath] = match;
      
      // Verificar si la imagen ya está en formato WebP
      if (imagePath.endsWith('.webp')) {
        // La imagen ya está en formato WebP, solo necesitamos slugificar el nombre
        const fileName = path.basename(imagePath);
        const slugifiedFileName = slugify(fileName);
        
        // Si el nombre del archivo ya está slugificado, continuar con el siguiente
        if (fileName === slugifiedFileName) {
          continue;
        }
        
        // Crear la nueva ruta de la imagen
        const newImagePath = imagePath.replace(fileName, slugifiedFileName);
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `![${alt}](${newImagePath})`
        );
      } else {
        // La imagen no está en formato WebP, necesitamos convertirla
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        const slugifiedFileName = slugify(fileNameWithoutExt) + '.webp';
        
        // Crear la nueva ruta de la imagen
        const newImagePath = `/images/webp/${slugifiedFileName}`;
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `![${alt}](${newImagePath})`
        );
      }
      
      fileUpdated = true;
      updatedReferences++;
      console.log(`  - Actualizada imagen Markdown en ${filePath}:`);
      console.log(`    De: ${imagePath}`);
      console.log(`    A:  ${newImagePath}`);
    }
    
    // 4. Buscar imágenes en formato HTML: <img src="path" alt="alt" />
    const htmlImageRegex = /<img\s+src="(\/images\/[^"]+)"/g;
    while ((match = htmlImageRegex.exec(content)) !== null) {
      const [fullMatch, imagePath] = match;
      
      // Verificar si la imagen ya está en formato WebP
      if (imagePath.endsWith('.webp')) {
        // La imagen ya está en formato WebP, solo necesitamos slugificar el nombre
        const fileName = path.basename(imagePath);
        const slugifiedFileName = slugify(fileName);
        
        // Si el nombre del archivo ya está slugificado, continuar con el siguiente
        if (fileName === slugifiedFileName) {
          continue;
        }
        
        // Crear la nueva ruta de la imagen
        const newImagePath = imagePath.replace(fileName, slugifiedFileName);
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `<img src="${newImagePath}"`
        );
      } else {
        // La imagen no está en formato WebP, necesitamos convertirla
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        const slugifiedFileName = slugify(fileNameWithoutExt) + '.webp';
        
        // Crear la nueva ruta de la imagen
        const newImagePath = `/images/webp/${slugifiedFileName}`;
        
        // Reemplazar la referencia en el contenido
        content = content.replace(
          fullMatch,
          `<img src="${newImagePath}"`
        );
      }
      
      fileUpdated = true;
      updatedReferences++;
      console.log(`  - Actualizada imagen HTML en ${filePath}:`);
      console.log(`    De: ${imagePath}`);
      console.log(`    A:  ${newImagePath}`);
    }
    
    // Si el contenido ha cambiado, guardar el archivo actualizado
    if (fileUpdated) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath} (${updatedReferences} referencias)`);
    }
  });
  
  console.log(`\nResumen:`);
  console.log(`- Archivos procesados: ${blogFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Referencias actualizadas: ${updatedReferences}`);
  console.log(`- Archivos sin cambios: ${blogFiles.length - updatedFiles}`);
}

// Ejecutar la función
updateBlogImageReferences();
