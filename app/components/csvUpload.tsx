"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/app/components/ui/ui";

type TransactionType = "Income" | "Expense" | "Debt";

type ImportedTransaction = {
  date: string;
  type: TransactionType;
  source: string;
  description: string;
  amount: number;
};

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

const incomeSourceOptions = [
  "Wages",
  "Scholarship",
  "Student Allowance",
  "Other Income",
];

const expenseSourceOptions = [
  "Accommodation",
  "Food & Groceries",
  "Transport",
  "Education",
  "Entertainment",
  "Utilities",
  "Personal Care",
  "Other Expense",
];

const debtSourceOptions = ["Loan Repayment", "Credit Card", "Other Debt"];

type CsvUploadProps = {
  onConfirmImport: (transactions: ImportedTransaction[]) => void;
};

export default function CsvUpload({ onConfirmImport }: CsvUploadProps)  {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

        const imported: ImportedTransaction[] = [];
        let invalidRowCount = 0;

        results.data.forEach((row) => {
          const transaction = convertCsvRowToTransaction(row);

          if (!transaction) {
            invalidRowCount++;
          } else {
            imported.push(transaction);
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

        setTransactions(imported);
        setErrors(errorMessages);
        setIsModalOpen(true);

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
    onConfirmImport(transactions);
    setTransactions([]);
    setErrors([]);
    setIsModalOpen(false);
  }

  function getSourceOptionsByType(type: TransactionType) {
    if (type === "Income") {
      return incomeSourceOptions;
    }

    if (type === "Debt") {
      return debtSourceOptions;
    }

    return expenseSourceOptions;
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
        className="w-full bg-white text-black py-3 rounded-lg font-bold"
      >
        CSV Import
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
                  style={confirmButtonStyle}
                >
                  Confirm Import
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

function convertCsvRowToTransaction(
  row: Record<string, string>
): ImportedTransaction | null {
  const date = getValue(row, dateHeaders);

  const description = getValue(row, descriptionHeaders);

  const amount = getAmount(row);

  if (!isValidDateFormat(date) || !description || amount === null) {
    return null;
  }

  const type = classifyTransactionType(amount, description);
  const source = classifyTransactionSource(description, type);

  return {
    date,
    type,
    source,
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

function classifyTransactionSource(
  description: string,
  type: TransactionType
): string {
  const text = description.toLowerCase();

  if (type === "Income") {
    if (
      text.includes("wage") ||
      text.includes("salary") ||
      text.includes("payroll")
    ) {
      return "Wages";
    }

    if (text.includes("scholarship")) {
      return "Scholarship";
    }

    if (text.includes("allowance")) {
      return "Student Allowance";
    }

    if (text.includes("family") || text.includes("support")) {
      return "Family Support";
    }

    return "Other Income";
  }

  if (type === "Debt") {
    if (text.includes("student loan")) {
      return "Student Loan";
    }

    if (text.includes("credit card")) {
      return "Credit Card";
    }

    if (text.includes("personal loan")) {
      return "Personal Loan";
    }

    return "Other Debt";
  }

  if (
    text.includes("rent") ||
    text.includes("landlord") ||
    text.includes("board")
  ) {
    return "Accommodation";
  }

  if (
    text.includes("countdown") ||
    text.includes("pak") ||
    text.includes("new world") ||
    text.includes("grocery")
  ) {
    return "Groceries";
  }

  if (
    text.includes("at hop") ||
    text.includes("transport") ||
    text.includes("uber") ||
    text.includes("fuel") ||
    text.includes("z energy")
  ) {
    return "Transport";
  }

  if (
    text.includes("textbook") ||
    text.includes("stationery") ||
    text.includes("course")
  ) {
    return "Education";
  }

  if (
    text.includes("netflix") ||
    text.includes("spotify") ||
    text.includes("movie") ||
    text.includes("cinema")
  ) {
    return "Entertainment";
  }

  if (
    text.includes("power") ||
    text.includes("electricity") ||
    text.includes("water") ||
    text.includes("internet") ||
    text.includes("phone bill")
  ) {
    return "Utilities";
  }

  if (
    text.includes("pharmacy") ||
    text.includes("toiletries") ||
    text.includes("skincare")
  ) {
    return "Personal Care";
  }

  return "Other Expense";
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