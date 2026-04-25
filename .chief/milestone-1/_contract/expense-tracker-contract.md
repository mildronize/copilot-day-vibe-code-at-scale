# Milestone 1 Contract: Expense Tracker MVP

## 1) Domain/Data Contract

### ExpenseCategory (fixed enum)
- `FOOD`
- `TRANSPORT`
- `SHOPPING`
- `BILLS`
- `OTHER`

### Expense Entity
- `id: string` (UUID)
- `name: string` (1..120 chars, trimmed)
- `amountCents: number` (integer, `> 0`)
- `category: ExpenseCategory`
- `userId: string` (UUID, owner)
- `createdAt: Date`
- `updatedAt: Date`

### Persistence Rules
- Records are user-scoped.
- Hard delete is allowed for milestone-1.
- Data is stored in PostgreSQL via Drizzle and survives app restarts.

## 2) API Contract (tRPC)

### `expense.create`
**Input**
- `name: string`
- `amount: string | number` (validated to max 2 decimals, positive)
- `category: ExpenseCategory`

**Output**
- `{ expense: Expense, message: string }`

### `expense.list`
**Input**
- `category?: ExpenseCategory | "ALL"` (default `"ALL"`)

**Output**
- `{ expenses: Expense[], count: number, totalCents: number }`
- `expenses` sorted by `createdAt desc`
- `totalCents` is sum of the returned (filtered) list

### `expense.delete`
**Input**
- `id: string`

**Output**
- `{ message: string }`

### Security/Error Contract
- All routes are protected/authenticated.
- User can only read/delete own expenses.
- Validation errors return `BAD_REQUEST`.
- Missing/inaccessible expense on delete returns `NOT_FOUND`.
- Unexpected failures return `INTERNAL_SERVER_ERROR`.

## 3) UI Contract (Single Page)

### Page Composition
- One authenticated page containing:
  - Add expense form
  - Category filter control
  - Expense list
  - Total spending block

### Form Contract
- Fields: Name, Amount, Category
- Category options map to fixed preset categories
- Submit creates expense and refreshes list + total

### List Contract
- Shows each expense name, category, amount, created date, delete action
- Empty state shown when no expenses exist for active filter

### Total Contract
- Displays sum of currently visible (filtered) expenses
- Currency format is UI concern; canonical value is `totalCents`

## 4) Explicit Non-Contracted Scope (M1)
- No expense edit/update flow
- No custom categories
