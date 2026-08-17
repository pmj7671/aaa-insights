# Cloud SQL for PostgreSQL 16 (+ pgvector) — the managed home for the repositories.
#
# Dev-sized and cheap: shared-core tier, zonal (no HA replica), 10 GB SSD, one daily
# backup, no point-in-time recovery. deletion_protection is OFF so this throwaway
# skeleton can be torn down cleanly; a production instance would flip both to true.
#
# pgvector: the `vector` extension is enabled by the application at first run
# (schema.sql: CREATE EXTENSION IF NOT EXISTS vector), which Cloud SQL for Postgres
# allowlists — nothing to configure here.

resource "google_sql_database_instance" "pg" {
  name             = "aaa-insights-pg"
  project          = var.project_id
  region           = var.region
  database_version = "POSTGRES_16"

  # Dev convenience: allow `terraform destroy` to remove the instance.
  deletion_protection = false

  settings {
    tier              = var.db_tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = false
    }

    ip_configuration {
      # Public IP; Cloud Run connects through the managed Cloud SQL connector
      # (IAM-authenticated), so no authorized networks are opened.
      ipv4_enabled = true
    }

    # Mirror of the resource-level flag; both must be false to allow teardown.
    deletion_protection_enabled = false
  }

  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "app" {
  name     = var.db_name
  project  = var.project_id
  instance = google_sql_database_instance.pg.name
}

# A generated password — never hardcoded; stored only in Secret Manager (see secrets.tf).
resource "random_password" "db" {
  length  = 32
  special = false # avoid characters that complicate connection strings
}

resource "google_sql_user" "app" {
  name     = var.db_user
  project  = var.project_id
  instance = google_sql_database_instance.pg.name
  password = random_password.db.result
}
