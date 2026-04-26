'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Grid,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconRefresh, IconTrash } from '@tabler/icons-react';
import type { ExpenseCategory } from '~/server/domain/models';
import { useExpenseTracker, type ExpenseFilter, type ExpenseListItem } from '../_hooks/useExpenseTracker';

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'FOOD', label: 'Food' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'BILLS', label: 'Bills' },
  { value: 'OTHER', label: 'Other' },
];

const FILTER_OPTIONS: { value: ExpenseFilter; label: string }[] = [
  { value: 'ALL', label: 'All categories' },
  ...CATEGORY_OPTIONS,
];

const formatCurrency = (amountCents: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100);

const formatCategoryLabel = (category: ExpenseCategory): string =>
  CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;

const formatExpenseDate = (value: Date | string): string => new Date(value).toLocaleDateString();

const sortNewestFirst = (expenses: ExpenseListItem[]): ExpenseListItem[] =>
  [...expenses].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

const computeTotalCents = (expenses: ExpenseListItem[]): number =>
  expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

export function ExpenseTracker() {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('FOOD');
  const [filter, setFilter] = useState<ExpenseFilter>('ALL');

  const { expensesQuery, createExpenseMutation, deleteExpenseMutation, refreshExpenses } =
    useExpenseTracker(filter);

  const sortedExpenses = useMemo(
    () => sortNewestFirst(expensesQuery.data?.expenses ?? []),
    [expensesQuery.data?.expenses],
  );
  const totalCents = useMemo(() => computeTotalCents(sortedExpenses), [sortedExpenses]);
  const visibleCount = sortedExpenses.length;

  const handleCreateExpense = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      notifications.show({
        title: 'Invalid expense',
        message: 'Name is required.',
        color: 'red',
      });
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      notifications.show({
        title: 'Invalid amount',
        message: 'Amount must be a positive number with up to 2 decimals.',
        color: 'red',
      });
      return;
    }

    try {
      await createExpenseMutation.mutateAsync({
        name: trimmedName,
        amount,
        category,
      });

      notifications.show({
        title: 'Success',
        message: 'Expense created successfully.',
        color: 'green',
      });

      setName('');
      setAmount('');
      await refreshExpenses();
    } catch (error) {
      notifications.show({
        title: 'Failed to create expense',
        message: error instanceof Error ? error.message : 'Please try again.',
        color: 'red',
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpenseMutation.mutateAsync({ id });

      notifications.show({
        title: 'Success',
        message: 'Expense deleted successfully.',
        color: 'green',
      });

      await refreshExpenses();
    } catch (error) {
      notifications.show({
        title: 'Failed to delete expense',
        message: error instanceof Error ? error.message : 'Please try again.',
        color: 'red',
      });
    }
  };

  const handleDeleteClick = (expense: ExpenseListItem) => {
    modals.openConfirmModal({
      title: 'Delete expense?',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <Text span fw={600}>{expense.name}</Text>? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        void handleDeleteExpense(expense.id);
      },
    });
  };

  return (
    <Grid gutter="lg" align="flex-start">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack gap="lg">
          <Card withBorder shadow="sm" padding="lg">
            <Stack gap="sm">
              <Title order={3}>Add Expense</Title>
              <TextInput
                label="Name"
                placeholder="Groceries, bus fare..."
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                required
              />
              <TextInput
                label="Amount"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.currentTarget.value)}
                inputMode="decimal"
                required
              />
              <Select
                label="Category"
                data={CATEGORY_OPTIONS}
                value={category}
                onChange={(value) => setCategory((value as ExpenseCategory | null) ?? 'FOOD')}
                allowDeselect={false}
              />
              <Group justify="flex-end">
                <Button loading={createExpenseMutation.isPending} onClick={handleCreateExpense}>
                  Add Expense
                </Button>
              </Group>
            </Stack>
          </Card>

          <Card withBorder shadow="sm" padding="lg">
            <Stack gap="md">
              <Group justify="space-between" align="flex-end">
                <div>
                  <Title order={3}>Expenses</Title>
                  <Text size="sm" c="dimmed">
                    Showing newest first
                  </Text>
                </div>
                <Group gap="sm">
                  <Select
                    label="Category filter"
                    data={FILTER_OPTIONS}
                    value={filter}
                    onChange={(value) => setFilter((value as ExpenseFilter | null) ?? 'ALL')}
                    allowDeselect={false}
                  />
                  <ActionIcon
                    variant="light"
                    color="blue"
                    mt={24}
                    onClick={() => void refreshExpenses()}
                    loading={expensesQuery.isFetching}
                  >
                    <IconRefresh size="1rem" />
                  </ActionIcon>
                </Group>
              </Group>

              {expensesQuery.isLoading ? (
                <Center py="lg">
                  <Stack gap="sm" align="center">
                    <Loader size="md" />
                    <Text c="dimmed" size="sm">
                      Loading expenses...
                    </Text>
                  </Stack>
                </Center>
              ) : expensesQuery.error ? (
                <Alert icon={<IconInfoCircle size="1rem" />} color="red" title="Error loading expenses">
                  <Stack gap="sm">
                    <Text size="sm">
                      {expensesQuery.error.message || 'Unable to load expenses. Please retry.'}
                    </Text>
                    <Group>
                      <Button size="xs" variant="outline" onClick={() => void refreshExpenses()}>
                        Retry
                      </Button>
                    </Group>
                  </Stack>
                </Alert>
              ) : sortedExpenses.length === 0 ? (
                <Paper withBorder p="lg" ta="center">
                  <Text c="dimmed">
                    {filter === 'ALL'
                      ? 'No expenses yet. Add your first expense above.'
                      : `No expenses found for ${formatCategoryLabel(filter)}.`}
                  </Text>
                </Paper>
              ) : (
                <Stack gap="sm">
                  {sortedExpenses.map((expense) => (
                    <Paper key={expense.id} withBorder p="md">
                      <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={4}>
                          <Group gap="xs">
                            <Text fw={600}>{expense.name}</Text>
                            <Badge variant="light">{formatCategoryLabel(expense.category)}</Badge>
                          </Group>
                          <Text size="sm" c="dimmed">
                            {formatExpenseDate(expense.createdAt)}
                          </Text>
                        </Stack>
                        <Group gap="sm" align="center" wrap="nowrap">
                          <Text fw={700}>{formatCurrency(expense.amountCents)}</Text>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleDeleteClick(expense)}
                            loading={deleteExpenseMutation.isPending}
                            disabled={deleteExpenseMutation.isPending}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Card withBorder shadow="sm" padding="lg">
          <Stack gap={4}>
            <Title order={4}>Total spending</Title>
            <Text c="dimmed" size="sm">
              {filter === 'ALL'
                ? 'Across all categories'
                : `For ${formatCategoryLabel(filter)}`}
            </Text>
            <Text fz={32} fw={700}>
              {formatCurrency(totalCents)}
            </Text>
            <Text size="sm" c="dimmed">
              {visibleCount} expense{visibleCount === 1 ? '' : 's'} shown
            </Text>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
