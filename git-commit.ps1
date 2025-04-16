Write-Host "Adding files to Git..."
git add netlify.toml netlify.toml.bak
Write-Host "Committing changes..."
git commit -m "Simplify netlify.toml by removing conditions and unnecessary redirects"
Write-Host "Pushing changes to GitHub..."
git push origin main
Write-Host "Done!"
