"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/app/components/ui/ui";
import { categoriseTransactionsBatch } from "@/lib/ai/categoriseTransaction";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  DEBT_CATEGORIES,
} from "@/lib/categories";

type TransactionType = "Income" | "Expense" | "Debt";

type ImportedTransaction = {
  date: string;
  type: TransactionType;
  source: string;
  description: string;
  amount: number;
};

const CATEGORISING_PLACEHOLDER = "Categorising...";

const dateHeaders = ["Date", "Transaction Date", "Posted Date"];

const descriptionHeaders = [
  "Description",
  "Memo",
  "Payee",
  "Details",
  "Particulars",
];

const amountHeaders = ["Amount", "Value"];

const debitHeaders = ["Debit", "Withdrawals"];

const creditHeaders = ["Credit", "Deposits"];

type CsvUploadProps = {
  onConfirmImport: (transactions: ImportedTransaction[]) => void;
};

export default function CsvUpload({ onConfirmImport }: CsvUploadProps)  {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategorising, setIsCategorising] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a valid CSV file."]);
      setTransactions([]);
      setIsModalOpen(true);
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const csvHeaders = results.meta.fields ?? [];
        const missingColumns = getMissingRequiredColumns(csvHeaders);

        if (missingColumns.length > 0) {
          setTransactions([]);
          setErrors([
            `Could not find ${missingColumns.join(", ")} in CSV.`,
          ]);
          setIsModalOpen(true);
          event.target.value = "";
          return;
        }

        const parsedRows: {
          date: string;
          type: TransactionType;
          description: string;
          amount: number;
        }[] = [];
        let invalidRowCount = 0;

        results.data.forEach((row) => {
          const parsedRow = parseCsvRow(row);

          if (!parsedRow) {
            invalidRowCount++;
          } else {
            parsedRows.push(parsedRow);
          }
        });

        const errorMessages: string[] = [];

        if (invalidRowCount > 0) {
          errorMessages.push(
            `Could not import ${invalidRowCount} transaction${
              invalidRowCount === 1 ? "" : "s"
            } due to invalid data.`
          );
        }

        const imported: ImportedTransaction[] = parsedRows.map((row) => ({
          ...row,
          source: CATEGORISING_PLACEHOLDER,
        }));

        setTransactions(imported);
        setErrors(errorMessages);
        setIsModalOpen(true);

        if (parsedRows.length > 0) {
          setIsCategorising(true);

          categoriseTransactionsBatch(
            parsedRows.map((row) => ({
              description: row.description,
              type: row.type,
            })),
            (chunkStartIndex, categories) => {
              setTransactions((currentTransactions) =>
                currentTransactions.map((transaction, index) => {
                  if (
                    index < chunkStartIndex ||
                    index >= chunkStartIndex + categories.length
                  ) {
                    return transaction;
                  }

                  if (transaction.source !== CATEGORISING_PLACEHOLDER) {
                    return transaction;
                  }

                  return {
                    ...transaction,
                    source: categories[index - chunkStartIndex],
                  };
                })
              );
            }
          ).finally(() => setIsCategorising(false));
        }

        // Allows the same CSV file to be selected again if needed
        event.target.value = "";
      },
      error: () => {
        setErrors(["Could not read the CSV file."]);
        setTransactions([]);
        setIsModalOpen(true);
      },
    });
  }

  function updateTransactionSource(index: number, newSource: string) {
    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction, transactionIndex) =>
        transactionIndex === index
          ? { ...transaction, source: newSource }
          : transaction
      )
    );
  }

  function deleteTransactionRow(index: number) {
    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (_, transactionIndex) => transactionIndex !== index
      )
    );
  }

  function confirmImport() {
    if (isCategorising) return;

    onConfirmImport(transactions);
    setTransactions([]);
    setErrors([]);
    setIsModalOpen(false);
  }

  function getSourceOptionsByType(type: TransactionType) {
    if (type === "Income") {
      return INCOME_CATEGORIES;
    }

    if (type === "Debt") {
      return DEBT_CATEGORIES;
    }

    return EXPENSE_CATEGORIES;
  }

  return (
    <section>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvUpload}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isCategorising}
        className="w-full bg-white text-black py-3 rounded-lg font-bold disabled:opacity-60"
      >
        {isCategorising ? "Categorising..." : "CSV Import"}
      </button>

      {isModalOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h3>Imported CSV Transactions</h3>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            {errors.length > 0 && (
              <section>
                <h4>CSV Errors</h4>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </section>
            )}

            {transactions.length > 0 ? (
              <section>
                <p>{transactions.length} transaction(s) imported.</p>

                <div style={tableContainerStyle}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={tableHeaderCellStyle}>Date</th>
                        <th style={tableHeaderCellStyle}>Type</th>
                        <th style={tableHeaderCellStyle}>Source</th>
                        <th style={tableHeaderCellStyle}>Description</th>
                        <th
                          style={{
                            ...tableHeaderCellStyle,
                            textAlign: "right",
                          }}
                        >
                          Amount
                        </th>
                        <th
                          style={{
                            ...tableHeaderCellStyle,
                            textAlign: "center",
                          }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td style={tableCellStyle}>{transaction.date}</td>
                          <td style={tableCellStyle}>{transaction.type}</td>

                          <td style={tableCellStyle}>
                            {transaction.source === CATEGORISING_PLACEHOLDER ? (
                              <span style={categorisingTextStyle}>
                                {CATEGORISING_PLACEHOLDER}
                              </span>
                            ) : (
                              <select
                                value={transaction.source}
                                onChange={(event) =>
                                  updateTransactionSource(
                                    index,
                                    event.target.value
                                  )
                                }
                                style={selectStyle}
                              >
                                {getSourceOptionsByType(transaction.type).map(
                                  (source) => (
                                    <option key={source} value={source}>
                                      {source}
                                    </option>
                                  )
                                )}
                              </select>
                            )}
                          </td>

                          <td style={tableCellStyle}>
                            {transaction.description}
                          </td>
                          <td style={amountCellStyle}>
                            {transaction.amount.toFixed(2)}
                          </td>
                          <td style={actionCellStyle}>
                            <button
                              type="button"
                              onClick={() => deleteTransactionRow(index)}
                              style={deleteButtonStyle}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={confirmImport}
                  disabled={isCategorising}
                  style={
                    isCategorising
                      ? { ...confirmButtonStyle, opacity: 0.6, cursor: "not-allowed" }
                      : confirmButtonStyle
                  }
                >
                  {isCategorising ? "Categorising transactions..." : "Confirm Import"}
                </button>
              </section>
            ) : (
              <p>No valid transactions were imported.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function getMissingRequiredColumns(csvHeaders: string[]): string[] {
  const missingColumns: string[] = [];

  if (!hasMatchingHeader(csvHeaders, dateHeaders)) {
    missingColumns.push("Date");
  }

  const hasSingleAmountColumn = hasMatchingHeader(csvHeaders, amountHeaders);
  const hasDebitOrCreditColumn =
    hasMatchingHeader(csvHeaders, debitHeaders) ||
    hasMatchingHeader(csvHeaders, creditHeaders);

  if (!hasSingleAmountColumn && !hasDebitOrCreditColumn) {
    missingColumns.push("Amount");
  }

  if (!hasMatchingHeader(csvHeaders, descriptionHeaders)) {
    missingColumns.push("Description");
  }

  return missingColumns;
}

function hasMatchingHeader(csvHeaders: string[], possibleHeaders: string[]) {
  return possibleHeaders.some((possibleHeader) =>
    csvHeaders.some(
      (csvHeader) => normalizeHeader(csvHeader) === normalizeHeader(possibleHeader)
    )
  );
}

function parseCsvRow(row: Record<string, string>): {
  date: string;
  type: TransactionType;
  description: string;
  amount: number;
} | null {
  const date = getValue(row, dateHeaders);

  const description = getValue(row, descriptionHeaders);

  const amount = getAmount(row);

  if (!isValidDateFormat(date) || !description || amount === null) {
    return null;
  }

  const type = classifyTransactionType(amount, description);

  return {
    date,
    type,
    description,
    amount,
  };
}

function getValue(row: Record<string, string>, possibleHeaders: string[]) {
  for (const header of possibleHeaders) {
    const matchingKey = Object.keys(row).find(
      (key) => normalizeHeader(key) === normalizeHeader(header)
    );

    if (matchingKey && row[matchingKey]) {
      return row[matchingKey].trim();
    }
  }

  return "";
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase();
}

function isValidDateFormat(date: string): boolean {
  const trimmedDate = date.trim();

  const yyyyMmDdSlash = /^\d{4}\/\d{2}\/\d{2}$/;
  const yyyyMmDdDash = /^\d{4}-\d{2}-\d{2}$/;

  if (!yyyyMmDdSlash.test(trimmedDate) && !yyyyMmDdDash.test(trimmedDate)) {
    return false;
  }

  const separator = trimmedDate.includes("/") ? "/" : "-";
  const [yearText, monthText, dayText] = trimmedDate.split(separator);

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const dateObject = new Date(year, month - 1, day);

  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );
}

function getAmount(row: Record<string, string>): number | null {
  const amountText = getValue(row, amountHeaders);

  if (amountText) {
    const amount = Number(amountText.replace(/[$,]/g, ""));
    return Number.isNaN(amount) ? null : amount;
  }

  const debitText = getValue(row, debitHeaders);
  const creditText = getValue(row, creditHeaders);

  if (debitText) {
    const debit = Number(debitText.replace(/[$,]/g, ""));
    return Number.isNaN(debit) ? null : -Math.abs(debit);
  }

  if (creditText) {
    const credit = Number(creditText.replace(/[$,]/g, ""));
    return Number.isNaN(credit) ? null : Math.abs(credit);
  }

  return null;
}

function classifyTransactionType(
  amount: number,
  description: string
): TransactionType {
  const text = description.toLowerCase();

  if (
    text.includes("loan") ||
    text.includes("repayment") ||
    text.includes("debt") ||
    text.includes("credit card")
  ) {
    return "Debt";
  }

  if (amount > 0) {
    return "Income";
  }

  return "Expense";
}



const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "white",
  color: "black",
  padding: "24px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "1100px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const closeButtonStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  color: "black",
  fontSize: "28px",
  cursor: "pointer",
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
  marginTop: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  color: "black",
  fontSize: "14px",
};

const tableHeaderCellStyle: React.CSSProperties = {
  borderBottom: "2px solid #ccc",
  padding: "10px 12px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
  fontWeight: "bold",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const tableCellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e5e5",
  padding: "10px 12px",
  textAlign: "left",
};

const amountCellStyle: React.CSSProperties = {
  ...tableCellStyle,
  textAlign: "right",
  fontFamily: "monospace",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "black",
};

const categorisingTextStyle: React.CSSProperties = {
  color: "#888",
  fontStyle: "italic",
  fontSize: "13px",
};

const actionCellStyle: React.CSSProperties = {
  ...tableCellStyle,
  textAlign: "center",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #d9534f",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#d9534f",
  cursor: "pointer",
};

const confirmButtonStyle: React.CSSProperties = {
  marginTop: "16px",
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "black",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};