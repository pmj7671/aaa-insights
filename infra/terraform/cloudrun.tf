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
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }

  depends_on = [google_project_service.apis]
}

# Public access for the placeholder so the URL is reachable in a browser. When the
# real API deploys, tighten this (admin routes are already auth-guarded in-app, R-42).
resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
