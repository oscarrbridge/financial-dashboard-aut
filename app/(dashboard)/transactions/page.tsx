



"use client";

import { useState } from "react";

type Transaction = {
  id: number;
  description: string;
  amount: string;
};


export default function TransactionsPage() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  function handleAddTransaction() {
    if (description === "" || amount === "") {
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      description,
      amount,
    };

    setTransactions([...transactions, newTransaction]);

    setDescription("");
    setAmount("");
  }

  function handleDeleteTransaction(id: number) {
    const updatedTransactions = transactions.filter(
      (transaction) => transaction.id !== id
    );

    setTransactions(updatedTransactions);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">
          Transactions
        </h1>

        <p className="mt-2 text-slate-600">
          Add and manage manual transactions.
        </p>

        <section className="mt-8 rounded-lg border border-slate-200 p-5">
          <h2 className="text-xl font-semibold text-slate-800">
            Add Transaction
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <input
              className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />

            <button
              className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700"
              onClick={handleAddTransaction}
            >
              Add Transaction
            </button>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">
            Transaction List
          </h2>

          <div className="mt-4 space-y-3">
            {transactions.length === 0 ? (
              <p className="text-slate-500">
                No transactions added yet.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {transaction.description}
                    </p>

                    <p className="text-sm text-slate-500">
                      Manual transaction
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-slate-900">
                      ${transaction.amount}
                    </p>

                    <button
                      className="rounded-md bg-red-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600"
                      onClick={() =>
                        handleDeleteTransaction(transaction.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}