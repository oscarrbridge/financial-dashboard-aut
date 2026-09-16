import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./config";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

export type BudgetPeriod = "Weekly" | "Fortnightly" | "Monthly";

export type Budget = {
  id?: string;
  category: string;
  limit: number;  // Weekly limit
};

// Predefined expense categories - users cannot create custom ones
export { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/categories";

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

    await setDoc(budgetRef, {
      category,
      limit: 0,
      createdAt: serverTimestamp(),
    });
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

// Live version of getUserBudgets - fires the callback again whenever a budget
// limit is changed. Returns an unsubscribe function.
export function subscribeToUserBudgets(
  uid: string,
  onChange: (budgets: Budget[]) => void
): () => void {
  const budgetsRef = collection(db, "users", uid, "budgets");

  return onSnapshot(budgetsRef, (snapshot) => {
    onChange(
      snapshot.docs.map((budgetDocument) => ({
        id: budgetDocument.id,
        ...(budgetDocument.data() as Omit<Budget, "id">),
      }))
    );
  });
}
