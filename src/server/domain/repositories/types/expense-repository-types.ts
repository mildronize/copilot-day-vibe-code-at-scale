import type { DbExpenseEntity } from '~/server/infrastructure/entities';

export type ExpenseCreateData = Omit<DbExpenseEntity, 'id' | 'createdAt' | 'updatedAt'>;

export type ExpenseFullData = DbExpenseEntity;

export type ExpenseCreateRequest = Pick<DbExpenseEntity, 'name' | 'amountCents' | 'category'> & {
  userId: string;
};

export type ExpenseListOptions = {
  category?: DbExpenseEntity['category'];
  limit?: number;
  skip?: number;
};

export type ExpenseDeleteInput = {
  id: string;
  userId: string;
};
