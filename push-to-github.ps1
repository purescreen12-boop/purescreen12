# Push to GitHub script
cd C:\xamppp\htdocs\gospelscreen-tv

# Configure git
git config user.name "Yemi Josh"
git config user.email "josh@example.com"
git config core.safecrlf false

# Stage all files
Write-Host "Staging files..."
git add .

# Check status
Write-Host "Checking status..."
git status

# Commit
Write-Host "Creating commit..."
git commit -m "Initial commit: Gospel Screen TV project"

# Push to GitHub
Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Done!"
