"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Filter, ReceiptText, Search, Plus, X } from "lucide-react";
import CsvUpload from "../../components/csvUpload";
import { requireAuth } from "@/lib/firebase/requireAuth";
import { categoriseTransaction } from "@/lib/ai/categoriseTransaction";
import {
  matchesTransactionFilter,
  normalizeCsvDate,
} from "@/lib/transactions/filterTransactions";

import {
  addTransactionToFirestore,
  addTransactionsBatchToFirestore,
  getUserTransactions,
  updateTransactionInFirestore,
  deleteTransactionFromFirestore,
} from "@/lib/firebase/transactions";

import { formatCurrency } from '@/lib/transactions/formatCurrency';
import { CATEGORIES_BY_TYPE } from "@/lib/categories";

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

const categoryOptions = CATEGORIES_BY_TYPE;

export default function TransactionsPage() {
  const { user, loading } = requireAuth();

  const [showPopup, setShowPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // Number of transactions shown per page.
  const [transactionsPerPage, setTransactionsPerPage] = useState(15);

  const [transactionType, setTransactionType] =
    useState<TransactionType>("Expense");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCategorising, setIsCategorising] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const isFilterActive = startDate !== "" || endDate !== "";

  const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

  const setLastWeekFilter = () => {
    const today = new Date();
    const lastWeek = new Date();

    lastWeek.setDate(today.getDate() - 7);

    setStartDate(formatDate(lastWeek));
    setEndDate(formatDate(today));
    setCurrentPage(1);
  };

  const setMonthRangeFilter = (monthsAgo: number) => {
    const today = new Date();
    const pastDate = new Date();

    pastDate.setMonth(today.getMonth() - monthsAgo);

    setStartDate(formatDate(pastDate));
    setEndDate(formatDate(today));
    setCurrentPage(1);
  };

  const filterCriteria = {
    searchText,
    startDate,
    endDate,
  };

  const filteredTransactionsWithIndex = transactions
    .map((transaction, originalIndex) => ({
      transaction,
      originalIndex,
    }))
    .filter(({ transaction }) =>
      matchesTransactionFilter(transaction, filterCriteria)
    );

  const totalPages = Math.ceil(
    filteredTransactionsWithIndex.length / transactionsPerPage
  );

  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;

  const currentTransactions = filteredTransactionsWithIndex.slice(
    startIndex,
    endIndex
  );

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("");
    setTransactionDate("");
    setTransactionType("Expense");
    setEditingIndex(null);
    setErrorMessage("");
    setIsCategorising(false);
  };

  const addTransaction = async () => {
    if (description.trim() === "") {
      setErrorMessage("Please enter a description.");
      return;
    }

    if (amount === "") {
      setErrorMessage("Please enter an amount.");
      return;
    }

    if (Number(amount) <= 0) {
      setErrorMessage("Amount must be greater than 0.");
      return;
    }

    if (transactionDate === "") {
      setErrorMessage("Please select a transaction date.");
      return;
    }

    if (!user) {
      return;
    }

    setErrorMessage("");
    setIsCategorising(true);

    try {
      const selectedCategory =
        category === ""
          ? await categoriseTransaction(description, transactionType)
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
    } finally {
      setIsCategorising(false);
    }
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
      description.trim() === "" ||
      amount === "" ||
      transactionDate === ""
    ) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (Number(amount) <= 0) {
      setErrorMessage("Amount must be greater than 0.");
      return;
    }

    if (!user) {
      return;
    }

    const transactionToEdit = transactions[editingIndex];

    if (!transactionToEdit.id) {
      return;
    }

    setIsCategorising(true);

    try {
      const selectedCategory =
        category === ""
          ? await categoriseTransaction(description, transactionType)
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
          transaction.id === transactionToEdit.id
            ? updatedTransaction
            : transaction
        )
      );

      resetForm();
      setEditMode(false);
      setShowPopup(false);
    } finally {
      setIsCategorising(false);
    }
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
      ({ originalIndex }) => originalIndex
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

    // Nothing is removed until the user confirms in the prompt below.
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDelete = async () => {
    if (!user) {
      return;
    }

    setIsDeleting(true);

    try {
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
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
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
        date: normalizeCsvDate(transaction.date),
        type: transaction.type,
        source: "csv",
      })
    );

    await addTransactionsBatchToFirestore(
      user.uid,
      convertedTransactions
    );

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

  // If filtering/deleting changes the number of pages,
  // prevent the user from remaining on a page that no longer exists.
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
      return;
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <p className="min-h-screen bg-white p-8 text-black dark:bg-black dark:text-white">
        Loading...
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-8 py-10 text-text xl:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/15 p-3 text-blue-400">
              <ReceiptText size={26} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Transactions</h1>
              <p className="mt-1 text-inactive-text">
                Review, search, filter, add, edit, and manage your financial transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
            <p className="text-sm text-inactive-text">Total Transactions</p>
            <p className="mt-2 text-3xl font-bold">{transactions.length}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
            <p className="text-sm text-inactive-text">Total Income</p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
            <p className="text-sm text-inactive-text">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </section>

        {/* Search / actions */}
        <section className="mb-6 rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <input
                placeholder="Search Transactions"
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-zinc-700 bg-secondary px-4 py-3 pr-11 text-text outline-none transition focus:border-blue-500"
              />

              <Search
                size={19}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-inactive-text"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEditClick}
                title="Edit"
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  editMode
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-zinc-700 bg-secondary hover:border-zinc-500"
                }`}
              >
                <Pencil size={18} />
                <span className="hidden sm:inline">Edit</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                title="Delete"
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  deleteMode
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-zinc-700 bg-secondary hover:border-zinc-500"
                }`}
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isFilterActive) {
                    setStartDate("");
                    setEndDate("");
                    setCurrentPage(1);
                    return;
                  }

                  setShowFilterPopup(true);
                }}
                title={isFilterActive ? "Clear filter" : "Filter"}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  isFilterActive
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-zinc-700 bg-secondary hover:border-zinc-500"
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">
                  {isFilterActive ? "Clear Filter" : "Filter"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setEditMode(false);
                  setShowPopup(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus size={18} />
                New Transaction
              </button>
            </div>
          </div>

          {isFilterActive && (
            <div className="mt-4 rounded-xl border border-blue-900/60 bg-blue-950/20 px-4 py-3">
              <p className="text-sm font-medium text-blue-300">
                {`Showing transactions from ${
                  startDate || "the beginning"
                } to ${endDate || "today"}`}
              </p>
            </div>
          )}
        </section>

        {/* Transaction list */}
        <section className="rounded-2xl border border-zinc-800 bg-widget p-5 shadow-lg">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Transaction History
              </p>
              <h2 className="mt-1 text-2xl font-bold">Your Transactions</h2>
            </div>

            <p className="text-sm text-inactive-text">
              {filteredTransactionsWithIndex.length} result
              {filteredTransactionsWithIndex.length === 1 ? "" : "s"}
            </p>
          </div>

          {editMode && (
            <div className="mb-4 rounded-xl border border-blue-900/60 bg-blue-950/20 px-4 py-3">
              <p className="text-sm text-blue-300">
                Edit mode is on. Click a transaction to edit it.
              </p>
            </div>
          )}

          {deleteMode && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/20 px-4 py-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    currentTransactions.length > 0 &&
                    currentTransactions.every(({ originalIndex }) =>
                      selectedTransactions.includes(originalIndex)
                    )
                  }
                  onChange={toggleSelectAll}
                  className="h-4 w-4"
                />
                <span className="font-medium">Select All</span>
              </label>

              <span className="text-inactive-text">
                {selectedTransactions.length} selected
              </span>

              {selectedTransactions.length > 0 && (
                <span className="text-xs text-red-300">
                  Press Delete again to continue.
                </span>
              )}
            </div>
          )}

          <div className="space-y-3">
            {currentTransactions.length === 0 && (
              <div className="rounded-xl border border-zinc-800 bg-secondary p-8 text-center">
                <p className="font-semibold">No transactions found.</p>
                <p className="mt-1 text-sm text-inactive-text">
                  Try changing your search or date filter.
                </p>
              </div>
            )}

            {currentTransactions.map(({ transaction, originalIndex }) => (
              <div
                key={transaction.id || originalIndex}
                onClick={() => openEditPopup(originalIndex)}
                className={`flex items-center gap-4 rounded-xl border bg-secondary p-4 transition ${
                  editMode
                    ? "cursor-pointer border-blue-500 hover:bg-blue-500/5"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {deleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(originalIndex)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => toggleSelectTransaction(originalIndex)}
                    className="h-4 w-4 shrink-0"
                  />
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {transaction.description}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-inactive-text">
                    <span>{transaction.type}</span>
                    <span>•</span>
                    <span>{transaction.date}</span>
                  </div>
                </div>

                <span
                  className={`hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${
                    transaction.type === "Income"
                      ? "border-green-700 bg-green-500/10 text-green-400"
                      : transaction.type === "Debt"
                        ? "border-yellow-700 bg-yellow-500/10 text-yellow-300"
                        : "border-red-800 bg-red-500/10 text-red-400"
                  }`}
                >
                  {transaction.category}
                </span>

                <p
                  className={`min-w-28 text-right text-sm font-bold ${
                    transaction.type === "Income"
                      ? "text-green-400"
                      : transaction.type === "Debt"
                        ? "text-yellow-300"
                        : "text-red-400"
                  }`}
                >
                  {transaction.type === "Income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-6 flex flex-col gap-4 border-t border-zinc-800 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <label
                htmlFor="transactions-per-page"
                className="text-sm text-inactive-text"
              >
                Transactions per page:
              </label>

              <select
                id="transactions-per-page"
                value={transactionsPerPage}
                onChange={(event) => {
                  setTransactionsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                  setSelectedTransactions([]);
                }}
                className="rounded-lg border border-zinc-700 bg-secondary px-3 py-2 text-sm text-text outline-none transition focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="max-w-full overflow-x-auto">
                <div className="flex min-w-max items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-zinc-700 bg-secondary px-3 py-2 text-sm transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &lt;
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        currentPage === pageNumber
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-zinc-700 bg-secondary hover:border-zinc-500"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-zinc-700 bg-secondary px-3 py-2 text-sm transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {filteredTransactionsWithIndex.length > 0 && (
            <p className="mt-4 text-xs text-inactive-text">
              Showing {startIndex + 1}–
              {Math.min(endIndex, filteredTransactionsWithIndex.length)} of{" "}
              {filteredTransactionsWithIndex.length} transactions
            </p>
          )}
        </section>

        {/* Filter popup */}
        {showFilterPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-[460px] rounded-2xl border border-zinc-800 bg-widget p-6 text-text shadow-2xl">
              <button
                type="button"
                onClick={() => setShowFilterPopup(false)}
                className="absolute right-4 top-4 rounded-lg border border-zinc-700 bg-secondary p-2 transition hover:border-zinc-500"
                aria-label="Close filter"
              >
                <X size={18} />
              </button>

              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                Filter
              </p>
              <h2 className="mt-1 text-2xl font-bold">Filter by Date</h2>
              <p className="mt-2 text-sm text-inactive-text">
                Choose a custom date range or use one of the quick options below.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => {
                      setStartDate(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => {
                      setEndDate(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={setLastWeekFilter}
                  className="rounded-xl border border-zinc-700 bg-secondary py-2.5 text-sm transition hover:border-zinc-500"
                >
                  Last Week
                </button>

                <button
                  type="button"
                  onClick={() => setMonthRangeFilter(1)}
                  className="rounded-xl border border-zinc-700 bg-secondary py-2.5 text-sm transition hover:border-zinc-500"
                >
                  Last Month
                </button>

                <button
                  type="button"
                  onClick={() => setMonthRangeFilter(6)}
                  className="rounded-xl border border-zinc-700 bg-secondary py-2.5 text-sm transition hover:border-zinc-500"
                >
                  Last 6 Months
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage(1);
                  setShowFilterPopup(false);
                }}
                className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Apply Filter
              </button>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-[460px] rounded-2xl border border-zinc-800 bg-widget p-6 text-text shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-400">
                Confirmation
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Delete transaction{selectedTransactions.length === 1 ? "" : "s"}?
              </h2>

              <p className="mt-3 text-sm leading-6 text-inactive-text">
                {selectedTransactions.length === 1
                  ? "This transaction will be permanently removed."
                  : `These ${selectedTransactions.length} transactions will be permanently removed.`}{" "}
                This can&apos;t be undone.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary py-3 font-semibold transition hover:border-zinc-500 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit popup */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-2xl border border-zinc-800 bg-widget p-6 text-text shadow-2xl">
              <button
                type="button"
                onClick={cancelPopup}
                className="absolute right-4 top-4 rounded-lg border border-zinc-700 bg-secondary p-2 transition hover:border-zinc-500"
                aria-label="Close transaction form"
              >
                <X size={18} />
              </button>

              <p className="text-sm font-semibold uppercase tracking-wide text-blue-400">
                {editingIndex === null ? "Create" : "Update"}
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {editingIndex === null ? "New Transaction" : "Edit Transaction"}
              </h2>

              {editingIndex === null && (
                <div className="mt-5 rounded-xl border border-zinc-800 bg-secondary p-4">
                  <CsvUpload onConfirmImport={handleConfirmCsvImport} />
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2">
                {(["Expense", "Income", "Debt"] as TransactionType[]).map(
                  (type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => {
                        setTransactionType(type);
                        setCategory("");
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        transactionType === type
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-zinc-700 bg-secondary hover:border-zinc-500"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">
                  Description <span className="text-red-400">*</span>
                </label>

                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">
                  Amount <span className="text-red-400">*</span>
                </label>

                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">Category</label>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                >
                  <option value="">Auto / Select Category</option>

                  {categoryOptions[transactionType].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">
                  Transaction Date <span className="text-red-400">*</span>
                </label>

                <input
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary p-3 text-text outline-none transition focus:border-blue-500"
                />
              </div>

              {errorMessage !== "" && (
                <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/20 p-3">
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={cancelPopup}
                  className="w-full rounded-xl border border-zinc-700 bg-secondary py-3 font-semibold transition hover:border-zinc-500"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    editingIndex === null
                      ? addTransaction
                      : confirmEditTransaction
                  }
                  disabled={isCategorising}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isCategorising
                    ? "Categorising..."
                    : editingIndex === null
                      ? "Add Transaction"
                      : "Confirm Edit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
