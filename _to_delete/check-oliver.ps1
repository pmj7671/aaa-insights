<#
  check-oliver.ps1  --  READ ONLY AUDIT. Changes nothing, writes nothing except
  its own log at oliver-check.txt. No secret values are printed.

  Verifies whether this session's gcloud work disturbed the Oliver setup.
#>

$ErrorActionPreference = "Continue"
Start-Transcript -Path (Join-Path $PSScriptRoot "oliver-check.txt") -Force | Out-Null

Write-Host "Audit run at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Write-Host "`n=== 1. gcloud configurations ==="
gcloud config configurations list

Write-Host "`n=== 2. active gcloud config (all properties) ==="
gcloud config list --all

Write-Host "`n=== 3. credentialed accounts on this machine ==="
gcloud auth list

Write-Host "`n=== 4. Application Default Credentials file ==="
$adc = Join-Path $env:APPDATA "gcloud\application_default_credentials.json"
if (Test-Path $adc) {
  $f = Get-Item $adc
  Write-Host ("path          : {0}" -f $f.FullName)
  Write-Host ("LAST WRITTEN  : {0}   <-- if this predates today, ADC was untouched" -f $f.LastWriteTime)
  Write-Host ("size (bytes)  : {0}" -f $f.Length)
  try {
    $j = Get-Content $adc -Raw | ConvertFrom-Json
    Write-Host ("quota_project_id : {0}" -f $j.quota_project_id)
  } catch { Write-Host "(could not parse; contents deliberately not printed)" }
} else {
  Write-Host "No ADC file found at the default path."
}

Write-Host "`n=== 5. Oliver project folder ==="
$oliver = "C:\Users\PaulJamieson\OneDrive - fisiteadvisors.com\Active AI\Oliver RVs\ZOHO Connection"
if (Test-Path $oliver) {
  Write-Host ("path: {0}" -f $oliver)
  Write-Host "`n--- 15 most recently modified files ---"
  Get-ChildItem $oliver -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 15 Name, LastWriteTime, Length |
    Format-Table -AutoSize | Out-String | Write-Host

  if (Test-Path (Join-Path $oliver ".git")) {
    Write-Host "--- git status (uncommitted changes) ---"
    Push-Location $oliver
    git status --short
    Write-Host "--- last 3 commits ---"
    git log --oneline -3
    Pop-Location
  } else {
    Write-Host "(not a git repo)"
  }

  $envf = Join-Path $oliver ".env"
  if (Test-Path $envf) {
    $ef = Get-Item $envf
    Write-Host ("`n--- .env last written: {0} ---" -f $ef.LastWriteTime)
    Write-Host "--- variable NAMES only, no values ---"
    Get-Content $envf | ForEach-Object {
      if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') { Write-Host ("  {0}" -f $Matches[1]) }
    }
  } else {
    Write-Host "`n(no .env at that path)"
  }
} else {
  Write-Host "Oliver folder not found at the expected path - skipping."
}

Write-Host "`n=== 6. does oliver-cdp still look normal? ==="
Write-Host "--- enabled services ---"
gcloud services list --enabled --project=oliver-cdp --format="value(config.name)" 2>&1 | Sort-Object

Write-Host "`nDone. Nothing was modified by this audit."
Stop-Transcript | Out-Null
