#!/bin/bash

# Script de construcción personalizado para Netlify
echo "🚀 Iniciando proceso de construcción personalizado"

# Mostrar versiones de Node y npm
echo "📦 Versiones de Node y npm:"
node -v
npm -v

# Instalar dependencias
echo "📚 Instalando dependencias..."
npm install

# Limpiar caché si es necesario
echo "🧹 Limpiando caché anterior..."
rm -rf .astro || true
rm -rf dist || true

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
npm run build

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
  echo "✅ Construcción completada exitosamente"
  
  # Listar archivos en dist para verificar
  echo "📂 Contenido del directorio dist:"
  ls -la dist
  
  exit 0
else
  echo "❌ Error durante la construcción"
  exit 1
fi 