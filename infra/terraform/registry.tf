# Artifact Registry — a Docker repository to hold the API container image. The real
# image is built and pushed in a later step; this just creates the shelf it sits on.

resource "google_artifact_registry_repository" "app" {
  project       = var.project_id
  location      = var.region
  repository_id = "aaa-insights"
  format        = "DOCKER"
  description   = "AAA Insights API container images"

  depends_on = [google_project_service.apis]
}
