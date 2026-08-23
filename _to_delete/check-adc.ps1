<#
  check-adc.ps1 -- READ ONLY. Prints no secret values.
  Determines (a) the real gcloud config state, (b) whether the ADC file is
  intact and working, (c) whether Oliver's code uses Google auth at all.
#>
$ErrorActionPreference = "Continue"
Start-Transcript -Path (Join-Path $PSScriptRoot "adc-check.txt") -Force | Out-Null
Write-Host "Audit run at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "`n=== 1. configurations ==="
(gcloud config configurations list 2>&1 | Out-String) | Write-Host

Write-Host "=== 2. aaa config ==="
(gcloud config list --all --configuration=aaa 2>&1 | Out-String) | Write-Host

Write-Host "=== 3. default config (Oliver) ==="
(gcloud config list --all --configuration=default 2>&1 | Out-String) | Write-Host

Write-Host "=== 4. credentialed accounts ==="
(gcloud auth list 2>&1 | Out-String) | Write-Host

Write-Host "=== 5. ADC file structure (names only, no values) ==="
$adc = Join-Path $env:APPDATA "gcloud\application_default_credentials.json"
if (Test-Path $adc) {
  $j = Get-Content $adc -Raw | ConvertFrom-Json
  Write-Host "keys present:"
  $j.PSObject.Properties | ForEach-Object { Write-Host ("   {0}" -f $_.Name) }
  Write-Host ("type              : {0}" -f $j.type)
  Write-Host ("quota_project_id  : '{0}'" -f $j.quota_project_id)
  Write-Host ("has client_id     : {0}" -f [bool]$j.client_id)
  Write-Host ("has refresh_token : {0}" -f [bool]$j.refresh_token)
} else { Write-Host "ADC file missing." }

Write-Host "`n=== 6. gcloud credential dir (recent writes) ==="
Get-ChildItem (Join-Path $env:APPDATA "gcloud") -File -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 10 Name, LastWriteTime, Length |
  Format-Table -AutoSize | Out-String | Write-Host

Write-Host "=== 7. DOES ADC STILL WORK? (token discarded, not printed) ==="
$null = gcloud auth application-default print-access-token 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "  RESULT: ADC WORKS" } else { Write-Host "  RESULT: ADC BROKEN OR NEEDS REAUTH (exit $LASTEXITCODE)" }

Write-Host "`n=== 8. does Oliver code use Google auth at all? ==="
$oliver = "C:\Users\PaulJamieson\OneDrive - fisiteadvisors.com\Active AI\Oliver RVs\ZOHO Connection"
if (Test-Path $oliver) {
  $hits = Get-ChildItem $oliver -Recurse -Include *.py,*.ipynb -ErrorAction SilentlyContinue |
    Select-String -Pattern 'google\.cloud|google\.auth|bigquery|aiplatform|default_credentials|GOOGLE_APPLICATION' -ErrorAction SilentlyContinue
  if ($hits) {
    Write-Host ("  {0} reference(s) found:" -f $hits.Count)
    $hits | Select-Object -First 20 | ForEach-Object { Write-Host ("   {0}:{1}" -f $_.Filename, $_.LineNumber) }
  } else {
    Write-Host "  NONE. Oliver code makes no Google-auth calls -> ADC is irrelevant to it."
  }
} else { Write-Host "  Oliver folder not found." }

Write-Host "`nDone. Nothing modified."
Stop-Transcript | Out-Null
