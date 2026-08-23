<#
  discover-claude-quotas.ps1  --  READ ONLY. Requests nothing, changes nothing.

  Finds the real quota IDs and base_model dimension labels for the Claude
  token-per-minute quotas on this project, so we don't have to hunt through
  the 185-row Dimensions filter in the console.

  Writes everything it finds to:
      infra\quota\discovery-output.txt   (readable log)
      infra\quota\raw-quota-list.json    (raw API response)

  Usage:
      powershell -ExecutionPolicy Bypass -File infra\quota\discover-claude-quotas.ps1
#>

$ErrorActionPreference = "Stop"
Start-Transcript -Path (Join-Path $PSScriptRoot "discovery-output.txt") -Force | Out-Null

$Project = "aaa-insights"
$Service = "aiplatform.googleapis.com"   # Vertex AI, now surfaced as "Agent Platform API"

Write-Host "Project: $Project   Service: $Service"
Write-Host "Listing quota infos (this can take ~30s)..."

$rawList = gcloud alpha quotas info list --service=$Service --project=$Project --format=json | Out-String
$rawList | Out-File -Encoding utf8 (Join-Path $PSScriptRoot "raw-quota-list.json")
$infos = $rawList | ConvertFrom-Json

Write-Host ("Got {0} quota definitions." -f $infos.Count)

$tokenQuotas = $infos | Where-Object { $_.metric -match "token" }

if (-not $tokenQuotas) {
  Write-Host "No token quotas matched. Dumping every quotaId so we can eyeball them:"
  $infos | ForEach-Object { Write-Host ("  {0}  [{1}]" -f $_.quotaId, $_.metric) }
  Stop-Transcript | Out-Null
  exit 0
}

Write-Host ""
Write-Host "--- token quotas on this service ---"

foreach ($q in $tokenQuotas) {
  Write-Host ""
  Write-Host ("=== quotaId: {0}" -f $q.quotaId)
  Write-Host ("    metric : {0}" -f $q.metric)

  try {
    $rawDetail = gcloud alpha quotas info describe $q.quotaId --service=$Service --project=$Project --format=json | Out-String
    $detail = $rawDetail | ConvertFrom-Json
  } catch {
    Write-Host ("    (describe failed: {0})" -f $_.Exception.Message)
    continue
  }

  $rows = @()
  foreach ($d in $detail.dimensionsInfos) {
    $dimStr = ($d.dimensions.PSObject.Properties | ForEach-Object { "$($_.Name)=$($_.Value)" }) -join ","
    $rows += [pscustomobject]@{ Dimensions = $dimStr; CurrentValue = $d.details.value }
  }

  if (-not $rows) {
    Write-Host "    (no dimension combinations returned)"
    continue
  }

  $sonnet = $rows | Where-Object { $_.Dimensions -match "sonnet" }
  if ($sonnet) {
    Write-Host "    SONNET ROWS:"
    $sonnet | Format-Table -AutoSize | Out-String | Write-Host
  } else {
    Write-Host ("    (no sonnet row among {0} combos; showing first 15)" -f $rows.Count)
    $rows | Select-Object -First 15 | Format-Table -AutoSize | Out-String | Write-Host
  }
}

Write-Host ""
Write-Host "Done. Results saved to infra\quota\discovery-output.txt"
Stop-Transcript | Out-Null
