import type { Expense } from '~/server/domain/models';
import type { ExpenseCreateRequest, ExpenseListOptions } from './types/expense-repository-types';

export interface IExpenseRepository {
  create(input: ExpenseCreateRequest): Promise<Expense>;
  findByUserId(userId: string, options?: ExpenseListOptions): Promise<Expense[]>;
  delete(id: string, userId: string): Promise<void>;
}
