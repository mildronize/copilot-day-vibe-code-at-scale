# Deployment Guide (Milestone 1)

## Prerequisites

- Bun 1.3+
- Docker
- Terraform 1.6+
- Azure CLI (`az`)
- Azure subscription permissions to create resources and RBAC assignments
- GitHub repository with Actions enabled
- GHCR image must be pullable by Azure Container Apps (public package or configured registry auth)

## Correct Setup Order (Important)

For this repository, use this order:

1. Run Terraform manually first (creates `rg-copilot-vibe`, `aca-copilot-vibe`, PostgreSQL server/database).
2. Create service principal scoped to the created resource group.
3. Create GitHub secrets (`AZURE_CREDENTIALS`, `DATABASE_URL`).
4. Ensure Azure Container App can pull the GHCR image.
5. Push to `main` to trigger deployment workflow.

This ordering avoids RBAC scope errors when creating a service principal scoped to `rg-copilot-vibe`.

## Manual Terraform Apply (outside CI)

Terraform is intentionally manual in milestone 1.

1. Initialize:
   ```bash
   cd terraform
   terraform init
   ```
2. Create variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
   Set a strong password in `terraform.tfvars`:
   ```hcl
   db_admin_password = "<strong-password>"
   ```
3. Review plan:
   ```bash
   terraform plan
   ```
4. Apply:
   ```bash
   terraform apply
   ```
5. Confirm resources exist in Azure:
   - Resource group: `rg-copilot-vibe`
   - Container App: `aca-copilot-vibe`
   - PostgreSQL Flexible Server: `psqlflex-copilot-vibe`
   - PostgreSQL database: `app-copilot-vibe`

## Required GitHub Secrets

After Terraform apply, configure these secrets in repository **Settings** → **Secrets and variables** → **Actions**.

### AZURE_CREDENTIALS

Used by `azure/login@v2` in `.github/workflows/deploy.yml`.

Create service principal scoped to the resource group created by Terraform:

```bash
az ad sp create-for-rbac --name "github-actions-sp-copilot-vibe" \
  --role Contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-copilot-vibe
```

Save the returned JSON as secret `AZURE_CREDENTIALS`.

### DATABASE_URL

Used by migration stage (`bunx prisma migrate deploy`).

Format:

```text
postgresql://copilotadmin:<db_admin_password>@psqlflex-copilot-vibe.postgres.database.azure.com:5432/app-copilot-vibe?schema=public&sslmode=require
```

Save this as secret `DATABASE_URL`.

> Do not commit secret values or real credentials to the repository.
>
> Terraform also injects the same `DATABASE_URL` into the Azure Container App as a runtime secret-backed environment variable. For this project, `BETTER_AUTH_*` is intentionally not part of the Azure runtime env setup.

## GHCR Pull Access for Azure Container Apps

`az containerapp update --image ghcr.io/...` only updates image reference. The app still needs pull access.

Choose one:

1. Make the GHCR package public (simplest for milestone 1), or
2. Configure registry credentials on the Container App before first deploy.

## GitHub Actions Workflow Behavior

Workflow: `.github/workflows/deploy.yml`  
Trigger: push to `main`

Stage order:

1. Build and push image to GHCR (`ghcr.io/<owner>/<repo>:<sha>`)
2. Run database migrations with `DATABASE_URL`
3. Deploy new image to Container App using `AZURE_CREDENTIALS`

`terraform apply` is **not** executed by CI.

## Rollback

1. Find previous working image tag in GHCR.
2. Update Container App:
   ```bash
   az containerapp update \
     --name aca-copilot-vibe \
     --resource-group rg-copilot-vibe \
     --image ghcr.io/<owner>/<repo>:<previous-sha>
   ```
3. If migration caused issues, restore from backup or apply a forward-fix migration.

## Troubleshooting

- **RBAC/service principal creation fails**: run Terraform apply first so `rg-copilot-vibe` exists.
- **Migration fails**: recheck `DATABASE_URL` format, password, host, db name, and connectivity.
- **Azure login fails**: verify `AZURE_CREDENTIALS` JSON and RBAC scope.
- **Deploy step fails**: verify app/resource group names match Terraform resources.
- **Container app cannot pull image**: verify GHCR visibility/permissions for the deployed image.

## Verification Checklist

- [ ] Terraform apply completed successfully
- [ ] `rg-copilot-vibe`, `aca-copilot-vibe`, `psqlflex-copilot-vibe`, and `app-copilot-vibe` exist
- [ ] `AZURE_CREDENTIALS` secret configured
- [ ] `DATABASE_URL` secret configured
- [ ] Push to `main` triggers workflow
- [ ] Workflow succeeds in build → migrate → deploy order
- [ ] Container App revision uses latest GHCR image
