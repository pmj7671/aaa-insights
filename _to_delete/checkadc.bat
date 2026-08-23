@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0check-adc.ps1"
echo.
echo ---- finished ----
pause
