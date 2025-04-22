$files = Get-ChildItem -Path src/content/blog -Recurse | Where-Object { $_.Name -match " " }

foreach ($file in $files) {
    $oldPath = $file.FullName
    $newName = $file.Name -replace " ", "-"
    $newPath = Join-Path -Path $file.DirectoryName -ChildPath $newName
    
    Write-Host "Renombrando: $($file.Name) -> $newName"
    Rename-Item -Path $oldPath -NewName $newName
}

Write-Host "Proceso completado. Se renombraron $($files.Count) archivos."
