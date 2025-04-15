const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imageDir = path.join(__dirname, 'public', 'images');
const outputDir = path.join(__dirname, 'public', 'images', 'webp');

// Crear el directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Obtener todas las imágenes
fs.readdir(imageDir, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio:', err);
    return;
  }

  // Filtrar solo archivos de imagen
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });

  console.log(`Encontradas ${imageFiles.length} imágenes para convertir.`);

  // Convertir cada imagen a WebP
  let processed = 0;
  imageFiles.forEach(file => {
    const inputPath = path.join(imageDir, file);
    const outputFileName = path.basename(file, path.extname(file)) + '.webp';
    const outputPath = path.join(outputDir, outputFileName);

    // Verificar si el archivo ya existe
    if (fs.existsSync(outputPath)) {
      console.log(`Saltando ${file} - ya existe en formato WebP`);
      processed++;
      if (processed === imageFiles.length) {
        console.log('¡Conversión completada!');
      }
      return;
    }

    // Convertir a WebP con calidad 80%
    sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        console.log(`Convertido: ${file} -> ${outputFileName}`);
        processed++;
        if (processed === imageFiles.length) {
          console.log('¡Conversión completada!');
        }
      })
      .catch(err => {
        console.error(`Error al convertir ${file}:`, err);
        processed++;
        if (processed === imageFiles.length) {
          console.log('¡Conversión completada con errores!');
        }
      });
  });
});
