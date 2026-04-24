# task-3 — PostgreSQL Runtime/Migration Alignment

## Objective
Ensure application runtime and Prisma migration flow can use PostgreSQL via `DATABASE_URL`.

## Scope
- Included: minimal config changes needed for PostgreSQL runtime and migration in deployment context.
- Excluded: unrelated refactors.

## Rules & Contracts to follow
- `AGENTS.md`
- `.chief/milestone-1/_goal/azure-container-app-postgres.md`
- `.chief/milestone-1/_contract/azure-deploy-contract.md`

## Steps
1. Update Prisma/app database configuration for PostgreSQL compatibility.
2. Keep local/deployment behavior explicit via `DATABASE_URL`.
3. Ensure no secret values are committed.

## Acceptance Criteria
- Prisma migration command can target PostgreSQL from `DATABASE_URL`.
- Runtime DB client is compatible with PostgreSQL connection URL.
- Repository contains no plaintext credentials.

## Verification
- `bunx prisma validate`
- `bunx tsc --noEmit`

## Deliverables
- Updated DB configuration files (only those required for PostgreSQL deployment compatibility).
