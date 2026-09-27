"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Filter } from "lucide-react";
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
    return date.toISOString().split("T")[0];
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
    <div className="mx-auto min-h-screen w-full max-w-[900px] bg-white text-black dark:bg-black dark:text-white">
      {/* Sticky top area */}
      <div className="sticky top-0 z-40 bg-white px-8 pb-4 pt-8 dark:bg-black">

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-r border-zinc-300 p-6 dark:border-zinc-500">
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
              Total Transactions
            </p>

            <p className="text-3xl">
              {transactions.length}
            </p>
          </div>

          <div className="border-r border-zinc-300 p-6 dark:border-zinc-500">
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
              Total Income
            </p>

            <p className="text-3xl">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          <div className="p-6">
            <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
              Total Expenses
            </p>

            <p className="text-3xl">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        {/* Search / edit / delete / filter */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex gap-2">
            <input
              placeholder="Search Transactions"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-black outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />

            <button
              onClick={handleEditClick}
              title="Edit"
              className={`rounded-lg px-4 py-2 ${
                editMode
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              }`}
            >
              <Pencil size={18} />
            </button>

            <button
              onClick={handleDeleteClick}
              title="Delete"
              className={`rounded-lg px-4 py-2 ${
                deleteMode
                  ? "bg-red-600 text-white"
                  : "bg-white text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              }`}
            >
              <Trash2 size={18} />
            </button>

            <button
              onClick={() => {
                if (isFilterActive) {
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                  return;
                }

                setShowFilterPopup(true);
              }}
              title="Filter"
              className={`rounded-lg px-4 py-2 ${
                isFilterActive
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              }`}
            >
              <Filter size={18} />
            </button>

            <button
              onClick={() => {
                resetForm();
                setEditMode(false);
                setShowPopup(true);
              }}
              className="rounded-lg bg-white px-4 py-2 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              + New Transaction
            </button>
          </div>

          {isFilterActive && (
            <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              {`Showing transactions from ${
                startDate || "the beginning"
              } to ${endDate || "today"}`}
            </p>
          )}
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-8 pb-8">
        <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
          {editMode && (
            <p className="mb-3 text-sm text-blue-600 dark:text-blue-400">
              Edit mode is on. Click a transaction to edit it.
            </p>
          )}

          {deleteMode && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={
                  currentTransactions.length > 0 &&
                  currentTransactions.every(({ originalIndex }) =>
                    selectedTransactions.includes(originalIndex)
                  )
                }
                onChange={toggleSelectAll}
              />

              <span>Select All</span>

              <span className="text-zinc-600 dark:text-zinc-400">
                {selectedTransactions.length} selected
              </span>
            </div>
          )}

          {/* Transactions */}
          <div className="rounded-lg bg-zinc-200 p-2 dark:bg-zinc-800">
            {currentTransactions.length === 0 && (
              <p className="p-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
                No transactions found.
              </p>
            )}

            {currentTransactions.map(
              ({ transaction, originalIndex }) => (
                <div
                  key={transaction.id || originalIndex}
                  onClick={() =>
                    openEditPopup(originalIndex)
                  }
                  className={`mb-2 flex items-center rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 ${
                    editMode
                      ? "cursor-pointer border-blue-500"
                      : ""
                  }`}
                >
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(
                        originalIndex
                      )}
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      onChange={() =>
                        toggleSelectTransaction(
                          originalIndex
                        )
                      }
                      className="mr-3"
                    />
                  )}

                  <div className="flex-1">
                    <p className="font-bold">
                      {transaction.description}
                    </p>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {transaction.type} |{" "}
                      {transaction.date}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-1 text-xs ${
                      transaction.type === "Income"
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : transaction.type === "Debt"
                          ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                          : "border-red-500 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.category}
                  </span>

                  <p
                    className={`w-40 text-right text-xs ${
                      transaction.type === "Income"
                        ? "text-green-600 dark:text-green-400"
                        : transaction.type === "Debt"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "Income"
                      ? "+"
                      : "-"}
                    {formatCurrency(
                      transaction.amount
                    )}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Pagination controls */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {/* Transaction count dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="transactions-per-page"
                className="text-sm text-zinc-600 dark:text-zinc-300"
              >
                Transactions per page:
              </label>

              <select
                id="transactions-per-page"
                value={transactionsPerPage}
                onChange={(event) => {
                  setTransactionsPerPage(
                    Number(event.target.value)
                  );
                  setCurrentPage(1);
                  setSelectedTransactions([]);
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
              </select>
            </div>

            {/* Page buttons */}
            {totalPages > 1 && (
              <div className="max-w-full overflow-x-auto">
                <div className="flex min-w-max items-center gap-2 px-1">
                  <button
                    onClick={() =>
                      setCurrentPage(
                        (page) => page - 1
                      )
                    }
                    disabled={currentPage === 1}
                    className="rounded bg-white px-3 py-1 text-black hover:bg-zinc-200 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                  >
                    &lt;
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() =>
                        setCurrentPage(
                          pageNumber
                        )
                      }
                      className={`rounded px-3 py-1 ${
                        currentPage ===
                        pageNumber
                          ? "bg-blue-600 text-white"
                          : "bg-white text-black hover:bg-zinc-200 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        (page) => page + 1
                      )
                    }
                    disabled={
                      currentPage === totalPages
                    }
                    className="rounded bg-white px-3 py-1 text-black hover:bg-zinc-200 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Result count */}
          {filteredTransactionsWithIndex.length > 0 && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              Showing{" "}
              {startIndex + 1}–
              {Math.min(
                endIndex,
                filteredTransactionsWithIndex.length
              )}{" "}
              of{" "}
              {filteredTransactionsWithIndex.length}{" "}
              transactions
            </p>
          )}
        </div>
      </div>

      {/* Filter popup */}
      {showFilterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[420px] rounded-xl border border-zinc-300 bg-white p-6 text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
            <button
              onClick={() =>
                setShowFilterPopup(false)
              }
              className="absolute right-4 top-4 rounded-lg bg-zinc-200 px-3 py-1 font-bold text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              X
            </button>

            <h2 className="mb-4 text-2xl font-bold">
              Filter by Date
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => {
                    setStartDate(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => {
                    setEndDate(
                      event.target.value
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2">
              <button
                onClick={setLastWeekFilter}
                className="rounded-lg bg-zinc-200 py-2 text-sm text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Last Week
              </button>

              <button
                onClick={() =>
                  setMonthRangeFilter(1)
                }
                className="rounded-lg bg-zinc-200 py-2 text-sm text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Last Month
              </button>

              <button
                onClick={() =>
                  setMonthRangeFilter(6)
                }
                className="rounded-lg bg-zinc-200 py-2 text-sm text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Last 6 Months
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentPage(1);
                setShowFilterPopup(false);
              }}
              className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[430px] rounded-xl border border-zinc-300 bg-white p-6 text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Delete transaction{selectedTransactions.length === 1 ? "" : "s"}?
            </h2>

            <p className="mb-6">
              {selectedTransactions.length === 1
                ? "This transaction will be permanently removed."
                : `These ${selectedTransactions.length} transactions will be permanently removed.`}{" "}
              This can&apos;t be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-zinc-200 py-3 font-bold text-black hover:bg-zinc-300 disabled:opacity-60 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[430px] rounded-xl border border-zinc-300 bg-white p-6 text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
            <button
              onClick={cancelPopup}
              className="absolute right-4 top-4 rounded-lg bg-zinc-200 px-3 py-1 font-bold text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              X
            </button>

            <h2 className="mb-4 text-3xl font-bold">
              {editingIndex === null
                ? "New Transaction"
                : "Edit Transaction"}
            </h2>

            {editingIndex === null && (
              <div className="mb-4 rounded-lg border border-zinc-300 p-3 dark:border-zinc-700">
                <CsvUpload
                  onConfirmImport={
                    handleConfirmCsvImport
                  }
                />
              </div>
            )}

            <div className="mb-4 flex gap-2">
              {(
                [
                  "Expense",
                  "Income",
                  "Debt",
                ] as TransactionType[]
              ).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setTransactionType(type);
                    setCategory("");
                  }}
                  className={`rounded-lg px-4 py-2 font-bold ${
                    transactionType === type
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-200 text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <label className="mb-1 block">
              Description
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />

            <label className="mb-1 block">
              Amount
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />

            <label className="mb-1 block">
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className="mb-3 w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            >
              <option value="">
                Auto / Select Category
              </option>

              {categoryOptions[
                transactionType
              ].map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

            <label className="mb-1 block">
              Transaction Date
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="date"
              value={transactionDate}
              onChange={(event) =>
                setTransactionDate(
                  event.target.value
                )
              }
              className="mb-5 w-full rounded-lg border border-zinc-300 bg-white p-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />

            {errorMessage !== "" && (
              <p className="mb-3 text-sm text-red-500 dark:text-red-400">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={cancelPopup}
                className="w-full rounded-lg bg-zinc-200 py-3 font-bold text-black hover:bg-zinc-300 dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600"
              >
                Cancel
              </button>

              <button
                onClick={
                  editingIndex === null
                    ? addTransaction
                    : confirmEditTransaction
                }
                disabled={isCategorising}
                className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
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
  );
}