const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Función para crear una imagen por defecto
function createDefaultImage() {
  // Crear un canvas de 800x600 píxeles
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Rellenar el fondo con un color gris claro
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Dibujar un borde
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, width - 10, height - 10);

  // Añadir texto
  ctx.fillStyle = '#666666';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Imagen no disponible', width / 2, height / 2 - 30);

  ctx.font = '24px Arial';
  ctx.fillText('Esta imagen se mostrará próximamente', width / 2, height / 2 + 30);

  // Añadir el logo de Cronometras
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('CRONOMETRAS', width / 2, height - 100);

  // Guardar la imagen como PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'default.png'), buffer);
  console.log('Imagen PNG creada: public/images/default.png');

  // Guardar la imagen como WebP
  const webpBuffer = canvas.toBuffer('image/webp');
  fs.writeFileSync(path.join(__dirname, 'public', 'images', 'webp', 'default.webp'), webpBuffer);
  console.log('Imagen WebP creada: public/images/webp/default.webp');
}

// Verificar si canvas está instalado
try {
  require.resolve('canvas');
  createDefaultImage();
} catch (e) {
  console.log('El módulo "canvas" no está instalado. Instalándolo...');
  console.log('Por favor, ejecuta: npm install canvas');
  console.log('Luego vuelve a ejecutar este script.');
}
