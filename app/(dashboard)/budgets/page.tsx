export default function BudgetPage() {
  return (
    <main className="min-h-screen bg-background text-text p-8">
      <h1 className="text-3xl font-bold">Budgets</h1>
      <p className="mt-2 text-inactive-text">
        Manage your monthly budget limits and spending alerts.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

  <div className="bg-widget p-6 rounded-lg">
    <h2 className="text-inactive-text text-sm">Total Budget</h2>
    <p className="text-3xl font-bold mt-2">$2,500</p>
  </div>

  <div className="bg-widget p-6 rounded-lg">
    <h2 className="text-inactive-text text-sm">Total Spent</h2>
    <p className="text-3xl font-bold mt-2">$1,420</p>
  </div>

  <div className="bg-widget p-6 rounded-lg">
    <h2 className="text-inactive-text text-sm">Remaining</h2>
    <p className="text-3xl font-bold mt-2">$1,080</p>
  </div>

</div>

    <div className="mt-10">
  <h2 className="text-2xl font-semibold mb-4">
    Budget Categories
  </h2>

  <div className="bg-widget p-6 rounded-lg">

    <div className="bg-widget p-6 rounded-lg">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold">Food & Groceries</h3>

      <div className="mt-2">
  <label className="text-sm text-inactive-text">
    Budget Limit
  </label>

  <input
    type="number"
    placeholder="Enter budget"
    className="w-full mt-2 bg-secondary text-text p-3 rounded-md outline-none"
  />
</div>
    </div>

  
  </div>

  <div className="w-full bg-secondary rounded-full h-3 mt-4">
    <div className="bg-green-500 h-3 rounded-full w-2/3"></div>
  </div>

  <p className="text-green-400 font-medium mt-3">
  Within Budget
</p>
</div>

<div className="bg-widget p-6 rounded-lg mt-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold">Transport</h3>

      <div className="mt-2">
        <label className="text-sm text-inactive-text">
          Budget Limit
        </label>

        <input
          type="number"
          placeholder="Enter budget"
          className="w-full mt-2 bg-secondary text-text p-3 rounded-md outline-none"
        />
      </div>
    </div>
  </div>

  <div className="w-full bg-secondary rounded-full h-3 mt-4">
    <div className="bg-red-500 h-3 rounded-full w-5/6"></div>
  </div>

  <p className="text-red-400 font-medium mt-3">
    Over Budget
  </p>
</div>

  </div>
</div>
    </main>
  );
}