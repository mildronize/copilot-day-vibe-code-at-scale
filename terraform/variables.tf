variable "db_admin_password" {
  description = "PostgreSQL administrator password."
  type        = string
  sensitive   = true
}

variable "better_auth_secret" {
  description = "Secret key for Better Auth."
  type        = string
  sensitive   = true
}

variable "better_auth_url" {
  description = "Public URL for the application (used by Better Auth)."
  type        = string
}
