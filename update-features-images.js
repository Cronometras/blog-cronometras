const fs = require('fs');
const path = require('path');

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

// Actualizar las imágenes en el archivo de características en inglés
function updateFeaturesImages() {
  const filePath = 'src/content/features/en/index.mdx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Lista de imágenes a reemplazar
  const imagesToReplace = [
    'cronometro repetitivos.png',
    'calculo de tomas restantes.png',
    'resultados en tiempo real.png',
    'gestion integral de estudios.png',
    'informe PDF.jpeg'
  ];
  
  // Reemplazar cada imagen
  imagesToReplace.forEach(imageName => {
    const slugifiedName = slugify(imageName.split('.')[0]);
    const webpPath = `/images/webp/${slugifiedName}.webp`;
    
    // Escapar caracteres especiales para la expresión regular
    const escapedImageName = imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Reemplazar la referencia en el componente WebpImage
    const webpImageRegex = new RegExp(`<WebpImage\\s+src="\/images\/${escapedImageName}"`, 'g');
    content = content.replace(webpImageRegex, `<WebpImage src="${webpPath}"`);
    
    console.log(`Reemplazado en WebpImage: /images/${imageName} -> ${webpPath}`);
  });
  
  // Guardar el archivo actualizado
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\nArchivo actualizado: ${filePath}`);
}

updateFeaturesImages();
