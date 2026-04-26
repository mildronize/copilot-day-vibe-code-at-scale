- [x] task-1: Create expense domain + persistence model
  - Add Expense domain model and repository interface/types following existing repository conventions.
  - Add Drizzle expense table schema with enum category, amountCents, userId, timestamps, and relation wiring.
  - Implement repository input validation and user-scoped CRUD methods needed for create/list/delete.

- [x] task-2: Implement expense service + tRPC router
  - Add ExpenseService with create/list/delete business logic, amount normalization to cents, and category validation.
  - Add protected `expense.create`, `expense.list`, `expense.delete` tRPC procedures with contract-compliant IO.
  - Register expense router in app root router and dependency container wiring.

- [x] task-3: Build single-page expense UI
  - Replace authenticated home content with expense tracker layout including add form, category filter, list, and total panel.
  - Add client components/hooks for querying, mutations, optimistic refresh, and empty/loading/error states.
  - Keep category options fixed to Food/Transport/Shopping/Bills/Other and display newest-first expenses.

- [x] task-4: Enforce filter-driven totals and deletion UX
  - Ensure active category filter drives both list payload and total spending value.
  - Add per-row delete action and confirmation UX consistent with existing UI style.
  - Recompute visible list + total after create/delete/filter changes without stale values.

- [x] task-5: Validate milestone behavior and document usage
  - Verify end-to-end behavior for add/list/delete/filter/total under authenticated user scope.
  - Confirm persistence across app restart with PostgreSQL-backed data.
  - Update user-facing docs (README relevant section) to include expense tracker usage and constraints.
