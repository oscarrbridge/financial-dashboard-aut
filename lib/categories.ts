export type TransactionType = "Expense" | "Income" | "Debt";

export const EXPENSE_CATEGORIES = [
  "Accommodation",
  "Utilities",
  "Transport",
  "Groceries",
  "Entertainment",
  "Education",
  "Personal Care",
  "Food & Dining",
  "Other Expense",
] as const;

export const INCOME_CATEGORIES = [
  "Wages",
  "Scholarship",
  "Student Allowance",
  "Family Support",
  "Other Income",
] as const;

export const DEBT_CATEGORIES = [
  "Student Loan",
  "Credit Card",
  "Personal Loan",
  "Other Debt",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type DebtCategory = (typeof DEBT_CATEGORIES)[number];

export const CATEGORIES_BY_TYPE: Record<TransactionType, readonly string[]> = {
  Expense: EXPENSE_CATEGORIES,
  Income: INCOME_CATEGORIES,
  Debt: DEBT_CATEGORIES,
};

export function getCategoriesForType(type: TransactionType): readonly string[] {
  return CATEGORIES_BY_TYPE[type];
}

export function isValidCategoryForType(
  category: string,
  type: TransactionType
): boolean {
  return CATEGORIES_BY_TYPE[type].includes(category.trim());
}
