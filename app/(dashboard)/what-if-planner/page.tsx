"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  RefreshCcw,
  WalletCards,
} from "lucide-react";

import { requireAuth } from "@/lib/firebase/requireAuth";
import {
  EXPENSE_CATEGORIES,
  getUserBudgets,
} from "@/lib/firebase/budgets";
import {
  getUserTransactions,
  type Transaction,
} from "@/lib/firebase/transactions";

type ScenarioValues = Record<string, number>;

function createEmptyScenario(): ScenarioValues {
  return Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [category, 0])
  ) as ScenarioValues;
}

function convertWeeklyToMonthly(weeklyValue: number) {
  return (weeklyValue / 7) * 30;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getScenarioTotal(values: ScenarioValues) {
  return EXPENSE_CATEGORIES.reduce(
    (total, category) => total + (values[category] ?? 0),
    0
  );
}

export default function WhatIfPlannerPage() {
  const { user } = requireAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // One shared income value for both scenarios.
  const [income, setIncome] = useState(0);

  // Scenario 1 - current saved budget.
  const [currentScenario, setCurrentScenario] =
    useState<ScenarioValues>(() => createEmptyScenario());

  // Editable values currently shown in Scenario 2.
  const [draftScenario, setDraftScenario] =
    useState<ScenarioValues>(() => createEmptyScenario());

  // Values that have been applied for comparison.
  const [appliedScenario, setAppliedScenario] =
    useState<ScenarioValues>(() => createEmptyScenario());

  const [showResults, setShowResults] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadPlannerData() {
      try {
        setLoading(true);
        setLoadError("");

        const [budgets, transactions] = await Promise.all([
          getUserBudgets(user!.uid),
          getUserTransactions(user!.uid),
        ]);

        /*
          Scenario 1 uses the existing saved budget.

          Budget values are stored weekly in the project,
          so convert each value to a 30-day monthly amount.
        */
        const monthlyBudget = createEmptyScenario();

        EXPENSE_CATEGORIES.forEach((category) => {
          const savedBudget = budgets.find(
            (budget) => budget.category === category
          );

          monthlyBudget[category] = convertWeeklyToMonthly(
            savedBudget?.limit ?? 0
          );
        });

        setCurrentScenario(monthlyBudget);
        setDraftScenario({ ...monthlyBudget });
        setAppliedScenario({ ...monthlyBudget });

        /*
          There is currently no separate saved monthly income field
          being used by the Budget page.

          Use the user's Income transactions from the last 30 days
          as the initial shared monthly income.
        */
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);

        const monthlyIncome = (
          transactions as Transaction[]
        )
          .filter((transaction) => {
            if (transaction.type !== "Income") {
              return false;
            }

            const transactionDate = new Date(
              transaction.date
            );

            return (
              !Number.isNaN(transactionDate.getTime()) &&
              transactionDate >= cutoff
            );
          })
          .reduce(
            (total, transaction) =>
              total + transaction.amount,
            0
          );

        setIncome(monthlyIncome);
        setShowResults(false);
      } catch (error) {
        console.error(
          "Error loading What-If Planner:",
          error
        );

        setLoadError(
          "Unable to load your budget information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlannerData();
  }, [user]);

  const currentExpenses = useMemo(
    () => getScenarioTotal(currentScenario),
    [currentScenario]
  );

  const draftExpenses = useMemo(
    () => getScenarioTotal(draftScenario),
    [draftScenario]
  );

  const customExpenses = useMemo(
    () => getScenarioTotal(appliedScenario),
    [appliedScenario]
  );

  const currentRemaining =
    income - currentExpenses;

  const draftRemaining =
    income - draftExpenses;

  const customRemaining =
    income - customExpenses;

  const expenseDifference =
    customExpenses - currentExpenses;

  const remainingDifference =
    customRemaining - currentRemaining;


  const hasUnappliedChanges = useMemo(() => {
    return EXPENSE_CATEGORIES.some(
      (category) =>
        (draftScenario[category] ?? 0) !==
        (appliedScenario[category] ?? 0)
    );
  }, [draftScenario, appliedScenario]);






  const handleScenarioChange = (
    category: string,
    value: number
  ) => {
    setDraftScenario((previous) => ({
      ...previous,
      [category]: Math.max(0, value),
    }));

    setApplyMessage("");
  };

  const handleReset = () => {
    setDraftScenario({ ...currentScenario });
    setApplyMessage("");
    setShowResults(false);
  };

  const handleApplyChanges = () => {
    setAppliedScenario({ ...draftScenario });
    setApplyMessage(
      "Custom scenario applied. Your saved Budget has not been changed."
    );
    setShowResults(false);
  };

  const handleCompare = () => {
    if (hasUnappliedChanges) return;

    setShowResults(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-text px-12 py-10">
        <p className="text-inactive-text">
          Loading What-If Planner...
        </p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background text-text px-12 py-10">
        <div className="max-w-3xl rounded-xl border border-red-800 bg-red-950/30 p-5">
          <p className="font-semibold text-red-300">
            {loadError}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text px-8 py-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/15 p-3 text-blue-400">
              <WalletCards size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                What-If Planner
              </h1>

              <p className="mt-1 text-inactive-text">
                Compare your current monthly budget with
                a custom spending scenario.
              </p>
            </div>
          </div>
        </div>

        {/* Shared Income */}
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-widget p-6 shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Shared Income
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Monthly Income
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-inactive-text">
                This income is shared by both Scenario 1
                and Scenario 2. It starts with your Income
                transactions from the last 30 days, but
                you can change it here.
              </p>
            </div>

            <div className="w-full md:w-72">
              <label className="mb-2 block text-sm text-inactive-text">
                Monthly income
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-inactive-text">
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  step="10"
                  value={income}
                  onChange={(event) =>
                    setIncome(
                      Math.max(
                        0,
                        Number(event.target.value) || 0
                      )
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-secondary py-3 pl-9 pr-4 text-xl font-bold text-text outline-none transition focus:border-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-inactive-text">
                Used for both scenarios
              </p>
            </div>
          </div>
        </section>

        {/* Scenarios */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Scenario 1 */}
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-widget shadow-lg">
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                    Scenario 1
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Current Budget
                  </h2>
                </div>

                <span className="rounded-full border border-zinc-700 bg-secondary px-3 py-1 text-xs text-inactive-text">
                  Saved Budget
                </span>
              </div>

              <p className="mt-3 text-sm text-inactive-text">
                Your existing weekly budget limits are
                converted to monthly amounts for this
                comparison.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {EXPENSE_CATEGORIES.map(
                  (category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-secondary px-4 py-3"
                    >
                      <span className="text-sm font-medium">
                        {category}
                      </span>

                      <span className="font-semibold">
                        {formatCurrency(
                          currentScenario[category] ?? 0
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                <SummaryCard
                  label="Total Expenses"
                  value={formatCurrency(
                    currentExpenses
                  )}
                />

                <SummaryCard
                  label="Remaining Balance"
                  value={formatCurrency(
                    currentRemaining
                  )}
                  negative={currentRemaining < 0}
                  positive={currentRemaining > 0}
                />
              </div>
            </div>
          </section>

          {/* Scenario 2 */}
          <section className="overflow-hidden rounded-2xl bg-widget shadow-lg">
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                    Scenario 2
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Custom Scenario
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-secondary px-3 py-2 text-sm transition hover:border-zinc-500"
                >
                  <RefreshCcw size={15} />
                  Reset
                </button>
              </div>

              <p className="mt-3 text-sm text-inactive-text">
                Change individual expense categories to
                explore a different monthly budget.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {EXPENSE_CATEGORIES.map(
                  (category) => (
                    <div
                      key={category}
                      className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-secondary px-4 py-3"
                    >
                      <p className="text-sm font-medium">
                        {category}
                      </p>

                      <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-inactive-text">
                          $
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={
                            draftScenario[
                              category
                            ] ?? 0
                          }
                          onChange={(event) =>
                            handleScenarioChange(
                              category,
                              Number(
                                event.target.value
                              ) || 0
                            )
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-background py-2 pl-7 pr-3 text-right font-semibold outline-none transition focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                <SummaryCard
                  label="Total Expenses"
                  value={formatCurrency(
                    draftExpenses
                  )}
                />

                <SummaryCard
                  label="Remaining Balance"
                  value={formatCurrency(
                    draftRemaining
                  )}
                  negative={draftRemaining < 0}
                  positive={draftRemaining > 0}
                />
              </div>

              <button
                type="button"
                onClick={handleApplyChanges}
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Apply Changes
              </button>

              <p className="mt-3 text-center text-xs text-inactive-text">
                Apply Changes only updates this What-If
                scenario. It does not overwrite your saved
                Budget.
              </p>

              {applyMessage && (
                <p className="mt-3 rounded-lg border border-green-900 bg-green-950/30 p-3 text-center text-sm text-green-300">
                  {applyMessage}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Compare */}
        <section className="my-8 rounded-2xl border border-zinc-800 bg-widget p-6">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div>
              <h2 className="text-xl font-bold">
                Ready to compare?
              </h2>

              <p className="mt-1 text-sm text-inactive-text">
                Apply your Scenario 2 changes first, then
                compare the two monthly scenarios.
              </p>

              {hasUnappliedChanges && (
                <p className="mt-2 text-sm font-medium text-orange-400">
                  You have unapplied changes in Scenario 2.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCompare}
              disabled={hasUnappliedChanges}
              className="flex min-w-52 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare Scenarios
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* Comparison Preview */}
        {showResults && (
          <section className="mb-8 rounded-2xl bg-widget p-6 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Comparison Preview
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Basic Scenario Comparison
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-inactive-text">
              Scenario 1 and Scenario 2 use the same monthly income of{" "}
              <span className="font-semibold text-text">
                {formatCurrency(income)}
              </span>
              . A basic monthly comparison is shown below. Detailed charts and
              insights can be added in the next development stage.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-secondary p-5">
                <p className="text-sm font-semibold">
                  Total Expenses
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">
                      Scenario 1
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(currentExpenses)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">
                      Scenario 2
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(customExpenses)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <p className="text-xs text-inactive-text">
                    Difference
                  </p>
                  <p
                    className={`mt-1 font-bold ${
                      expenseDifference > 0
                        ? "text-red-400"
                        : expenseDifference < 0
                          ? "text-green-400"
                          : ""
                    }`}
                  >
                    {expenseDifference === 0
                      ? "No change"
                      : expenseDifference > 0
                        ? `${formatCurrency(
                            expenseDifference
                          )} more spending`
                        : `${formatCurrency(
                            Math.abs(expenseDifference)
                          )} less spending`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-secondary p-5">
                <p className="text-sm font-semibold">
                  Remaining Balance
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">
                      Scenario 1
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(currentRemaining)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">
                      Scenario 2
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(customRemaining)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <p className="text-xs text-inactive-text">
                    Difference
                  </p>
                  <p
                    className={`mt-1 font-bold ${
                      remainingDifference > 0
                        ? "text-green-400"
                        : remainingDifference < 0
                          ? "text-red-400"
                          : ""
                    }`}
                  >
                    {remainingDifference === 0
                      ? "No change"
                      : remainingDifference > 0
                        ? `${formatCurrency(
                            remainingDifference
                          )} more remaining`
                        : `${formatCurrency(
                            Math.abs(remainingDifference)
                          )} less remaining`}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
};

function SummaryCard({
  label,
  value,
  positive = false,
  negative = false,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <p className="text-xs text-inactive-text">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-bold ${
          negative
            ? "text-red-400"
            : positive
              ? "text-green-400"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

