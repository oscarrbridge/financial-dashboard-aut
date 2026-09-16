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

// Short disambiguation hints for the AI categorisation prompts only -
// doesn't affect dropdowns, budgets, or the keyword-matcher fallback.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Accommodation: "rent, board, flatting, hostel, hall, housing costs",
  Utilities: "recurring household bills: power, water, gas, internet, mobile/phone plan",
  Transport: "public transport, fuel, parking, rideshare, vehicle costs",
  Groceries: "supermarket/grocery store purchases for food to prepare at home",
  Entertainment: "movies, music/streaming subscriptions, games, events, going out for fun",
  Education: "course fees, tuition, textbooks, study-related stationery",
  "Personal Care": "health, medical, gym memberships, fitness, haircuts, toiletries, clothing",
  "Food & Dining": "eating out: restaurants, cafes, takeaways, fast food, food delivery (e.g. pizza)",
  "Other Expense": "miscellaneous purchases that don't clearly fit another category, e.g. household items, tech accessories, printing credit, general shopping",
  Wages: "employment income, salary, payroll from a job",
  Scholarship: "scholarships, grants, bursaries, awards",
  "Student Allowance": "recurring government study support payments (e.g. StudyLink), often described as 'allowance' or 'weekly allowance'",
  "Family Support": "money received from family members",
  "Other Income": "any other income that doesn't fit the above",
  "Student Loan": "student loan repayments or StudyLink loan activity",
  "Credit Card": "credit card repayments",
  "Personal Loan": "other personal loan repayments or finance",
  "Other Debt": "any other debt repayment that doesn't fit the above",
};

export function describeCategory(category: string): string {
  const description = CATEGORY_DESCRIPTIONS[category];
  return description ? `${category} (${description})` : category;
}
