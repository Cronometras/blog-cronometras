const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Función para convertir imágenes a formato WebP usando sharp
function convertTeamImages() {
  // Verificar si sharp está instalado
  try {
    require.resolve('sharp');
  } catch (e) {
    console.log('El módulo "sharp" no está instalado. Instalándolo...');
    console.log('Por favor, ejecuta: npm install sharp');
    console.log('Luego vuelve a ejecutar este script.');
    return;
  }
  
  const sharp = require('sharp');
  
  // Crear la carpeta de destino si no existe
  const destDir = path.join(__dirname, 'public', 'images', 'webp', 'team');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Creada carpeta: ${destDir}`);
  }
  
  // Lista de imágenes a convertir
  const teamImages = [
    'german.png',
    'juanvi.png',
    'miguel.png',
    'sofia.png'
  ];
  
  // Convertir cada imagen
  teamImages.forEach(imageName => {
    const srcPath = path.join(__dirname, 'public', 'images', 'team', imageName);
    const destPath = path.join(destDir, imageName.replace(/\.[^.]+$/, '.webp'));
    
    sharp(srcPath)
      .webp({ quality: 80 })
      .toFile(destPath)
      .then(() => {
        console.log(`Convertida: ${imageName} -> ${path.basename(destPath)}`);
      })
      .catch(err => {
        console.error(`Error al convertir ${imageName}:`, err);
      });
  });
}

// Ejecutar la función
convertTeamImages();
