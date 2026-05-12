export default function BudgetPage() {
  return (
    <main className="min-h-screen bg-background text-text p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Budgets</h1>

      <p className="mt-2 text-inactive-text">
        Manage your monthly budget limits and spending alerts.
      </p>

      <button className="mt-6 bg-widget border border-zinc-700 text-text px-5 py-3 rounded-lg font-medium hover:bg-zinc-800 transition-all duration-200">
        Save Budgets
      </button>

      {/* Summary Cards */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">
      Budget Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

        <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]">
          <h2 className="text-inactive-text text-sm">
            Total Budget
          </h2>

          <p className="text-3xl font-bold mt-2">
            $2,500
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Monthly planned spending
          </p>
        </div>

        <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]">
          <h2 className="text-inactive-text text-sm">
            Total Spent
          </h2>

          <p className="text-3xl font-bold mt-2">
            $1,420
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Current expenses tracked
          </p>
        </div>

        <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]">
          <h2 className="text-inactive-text text-sm">
            Remaining
          </h2>

          <p className="text-3xl font-bold mt-2">
            $1,080
          </p>

          <p className="text-sm text-inactive-text mt-2">
            Available budget remaining
          </p>
        </div>

      </div>

      {/* Budget Categories */}
      <div className="mt-10">

        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
          ⚠️ Warning: Transport spending has exceeded the allocated budget.
  </div>
        <div className="flex items-center justify-between mb-4">
  <h2 className="text-2xl font-semibold">
    Budget Categories
  </h2>

  <button className="bg-widget border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 transition-all duration-200">
    + Add Category
  </button>
</div>

        <div className="bg-widget p-6 rounded-lg border border-zinc-800">

          {/* Food */}
          <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] mt-4">
  <div className="flex items-start justify-between gap-4">

    <div className="flex-1">
      <h3 className="font-semibold text-lg">
        Food & Groceries
      </h3>

      <p className="text-sm text-inactive-text mt-1">
        Track grocery and dining expenses.
      </p>

      <div className="mt-4">
        <label className="text-sm text-inactive-text">
          Budget Limit
        </label>

        <input
          type="number"
          defaultValue={300}
          placeholder="Enter budget"
          className="w-full mt-2 bg-secondary text-text p-3 rounded-md outline-none border border-zinc-700"
        />

        <p className="text-sm text-inactive-text mt-3">
          Spent: $200
        </p>
      </div>
    </div>

    <button className="bg-secondary border border-zinc-700 px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-all duration-200">
      Edit
    </button>

  </div>

  <div className="w-full bg-secondary rounded-full h-3 mt-6">
    <div className="bg-green-500 h-3 rounded-full w-2/3"></div>
  </div>

  <div className="flex items-center justify-between mt-3">
    <p className="text-green-400 font-medium">
      Within Budget
    </p>

    <p className="text-inactive-text text-sm">
      67% used
    </p>
  </div>
</div>

          {/* Transport */}
          <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] mt-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  Transport
                  <p className="text-sm text-inactive-text mt-1">
                    Monitor travel and commuting costs.
                  </p>
                </h3>

                <div className="mt-2">
                  <label className="text-sm text-inactive-text">
                    Budget Limit
                  </label>

                  <input
                    type="number"
                    defaultValue={150}
                    placeholder="Enter budget"
                    className="w-full mt-2 bg-secondary text-text p-3 rounded-md outline-none border border-zinc-700 focus:border-white transition-all duration-200"
                  />
                  <p className="text-sm text-inactive-text mt-3">
                    Spent: $200
                  </p>
                </div>
              </div>
              <button className="bg-secondary border border-zinc-700 px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-all duration-200">
              Edit
    </button>
            </div>

            <div className="w-full bg-secondary rounded-full h-3 mt-4">
              <div className="bg-red-500 h-3 rounded-full w-5/6"></div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-red-400 font-medium">
                Over Budget
              </p>

              <p className="text-inactive-text text-sm">
                83% used
              </p>
            </div>
          </div>

          {/* Entertainment */}
          <div className="bg-widget p-6 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] mt-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  Entertainment
                  <p className="text-sm text-inactive-text mt-1">
                    Manage leisure and subscription spending.
                  </p>
                </h3>

                <div className="mt-2">
                  <label className="text-sm text-inactive-text">
                    Budget Limit
                  </label>

                  <input
                    type="number"
                    defaultValue={200}
                    placeholder="Enter budget"
                    className="w-full mt-2 bg-secondary text-text p-3 rounded-md outline-none border border-zinc-700 focus:border-white transition-all duration-200"
                  />
                  <p className="text-sm text-inactive-text mt-3">
                    Spent: $104
                  </p>
                </div>
              </div>
              <button className="bg-secondary border border-zinc-700 px-3 py-2 rounded-md text-sm hover:bg-zinc-800 transition-all duration-200">
      Edit
    </button>
            </div>

            <div className="w-full bg-secondary rounded-full h-3 mt-4">
              <div className="bg-purple-500 h-3 rounded-full w-1/2"></div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-purple-400 font-medium">
                Moderate Spending
              </p>

              <p className="text-inactive-text text-sm">
                52% used
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}