# The service account the API runs as. Least privilege: it can connect to Cloud SQL
# and read its two secrets (granted per-secret in secrets.tf) — nothing more.

resource "google_service_account" "run_sa" {
  project      = var.project_id
  account_id   = "aaa-insights-run"
  display_name = "AAA Insights Cloud Run service account"
}

# Allow the service account to open Cloud SQL connections through the connector.
resource "google_project_iam_member" "run_sa_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.run_sa.email}"
}

# Allow the API to call Claude on Vertex AI (used when llm_provider = "vertex").
resource "google_project_iam_member" "run_sa_vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.run_sa.email}"
}
