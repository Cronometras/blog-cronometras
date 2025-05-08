#!/bin/bash

# Actualizar browserslist
echo "Actualizando browserslist..."
npx update-browserslist-db@latest

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
  fi

  # Asegurarse de que el archivo .htaccess esté en la carpeta dist
  if [ ! -f "dist/.htaccess" ] && [ -f "public/.htaccess" ]; then
    echo "Copiando archivo .htaccess a la carpeta dist..."
    cp public/.htaccess dist/
  fi

  # Crear un archivo index.html básico si no existe
  if [ ! -f "dist/index.html" ]; then
    echo "Creando archivo index.html básico para redirección..."
    echo "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;url=/es'></head><body>Redirigiendo...</body></html>" > dist/index.html
  fi

  echo "¡Compilación completada! Los archivos están listos en la carpeta 'dist'."
  echo "Puedes subir el contenido de la carpeta 'dist' a tu servidor web."
else
  echo "Error durante la compilación. Revisa los mensajes de error anteriores."
  exit 1
fi
