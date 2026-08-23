@echo off
cd /d "%~dp0"
echo ================================================
echo  STEP 1: fix the aaa configuration
echo ================================================
call gcloud config configurations activate aaa
call gcloud config set account paul@activeaiadvisors.com
call gcloud config set project aaa-insights --quiet
echo.
echo ================================================
echo  STEP 2: restore the default configuration for Oliver
echo ================================================
call gcloud config configurations activate default
call gcloud config set account oliver-pipeline@oliver-cdp.iam.gserviceaccount.com
call gcloud config set project oliver-cdp --quiet
echo.
echo ================================================
echo  STEP 3: show both configurations
echo ================================================
call gcloud config configurations list
echo.
echo ================================================
echo  STEP 4: read-only Oliver audit
echo ================================================
call gcloud config configurations activate aaa
powershell -ExecutionPolicy Bypass -File "%~dp0check-oliver.ps1"
echo.
echo ---- finished ----
pause
