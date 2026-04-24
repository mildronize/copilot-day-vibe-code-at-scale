# Deployment Guide (Milestone 1)

## Prerequisites

- Bun 1.3+
- Docker (for local image sanity checks if needed)
- Terraform 1.6+
- Azure CLI (`az`) and an Azure subscription
- GitHub repository with Actions enabled and permission to push packages to GHCR

## Required GitHub Secrets

Configure these repository secrets before using CI deployment.

For details on setting secrets, see [GitHub docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

### AZURE_CREDENTIALS

Azure service principal credentials JSON used by `azure/login@v2`.

**To create:**
1. Install or ensure Azure CLI is available:
   ```bash
   az --version
   ```
2. Create a service principal with RBAC assignment to your resource group:
   ```bash
   az ad sp create-for-rbac --name "github-actions-sp" \
     --role Contributor \
     --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/rg-copilot-vibe
   ```
3. Copy the output JSON (contains `clientId`, `clientSecret`, `subscriptionId`, `tenantId`).
4. Store in GitHub repository secrets as `AZURE_CREDENTIALS`:
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste the JSON output from step 2

### DATABASE_URL

PostgreSQL connection string used by Prisma migration step.

**Format:**
```
postgresql://<db_admin>:<db_admin_password>@<server-host>:5432/<database_name>?schema=public
```

**To obtain after Terraform apply:**
1. Run `terraform output` in the `terraform/` directory to see PostgreSQL host and database name.
2. Use the `db_admin` username and `db_admin_password` you provided to `terraform apply`.
3. Compose the connection string:
   ```
   postgresql://postgres:mypassword@copilot-vibe-db.postgres.database.azure.com:5432/copilot_vibe_db?schema=public
   ```
4. Store in GitHub repository secrets as `DATABASE_URL`:
   - Go to repository **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `DATABASE_URL`
   - Value: Paste your PostgreSQL connection string

> Do not commit secret values in repository files.

## Manual Terraform Apply (outside CI)

Terraform is intentionally manual in milestone 1.

1. Initialize:
   - `cd terraform`
   - `terraform init`
2. Review plan:
   - `terraform plan -var="db_admin_password=<your-password>"`
3. Apply:
   - `terraform apply -var="db_admin_password=<your-password>"`
4. Confirm created resources (resource group, container apps environment, container app, PostgreSQL flexible server, database).

## GitHub Actions Workflow Behavior

Workflow file: `.github/workflows/deploy.yml`  
Trigger: push to `main`

Strict stage order:

1. **Build and push image**
   - Builds Docker image from repo root.
   - Pushes image to `ghcr.io/<owner>/<repo>:<commit-sha>`.
2. **Run database migration**
   - Uses `DATABASE_URL` secret.
   - Runs `bunx prisma migrate deploy`.
3. **Deploy to Azure Container App**
   - Logs in using `azure/login@v2` and `AZURE_CREDENTIALS`.
   - Updates Container App image (`aca-copilot-vibe` in `rg-copilot-vibe`).

`terraform apply` is **not** executed by CI.

## Rollback

If a deployment fails or a release must be reverted:

1. Find the previous known-good image in GHCR.
2. Update Container App image manually:
   - `az containerapp update --name aca-copilot-vibe --resource-group rg-copilot-vibe --image ghcr.io/<owner>/<repo>:<previous-sha>`
3. If migration introduced issues, restore database from backup or apply a forward fix migration.

## Troubleshooting

- **Migration step fails**: verify `DATABASE_URL` secret format, host reachability, credentials, and database permissions.
- **Azure login fails**: verify `AZURE_CREDENTIALS` JSON is valid and service principal has required RBAC on resource group.
- **Deploy step fails**: verify Container App/resource group names (`aca-copilot-vibe`, `rg-copilot-vibe`) match your Terraform-provisioned resources.
- **Image pull issues**: verify image exists in GHCR and authentication/permissions are correct for Azure to pull the image.

## Verification Checklist

After completing all setup steps, use this checklist to validate your deployment is ready:

- [ ] **Prerequisites installed**: Bun, Docker, Terraform, Azure CLI are available in your PATH
- [ ] **Azure subscription & permissions**: You have owner/contributor role on your Azure subscription
- [ ] **GitHub repo access**: You have admin or write access to push to `main` branch
- [ ] **AZURE_CREDENTIALS secret set**: In repository **Settings** → **Secrets and variables** → **Actions**
- [ ] **DATABASE_URL secret set**: In repository **Settings** → **Secrets and variables** → **Actions**
- [ ] **Terraform initialized**: Ran `terraform init` in `terraform/` directory
- [ ] **Terraform plan reviewed**: Ran `terraform plan` and verified resource names and configuration
- [ ] **Terraform apply completed**: Ran `terraform apply` successfully; resources exist in Azure portal
- [ ] **PostgreSQL server running**: Verified in Azure portal that PostgreSQL Flexible Server is running
- [ ] **Container App created**: Verified in Azure portal that Container App `aca-copilot-vibe` exists in resource group `rg-copilot-vibe`
- [ ] **GHCR access verified**: Ensured service principal has push permissions to GHCR
- [ ] **Test deployment triggered**: Pushed a test commit to `main` branch
- [ ] **GitHub Actions triggered**: Workflow ran successfully in **Actions** tab
- [ ] **Docker image pushed**: New image visible in GHCR packages
- [ ] **Container app updated**: New image deployed to Container App (verify in Azure portal or CLI)

If all items are checked, your deployment pipeline is operational.
