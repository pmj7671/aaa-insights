<#
  request-sonnet-quota.ps1  —  files a quota-increase request. WRITES.

  Run discover-claude-quotas.ps1 first and pass the real values in.

  Example:
    pwsh -File infra\quota\request-sonnet-quota.ps1 `
      -QuotaId  "<quotaId from discovery>" `
      -BaseModel "<base_model=... value from discovery>" `
      -PreferredValue 50000
#>

param(
  [Parameter(Mandatory=$true)][string]$QuotaId,
  [Parameter(Mandatory=$true)][string]$BaseModel,
  [int]$PreferredValue = 50000,
  [string]$Region      = "us-central1",
  [string]$Project     = "aaa-insights",
  [string]$Service     = "aiplatform.googleapis.com",
  [string]$Email       = "paul@activeaiadvisors.com"
)

$ErrorActionPreference = "Stop"

$justification = "Production workload for AAA Insights, a customer-feedback analysis service " +
  "running on Cloud Run in this project. The service calls Claude Sonnet on Vertex to compose " +
  "grounded, evidence-cited answers over first-party survey responses. Default limit is 0, so " +
  "every call returns 429 and falls back to a non-AI baseline. Requesting $PreferredValue " +
  "tokens/minute to support development plus a small pilot customer set."

$prefId = ("aaa-insights-{0}-{1}" -f $QuotaId, $Region).ToLower() -replace '[^a-z0-9-]','-'

Write-Host "About to request:" -ForegroundColor Cyan
Write-Host "  quota-id       : $QuotaId"
Write-Host "  dimensions     : region=$Region,base_model=$BaseModel"
Write-Host "  preferred-value: $PreferredValue"
Write-Host "  preference-id  : $prefId"
$ok = Read-Host "Proceed? (y/n)"
if ($ok -ne "y") { Write-Host "Aborted."; exit 0 }

gcloud alpha quotas preferences create `
  --service=$Service `
  --project=$Project `
  --quota-id=$QuotaId `
  --preferred-value=$PreferredValue `
  --dimensions="region=$Region,base_model=$BaseModel" `
  --preference-id=$prefId `
  --email=$Email `
  --justification=$justification

Write-Host "`nFiled. Check status with:" -ForegroundColor Green
Write-Host "  gcloud alpha quotas preferences list --project=$Project --service=$Service"
