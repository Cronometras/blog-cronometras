# Limpiar la carpeta de construcción
Write-Host "Limpiando la carpeta de construcción..."
if (Test-Path dist) {
    Remove-Item -Path dist -Recurse -Force
}

# Ejecutar el comando de construcción
Write-Host "Reconstruyendo el sitio..."
npm run build

Write-Host "Proceso completado."
