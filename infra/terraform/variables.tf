# Inputs for the walking skeleton. Defaults are chosen to be cheap and safe for a
# dev environment; override in terraform.tfvars if needed.

variable "project_id" {
  description = "The GCP project that holds AAA Insights."
  type        = string
  default     = "aaa-insights"
}

variable "region" {
  description = "Region for all regional resources (US residency, DPS-9)."
  type        = string
  default     = "us-central1"
}

variable "db_tier" {
  description = "Cloud SQL machine tier. db-f1-micro is the cheapest shared-core tier — fine for dev."
  type        = string
  default     = "db-f1-micro"
}

variable "db_name" {
  description = "The application database created inside the Cloud SQL instance."
  type        = string
  default     = "aaa_insights"
}

variable "db_user" {
  description = "The application database user."
  type        = string
  default     = "aaa_app"
}

variable "api_image" {
  description = "Container image for the Cloud Run API. Defaults to the placeholder; the deploy step passes the built image from Artifact Registry."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "llm_provider" {
  description = "Grounded-answer LLM: 'baseline' (deterministic) or 'vertex' (Claude via Vertex AI)."
  type        = string
  default     = "baseline"
}

variable "vertex_model" {
  description = "Vertex Model Garden model id for Claude (e.g. 'claude-sonnet-4@20250514'). Required when llm_provider = vertex."
  type        = string
  default     = ""
}

variable "vertex_region" {
  description = <<-EOT
    Region that SERVES the Claude model on Vertex — deliberately separate from var.region
    (Cloud Run + Cloud SQL). No Claude Sonnet is served in us-central1; Sonnet lives in
    us-east5 / europe-west1 / asia-southeast1. us-east5 is US soil so DPS-9 residency holds.
    Required when llm_provider = vertex; falls back to var.region when left blank.
  EOT
  type        = string
  default     = ""
}
