# Terraform + provider versions for the AAA Insights walking-skeleton infrastructure.
#
# State: local for this first pass (Cloud Shell's home directory persists across
# sessions). Once the skeleton is proven, migrate to a GCS backend for durability —
# the block below is ready; create the bucket, uncomment, and `terraform init -migrate-state`.
#
# terraform {
#   backend "gcs" {
#     bucket = "aaa-insights-tfstate"
#     prefix = "walking-skeleton"
#   }
# }

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
