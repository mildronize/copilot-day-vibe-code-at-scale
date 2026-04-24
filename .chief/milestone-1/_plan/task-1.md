# task-1 — Terraform Baseline Resources

## Objective
Provision milestone-required Azure resources in `southeastasia` using Terraform under `terraform/`.

## Scope
- Included: resource group, container apps environment, container app, PostgreSQL flexible server (`B_Standard_B1ms`), and one application database.
- Excluded: private networking, HA, production hardening.

## Rules & Contracts to follow
- `AGENTS.md`
- `.chief/milestone-1/_goal/azure-container-app-postgres.md`
- `.chief/milestone-1/_contract/azure-deploy-contract.md`

## Steps
1. Create Terraform files and provider setup in `terraform/`.
2. Define required Azure resources and dependencies.
3. Ensure all regional resources use `southeastasia`.

## Acceptance Criteria
- `terraform/` contains valid configuration for all required resources.
- PostgreSQL flexible server SKU is `B_Standard_B1ms`.
- Public access + no HA baseline is reflected.

## Verification
- `terraform -chdir=terraform init -backend=false`
- `terraform -chdir=terraform validate`

## Deliverables
- Terraform configuration files in `terraform/` implementing baseline resource topology.
