# task-4 — CI/CD Workflow (Build → Migrate → Deploy)

## Objective
Create deployment workflow for push to `main` that builds/pushes GHCR image, runs migrations, then deploys Container App.

## Scope
- Included: one GitHub Actions workflow under `.github/workflows/`.
- Excluded: Terraform apply in CI.

## Rules & Contracts to follow
- `AGENTS.md`
- `.chief/milestone-1/_goal/azure-container-app-postgres.md`
- `.chief/milestone-1/_contract/azure-deploy-contract.md`

## Steps
1. Add workflow trigger on push to `main`.
2. Implement GHCR build/push stage.
3. Implement migration stage using `DATABASE_URL`.
4. Implement Azure deploy stage using `AZURE_CREDENTIALS` and container app image update.

## Acceptance Criteria
- Workflow exists under `.github/workflows/`.
- Stage order is build/push → migrate → deploy.
- Uses `azure/login@v2` with `AZURE_CREDENTIALS`.
- Does not run Terraform apply.

## Verification
- `bunx tsc --noEmit` (if workflow references project scripts/commands)
- Manual workflow review for stage order and secrets usage.

## Deliverables
- `.github/workflows/*` deployment workflow implementing required sequence.
