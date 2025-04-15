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

// Cargar el mapa de renombrado
let renameMap = {};
try {
  const mapContent = fs.readFileSync('webp-rename-map.json', 'utf8');
  renameMap = JSON.parse(mapContent);
  console.log(`Cargado mapa de renombrado con ${Object.keys(renameMap).length} entradas.`);
} catch (e) {
  console.log('No se pudo cargar el mapa de renombrado. Continuando sin él.');
}

// Función para actualizar las referencias a imágenes en los archivos en inglés
function updateEnglishImages() {
  // Buscar todos los archivos en inglés
  const englishFiles = [
    ...glob.sync('src/content/pages/en/**/*.mdx'),
    ...glob.sync('src/content/pages/en/**/*.md'),
    ...glob.sync('src/content/about/en/**/*.md'),
    ...glob.sync('src/content/blog/en/**/*.mdx'),
    ...glob.sync('src/pages/en/**/*.astro')
  ];
  
  console.log(`Encontrados ${englishFiles.length} archivos en inglés para procesar.`);
  
  let updatedFiles = 0;
  let updatedReferences = 0;
  
  englishFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fileUpdated = false;
    
    // 1. Buscar imágenes en formato Markdown: ![alt](path)
    const markdownImageRegex = /!\[(.*?)\]\((\/images\/.*?\.(?:png|jpg|jpeg|gif))\)/g;
    let match;
    while ((match = markdownImageRegex.exec(content)) !== null) {
      const [fullMatch, alt, imagePath] = match;
      
      // Crear la ruta de la imagen WebP
      const fileName = path.basename(imagePath);
      const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
      const slugifiedName = slugify(fileNameWithoutExt);
      const webpPath = `/images/webp/${slugifiedName}.webp`;
      
      // Reemplazar la referencia
      const replacement = `<WebpImage src="${imagePath}" alt="${alt}" />`;
      content = content.replace(fullMatch, replacement);
      fileUpdated = true;
      updatedReferences++;
    }
    
    // 2. Buscar imágenes en formato HTML: <img src="/images/..." alt="..." />
    const htmlImageRegex = /<img\s+src="(\/images\/.*?\.(?:png|jpg|jpeg|gif))"\s+(?:alt="(.*?)")?.*?(?:\/?|><\/img>)/g;
    while ((match = htmlImageRegex.exec(content)) !== null) {
      const [fullMatch, imagePath, alt = ''] = match;
      
      // Extraer otros atributos
      const widthMatch = fullMatch.match(/width="([^"]*)"/i);
      const heightMatch = fullMatch.match(/height="([^"]*)"/i);
      const classMatch = fullMatch.match(/class="([^"]*)"/i);
      
      // Crear props para el componente WebpImage
      let props = `src="${imagePath}" alt="${alt}"`;
      if (widthMatch) props += ` width="${widthMatch[1]}"`;
      if (heightMatch) props += ` height="${heightMatch[1]}"`;
      if (classMatch) props += ` class="${classMatch[1]}"`;
      
      // Reemplazar la referencia
      const replacement = `<WebpImage ${props} />`;
      content = content.replace(fullMatch, replacement);
      fileUpdated = true;
      updatedReferences++;
    }
    
    // 3. Buscar componentes Section con imágenes
    const sectionRegex = /<Section\s+section={{\s+title:\s+"([^"]+)",\s+content:\s+"([^"]+)",\s+image:\s+"(\/images\/[^"]+)",\s+imageClasses:\s+"([^"]+)",\s+alt:\s+"([^"]+)"\s+}}\s*\/>/g;
    while ((match = sectionRegex.exec(content)) !== null) {
      const [fullMatch, title, contentText, imagePath, imageClasses, alt] = match;
      
      // Verificar si la imagen ya es WebP
      if (!imagePath.endsWith('.webp')) {
        // Crear la ruta de la imagen WebP
        const fileName = path.basename(imagePath);
        const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
        const slugifiedName = slugify(fileNameWithoutExt);
        const webpPath = `/images/webp/${slugifiedName}.webp`;
        
        // Crear el nuevo componente Section
        const replacement = `<Section
  section={{
    title: "${title}",
    content: "${contentText}",
    image: "${webpPath}",
    imageClasses: "${imageClasses}",
    alt: "${alt}"
  }}
/>`;
        
        content = content.replace(fullMatch, replacement);
        fileUpdated = true;
        updatedReferences++;
      }
    }
    
    // 4. Buscar imágenes WebP con espacios en el nombre
    Object.keys(renameMap).forEach(oldFilename => {
      const oldWebpPath = `/images/webp/${oldFilename}`;
      const newWebpPath = `/images/webp/${renameMap[oldFilename]}`;
      
      if (content.includes(oldWebpPath)) {
        content = content.replace(new RegExp(oldWebpPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newWebpPath);
        fileUpdated = true;
        updatedReferences++;
      }
    });
    
    // Si el contenido ha cambiado, añadir la importación del componente WebpImage si es necesario
    if (fileUpdated) {
      // Verificar si ya existe la importación
      if (!content.includes("import WebpImage from")) {
        // Buscar la sección de frontmatter
        const frontmatterEndIndex = content.indexOf("---", 3) + 3;
        
        if (frontmatterEndIndex > 3) {
          // Insertar la importación después del frontmatter
          content = content.slice(0, frontmatterEndIndex) + 
                   "\nimport WebpImage from '@components/WebpImage.astro';\n" + 
                   content.slice(frontmatterEndIndex);
        }
      }
      
      // Guardar el archivo actualizado
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath} (${updatedReferences} referencias)`);
    }
  });
  
  console.log(`\nResumen:`);
  console.log(`- Archivos procesados: ${englishFiles.length}`);
  console.log(`- Archivos actualizados: ${updatedFiles}`);
  console.log(`- Referencias actualizadas: ${updatedReferences}`);
  console.log(`- Archivos sin cambios: ${englishFiles.length - updatedFiles}`);
}

// Verificar si glob está instalado
try {
  require.resolve('glob');
  updateEnglishImages();
} catch (e) {
  console.log('El módulo "glob" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install glob');
  console.log('Luego vuelve a ejecutar este script.');
}
