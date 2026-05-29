@echo off
cd /d C:\xamppp\htdocs\gospelscreen-tv

echo Checking current git status...
git status

echo.
echo Attempting to pull latest from GitHub...
git pull origin main --allow-unrelated-histories || echo "No commits on remote yet"

echo.
echo Force adding all files...
git add -f .

echo.
echo Current status after add:
git status

echo.
echo Creating commit...
git commit -m "Initial commit: Gospel Screen TV project" || echo "Commit failed"

echo.
echo Pushing to GitHub...
git push -u origin main -f

echo.
echo Done!
pause
