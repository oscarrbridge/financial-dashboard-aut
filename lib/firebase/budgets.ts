import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

export type BudgetPeriod = "Weekly" | "Fortnightly" | "Monthly";

export type Budget = {
  id?: string;
  category: string;
  limit: number;  // Weekly limit
};

// Predefined expense categories - users cannot create custom ones
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

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

function createBudgetId(category: string): string {
  return category.trim().toLowerCase();
}

export async function initializeDefaultBudgets(
  uid: string
): Promise<void> {
  const budgetsRef = collection(db, "users", uid, "budgets");
  const snapshot = await getDocs(budgetsRef);

  // Only initialize if no budgets exist yet
  if (snapshot.docs.length > 0) {
    return;
  }

  // Create default budgets for all expense categories with $0 weekly limit
  for (const category of EXPENSE_CATEGORIES) {
    const budgetId = createBudgetId(category);
    const budgetRef = doc(db, "users", uid, "budgets", budgetId);

    await setDoc(
      budgetRef,
      {
        category,
        limit: 0,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

export async function saveBudgetToFirestore(
  uid: string,
  budget: Omit<Budget, "id">
) {
  const budgetId = createBudgetId(budget.category);
  const budgetRef = doc(db, "users", uid, "budgets", budgetId);

  await setDoc(
    budgetRef,
    {
      category: budget.category,
      limit: budget.limit,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserBudgets(
  uid: string
): Promise<Budget[]> {
  const budgetsRef = collection(db, "users", uid, "budgets");
  const snapshot = await getDocs(budgetsRef);

  return snapshot.docs.map((budgetDocument) => ({
    id: budgetDocument.id,
    ...(budgetDocument.data() as Omit<Budget, "id">),
  }));
}