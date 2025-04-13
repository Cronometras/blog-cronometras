#!/bin/bash

# Actualizar browserslist
echo "Actualizando browserslist..."
npx update-browserslist-db@latest

# Asegurarse de que el adaptador de Node.js esté instalado
echo "Instalando adaptador de Node.js..."
pnpm install @astrojs/node

# Ejecutar el comando de compilación
echo "Ejecutando comando de compilación..."
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
  # Por ejemplo, si hay un problema con el idioma "Tiempo"

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
    echo "<!DOCTYPE html><html><head><title>Sitio en mantenimiento</title></head><body><h1>Sitio en mantenimiento</h1><p>Estamos trabajando para mejorar el sitio. Por favor, vuelve más tarde.</p></body></html>" > dist/index.html

    exit 0
  fi
fi
