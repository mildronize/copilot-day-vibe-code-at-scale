import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { baseFields, type BaseFields } from './base';
import { user } from './user';

export const expenseCategoryEnum = pgEnum('expense_category', [
  'FOOD',
  'TRANSPORT',
  'SHOPPING',
  'BILLS',
  'OTHER',
]);

export const expenses = pgTable('expense', {
  ...baseFields,
  name: varchar('name', { length: 120 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  category: expenseCategoryEnum('category').notNull(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(user, {
    fields: [expenses.userId],
    references: [user.id],
  }),
}));

export type DbExpenseEntity = typeof expenses.$inferSelect;
export type DbExpenseInsert = typeof expenses.$inferInsert;
export type DbExpenseUpdate = Partial<Omit<DbExpenseEntity, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>;

export interface Expense extends BaseFields {
  name: string;
  amountCents: number;
  category: 'FOOD' | 'TRANSPORT' | 'SHOPPING' | 'BILLS' | 'OTHER';
  userId: string;
}
