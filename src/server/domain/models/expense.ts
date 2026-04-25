export const EXPENSE_CATEGORIES = ['FOOD', 'TRANSPORT', 'SHOPPING', 'BILLS', 'OTHER'] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
  id: string;
  name: string;
  amountCents: number;
  category: ExpenseCategory;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
