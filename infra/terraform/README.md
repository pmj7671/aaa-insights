# AAA Insights — Infrastructure (walking skeleton)

Terraform (IaC) for the first GCP footprint: **Cloud SQL (Postgres 16 + pgvector),
Secret Manager, a least-privilege service account, Artifact Registry, and a Cloud Run
service** (running a placeholder image until the real API container is built).

Region: `us-central1` (US residency, DPS-9). State: local for now (migrate to a GCS
backend once proven — see `versions.tf`).

## Prerequisites (already done during bootstrap)
- Project `aaa-insights` created and linked to billing.
- Required APIs enabled (`gcloud services enable ...`).
- Run everything below in **Cloud Shell**, which has `gcloud` and `terraform` preinstalled.

## Run it
```bash
cd ~/aaa-insights/infra/terraform      # after cloning the repo in Cloud Shell
terraform init                          # downloads providers, sets up state
terraform plan                          # DRY RUN — shows what will be created; creates nothing
# review the plan together, then:
terraform apply                         # type "yes" to create the resources
```

`terraform apply` prints outputs (Cloud Run URL, Cloud SQL connection name, secret ids,
service-account email). If the google provider reports a credentials error, run
`gcloud auth application-default login` once and retry.

## What this does NOT do yet
- Build/push the real API image (needs the HTTP server entrypoint + Dockerfile — next step).
- Connect Cloud Run to Cloud SQL / inject the DATABASE_URL secret (added when the real
  image deploys).
- Vertex AI (Claude), Identity Platform (real SSO/MFA), Cloud DLP, Cloud Armor — later phases.

## Tear down (to stop all spend)
```bash
terraform destroy      # removes every resource above; deletion_protection is off for dev
```
Or, to just pause cost between work sessions, stop the SQL instance:
`gcloud sql instances patch aaa-insights-pg --activation-policy=NEVER` (and `ALWAYS` to resume).
