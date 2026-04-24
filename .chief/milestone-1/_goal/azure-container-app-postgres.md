# Milestone 1 Goal — Azure Deployment Baseline (copilot-vibe)

## Outcome

Deploy this project automatically on push to `main` using:

- Azure Container Apps (Consumption plan)
- Azure Database for PostgreSQL Flexible Server (cost-minimized, B1ms)
- GitHub Container Registry (GHCR) image publishing

## Scope

1. Add Terraform under `terraform/` to provision Azure resources for app hosting and database.
2. Use `locals` for all naming; follow Azure naming conventions and include `copilot-vibe` suffix on each resource.
3. Avoid Terraform variables for normal configuration; use variables only for external secrets and mark them sensitive.
4. Add GitHub Actions workflow that:
   - runs on push to `main`
   - builds and pushes Docker image to GHCR
   - runs database migration
   - deploys new image to Azure Container App
5. Use `AZURE_CREDENTIALS` GitHub secret for Azure login.
6. Keep Terraform execution manual by user (`terraform plan/apply` is not run by GitHub Actions in this milestone).
7. Add deployment documentation that explains prerequisites, secret setup, Terraform apply flow, and deployment workflow usage.

## Non-Goals

1. Multi-environment promotion flows (dev/stage/prod) in this milestone.
2. Private VNet-only database/networking hardening in this milestone.
3. OIDC federation auth setup in this milestone.

## Success Criteria

1. Terraform plan includes all required Azure resources in `southeastasia`.
2. PostgreSQL Flexible Server is configured for low-cost baseline with SKU `B_Standard_B1ms`.
3. Workflow on push to `main` completes build → migrate → deploy sequence.
4. Container App runs the latest GHCR image after deployment.
