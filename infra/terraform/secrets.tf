# Secret Manager — the vault (R-43 / DPS-11). The DB password and a ready-to-use
# DATABASE_URL live here; nothing sensitive is written to the Cloud Run config in
# plaintext. The Cloud Run service account is granted read access per-secret (least
# privilege) rather than at the project level.

# Raw password.
resource "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "aaa-db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db.result
}

# Full connection string the app reads (Postgres over the Cloud SQL unix socket).
resource "google_secret_manager_secret" "database_url" {
  project   = var.project_id
  secret_id = "aaa-database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret = google_secret_manager_secret.database_url.id
  secret_data = format(
    "postgresql://%s:%s@/%s?host=/cloudsql/%s",
    var.db_user,
    random_password.db.result,
    var.db_name,
    google_sql_database_instance.pg.connection_name,
  )
}

# Least-privilege read for the app's service account.
resource "google_secret_manager_secret_iam_member" "db_password_reader" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "database_url_reader" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run_sa.email}"
}
