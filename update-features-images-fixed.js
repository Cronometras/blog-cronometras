const fs = require('fs');
const path = require('path');

// Actualizar las imágenes en el archivo de características en inglés
function updateFeaturesImages() {
  const filePath = 'src/content/features/en/index.mdx';
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Reemplazar la imagen específica
  const oldImagePath = '/images/cronometro repetitivos.png';
  const newImagePath = '/images/webp/cronometro-repetitivos.webp';
  
  // Reemplazar la referencia en el componente WebpImage
  content = content.replace(
    `<WebpImage src="${oldImagePath}"`,
    `<WebpImage src="${newImagePath}"`
  );
  
  console.log(`Reemplazado: ${oldImagePath} -> ${newImagePath}`);
  
  // Guardar el archivo actualizado
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\nArchivo actualizado: ${filePath}`);
}

updateFeaturesImages();
