import type { AppContext } from '~/server/context/app-context';
import type { Expense, ExpenseCategory, IExpenseRepository } from '~/server/domain';
import { EXPENSE_CATEGORIES } from '~/server/domain/models';
import * as Err from '~/server/lib/errors/domain-errors';

export interface CreateExpenseRequest {
  name: string;
  amount: string | number;
  category: string;
}

export interface ListExpensesRequest {
  category?: ExpenseCategory | 'ALL';
}

export interface ListExpensesResponse {
  expenses: Expense[];
  count: number;
  totalCents: number;
}

export class ExpenseService {
  constructor(
    private appContext: AppContext,
    private expenseRepository: IExpenseRepository,
  ) {}

  async createExpense(userId: string, request: CreateExpenseRequest): Promise<Expense> {
    try {
      this.appContext.logger.info('Creating expense', {
        userId,
        name: request.name,
        category: request.category,
        operation: 'createExpense',
        service: 'ExpenseService',
      });

      const normalizedName = request.name.trim();
      if (!normalizedName) {
        throw new Err.ValidationError('Name is required', {
          field: 'name',
          value: request.name,
        });
      }

      if (normalizedName.length > 120) {
        throw new Err.ValidationError('Name too long', {
          field: 'name',
          maxLength: 120,
          currentLength: normalizedName.length,
        });
      }

      const category = this.validateCategory(request.category, 'category');
      const amountCents = this.normalizeAmountToCents(request.amount);

      const expense = await this.expenseRepository.create({
        name: normalizedName,
        amountCents,
        category,
        userId,
      });

      this.appContext.logger.info('Expense created successfully', {
        expenseId: expense.id,
        userId,
        operation: 'createExpense',
      });

      return expense;
    } catch (error) {
      this.appContext.logger.error('Failed to create expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        name: request.name,
        operation: 'createExpense',
        service: 'ExpenseService',
      });
      throw error;
    }
  }

  async listExpenses(userId: string, request: ListExpensesRequest = {}): Promise<ListExpensesResponse> {
    try {
      const category = request.category && request.category !== 'ALL'
        ? this.validateCategory(request.category, 'category')
        : undefined;

      this.appContext.logger.info('Fetching expenses', {
        userId,
        category: category ?? 'ALL',
        operation: 'listExpenses',
        service: 'ExpenseService',
      });

      const expenses = await this.expenseRepository.findByUserId(userId, {
        category,
      });

      const totalCents = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

      return {
        expenses,
        count: expenses.length,
        totalCents,
      };
    } catch (error) {
      this.appContext.logger.error('Failed to fetch expenses', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        category: request.category,
        operation: 'listExpenses',
        service: 'ExpenseService',
      });
      throw error;
    }
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    try {
      this.appContext.logger.info('Deleting expense', {
        expenseId: id,
        userId,
        operation: 'deleteExpense',
        service: 'ExpenseService',
      });

      await this.expenseRepository.delete(id, userId);

      this.appContext.logger.info('Expense deleted successfully', {
        expenseId: id,
        userId,
        operation: 'deleteExpense',
      });
    } catch (error) {
      this.appContext.logger.error('Failed to delete expense', {
        error: error instanceof Error ? error.message : 'Unknown error',
        expenseId: id,
        userId,
        operation: 'deleteExpense',
        service: 'ExpenseService',
      });
      throw error;
    }
  }

  private validateCategory(value: string, field: string): ExpenseCategory {
    if (!EXPENSE_CATEGORIES.includes(value as ExpenseCategory)) {
      throw new Err.ValidationError('Invalid expense category', {
        field,
        value,
        allowedValues: EXPENSE_CATEGORIES,
      });
    }
    return value as ExpenseCategory;
  }

  private normalizeAmountToCents(amount: string | number): number {
    if (typeof amount === 'number') {
      if (!Number.isFinite(amount)) {
        throw new Err.ValidationError('Amount must be a valid number', {
          field: 'amount',
          value: amount,
        });
      }

      if (amount <= 0) {
        throw new Err.ValidationError('Amount must be greater than 0', {
          field: 'amount',
          value: amount,
        });
      }

      const amountCents = Math.round(amount * 100);
      const difference = Math.abs(amount * 100 - amountCents);
      if (difference > 1e-8) {
        throw new Err.ValidationError('Amount can have at most 2 decimal places', {
          field: 'amount',
          value: amount,
        });
      }

      return amountCents;
    }

    const normalizedAmount = amount.trim();
    if (!normalizedAmount) {
      throw new Err.ValidationError('Amount is required', {
        field: 'amount',
        value: amount,
      });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(normalizedAmount)) {
      throw new Err.ValidationError('Amount must be a positive number with up to 2 decimal places', {
        field: 'amount',
        value: amount,
      });
    }

    const [wholePart = '0', decimalPart = ''] = normalizedAmount.split('.');
    const whole = Number.parseInt(wholePart, 10);
    const cents = Number.parseInt(decimalPart.padEnd(2, '0'), 10);
    const amountCents = whole * 100 + cents;

    if (amountCents <= 0) {
      throw new Err.ValidationError('Amount must be greater than 0', {
        field: 'amount',
        value: amount,
      });
    }

    return amountCents;
  }
}
