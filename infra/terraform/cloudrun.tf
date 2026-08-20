# Cloud Run service. For this first pass it runs Google's public "hello" placeholder
# image — enough to prove the service, the service account, and public access all stand
# up. A later step builds the real API image, pushes it to Artifact Registry, and swaps
# it in here along with the Cloud SQL volume and the DATABASE_URL secret env.

resource "google_cloud_run_v2_service" "api" {
  name     = "aaa-insights-api"
  project  = var.project_id
  location = var.region

  deletion_protection = false

  template {
    service_account = google_service_account.run_sa.email

    scaling {
      # Scale to zero between requests (cost) and cap the ceiling for a dev service.
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = var.api_image

      ports {
        container_port = 8080
      }

      # DATABASE_URL comes from Secret Manager, never plaintext config (R-43/DPS-11).
      env {
        name = "AAA_DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      # LLM configuration (non-secret). llm_provider=vertex turns on Claude via Vertex.
      env {
        name  = "AAA_LLM_PROVIDER"
        value = var.llm_provider
      }
      env {
        name  = "AAA_VERTEX_PROJECT"
        value = var.project_id
      }
      env {
        name  = "AAA_VERTEX_REGION"
        value = var.region
      }
      env {
        name  = "AAA_VERTEX_MODEL"
        value = var.vertex_model
      }

      # The Cloud SQL connector socket is mounted here; the DATABASE_URL points at it.
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # Startup probe on '/' (liveness — deliberately NOT the DB-checking /readyz, so a
      # database blip never causes Cloud Run to kill healthy instances). Our server
      # binds even if the DB is briefly unreachable, so '/' answers quickly.
      startup_probe {
        http_get {
          path = "/"
        }
        initial_delay_seconds = 0
        timeout_seconds       = 3
        period_seconds        = 10
        failure_threshold     = 6
      }
    }

    # Attach the Cloud SQL instance via the managed connector (no VPC needed).
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.pg.connection_name]
      }
    }
  }

  depends_on = [
    google_project_service.apis,
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_iam_member.database_url_reader,
  ]
}

# NOTE: public (allUsers) invocation is blocked by the organization's Domain Restricted
# Sharing policy (iam.allowedPolicyMemberDomains) — a deliberate security guardrail on
# activeaiadvisors.com. We honor it: the service is private, verified with an
# authenticated request (`curl -H "Authorization: Bearer $(gcloud auth print-identity-token)"`).
# The real API carries its own auth (R-42); if public respondent endpoints are ever
# needed (INV-5), we'll expose those deliberately (e.g. via a fronting load balancer or
# a scoped org-policy exception) rather than opening the whole service to allUsers.
#
# resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
#   project  = var.project_id
#   location = google_cloud_run_v2_service.api.location
#   name     = google_cloud_run_v2_service.api.name
#   role     = "roles/run.invoker"
#   member   = "allUsers"
# }
