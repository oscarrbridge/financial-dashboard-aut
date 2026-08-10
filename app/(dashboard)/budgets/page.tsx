"use client";

import { useEffect, useMemo, useState } from "react";
import { requireAuth } from "@/lib/firebase/requireAuth";
import {
  getUserBudgets,
  saveBudgetToFirestore,
  initializeDefaultBudgets,
  EXPENSE_CATEGORIES,
  type BudgetPeriod,
} from "@/lib/firebase/budgets";
import { getUserTransactions, type Transaction } from "@/lib/firebase/transactions";

interface BudgetDisplay {
  name: string;
  spent: number;
  limit: number; // canonical stored value, always weekly
  periodLimit: number; // limit converted to the currently selected budgetPeriod
  period: BudgetPeriod;
}

// Convert a canonical weekly limit to the given period.
function convertFromWeekly(weeklyLimit: number, period: BudgetPeriod): number {
  if (period === "Weekly") return weeklyLimit;
  if (period === "Fortnightly") return weeklyLimit * 2;
  if (period === "Monthly") return (weeklyLimit / 7) * 30;
  return weeklyLimit;
}

export default function BudgetPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savedBudgets, setSavedBudgets] = useState<
    Awaited<ReturnType<typeof getUserBudgets>>
  >([]);
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>("Monthly");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editLimits, setEditLimits] = useState<Record<string, number>>({});
  const { user } = requireAuth();

  const getPeriodDays = (): number => {
    if (budgetPeriod === "Weekly") return 7;
    if (budgetPeriod === "Fortnightly") return 14;
    if (budgetPeriod === "Monthly") return 30;
    return 7;
  };

  // Fetch raw budgets + transactions once per user
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        setLoading(true);

        // Initialize default budgets if none exist
        await initializeDefaultBudgets(user!.uid);

        const [budgets, txns] = await Promise.all([
          getUserBudgets(user!.uid),
          getUserTransactions(user!.uid),
        ]);

        setSavedBudgets(budgets);
        setTransactions(txns);
      } catch (error) {
        console.error("Error loading budgets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  // Derive categories locally — recalculates instantly when budgetPeriod changes, no refetch
  const categories: BudgetDisplay[] = useMemo(() => {
    const days = getPeriodDays();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentTransactions = transactions.filter(
      (transaction) => new Date(transaction.date) >= cutoff
    );

    return EXPENSE_CATEGORIES.map((categoryName) => {
      const savedBudget = savedBudgets.find((b) => b.category === categoryName);
      const spent = recentTransactions
        .filter(
          (transaction) =>
            transaction.type === "Expense" && transaction.category === categoryName
        )
        .reduce((total, transaction) => total + transaction.amount, 0);

      const limit = savedBudget?.limit ?? 0;

      return {
        name: categoryName,
        spent,
        limit,
        periodLimit: convertFromWeekly(limit, budgetPeriod),
        period: "Weekly",
      };
    });
  }, [transactions, savedBudgets, budgetPeriod]);

  // Keep edit limits in sync with the latest category limits
  useEffect(() => {
    const initialLimits: Record<string, number> = {};
    categories.forEach((cat) => {
      initialLimits[cat.name] = cat.limit;
    });
    setEditLimits(initialLimits);
  }, [categories]);

  const totalSpent = categories.reduce(
    (total, category) => total + category.spent,
    0
  );

  const alerts = categories
    .filter(
      (category) =>
        category.periodLimit > 0 &&
        (category.spent > category.periodLimit ||
          category.spent > category.periodLimit * 0.8)
    )
    .sort((a, b) => b.spent / b.periodLimit - a.spent / a.periodLimit);

  const handleSaveAllBudgets = async () => {
    if (!user) return;

    try {
      // Save only budgets that were actually changed
      for (const category of EXPENSE_CATEGORIES) {
        const newLimit = editLimits[category] ?? 0;
        const originalLimit = categories.find((c) => c.name === category)?.limit ?? 0;

        // Only save if the limit actually changed
        if (newLimit !== originalLimit) {
          await saveBudgetToFirestore(user.uid, {
            category,
            limit: newLimit,
          });
        }
      }

      // Refresh saved budgets from what we just wrote, so `categories` re-derives
      setSavedBudgets((prev) =>
        prev.map((b) =>
          editLimits[b.category] !== undefined
            ? { ...b, limit: editLimits[b.category] }
            : b
        )
      );
      setEditMode(false);
    } catch (error) {
      console.error("Error saving budgets:", error);
    }
  };

  const getPeriodLabel = (): string => {
    return budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1);
  };

  // Short lowercase form for inline copy, e.g. "week" / "fortnight" / "month"
  const getPeriodUnitLabel = (): string => {
    if (budgetPeriod === "Weekly") return "week";
    if (budgetPeriod === "Fortnightly") return "fortnight";
    if (budgetPeriod === "Monthly") return "month";
    return "week";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-text px-12 py-10">
        <p className="text-inactive-text">Loading budgets...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text px-12 py-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="mt-2 text-inactive-text">
            Manage your budget limits and spending alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-inactive-text">View as:</p>
          <select
            value={budgetPeriod}
            onChange={(event) =>
              setBudgetPeriod(event.target.value as BudgetPeriod)
            }
            className="bg-widget border border-zinc-700 px-4 py-2 rounded-lg outline-none font-semibold"
          >
            <option>Weekly</option>
            <option>Fortnightly</option>
            <option>Monthly</option>
          </select>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-6 bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold">Budget Alert</p>

            <p className="text-sm text-red-200">
              {alerts.length} active budget alert
              {alerts.length > 1 ? "s" : ""}
            </p>
          </div>

          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mt-10">
        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">{getPeriodLabel()} Budget</h2>

          <p className="text-3xl font-bold mt-2">
            ${categories
              .reduce((total, category) => total + category.periodLimit, 0)
              .toFixed(2)}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Planned spending across all categories
          </p>
        </div>

        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">{getPeriodLabel()} Spent</h2>

          <p className="text-3xl font-bold mt-2">
            ${totalSpent.toFixed(2)}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Current expenses tracked (last {getPeriodDays()} days)
          </p>
        </div>

        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">{getPeriodLabel()} Remaining</h2>

          <p className="text-3xl font-bold mt-2">
            ${(
              categories.reduce((total, category) => total + category.periodLimit, 0) -
              totalSpent
            ).toFixed(2)}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Available budget remaining
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Budget Alerts</h2>
          <div className="bg-widget p-6 rounded-lg border border-zinc-800 space-y-3">
            {alerts.map((category) => (
              <div
                key={category.name}
                className="bg-secondary p-4 rounded-lg flex items-center justify-between border border-zinc-800"
              >
                <p className="text-sm">
                  {category.spent > category.periodLimit
                    ? `${category.name} budget has been exceeded by $${(
                        category.spent - category.periodLimit
                      ).toFixed(2)}.`
                    : `${category.name} has reached ${Math.round(
                        (category.spent / category.periodLimit) * 100
                      )}% of its budget.`}
                </p>

                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    category.spent > category.periodLimit
                      ? "bg-red-500"
                      : "bg-orange-400"
                  }`}
                ></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Budget Categories</h2>
            <p className="text-sm text-inactive-text mt-1">{getPeriodLabel()} budgets for each category</p>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Budgets
            </button>
          )}
        </div>

        {editMode ? (
          // Edit Mode
          <div className="bg-widget p-6 rounded-lg border border-zinc-800">
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="border-b border-zinc-800 pb-4 last:border-b-0"
                >
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm text-inactive-text mb-2">
                        {category.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={editLimits[category.name] ?? 0}
                          onChange={(e) =>
                            setEditLimits({
                              ...editLimits,
                              [category.name]: Number(e.target.value) || 0,
                            })
                          }
                          className="bg-secondary border border-zinc-700 px-3 py-2 rounded text-white outline-none w-24"
                        />
                        <span className="text-sm text-inactive-text">/ week</span>
                      </div>
                      <p className="text-xs text-inactive-text mt-2">
                        Spent this {getPeriodUnitLabel()}: ${category.spent.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-800">
              <button
                onClick={handleSaveAllBudgets}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold"
              >
                Save All
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 bg-secondary border border-zinc-700 hover:border-zinc-600 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <section className="bg-widget p-6 rounded-lg border border-zinc-800">
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="py-8 text-center text-inactive-text">
                  <p>No budget categories yet.</p>
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.name}
                    className="border-b border-zinc-800 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm font-bold">
                        ${category.periodLimit.toFixed(2)} / {getPeriodUnitLabel()}
                      </p>
                    </div>

                    <div className="flex justify-between text-xs text-inactive-text mb-3">
                      <span>Spent this {getPeriodUnitLabel()}: ${category.spent.toFixed(2)}</span>
                      {category.periodLimit > 0 && (
                        <span>{Math.round((category.spent / category.periodLimit) * 100)}% of budget</span>
                      )}
                    </div>

                    {category.periodLimit > 0 && (
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            category.spent > category.periodLimit
                              ? "bg-red-500"
                              : category.spent > category.periodLimit * 0.8
                              ? "bg-orange-400"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (category.spent / category.periodLimit) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
