# task-2 — Naming, Locals, and Secret Variable Rules

## Objective
Apply naming and configuration contracts in Terraform.

## Scope
- Included: locals-based naming, `copilot-vibe` suffix, Azure-safe names, non-secret constants in locals, sensitive variables only for external secrets.
- Excluded: introducing broad variable-driven configuration.

## Rules & Contracts to follow
- `AGENTS.md`
- `.chief/milestone-1/_goal/azure-container-app-postgres.md`
- `.chief/milestone-1/_contract/azure-deploy-contract.md`

## Steps
1. Add/adjust `locals` for all resource names.
2. Ensure naming variables are not exposed as Terraform input vars.
3. Define secret inputs (e.g., DB admin password) as sensitive Terraform variables only.

## Acceptance Criteria
- Terraform naming derives from locals only.
- All milestone resource names include `copilot-vibe`.
- Only external secrets are Terraform variables and marked sensitive.

## Verification
- `terraform -chdir=terraform fmt -check`
- `terraform -chdir=terraform validate`

## Deliverables
- Updated Terraform files reflecting naming + secret variable contract.
