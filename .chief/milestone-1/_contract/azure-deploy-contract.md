# Milestone 1 Contract — Azure Container Apps + PostgreSQL (copilot-vibe)

## 1. Terraform Structure Contract

1. Terraform files live under `terraform/` at project root.
2. Terraform configuration for this milestone provisions:
   - Resource Group
   - Azure Container Apps Environment
   - Azure Container App
   - Azure Database for PostgreSQL Flexible Server
   - One application database on that server
3. Terraform execution is manual by user (`terraform init/plan/apply`), not executed by GitHub Actions.

## 2. Naming Contract

1. Resource names must be derived from `locals` only.
2. No Terraform input variables for naming.
3. Names follow Azure naming conventions and include `copilot-vibe` suffix.
4. Region constant is `southeastasia` for all regional resources in this milestone.

## 3. Pricing and Topology Contract

1. Azure Container Apps uses Consumption plan baseline.
2. PostgreSQL uses Flexible Server with low-cost baseline:
   - SKU: `B_Standard_B1ms`
   - HA disabled
   - Public access mode for milestone 1
3. Advanced hardening (private networking, HA, production-grade resiliency) is out of scope for this milestone.

## 4. Secrets and Variables Contract

1. External secrets use Terraform variables marked sensitive (for example DB admin password).
2. Non-secret configuration uses locals/constants.
3. GitHub Actions secret requirements:
   - `AZURE_CREDENTIALS`
   - `DATABASE_URL` (for migration step)
4. No secret values are committed to repository files.

## 5. CI/CD Workflow Contract

1. A GitHub Actions workflow is defined under `.github/workflows/`.
2. Trigger: push to `main`.
3. Required stages and order:
   1. Build Docker image and push to GHCR.
   2. Run database migrations using `DATABASE_URL`.
   3. Deploy updated image to Azure Container App.
4. Azure authentication uses `azure/login@v2` with `AZURE_CREDENTIALS`.

## 6. Documentation Contract

1. A deployment document is added (DEPLOY doc) and must include:
   - Required tools/prerequisites
   - Required GitHub secrets and variables
   - Manual Terraform apply steps
   - Workflow behavior on push to `main`
   - Rollback/basic troubleshooting guidance
