"use client";

import { useEffect, useState } from "react";
import CsvUpload from "../../components/csvUpload";
import { requireAuth } from "@/lib/firebase/requireAuth";
import { autoCategorizeTransaction } from "@/lib/firebase/transactions";

import {
  addTransactionToFirestore,
  addTransactionsBatchToFirestore,
  getUserTransactions,
  updateTransactionInFirestore,
  deleteTransactionFromFirestore,
} from "@/lib/firebase/transactions";



type TransactionType = "Expense" | "Income" | "Debt";

type Transaction = {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  source?: "manual" | "csv";
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
    "Food & Dining",
    "Other Expense"
  ],
  Income: ["Wages", "Scholarship", "Student Allowance", "Family Support", "Other Income"],
  Debt: ["Student Loan", "Credit Card", "Personal Loan", "Other Debt"],
};

export default function TransactionsPage() {

  const { user, loading } = requireAuth();


  const [showPopup, setShowPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [filterDate, setFilterDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;

  const [transactionType, setTransactionType] =
    useState<TransactionType>("Expense");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const filteredTransactions =
    filterDate === ""
      ? transactions
      : transactions.filter((transaction) => transaction.date === filterDate);

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setTransactionDate("");
    setTransactionType("Expense");
    setEditingIndex(null);
  };

  const addTransaction = async () => {
  if (description === "" || amount === "" || transactionDate === "") {
    return;
  }

  if (!user) {
    return;
  }

  const selectedCategory =
  category === ""
    ? autoCategorizeTransaction(description, transactionType)
    : category;

  const newTransaction: Transaction = {
    description,
    amount: Number(amount),
    category: selectedCategory,
    date: transactionDate,
    type: transactionType,
    source: "manual",
  };

  const newTransactionId = await addTransactionToFirestore(
    user.uid,
    newTransaction
  );

  setTransactions((currentTransactions) => [
    { ...newTransaction, id: newTransactionId },
    ...currentTransactions,
  ]);

  resetForm();
  setCurrentPage(1);
  setShowPopup(false);
  };

  const handleEditClick = () => {
    setEditMode(!editMode);
    setDeleteMode(false);
    setSelectedTransactions([]);
  };

  const openEditPopup = (actualIndex: number) => {
    if (!editMode || deleteMode) return;

    const transaction = transactions[actualIndex];

    setEditingIndex(actualIndex);
    setDescription(transaction.description);
    setAmount(String(transaction.amount));
    setCategory(transaction.category === "Auto" ? "" : transaction.category);
    setTransactionDate(transaction.date);
    setTransactionType(transaction.type);
    setShowPopup(true);
  };

  const confirmEditTransaction = async () => {
    if (
      editingIndex === null ||
      description === "" ||
      amount === "" ||
      transactionDate === ""
    ) {
      return;
    }

    if (!user) {
      return;
    }

    const transactionToEdit = transactions[editingIndex];

    if (!transactionToEdit.id) {
      return;
    }

    const selectedCategory =
      category === ""
        ? autoCategorizeTransaction(description, transactionType)
        : category;

    const updatedTransaction: Transaction = {
      id: transactionToEdit.id,
      description,
      amount: Number(amount),
      category: selectedCategory,
      date: transactionDate,
      type: transactionType,
      source: transactionToEdit.source,
    };

    await updateTransactionInFirestore(
      user.uid,
      transactionToEdit.id,
      updatedTransaction
    );

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionToEdit.id ? updatedTransaction : transaction
      )
    );

    resetForm();
    setEditMode(false);
    setShowPopup(false);
  };

  const cancelPopup = () => {
    resetForm();
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

  const handleDeleteClick = async () => {
    if (!deleteMode) {
      setDeleteMode(true);
      setEditMode(false);
      setSelectedTransactions([]);
      return;
    }

    if (selectedTransactions.length === 0) {
      setDeleteMode(false);
      return;
    }

    if (!user) {
      return;
    }

    const transactionsToDelete = selectedTransactions
      .map((index) => transactions[index])
      .filter((transaction) => transaction?.id);

    for (const transaction of transactionsToDelete) {
      await deleteTransactionFromFirestore(user.uid, transaction.id!);
    }

    const deletedIds = transactionsToDelete.map(
      (transaction) => transaction.id
    );

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) => !deletedIds.includes(transaction.id)
      )
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

  
  const handleConfirmCsvImport = async (
    importedTransactions: {
      date: string;
      type: TransactionType;
      source: string;
      description: string;
      amount: number;
    }[]
  ) => {
    if (!user) {
      return;
    }

    const convertedTransactions: Transaction[] = importedTransactions.map(
      (transaction) => ({
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        category: transaction.source,
        date: transaction.date,
        type: transaction.type,
        source: "csv",
      })
    );

    await addTransactionsBatchToFirestore(user.uid, convertedTransactions);

    const savedTransactions = await getUserTransactions(user.uid);
    setTransactions(savedTransactions);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return;

      const savedTransactions = await getUserTransactions(user.uid);
      setTransactions(savedTransactions);
    }

    loadTransactions();
  }, [user]);

  if (loading) {
    return <p className="text-white">Loading...</p>;
  }

  if (!user) {
    return null;
  }

  

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

          <button
            onClick={handleEditClick}
            className={`px-4 py-2 rounded-lg ${
              editMode ? "bg-blue-600 text-white" : "bg-white text-black"
            }`}
          >
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

          <button
            onClick={() => setShowFilterPopup(true)}
            className="bg-white text-black px-4 py-2 rounded-lg"
          >
            Filter
          </button>

          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowPopup(true);
            }}
            className="bg-white text-black px-4 py-2 rounded-lg"
          >
            + New Transaction
          </button>
        </div>

        {filterDate !== "" && (
          <p className="text-sm text-zinc-400 mb-3">
            Showing transactions from: {filterDate}
          </p>
        )}

        {editMode && (
          <p className="text-sm text-blue-400 mb-3">
            Edit mode is on. Click a transaction to edit it.
          </p>
        )}

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
         

          {currentTransactions.map((transaction, index) => {
            const actualIndex = startIndex + index;

            return (
              <div
                key={actualIndex}
                onClick={() => openEditPopup(actualIndex)}
                className={`bg-zinc-900 rounded-lg p-4 flex items-center mb-2 ${
                  editMode ? "cursor-pointer border border-blue-500" : ""
                }`}
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

      {showFilterPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-zinc-950 border border-zinc-700 rounded-xl p-6 w-[360px] text-white">
            <button
              onClick={() => setShowFilterPopup(false)}
              className="absolute right-4 top-4 bg-white text-black px-3 py-1 rounded-lg font-bold"
            >
              X
            </button>

            <h2 className="text-2xl font-bold mb-4">Filter by Date</h2>

            <label className="block mb-1">Select Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(event) => setFilterDate(event.target.value)}
              className="w-full mb-5 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilterDate("");
                  setCurrentPage(1);
                  setShowFilterPopup(false);
                }}
                className="w-full bg-zinc-700 text-white py-3 rounded-lg font-bold"
              >
                Clear
              </button>

              <button
                onClick={() => {
                  setCurrentPage(1);
                  setShowFilterPopup(false);
                }}
                className="w-full bg-white text-black py-3 rounded-lg font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-zinc-950 border border-zinc-700 rounded-xl p-6 w-[430px] text-white">
            <button
              onClick={cancelPopup}
              className="absolute right-4 top-4 bg-white text-black px-3 py-1 rounded-lg font-bold"
            >
              X
            </button>

            <h2 className="text-3xl font-bold mb-4">
              {editingIndex === null ? "New Transaction" : "Edit Transaction"}
            </h2>

            {editingIndex === null && (
              <div className="mb-4 border border-zinc-700 rounded-lg p-3">
                <CsvUpload onConfirmImport={handleConfirmCsvImport} />
              </div>
            )}

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

            <div className="flex gap-2">
              <button
                onClick={cancelPopup}
                className="w-full bg-zinc-700 text-white py-3 rounded-lg font-bold"
              >
                Cancel
              </button>

              <button
                onClick={
                  editingIndex === null ? addTransaction : confirmEditTransaction
                }
                className="w-full bg-white text-black py-3 rounded-lg font-bold"
              >
                {editingIndex === null ? "Add Transaction" : "Confirm Edit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}