# Script para eliminar tildes de los nombres de archivos .mdx

function Remove-Accents {
    param (
        [string]$text
    )
    
    $text = $text -replace 'á', 'a'
    $text = $text -replace 'é', 'e'
    $text = $text -replace 'í', 'i'
    $text = $text -replace 'ó', 'o'
    $text = $text -replace 'ú', 'u'
    $text = $text -replace 'Á', 'A'
    $text = $text -replace 'É', 'E'
    $text = $text -replace 'Í', 'I'
    $text = $text -replace 'Ó', 'O'
    $text = $text -replace 'Ú', 'U'
    $text = $text -replace 'ñ', 'n'
    $text = $text -replace 'Ñ', 'N'
    $text = $text -replace 'ü', 'u'
    $text = $text -replace 'Ü', 'U'
    
    return $text
}

# Obtener todos los archivos .mdx
$files = Get-ChildItem -Path "src/content/blog" -Recurse -Filter "*.mdx"

# Contador para archivos renombrados
$renamedCount = 0

foreach ($file in $files) {
    $directory = $file.DirectoryName
    $oldName = $file.Name
    $newName = Remove-Accents -text $oldName
    
    # Verificar si el nombre tiene tildes
    if ($oldName -ne $newName) {
        $oldPath = Join-Path -Path $directory -ChildPath $oldName
        $newPath = Join-Path -Path $directory -ChildPath $newName
        
        Write-Host "Renombrando: $oldName -> $newName"
        
        # Renombrar el archivo
        Rename-Item -Path $oldPath -NewName $newName -Force
        $renamedCount++
    }
}

Write-Host "Proceso completado. Se renombraron $renamedCount archivos."
