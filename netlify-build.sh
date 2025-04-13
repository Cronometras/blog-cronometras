#!/bin/bash

# Actualizar browserslist
echo "Actualizando browserslist..."
npx update-browserslist-db@latest

# Ejecutar el comando de compilación
echo "Ejecutando comando de compilación..."
npm run build

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
  echo "Compilación exitosa!"
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
    exit 0
  else
    echo "La compilación falló nuevamente."
    exit 1
  fi
fi
