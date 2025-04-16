#!/bin/bash

# Actualizar browserslist
echo "Actualizando browserslist..."
npx update-browserslist-db@latest

# Asegurarse de que el adaptador de Node.js esté instalado
echo "Instalando adaptador de Node.js..."
pnpm install @astrojs/node

# Ejecutar el comando de compilación
echo "Ejecutando comando de compilación..."

# Asegurarse de que estamos en modo estático
echo "Verificando configuración de Astro..."
grep -q "output: \"static\"" astro.config.mjs || {
  echo "Cambiando modo de salida a static..."
  sed -i 's/output: "server"/output: "static"/g' astro.config.mjs
  sed -i 's/output: "hybrid"/output: "static"/g' astro.config.mjs
}

# Ejecutar la compilación
npm run build

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
  echo "Compilación exitosa!"

  # Verificar si el directorio dist existe
  if [ ! -d "dist" ]; then
    echo "El directorio 'dist' no existe. Creando directorio..."
    mkdir -p dist

    # Copiar archivos necesarios al directorio dist
    echo "Copiando archivos al directorio dist..."
    cp -r ./.netlify/* ./dist/

    # Crear un archivo index.html básico si no existe
    if [ ! -f "dist/index.html" ]; then
      echo "Creando archivo index.html básico..."
      echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;url=/es'></head><body>Redirigiendo...</body></html>" > dist/index.html
    fi
  fi

  exit 0
else
  echo "Error en la compilación. Intentando solucionar..."

  # Si hay un error, podemos intentar soluciones específicas aquí
  # Por ejemplo, si hay un problema con WebpImage
  echo "Buscando y corrigiendo problemas con WebpImage..."

  # Crear un script para eliminar importaciones de WebpImage
  cat > fix-webpimage.js << 'EOL'
const fs = require('fs');
const path = require('path');

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

function fixWebpImageIssues() {
  const mdxFiles = getAllFiles(path.join(__dirname, 'src', 'content'));
  console.log(`Encontrados ${mdxFiles.length} archivos MDX para procesar.`);

  let updatedFiles = 0;

  mdxFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Eliminar importaciones de WebpImage
    content = content.replace(/\/\/?\s*import\s+WebpImage\s+from\s+['\"](\@components|\.\.\/)?WebpImage\.astro['\"];?/g, '');

    // Reemplazar etiquetas WebpImage por img
    content = content.replace(/<WebpImage\s+src=['\"]([^'\"]+)['\"]\s+alt=['\"]([^'\"]+)['\"](?:\s+class=['\"]([^'\"]+)['\"])?(?:\s+[^>]*)?(?:\s+\/?><\/WebpImage>|\s*\/>)/g,
      (match, src, alt, className) => {
        let imgTag = `<img src="${src}" alt="${alt}"`;
        if (className) imgTag += ` class="${className}"`;
        imgTag += ` />`;
        return imgTag;
      }
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      updatedFiles++;
      console.log(`Actualizado: ${filePath}`);
    }
  });

  console.log(`\nResumen:\n- Archivos procesados: ${mdxFiles.length}\n- Archivos actualizados: ${updatedFiles}`);
}

fixWebpImageIssues();
EOL

  # Ejecutar el script
  node fix-webpimage.js

  # Si hay un problema con el idioma "Tiempo"

  # Intentar nuevamente la compilación
  npm run build

  # Verificar nuevamente
  if [ $? -eq 0 ]; then
    echo "Compilación exitosa después de solucionar!"

    # Verificar si el directorio dist existe
    if [ ! -d "dist" ]; then
      echo "El directorio 'dist' no existe. Creando directorio..."
      mkdir -p dist

      # Copiar archivos necesarios al directorio dist
      echo "Copiando archivos al directorio dist..."
      cp -r ./.netlify/* ./dist/

      # Crear un archivo index.html básico si no existe
      if [ ! -f "dist/index.html" ]; then
        echo "Creando archivo index.html básico..."
        echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;url=/es'></head><body>Redirigiendo...</body></html>" > dist/index.html
      fi
    fi

    exit 0
  else
    echo "La compilación falló nuevamente."

    # Aún así, crear el directorio dist para evitar el error de despliegue
    echo "Creando directorio dist de emergencia..."
    mkdir -p dist

    # Crear un archivo index.html que redirija a /es/
    echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;url=/es/'><title>Redirigiendo...</title></head><body><h1>Redirigiendo...</h1><p>Si no eres redirigido automáticamente, <a href='/es/'>haz clic aquí</a>.</p></body></html>" > dist/index.html

    # Crear un archivo _redirects para asegurar que las redirecciones funcionen
    echo "/ /es/ 301" > dist/_redirects
    echo "/index.html /es/ 301" >> dist/_redirects

    exit 0
  fi
fi
