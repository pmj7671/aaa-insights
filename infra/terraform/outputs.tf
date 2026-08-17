# Handy values printed after `apply` — used in later steps and for verification.

output "cloud_run_url" {
  description = "Public URL of the Cloud Run service (the placeholder for now)."
  value       = google_cloud_run_v2_service.api.uri
}

output "sql_instance_connection_name" {
  description = "Cloud SQL connection name (project:region:instance) for the connector."
  value       = google_sql_database_instance.pg.connection_name
}

output "sql_database" {
  description = "Application database name."
  value       = google_sql_database.app.name
}

output "run_service_account" {
  description = "Email of the service account the API runs as."
  value       = google_service_account.run_sa.email
}

output "artifact_registry_repo" {
  description = "Artifact Registry repository path for the API image."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

output "db_password_secret" {
  description = "Secret Manager id holding the DB password."
  value       = google_secret_manager_secret.db_password.secret_id
}

output "database_url_secret" {
  description = "Secret Manager id holding the full DATABASE_URL."
  value       = google_secret_manager_secret.database_url.secret_id
}
