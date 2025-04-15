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

// Función para reemplazar las etiquetas WebpImage por etiquetas img
function replaceWebpImageTags() {
  // Buscar todos los archivos MDX en el directorio de contenido
  const mdxFiles = getAllFiles(path.join(__dirname, 'src', 'content'));
  
  console.log(`Encontrados ${mdxFiles.length} archivos MDX para procesar.`);
  
  let updatedFiles = 0;
  
  mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Buscar etiquetas WebpImage
    const webpImageRegex = /<WebpImage\s+src="([^"]+)"\s+alt="([^"]+)"(?:\s+class="([^"]+)")?(?:\s+width="([^"]+)")?(?:\s+height="([^"]+)")?(?:\s+loading="([^"]+)")?(?:\s+decoding="([^"]+)")?(?:\s+fetchpriority="([^"]+)")?(?:\s+style="([^"]+)")?(?:\s+id="([^"]+)")?(?:\s+title="([^"]+)")?(?:\s+crossorigin="([^"]+)")?(?:\s+referrerpolicy="([^"]+)")?(?:\s+sizes="([^"]+)")?(?:\s+srcset="([^"]+)")?(?:\s+usemap="([^"]+)")?(?:\s+ismap)?(?:\s+[^>]*)?(?:\s+\/>|\s*>\s*<\/WebpImage>)/g;
    
    // Reemplazar las etiquetas WebpImage por etiquetas img
    content = content.replace(webpImageRegex, (match, src, alt, className, width, height, loading, decoding, fetchpriority, style, id, title, crossorigin, referrerpolicy, sizes, srcset, usemap, ismap) => {
      let imgTag = `<img src="${src}" alt="${alt}"`;
      
      if (className) imgTag += ` class="${className}"`;
      if (width) imgTag += ` width="${width}"`;
      if (height) imgTag += ` height="${height}"`;
      if (loading) imgTag += ` loading="${loading}"`;
      if (decoding) imgTag += ` decoding="${decoding}"`;
      if (fetchpriority) imgTag += ` fetchpriority="${fetchpriority}"`;
      if (style) imgTag += ` style="${style}"`;
      if (id) imgTag += ` id="${id}"`;
      if (title) imgTag += ` title="${title}"`;
      if (crossorigin) imgTag += ` crossorigin="${crossorigin}"`;
      if (referrerpolicy) imgTag += ` referrerpolicy="${referrerpolicy}"`;
      if (sizes) imgTag += ` sizes="${sizes}"`;
      if (srcset) imgTag += ` srcset="${srcset}"`;
      if (usemap) imgTag += ` usemap="${usemap}"`;
      if (ismap) imgTag += ` ismap`;
      
      imgTag += ` />`;
      
      return imgTag;
    });
    
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
replaceWebpImageTags();
