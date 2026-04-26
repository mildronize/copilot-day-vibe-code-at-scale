'use client';

import { api, type RouterOutputs } from '~/trpc/react';
import type { ExpenseCategory } from '~/server/domain/models';

export type ExpenseFilter = ExpenseCategory | 'ALL';
export type ExpenseListItem = RouterOutputs['expense']['list']['expenses'][number];

export function useExpenseTracker(category: ExpenseFilter) {
  const utils = api.useUtils();

  const expensesQuery = api.expense.list.useQuery({
    category,
  });

  const createExpenseMutation = api.expense.create.useMutation({
    onSuccess: async () => {
      await utils.expense.list.invalidate();
    },
  });

  const deleteExpenseMutation = api.expense.delete.useMutation({
    onSuccess: async () => {
      await utils.expense.list.invalidate();
    },
  });

  const refreshExpenses = async () => {
    await expensesQuery.refetch();
  };

  return {
    expensesQuery,
    createExpenseMutation,
    deleteExpenseMutation,
    refreshExpenses,
  };
}
