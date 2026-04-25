import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { EXPENSE_CATEGORIES } from '~/server/domain/models';
import * as Err from '~/server/lib/errors/domain-errors';

const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

const mapExpenseErrorToTRPC = (error: unknown, fallbackMessage: string): TRPCError => {
  if (error instanceof Err.ValidationError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.message,
      cause: error,
    });
  }

  if (error instanceof Err.NotFoundError) {
    return new TRPCError({
      code: 'NOT_FOUND',
      message: error.message,
      cause: error,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: fallbackMessage,
    cause: error,
  });
};

export const expenseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(120, 'Name too long'),
        amount: z.union([z.string(), z.number()]),
        category: expenseCategorySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const expenseService = ctx.container.expenseService;
        const userId = ctx.user.id;

        const expense = await expenseService.createExpense(userId, {
          name: input.name,
          amount: input.amount,
          category: input.category,
        });

        return {
          expense,
          message: 'Expense created successfully',
        };
      } catch (error) {
        ctx.container.appContext.logger.error('Failed to create expense', {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.user.id,
          input,
        });

        throw mapExpenseErrorToTRPC(error, 'Failed to create expense');
      }
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          category: z.union([expenseCategorySchema, z.literal('ALL')]).default('ALL'),
        })
        .default({ category: 'ALL' }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const expenseService = ctx.container.expenseService;
        const userId = ctx.user.id;

        return await expenseService.listExpenses(userId, {
          category: input.category,
        });
      } catch (error) {
        ctx.container.appContext.logger.error('Failed to list expenses', {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.user.id,
          input,
        });

        throw mapExpenseErrorToTRPC(error, 'Failed to list expenses');
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid('Invalid expense ID'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const expenseService = ctx.container.expenseService;
        const userId = ctx.user.id;

        await expenseService.deleteExpense(input.id, userId);

        return {
          message: 'Expense deleted successfully',
        };
      } catch (error) {
        ctx.container.appContext.logger.error('Failed to delete expense', {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.user.id,
          expenseId: input.id,
        });

        throw mapExpenseErrorToTRPC(error, 'Failed to delete expense');
      }
    }),
});
