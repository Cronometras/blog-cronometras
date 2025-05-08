# Script de compilación para Windows PowerShell

# Actualizar browserslist
Write-Host "Actualizando browserslist..."
npx update-browserslist-db@latest

# Ejecutar el comando de compilación
Write-Host "Ejecutando comando de compilación..."

# Asegurarse de que estamos en modo estático
Write-Host "Verificando configuración de Astro..."
$configContent = Get-Content -Path "astro.config.mjs" -Raw
if (-not ($configContent -match "output: `"static`"")) {
    Write-Host "Cambiando modo de salida a static..."
    $configContent = $configContent -replace "output: `"server`"", "output: `"static`""
    $configContent = $configContent -replace "output: `"hybrid`"", "output: `"static`""
    Set-Content -Path "astro.config.mjs" -Value $configContent
}

# Ejecutar la compilación
npm run build

# Verificar si la compilación fue exitosa
if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilación exitosa!"

    # Verificar si el directorio dist existe
    if (-not (Test-Path -Path "dist" -PathType Container)) {
        Write-Host "El directorio 'dist' no existe. Creando directorio..."
        New-Item -Path "dist" -ItemType Directory
    }

    # Asegurarse de que el archivo .htaccess esté en la carpeta dist
    if ((-not (Test-Path -Path "dist\.htaccess")) -and (Test-Path -Path "public\.htaccess")) {
        Write-Host "Copiando archivo .htaccess a la carpeta dist..."
        Copy-Item -Path "public\.htaccess" -Destination "dist\"
    }

    # Copiar archivos PHP para manejar la redirección
    if (Test-Path -Path "public\index.php") {
        Write-Host "Copiando archivo index.php a la carpeta dist..."
        Copy-Item -Path "public\index.php" -Destination "dist\"
    }

    if (Test-Path -Path "public\router.php") {
        Write-Host "Copiando archivo router.php a la carpeta dist..."
        Copy-Item -Path "public\router.php" -Destination "dist\"
    }

    if (Test-Path -Path "public\phpinfo.php") {
        Write-Host "Copiando archivo phpinfo.php a la carpeta dist..."
        Copy-Item -Path "public\phpinfo.php" -Destination "dist\"
    }

    # Crear un archivo index.html básico si no existe
    if ((-not (Test-Path -Path "dist\index.html")) -and (-not (Test-Path -Path "dist\index.php"))) {
        Write-Host "Creando archivo index.html básico para redirección..."
        Set-Content -Path "dist\index.html" -Value "<!DOCTYPE html><html><head><meta http-equiv='refresh' content='0;url=/es'></head><body>Redirigiendo...</body></html>"
    }

    Write-Host "¡Compilación completada! Los archivos están listos en la carpeta 'dist'."
    Write-Host "Puedes subir el contenido de la carpeta 'dist' a tu servidor web."
} else {
    Write-Host "Error durante la compilación. Revisa los mensajes de error anteriores."
    exit 1
}
