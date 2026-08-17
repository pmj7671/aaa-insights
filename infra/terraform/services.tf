# Bring the required APIs under Terraform management. These were enabled by hand
# during bootstrap; declaring them here is idempotent and documents the dependency.
# disable_on_destroy = false so `terraform destroy` never tears an API out from under
# other projects or leaves the project half-disabled.

locals {
  required_apis = [
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each                   = toset(local.required_apis)
  project                    = var.project_id
  service                    = each.value
  disable_on_destroy         = false
  disable_dependent_services = false
}
