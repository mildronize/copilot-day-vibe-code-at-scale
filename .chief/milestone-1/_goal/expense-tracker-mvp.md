# Milestone 1 Goal: Expense Tracker MVP

## Problem
The app currently supports todo management, but milestone-1 needs a minimal expense-tracking workflow so users can record and review spending in one place with durable persistence.

## Goal
Deliver an authenticated, user-scoped expense tracker on a single page where a user can:

1. Add an expense with **name**, **amount**, and **category**.
2. View all expenses as a list.
3. Delete an expense.
4. Filter expenses by category.
5. View total spending for the currently visible (filtered) expense list.

## Required Behavior

- Preset categories are fixed to: **Food**, **Transport**, **Shopping**, **Bills**, **Other**.
- Amount input accepts positive values with up to 2 decimal places and is stored as integer cents.
- Data persists across restarts using the existing server/database stack.
- The UI is a single authenticated page containing form, filter controls, expense list, and total.

## Out of Scope

- Editing existing expenses.
- Custom categories.
- Cross-user/shared expenses.
