@echo off
REM ── AAA Insights: one-click backup to GitHub ────────────────────────
REM Double-click this file to commit all changes and push to GitHub.
cd /d "%~dp0"

echo Clearing any stale git lock files (OneDrive leaves these behind)...
if exist ".git\index.lock"  del /f /q ".git\index.lock"
if exist ".git\config.lock" del /f /q ".git\config.lock"
if exist ".git\HEAD.lock"   del /f /q ".git\HEAD.lock"

echo.
set /p msg=Enter a short description of what changed (or press Enter): 
if "%msg%"=="" set "msg=Update from %date% %time%"

echo.
echo Staging and committing...
git add -A
git commit -m "%msg%"

echo.
echo Pushing to GitHub...
git push

echo.
echo ============================================================
echo Done. If you see errors above, copy them to Claude.
echo ============================================================
pause
