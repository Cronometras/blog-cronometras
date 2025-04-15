const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'public', 'images');
const webpDir = path.join(__dirname, 'public', 'images', 'webp');
const outputFile = path.join(__dirname, 'webp-implementation-guide.md');

// Obtener todas las imágenes originales
const imageFiles = fs.readdirSync(imageDir).filter(file => {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
});

// Obtener todas las imágenes WebP
const webpFiles = fs.readdirSync(webpDir).filter(file => {
  return path.extname(file).toLowerCase() === '.webp';
});

// Crear la guía de implementación
let guide = `# Guía de implementación de imágenes WebP

Se han generado ${webpFiles.length} imágenes WebP a partir de ${imageFiles.length} imágenes originales.

## Ahorro de espacio
- Tamaño original: ${(fs.statSync(imageDir).size / 1024 / 1024).toFixed(2)} MB
- Tamaño WebP: ${(fs.statSync(webpDir).size / 1024 / 1024).toFixed(2)} MB
- Ahorro: ${((1 - (fs.statSync(webpDir).size / fs.statSync(imageDir).size)) * 100).toFixed(2)}%

## Cómo implementar las imágenes WebP en tu sitio

### Opción 1: Usando la etiqueta \`<picture>\`

La etiqueta \`<picture>\` permite proporcionar diferentes fuentes de imagen según el soporte del navegador:

\`\`\`html
<picture>
  <source srcset="/images/webp/nombre-de-imagen.webp" type="image/webp">
  <img src="/images/nombre-de-imagen.png" alt="Descripción de la imagen">
</picture>
\`\`\`

### Opción 2: Usando JavaScript para detectar soporte de WebP

Puedes usar JavaScript para detectar si el navegador soporta WebP y cargar las imágenes correspondientes:

\`\`\`javascript
function checkWebpSupport(callback) {
  var img = new Image();
  img.onload = function() {
    var result = (img.width > 0) && (img.height > 0);
    callback(result);
  };
  img.onerror = function() {
    callback(false);
  };
  img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
}

checkWebpSupport(function(support) {
  var images = document.querySelectorAll('img[data-src]');
  images.forEach(function(img) {
    if (support) {
      img.src = img.getAttribute('data-src').replace('/images/', '/images/webp/').replace(/\\.(png|jpg|jpeg|gif)$/, '.webp');
    } else {
      img.src = img.getAttribute('data-src');
    }
  });
});
\`\`\`

Y en tu HTML:

\`\`\`html
<img data-src="/images/nombre-de-imagen.png" alt="Descripción de la imagen">
\`\`\`

### Opción 3: Usando Astro para manejar las imágenes

Si estás usando Astro, puedes crear un componente personalizado para manejar las imágenes WebP:

\`\`\`astro
---
// WebpImage.astro
const { src, alt, width, height, class: className } = Astro.props;
const webpSrc = src.replace('/images/', '/images/webp/').replace(/\\.(png|jpg|jpeg|gif)$/, '.webp');
---

<picture>
  <source srcset={webpSrc} type="image/webp">
  <img src={src} alt={alt} width={width} height={height} class={className}>
</picture>
\`\`\`

Y usarlo en tus páginas:

\`\`\`astro
---
import WebpImage from '../components/WebpImage.astro';
---

<WebpImage src="/images/nombre-de-imagen.png" alt="Descripción de la imagen" />
\`\`\`

## Lista de imágenes convertidas

A continuación se muestra una lista de todas las imágenes que se han convertido a formato WebP:

`;

// Añadir la lista de imágenes convertidas
webpFiles.forEach(webpFile => {
  const originalFile = webpFile.replace('.webp', path.extname(webpFile.replace('.webp', '')));
  guide += `- ${originalFile} -> ${webpFile}\n`;
});

// Escribir la guía en un archivo
fs.writeFileSync(outputFile, guide);

console.log(`Guía de implementación generada en ${outputFile}`);
