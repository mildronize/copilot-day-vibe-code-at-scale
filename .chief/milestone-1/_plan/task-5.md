# task-5 — DEPLOY Documentation

## Objective
Document end-to-end deployment setup and operations for milestone 1.

## Scope
- Included: prerequisites, required secrets/variables, manual Terraform apply, workflow behavior, rollback/troubleshooting basics.
- Excluded: enterprise runbook depth.

## Rules & Contracts to follow
- `AGENTS.md`
- `.chief/milestone-1/_goal/azure-container-app-postgres.md`
- `.chief/milestone-1/_contract/azure-deploy-contract.md`

## Steps
1. Add DEPLOY documentation file.
2. Document required tooling and Azure/GitHub prerequisites.
3. Document required secrets and how they are used.
4. Document manual Terraform flow and automated workflow flow.
5. Add rollback/troubleshooting checklist.

## Acceptance Criteria
- DEPLOY doc exists and covers all required contract sections.
- Instructions clearly separate manual Terraform from CI deployment steps.

## Verification
- Human-readable walkthrough confirms all required sections exist.

## Deliverables
- `DEPLOY.md` (or equivalent DEPLOY document) in repository root.
