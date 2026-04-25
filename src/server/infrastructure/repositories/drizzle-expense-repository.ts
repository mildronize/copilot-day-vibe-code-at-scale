import type { AppContext } from '~/server/context/app-context';
import type { Expense, IExpenseRepository } from '~/server/domain';
import { and, desc, eq } from 'drizzle-orm';
import { expenses } from '~/server/infrastructure/db/schema';
import * as Err from '~/server/lib/errors/domain-errors';
import { BaseDrizzleRepository } from './base-drizzle-repository';
import {
  RepoExpenseCreateSchema,
  RepoExpenseDeleteSchema,
  RepoExpenseListQuerySchema,
} from '~/server/domain/repositories/schemas/expense-repository-schemas';
import type {
  ExpenseCreateRequest,
  ExpenseListOptions,
} from '~/server/domain/repositories/types/expense-repository-types';

export class DrizzleExpenseRepository extends BaseDrizzleRepository implements IExpenseRepository {
  constructor(private appContext: AppContext) {
    super('expenses');
  }

  protected getLogger() {
    return this.appContext.logger;
  }

  private toDomainExpense(dbExpense: typeof expenses.$inferSelect): Expense {
    return {
      id: dbExpense.id,
      name: dbExpense.name,
      amountCents: dbExpense.amountCents,
      category: dbExpense.category,
      userId: dbExpense.userId,
      createdAt: dbExpense.createdAt,
      updatedAt: dbExpense.updatedAt,
    };
  }

  async create(input: ExpenseCreateRequest): Promise<Expense> {
    try {
      this.appContext.logger.info('Creating expense in repository', {
        name: input.name,
        category: input.category,
        amountCents: input.amountCents,
        userId: input.userId,
        operation: 'create',
        repository: 'DrizzleExpenseRepository',
      });

      const validatedData = RepoExpenseCreateSchema.parse(input);
      const db = await this.ensureDatabase();

      const createdExpenses = await db.insert(expenses).values(validatedData).returning();
      const createdExpense = createdExpenses[0];

      if (!createdExpense) {
        throw new Err.DatabaseError('Failed to create expense - no data returned');
      }

      this.appContext.logger.info('Expense created successfully in repository', {
        expenseId: createdExpense.id,
        userId: createdExpense.userId,
        operation: 'create',
      });

      return this.toDomainExpense(createdExpense);
    } catch (error) {
      this.appContext.logger.error('Failed to create expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: input.userId,
        operation: 'create',
        repository: 'DrizzleExpenseRepository',
      });
      throw error;
    }
  }

  async findByUserId(userId: string, options?: ExpenseListOptions): Promise<Expense[]> {
    try {
      const validatedQuery = RepoExpenseListQuerySchema.parse({
        userId,
        category: options?.category,
        limit: options?.limit,
        skip: options?.skip,
      });

      this.appContext.logger.info('Finding expenses for user', {
        userId: validatedQuery.userId,
        category: validatedQuery.category,
        operation: 'findByUserId',
        repository: 'DrizzleExpenseRepository',
      });

      const db = await this.ensureDatabase();

      const conditions = [eq(expenses.userId, validatedQuery.userId)];
      if (validatedQuery.category) {
        conditions.push(eq(expenses.category, validatedQuery.category));
      }

      let query = db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.createdAt));

      if (validatedQuery.limit !== undefined) {
        query = query.limit(validatedQuery.limit) as typeof query;
      }

      if (validatedQuery.skip !== undefined) {
        query = query.offset(validatedQuery.skip) as typeof query;
      }

      const expenseList = await query;

      this.appContext.logger.info('Found expenses for user', {
        userId: validatedQuery.userId,
        category: validatedQuery.category,
        count: expenseList.length,
        operation: 'findByUserId',
      });

      return expenseList.map((expense) => this.toDomainExpense(expense));
    } catch (error) {
      this.appContext.logger.error('Failed to find expenses for user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        category: options?.category,
        operation: 'findByUserId',
        repository: 'DrizzleExpenseRepository',
      });
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const validatedInput = RepoExpenseDeleteSchema.parse({ id, userId });

      this.appContext.logger.info('Deleting expense', {
        expenseId: validatedInput.id,
        userId: validatedInput.userId,
        operation: 'delete',
        repository: 'DrizzleExpenseRepository',
      });

      const db = await this.ensureDatabase();

      const existingExpense = await db
        .select({ id: expenses.id })
        .from(expenses)
        .where(
          and(
            eq(expenses.id, validatedInput.id),
            eq(expenses.userId, validatedInput.userId),
          ),
        )
        .limit(1);

      if (existingExpense.length === 0) {
        throw new Err.NotFoundError(`Expense not found or not owned by user: ${validatedInput.id}`);
      }

      await db
        .delete(expenses)
        .where(
          and(
            eq(expenses.id, validatedInput.id),
            eq(expenses.userId, validatedInput.userId),
          ),
        );

      this.appContext.logger.info('Expense deleted successfully', {
        expenseId: validatedInput.id,
        userId: validatedInput.userId,
        operation: 'delete',
      });
    } catch (error) {
      this.appContext.logger.error('Failed to delete expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId: id,
        userId,
        operation: 'delete',
        repository: 'DrizzleExpenseRepository',
      });
      throw error;
    }
  }
}
