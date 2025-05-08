# Script para copiar los archivos de la API a la carpeta dist

# Crear la estructura de directorios en dist
Write-Host "Creando estructura de directorios para la API..."
New-Item -Path "dist\api" -ItemType Directory -Force | Out-Null
New-Item -Path "dist\api\contact" -ItemType Directory -Force | Out-Null
New-Item -Path "dist\api\information-request" -ItemType Directory -Force | Out-Null
New-Item -Path "dist\api\newsletter" -ItemType Directory -Force | Out-Null

# Copiar los archivos PHP de la API
Write-Host "Copiando archivos PHP de la API..."
Copy-Item -Path "public\api\contact\index.php" -Destination "dist\api\contact\" -Force
Copy-Item -Path "public\api\information-request\index.php" -Destination "dist\api\information-request\" -Force
Copy-Item -Path "public\api\newsletter\index.php" -Destination "dist\api\newsletter\" -Force

Write-Host "Archivos de la API copiados correctamente a la carpeta dist."
