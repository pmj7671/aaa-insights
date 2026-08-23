<# check-code.ps1 -- READ ONLY. Greps ONLY Oliver's own scripts, excluding
   .venv / site-packages / node_modules, to see if the pipeline itself uses Google auth. #>
$ErrorActionPreference = "Continue"
Start-Transcript -Path (Join-Path $PSScriptRoot "code-check.txt") -Force | Out-Null
Write-Host "Audit run at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

$oliver = "C:\Users\PaulJamieson\OneDrive - fisiteadvisors.com\Active AI\Oliver RVs\ZOHO Connection"

Write-Host "`n=== Oliver's OWN .py files (venv/site-packages excluded) ==="
$files = Get-ChildItem $oliver -Recurse -Include *.py,*.ipynb -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch '\\(\.venv|venv|site-packages|node_modules|\.git)\\' }
Write-Host ("  {0} own script file(s) found" -f $files.Count)

$hits = $files | Select-String -Pattern 'google\.cloud|google\.auth|bigquery|aiplatform|default_credentials|GOOGLE_APPLICATION' -ErrorAction SilentlyContinue
if ($hits) {
  Write-Host ("`n  GOOGLE AUTH REFERENCES: {0}" -f $hits.Count)
  $hits | ForEach-Object { Write-Host ("   {0}:{1}  {2}" -f $_.Filename, $_.LineNumber, $_.Line.Trim()) }
} else {
  Write-Host "`n  NONE. Oliver's own code makes no Google-auth calls."
}

Write-Host "`n=== top-level scripts (for context) ==="
$files | Where-Object { $_.DirectoryName -eq $oliver } | Select-Object Name, LastWriteTime |
  Sort-Object Name | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "Done. Nothing modified."
Stop-Transcript | Out-Null
