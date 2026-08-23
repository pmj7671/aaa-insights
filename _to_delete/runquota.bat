@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0infra\quota\discover-claude-quotas.ps1"
echo.
echo ---- finished ----
pause
