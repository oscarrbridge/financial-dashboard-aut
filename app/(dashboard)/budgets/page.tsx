export default function BudgetPage() {
  return (
    <main className="min-h-screen bg-background text-text p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Budgets</h1>

      <p className="mt-2 text-inactive-text">
        Manage your monthly budget limits and spending alerts.
      </p>

      <button className="bg-widget border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 hover:scale-105 transition-all duration-200">
        Save Budgets
      </button>

      <h2 className="text-2xl font-semibold mt-10 mb-4">
        Budget Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
        <div className="bg-widget p-6 rounded-lg border border-zinc-800">
          <h2 className="text-inactive-text text-sm">Total Budget</h2>
          <p className="text-3xl font-bold mt-2">$2,500</p>
          <p className="text-sm text-inactive-text mt-2">
            Monthly planned spending
          </p>
        </div>

        <div className="bg-widget p-6 rounded-lg border border-zinc-800">
          <h2 className="text-inactive-text text-sm">Total Spent</h2>
          <p className="text-3xl font-bold mt-2">$1,420</p>
          <p className="text-sm text-inactive-text mt-2">
            Current expenses tracked
          </p>
        </div>

        <div className="bg-widget p-6 rounded-lg border border-zinc-800">
          <h2 className="text-inactive-text text-sm">Remaining</h2>
          <p className="text-3xl font-bold mt-2">$1,080</p>
          <p className="text-sm text-inactive-text mt-2">
            Available budget remaining
          </p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Budget Categories</h2>

          <button className="bg-widget border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 hover:scale-105 transition-all duration-200">
            + Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <section className="bg-widget p-6 rounded-lg border border-zinc-800 h-full">
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-3">
              <h3 className="text-2xl font-bold">Category</h3>
              <h3 className="text-2xl font-bold">Budget Limit</h3>
            </div>

            {[
              ["Technology / Electronics", "$90 / $120"],
              ["Accommodation", "$90 / $120"],
              ["Groceries", "$200 / $300"],
              ["Transport", "$200 / $150"],
              ["Education", "$90 / $120"],
              ["Entertainment", "$104 / $200"],
              ["Utilities", "$90 / $120"],
              ["Personal Care", "$90 / $120"],
              ["Other", "$90 / $120"],
            ].map(([category, budget]) => (
              <div
                key={category}
                className="grid grid-cols-2 gap-4 border-b border-zinc-800 py-3 text-sm"
              >
                <p>{category}</p>
                <p>{budget}</p>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button className="bg-widget border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 hover:scale-105 transition-all duration-200">
                Edit
              </button>
            </div>
          </section>

          <section className="bg-widget p-6 rounded-lg border border-zinc-800">
            <h3 className="text-2xl font-bold mb-4">Budget Alerts</h3>

            <div className="space-y-4">
              <div className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                <p className="text-sm">
                  Groceries has reached 80% of its budget.
                </p>
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
              </div>

              <div className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                <p className="text-sm">
                  Transport budget has been exceeded.
                </p>
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}