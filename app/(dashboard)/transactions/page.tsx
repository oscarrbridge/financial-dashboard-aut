"use client";

import { useState } from "react";

type TransactionType = "Expense" | "Income" | "Debt";

type Transaction = {
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
};

const categoryOptions: Record<TransactionType, string[]> = {
  Expense: [
    "Accommodation",
    "Utilities",
    "Transport",
    "Groceries",
    "Entertainment",
    "Education",
    "Personal Care",
  ],
  Income: ["Wages", "Scholarship", "Student Allowance", "Family Support"],
  Debt: ["Student Loan", "Credit Card", "Personal Loan"],
};

export default function TransactionsPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;

  const [transactionType, setTransactionType] =
    useState<TransactionType>("Expense");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      description: "Mc Donalds",
      amount: 17.8,
      category: "Groceries",
      date: "2028-04-22",
      type: "Expense",
    },
    {
      description: "Income",
      amount: 382.44,
      category: "Wages",
      date: "2028-04-21",
      type: "Income",
    },
    {
      description: "Student Loan",
      amount: 1200,
      category: "Student Loan",
      date: "2028-04-20",
      type: "Debt",
    },
    {
      description: "Spotify",
      amount: 6.99,
      category: "Entertainment",
      date: "2028-04-19",
      type: "Expense",
    },
    {
      description: "Bus",
      amount: 4.5,
      category: "Transport",
      date: "2028-04-18",
      type: "Expense",
    },
    {
      description: "Scholarship",
      amount: 500,
      category: "Scholarship",
      date: "2028-04-17",
      type: "Income",
    },
    {
      description: "Rent",
      amount: 280,
      category: "Accommodation",
      date: "2028-04-16",
      type: "Expense",
    },
  ]);

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const addTransaction = () => {
    if (description === "" || amount === "" || transactionDate === "") {
      return;
    }

    const newTransaction: Transaction = {
      description,
      amount: Number(amount),
      category: category === "" ? "Auto" : category,
      date: transactionDate,
      type: transactionType,
    };

    setTransactions([newTransaction, ...transactions]);

    setDescription("");
    setAmount("");
    setCategory("");
    setTransactionDate("");
    setTransactionType("Expense");
    setCurrentPage(1);
    setShowPopup(false);
  };

  const toggleSelectTransaction = (actualIndex: number) => {
    if (selectedTransactions.includes(actualIndex)) {
      setSelectedTransactions(
        selectedTransactions.filter(
          (selectedIndex) => selectedIndex !== actualIndex
        )
      );
    } else {
      setSelectedTransactions([...selectedTransactions, actualIndex]);
    }
  };

  const toggleSelectAll = () => {
    const currentPageIndexes = currentTransactions.map(
      (_, index) => startIndex + index
    );

    const allCurrentSelected = currentPageIndexes.every((index) =>
      selectedTransactions.includes(index)
    );

    if (allCurrentSelected) {
      setSelectedTransactions(
        selectedTransactions.filter(
          (index) => !currentPageIndexes.includes(index)
        )
      );
    } else {
      setSelectedTransactions([
        ...selectedTransactions,
        ...currentPageIndexes.filter(
          (index) => !selectedTransactions.includes(index)
        ),
      ]);
    }
  };

  const handleDeleteClick = () => {
    if (!deleteMode) {
      setDeleteMode(true);
      setSelectedTransactions([]);
      return;
    }

    if (selectedTransactions.length === 0) {
      setDeleteMode(false);
      return;
    }

    setTransactions(
      transactions.filter((_, index) => !selectedTransactions.includes(index))
    );

    setSelectedTransactions([]);
    setDeleteMode(false);
    setCurrentPage(1);
  };

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-10">Welcome back &lt;user&gt;</h1>

      <div className="grid grid-cols-3 bg-zinc-900 rounded-lg mb-6">
        <div className="p-6 border-r border-zinc-500">
          <p className="text-sm mb-6">Total Transactions</p>
          <p className="text-3xl">{transactions.length}</p>
        </div>

        <div className="p-6 border-r border-zinc-500">
          <p className="text-sm mb-6">Total Income</p>
          <p className="text-3xl">NZ${totalIncome.toFixed(2)}</p>
        </div>

        <div className="p-6">
          <p className="text-sm mb-6">Total Expenses</p>
          <p className="text-3xl">NZ${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-3">
        <div className="flex gap-2 mb-3">
          <input
            placeholder="Search Transactions"
            className="flex-1 bg-zinc-900 border border-zinc-600 rounded-lg px-4 py-2 text-white"
          />

          <button className="bg-white text-black px-4 py-2 rounded-lg">
            Edit
          </button>

          <button
            onClick={handleDeleteClick}
            className={`px-4 py-2 rounded-lg ${
              deleteMode ? "bg-red-600 text-white" : "bg-white text-black"
            }`}
          >
            🗑 Delete
          </button>

          <button className="bg-white text-black px-4 py-2 rounded-lg">
            Filter
          </button>

          <button
            onClick={() => setShowPopup(true)}
            className="bg-white text-black px-4 py-2 rounded-lg"
          >
            + New Transaction
          </button>
        </div>

        {deleteMode && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <input
              type="checkbox"
              checked={
                currentTransactions.length > 0 &&
                currentTransactions.every((_, index) =>
                  selectedTransactions.includes(startIndex + index)
                )
              }
              onChange={toggleSelectAll}
            />
            <span>Select All</span>
            <span className="text-zinc-400">
              {selectedTransactions.length} selected
            </span>
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-2">
          <p className="text-xs mb-2">
            Transactions | {transactions.length} total
          </p>

          {currentTransactions.map((transaction, index) => {
            const actualIndex = startIndex + index;

            return (
              <div
                key={actualIndex}
                className="bg-zinc-900 rounded-lg p-4 flex items-center mb-2"
              >
                {deleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(actualIndex)}
                    onChange={() => toggleSelectTransaction(actualIndex)}
                    className="mr-3"
                  />
                )}

                <div className="flex-1">
                  <p className="font-bold">{transaction.description}</p>
                  <p className="text-xs">
                    {transaction.type} | {transaction.date}
                  </p>
                </div>

                <span
                  className={`border rounded-full px-4 py-1 text-xs ${
                    transaction.type === "Income"
                      ? "text-green-400 border-green-500"
                      : transaction.type === "Debt"
                      ? "text-yellow-400 border-yellow-500"
                      : "text-red-400 border-red-500"
                  }`}
                >
                  {transaction.category}
                </span>

                <p
                  className={`text-xs w-32 text-right ${
                    transaction.type === "Income"
                      ? "text-green-400"
                      : transaction.type === "Debt"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {transaction.type === "Income" ? "+" : "-"}NZ$
                  {transaction.amount.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-white text-black px-3 py-1 rounded disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-white text-black"
                      : "bg-zinc-700 text-white"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-white text-black px-3 py-1 rounded disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-zinc-950 border border-zinc-700 rounded-xl p-6 w-[430px] text-white">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute right-4 top-4 bg-white text-black px-3 py-1 rounded-lg font-bold"
            >
              X
            </button>

            <h2 className="text-3xl font-bold mb-4">New Transaction</h2>

            <div className="flex gap-2 mb-4">
              {(["Expense", "Income", "Debt"] as TransactionType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setTransactionType(type);
                      setCategory("");
                    }}
                    className={`px-4 py-2 rounded-lg font-bold ${
                      transactionType === type
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-white"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}

              <button className="ml-auto bg-white text-black px-4 py-2 rounded-lg">
                Add From CSV
              </button>
            </div>

            <label className="block mb-1">
              Description<span className="text-red-500">*</span>
            </label>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full mb-3 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
            />

            <label className="block mb-1">
              Amount<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full mb-3 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
            />

            <label className="block mb-1">Category</label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full mb-3 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
            >
              <option value="">Auto / Select Category</option>

              {categoryOptions[transactionType].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="block mb-1">
              Transaction Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              className="w-full mb-5 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
            />

            <button
              onClick={addTransaction}
              className="w-full bg-white text-black py-3 rounded-lg font-bold"
            >
              Add Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}