"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function BudgetPage() {
  const [categories, setCategories] = useState([
    { name: "Groceries", spent: 200, limit: 300 },
    { name: "Transport", spent: 200, limit: 150 },
    { name: "Entertainment", spent: 104, limit: 200 },
  ]);

  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");
  const [newSpent, setNewSpent] = useState("");
  const [budgetPeriod, setBudgetPeriod] = useState("Monthly");

  const totalBudget = categories.reduce(
    (total, category) => total + category.limit,
    0
  );

  const totalSpent = categories.reduce(
    (total, category) => total + category.spent,
    0
  );

  const remainingBudget = totalBudget - totalSpent;

  const alerts = categories
  .filter(
    (category) =>
      category.spent > category.limit ||
      category.spent > category.limit * 0.8
  )
  .sort(
    (a, b) =>
      b.spent / b.limit - a.spent / a.limit
  );

  function addCategory() {
    if (!newCategory || !newLimit) return;

    setCategories([
      ...categories,
      {
        name: newCategory,
        spent: Number(newSpent),
        limit: Number(newLimit),
      },
    ]);

    setNewCategory("");
    setNewLimit("");
    setNewSpent("");
  }

  return (
    <main className="min-h-screen bg-background text-text px-12 py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Budgets</h1>

      <p className="mt-2 text-inactive-text">
        Manage your budget limits and spending alerts.
      </p>

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

      <div className="flex items-center gap-3 mt-10 mb-4">
        <h2 className="text-2xl font-semibold">
          Budget Overview
        </h2>

        <span className="bg-secondary text-inactive-text text-xs px-3 py-1 rounded-full self-center">
          {budgetPeriod}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">Total Budget</h2>

          <p className="text-3xl font-bold mt-2">
            ${totalBudget}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Monthly planned spending
          </p>
        </div>

        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">Total Spent</h2>

          <p className="text-3xl font-bold mt-2">
            ${totalSpent}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Current expenses tracked
          </p>
        </div>

        <div className="bg-widget p-6 rounded-2xl border border-zinc-800 hover:border-zinc-600 hover:-translate-y-1 transition-all duration-200 shadow-lg">
          <h2 className="text-inactive-text text-sm">Remaining</h2>

          <p className="text-3xl font-bold mt-2">
            ${remainingBudget}
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Available budget remaining
          </p>
        </div>
      </div>

      <div className="mt-10">
      <div className="max-w-5xl">
        <div className="flex items-center gap-3 mt-6 mb-4">
          <p className="text-sm text-inactive-text">
            Budget period:
          </p>

          <select
            value={budgetPeriod}
            onChange={(event) => setBudgetPeriod(event.target.value)}
            className="bg-widget border border-zinc-700 px-3 py-2 rounded-lg outline-none"
          >
            <option>Weekly</option>
            <option>Fortnightly</option>
            <option>Monthly</option>
          </select>
        </div>
      </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Budget Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="bg-widget p-6 rounded-lg border border-zinc-800 h-full">
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-3">
              <h3 className="text-2xl font-bold">
                Category
              </h3>

              <h3 className="text-2xl font-bold">
                Budget Limit
              </h3>
            </div>

              {categories.length === 0 ? (
                <div className="py-8 text-center text-inactive-text border-b border-zinc-800">
                  <p>No budget categories yet.</p>

                  <p className="text-sm mt-1">
                    Add a category to start managing your budget.
                  </p>
                </div>
              ) : (
                categories.map((category) => (
              <div
                key={category.name}
                className="border-b border-zinc-800 py-4"
              >
                <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center">
                  <p>{category.name}</p>

                  <div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={category.spent || 0}
                      onChange={(event) => {
                        const updatedCategories = categories.map((item) =>
                          item.name === category.name
                            ? {
                                ...item,
                                spent: Number(event.target.value) || 0,
                              }
                            : item
                        );

                        setCategories(updatedCategories);
                      }}
                      className="w-full accent-white cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] text-inactive-text mt-2 gap-4">
                        <span>Spent: ${category.spent}</span>

                        <span>Budget: ${category.limit}</span>
                      </div>

                    <div className="w-full bg-zinc-800 rounded-full h-2 mt-4">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          category.spent > category.limit
                            ? "bg-red-500"
                            : category.spent > category.limit * 0.8
                            ? "bg-orange-400"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (category.spent / category.limit) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const updatedCategories = categories.filter(
                        (item) => item.name !== category.name
                      );

                      setCategories(updatedCategories);
                    }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
            )}

            <div className="mt-6 bg-secondary p-4 rounded-xl border border-zinc-800">
              <h4 className="font-semibold mb-3">
                Add New Category
              </h4>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(event.target.value)
                  }
                  placeholder="Category"
                  className="bg-widget border border-zinc-700 px-4 py-3 rounded-xl outline-none focus:border-zinc-500 transition-all duration-200"
                />

                <input
                  type="number"
                  value={newLimit}
                  onChange={(event) =>
                    setNewLimit(event.target.value)
                  }
                  placeholder="Limit"
                  className="bg-widget border border-zinc-700 px-4 py-3 rounded-xl outline-none focus:border-zinc-500 transition-all duration-200"
                />

                <input
                  type="number"
                  value={newSpent}
                  onChange={(event) =>
                    setNewSpent(event.target.value)
                  }
                  placeholder="Amount"
                  className="bg-widget border border-zinc-700 px-4 py-3 rounded-xl outline-none focus:border-zinc-500 transition-all duration-200"
                />
              </div>
              <button
                onClick={addCategory}
                className="mt-4 bg-widget border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 hover:scale-105 transition-all duration-200"
              >
                + Add Category
              </button>
            </div>
          </section>

          <section className="bg-widget p-6 rounded-lg border border-zinc-800 min-h-[440px] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              Budget Alerts
            </h3>

            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((category) => (
                  <div
                    key={category.name}
                    className="bg-secondary p-4 rounded-xl flex items-center justify-between border border-zinc-800 hover:border-zinc-600 transition-all duration-200"
                  >
                    <p className="text-sm">
                      {category.spent > category.limit
                        ? `${category.name} budget has been exceeded.`
                        : `${category.name} has reached 80% of its budget.`}
                    </p>

                    <span
                      className={`w-3 h-3 rounded-full ${
                        category.spent > category.limit
                          ? "bg-red-500"
                          : "bg-orange-400"
                      }`}
                    ></span>
                  </div>
                ))
              ) : (
                <div className="bg-secondary p-4 rounded-xl border border-zinc-800">
                  <p className="text-sm text-inactive-text">
                    No active budget alerts.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}