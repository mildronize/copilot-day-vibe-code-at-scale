# Milestone 1 TODO

- [ ] task-1: Create Terraform baseline in `terraform/` for Resource Group, Container Apps Environment, Container App, PostgreSQL Flexible Server, and app database in `southeastasia`.
- [ ] task-2: Implement locals-based naming convention across Terraform resources using Azure-safe names with `copilot-vibe` suffix (no naming input variables).
- [ ] task-3: Add Terraform secret variable definitions for external secrets only (sensitive), wire them into DB/server/app configuration, and keep non-secret values in locals/constants.
- [ ] task-4: Create GitHub Actions workflow for push to `main` that builds/pushes GHCR image, runs migrations with `DATABASE_URL`, and deploys image to Azure Container App using `AZURE_CREDENTIALS`.
- [ ] task-5: Write deployment documentation covering prerequisites, required secrets/vars, manual terraform apply steps, workflow behavior, and rollback/troubleshooting basics.
