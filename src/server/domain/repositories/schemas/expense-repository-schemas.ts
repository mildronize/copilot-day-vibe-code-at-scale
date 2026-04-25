import { z } from 'zod';
import { matches } from '~/server/lib/validation/zod-utils';
import type { DbExpenseEntity } from '~/server/infrastructure/entities';

type RepoExpenseCreateData = Omit<DbExpenseEntity, 'id' | 'createdAt' | 'updatedAt'>;
type RepoExpenseListQuery = {
  userId: string;
  category?: DbExpenseEntity['category'];
  limit?: number;
  skip?: number;
};
type RepoExpenseDeleteInput = {
  id: string;
  userId: string;
};

const ExpenseCategorySchema = z.enum(['FOOD', 'TRANSPORT', 'SHOPPING', 'BILLS', 'OTHER']);

export const RepoExpenseCreateSchema = matches<RepoExpenseCreateData>()(
  z.object({
    name: z.string().trim().min(1, 'Name is required').max(120, 'Name too long'),
    amountCents: z.number().int().positive('Amount must be greater than 0'),
    category: ExpenseCategorySchema,
    userId: z.string().uuid('Invalid user ID format'),
  })
);

export const RepoExpenseListQuerySchema = matches<RepoExpenseListQuery>()(
  z.object({
    userId: z.string().uuid('Invalid user ID format'),
    category: ExpenseCategorySchema.optional(),
    limit: z.number().int().min(1).max(100).optional(),
    skip: z.number().int().min(0).optional(),
  })
);

export const RepoExpenseDeleteSchema = matches<RepoExpenseDeleteInput>()(
  z.object({
    id: z.string().uuid('Invalid expense ID format'),
    userId: z.string().uuid('Invalid user ID format'),
  })
);
