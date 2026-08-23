@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0check-code.ps1"
echo.
echo ---- finished ----
pause
