"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowRight, BarChart3, RefreshCcw, TrendingUp } from "lucide-react";

import { requireAuth } from "@/lib/firebase/requireAuth";

import { EXPENSE_CATEGORIES, getUserBudgets } from "@/lib/firebase/budgets";

import {
  getUserTransactions,
  type Transaction,
} from "@/lib/firebase/transactions";

type ScenarioValues = Record<string, number>;

function createEmptyScenario(): ScenarioValues {
  return Object.fromEntries(
    EXPENSE_CATEGORIES.map((category) => [category, 0]),
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

    0,
  );
}

export default function WhatIfPlannerPage() {
  const { user } = requireAuth();

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  // One shared income value for both scenarios.

  const [income, setIncome] = useState(0);

  const [isIncomeFocused, setIsIncomeFocused] = useState(false);

  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  // Scenario 1 - current saved budget.

  const [currentScenario, setCurrentScenario] = useState<ScenarioValues>(() =>
    createEmptyScenario(),
  );

  // Editable values currently shown in Scenario 2.

  const [draftScenario, setDraftScenario] = useState<ScenarioValues>(() =>
    createEmptyScenario(),
  );

  // Values that have been applied for comparison.

  const [appliedScenario, setAppliedScenario] = useState<ScenarioValues>(() =>
    createEmptyScenario(),
  );

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
            (budget) => budget.category === category,
          );

          monthlyBudget[category] = convertWeeklyToMonthly(
            savedBudget?.limit ?? 0,
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

        const monthlyIncome = (transactions as Transaction[])

          .filter((transaction) => {
            if (transaction.type !== "Income") {
              return false;
            }

            const transactionDate = new Date(transaction.date);

            return (
              !Number.isNaN(transactionDate.getTime()) &&
              transactionDate >= cutoff
            );
          })

          .reduce(
            (total, transaction) => total + transaction.amount,

            0,
          );

        setIncome(monthlyIncome);

        setShowResults(false);
      } catch (error) {
        console.error(
          "Error loading What-If Planner:",

          error,
        );

        setLoadError(
          "Unable to load your budget information. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlannerData();
  }, [user]);

  const currentExpenses = useMemo(
    () => getScenarioTotal(currentScenario),

    [currentScenario],
  );

  const draftExpenses = useMemo(
    () => getScenarioTotal(draftScenario),

    [draftScenario],
  );

  const customExpenses = useMemo(
    () => getScenarioTotal(appliedScenario),

    [appliedScenario],
  );

  const currentRemaining = income - currentExpenses;

  const draftRemaining = income - draftExpenses;

  const customRemaining = income - customExpenses;

  const expenseDifference = customExpenses - currentExpenses;

  const remainingDifference = customRemaining - currentRemaining;

  const maxCategoryAmount = useMemo(() => {
    const values = EXPENSE_CATEGORIES.flatMap((category) => [
      currentScenario[category] ?? 0,

      appliedScenario[category] ?? 0,
    ]);

    return Math.max(1, ...values);
  }, [currentScenario, appliedScenario]);

  const hasUnappliedChanges = useMemo(() => {
    return EXPENSE_CATEGORIES.some(
      (category) =>
        (draftScenario[category] ?? 0) !== (appliedScenario[category] ?? 0),
    );
  }, [draftScenario, appliedScenario]);

  const handleScenarioChange = (
    category: string,

    value: number,
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
      "Custom scenario applied. Your saved Budget has not been changed.",
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
        <p className="text-inactive-text">Loading What-If Planner...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background text-text px-12 py-10">
        <div className="max-w-3xl rounded-xl border border-red-800 bg-red-950/30 p-5">
          <p className="font-semibold text-red-300">{loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text px-8 py-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">What-If Planner</h1>

          <p className="mt-1 text-inactive-text">
            Compare your current monthly budget with a custom spending scenario.
          </p>
        </div>

        {/* Shared Income */}

        <section className="mb-8 rounded-2xl border border-zinc-800 bg-widget p-6 shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Shared Income
              </p>

              <h2 className="mt-1 text-2xl font-bold">Monthly Income</h2>

              <p className="mt-2 max-w-2xl text-sm text-inactive-text">
                This income is shared by both Scenario 1 and Scenario 2. It
                starts with your Income transactions from the last 30 days, but
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
                  value={income === 0 && isIncomeFocused ? "" : income}
                  onFocus={() => setIsIncomeFocused(true)}
                  onBlur={() => setIsIncomeFocused(false)}
                  onChange={(event) =>
                    setIncome(
                      Math.max(
                        0,

                        Number(event.target.value) || 0,
                      ),
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-secondary py-3 pl-9 pr-4 text-xl font-bold text-text outline-none transition focus:border-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-inactive-text">
                Initial value based on income transactions from the last 30
                days.
                <br />
                Used for both scenarios.
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

                  <h2 className="mt-1 text-2xl font-bold">Current Budget</h2>
                </div>

                <span className="rounded-full border border-zinc-700 bg-secondary px-3 py-1 text-xs text-inactive-text">
                  Saved Budget
                </span>
              </div>

              <p className="mt-3 text-sm text-inactive-text">
                Your existing weekly budget limits are converted to monthly
                amounts for this comparison.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {EXPENSE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-secondary px-4 py-3"
                  >
                    <span className="text-sm font-medium">{category}</span>

                    <span className="font-semibold">
                      {formatCurrency(currentScenario[category] ?? 0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                <SummaryCard
                  label="Total Expenses"
                  value={formatCurrency(currentExpenses)}
                />

                <SummaryCard
                  label="Remaining Balance"
                  value={formatCurrency(currentRemaining)}
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

                  <h2 className="mt-1 text-2xl font-bold">Custom Scenario</h2>
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
                Change individual expense categories to explore a different
                monthly budget.
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {EXPENSE_CATEGORIES.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-secondary px-4 py-3"
                  >
                    <p className="text-sm font-medium">{category}</p>

                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-inactive-text">
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={
                          draftScenario[category] === 0 &&
                          focusedCategory === category
                            ? ""
                            : (draftScenario[category] ?? 0)
                        }
                        onFocus={() => setFocusedCategory(category)}
                        onBlur={() => setFocusedCategory(null)}
                        onChange={(event) =>
                          handleScenarioChange(
                            category,

                            Number(event.target.value) || 0,
                          )
                        }
                        className="w-full rounded-lg border border-zinc-700 bg-background py-2 pl-7 pr-3 text-right font-semibold outline-none transition focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
                <SummaryCard
                  label="Total Expenses"
                  value={formatCurrency(draftExpenses)}
                />

                <SummaryCard
                  label="Remaining Balance"
                  value={formatCurrency(draftRemaining)}
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
                Apply Changes only updates this What-If scenario. It does not
                overwrite your saved Budget.
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
              <h2 className="text-xl font-bold">Ready to compare?</h2>

              <p className="mt-1 text-sm text-inactive-text">
                Apply your Scenario 2 changes first, then compare the two
                monthly scenarios.
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

        {/* Comparison Results */}

        {showResults && (
          <section className="mb-8 rounded-2xl bg-widget p-6 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
              Comparison Preview
            </p>

            <h2 className="mt-1 text-2xl font-bold">Scenario Comparison</h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-inactive-text">
              Scenario 1 and Scenario 2 use the same monthly income of{" "}
              <span className="font-semibold text-text">
                {formatCurrency(income)}
              </span>
              . The summary below compares the main financial differences and
              monthly spending categories.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-secondary p-5">
                <p className="text-sm font-semibold">Total Expenses</p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">Scenario 1</span>

                    <span className="font-semibold">
                      {formatCurrency(currentExpenses)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">Scenario 2</span>

                    <span className="font-semibold">
                      {formatCurrency(customExpenses)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <p className="text-xs text-inactive-text">Difference</p>

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
                        ? `${formatCurrency(expenseDifference)} more spending`
                        : `${formatCurrency(
                            Math.abs(expenseDifference),
                          )} less spending`}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-secondary p-5">
                <p className="text-sm font-semibold">Remaining Balance</p>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">Scenario 1</span>

                    <span className="font-semibold">
                      {formatCurrency(currentRemaining)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-inactive-text">Scenario 2</span>

                    <span className="font-semibold">
                      {formatCurrency(customRemaining)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <p className="text-xs text-inactive-text">Difference</p>

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
                            remainingDifference,
                          )} more remaining`
                        : `${formatCurrency(
                            Math.abs(remainingDifference),
                          )} less remaining`}
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Spending by Category */}

            <div className="mt-6 rounded-xl bg-secondary p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <BarChart3
                    size={21}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <div>
                    <h3 className="text-xl font-semibold">
                      Monthly Spending by Category
                    </h3>

                    <p className="mt-1 text-sm text-inactive-text">
                      Scenario 1 and Scenario 2 spending by category.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-4 text-xs text-inactive-text">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                    Scenario 1
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
                    Scenario 2
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[680px] space-y-3">
                  {EXPENSE_CATEGORIES.map((category) => {
                    const currentAmount = currentScenario[category] ?? 0;

                    const customAmount = appliedScenario[category] ?? 0;

                    const currentWidth =
                      (currentAmount / maxCategoryAmount) * 100;

                    const customWidth =
                      (customAmount / maxCategoryAmount) * 100;

                    return (
                      <div
                        key={category}
                        className="grid grid-cols-[140px_1fr_190px] items-center gap-3"
                      >
                        <p
                          className="truncate text-sm font-medium"
                          title={category}
                        >
                          {category}
                        </p>

                        <div className="space-y-1.5">
                          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${currentWidth}%` }}
                            />
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-violet-500 transition-all duration-500"
                              style={{ width: `${customWidth}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-right text-xs text-inactive-text">
                          {formatCurrency(currentAmount)}

                          {" → "}

                          {formatCurrency(customAmount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Projected Savings */}
            <div className="mt-6 rounded-xl bg-secondary p-5">
              <div className="flex items-start gap-3">
                <TrendingUp
                  size={21}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div>
                  <h3 className="text-xl font-semibold">Projected Savings</h3>

                  <p className="mt-1 text-sm text-inactive-text">
                    Projection over the next 12 months if the same monthly
                    income and spending continue.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <ProjectionChart
                  currentMonthly={currentRemaining}
                  customMonthly={customRemaining}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

type ProjectionChartProps = {
  currentMonthly: number;
  customMonthly: number;
};

function ProjectionChart({
  currentMonthly,
  customMonthly,
}: ProjectionChartProps) {
  const width = 900;
  const height = 260;

  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 42;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const currentValues = Array.from(
    { length: 13 },
    (_, month) => currentMonthly * month,
  );

  const customValues = Array.from(
    { length: 13 },
    (_, month) => customMonthly * month,
  );

  const allValues = [0, ...currentValues, ...customValues];
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const range = maximum - minimum || 1;

  const getX = (month: number) => paddingLeft + (month / 12) * chartWidth;

  const getY = (value: number) =>
    paddingTop + ((maximum - value) / range) * chartHeight;

  const currentPoints = currentValues
    .map((value, month) => `${getX(month)},${getY(value)}`)
    .join(" ");

  const customPoints = customValues
    .map((value, month) => `${getX(month)},${getY(value)}`)
    .join(" ");

  const zeroY = getY(0);
  const monthLabels = [0, 3, 6, 9, 12];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-inactive-text">
        <div className="flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-blue-500" />
          Scenario 1
        </div>

        <div className="flex items-center gap-2">
          <span className="h-1 w-6 rounded bg-violet-500" />
          Scenario 2
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[680px] w-full"
          role="img"
          aria-label="Projected savings comparison over 12 months"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((position) => {
            const y = paddingTop + chartHeight * position;

            return (
              <line
                key={position}
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-zinc-800"
                strokeWidth="1"
              />
            );
          })}

          <line
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={zeroY}
            y2={zeroY}
            stroke="currentColor"
            className="text-zinc-500"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />

          <polyline
            points={currentPoints}
            fill="none"
            stroke="currentColor"
            className="text-blue-500"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={customPoints}
            fill="none"
            stroke="currentColor"
            className="text-violet-500"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {monthLabels.map((month) => (
            <g key={month}>
              <line
                x1={getX(month)}
                x2={getX(month)}
                y1={paddingTop}
                y2={height - paddingBottom}
                stroke="currentColor"
                className="text-zinc-800"
                strokeWidth="1"
              />

              <text
                x={getX(month)}
                y={height - 14}
                textAnchor="middle"
                fill="currentColor"
                className="text-inactive-text"
                fontSize="13"
              >
                {month === 0 ? "Now" : `${month} mo`}
              </text>
            </g>
          ))}

          <text
            x={8}
            y={getY(maximum) + 5}
            fill="currentColor"
            className="text-inactive-text"
            fontSize="12"
          >
            {formatCompactCurrency(maximum)}
          </text>

          <text
            x={8}
            y={getY(minimum) + 5}
            fill="currentColor"
            className="text-inactive-text"
            fontSize="12"
          >
            {formatCompactCurrency(minimum)}
          </text>
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-background p-4">
          <p className="text-xs text-inactive-text">
            Scenario 1 after 12 months
          </p>

          <p
            className={`mt-1 text-lg font-bold ${
              currentMonthly * 12 < 0 ? "text-red-400" : "text-blue-400"
            }`}
          >
            {formatCurrency(currentMonthly * 12)}
          </p>
        </div>

        <div className="rounded-xl bg-background p-4">
          <p className="text-xs text-inactive-text">
            Scenario 2 after 12 months
          </p>

          <p
            className={`mt-1 text-lg font-bold ${
              customMonthly * 12 < 0 ? "text-red-400" : "text-violet-400"
            }`}
          >
            {formatCurrency(customMonthly * 12)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatCompactCurrency(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1000000) {
    return `${value < 0 ? "-" : ""}$${(absolute / 1000000).toFixed(1)}m`;
  }

  if (absolute >= 1000) {
    return `${value < 0 ? "-" : ""}$${(absolute / 1000).toFixed(1)}k`;
  }

  return `${value < 0 ? "-" : ""}$${absolute.toFixed(0)}`;
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
      <p className="text-xs text-inactive-text">{label}</p>

      <p
        className={`mt-1 text-xl font-bold ${
          negative ? "text-red-400" : positive ? "text-green-400" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
