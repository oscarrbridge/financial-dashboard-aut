"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/app/components/ui/ui";

type ImportedTransaction = {
  date: string;
  type: "Income" | "Expense" | "Debt";
  source: string;
  description: string;
  amount: number;
};

export default function CsvUpload() {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a valid CSV file."]);
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const imported: ImportedTransaction[] = [];
        const errorMessages: string[] = [];

        results.data.forEach((row, index) => {
          const transaction = convertCsvRowToTransaction(row);

          if (!transaction) {
            errorMessages.push(`Row ${index + 2}: Invalid or missing data.`);
          } else {
            imported.push(transaction);
          }
        });

        setTransactions(imported);
        setErrors(errorMessages);
      },
      error: () => {
        setErrors(["Could not read the CSV file."]);
      },
    });
  }

  return (
    <section>
      <h2>Upload CSV</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCsvUpload}
        style={{ display: "none" }}
      />

      <Button
        buttonText="Upload CSV"
        onClick={() => fileInputRef.current?.click()}
      />

      {errors.length > 0 && (
        <section>
          <h3>CSV Errors</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </section>
      )}

      {transactions.length > 0 && (
        <section>
          <h3>Imported Transactions</h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Source</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{transaction.date}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.source}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </section>
  );
}

function convertCsvRowToTransaction(
  row: Record<string, string>
): ImportedTransaction | null {
  const date = getValue(row, ["Date", "Transaction Date", "Posted Date"]);

  const description = getValue(row, [
    "Description",
    "Memo",
    "Payee",
    "Details",
    "Particulars",
  ]);

  const amount = getAmount(row);

  if (!date || !description || amount === null) {
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
    if (row[header]) {
      return row[header];
    }
  }

  return "";
}

function getAmount(row: Record<string, string>): number | null {
  const amountText = getValue(row, ["Amount", "Value"]);

  if (amountText) {
    const amount = Number(amountText.replace(/[$,]/g, ""));
    return Number.isNaN(amount) ? null : amount;
  }

  const debitText = getValue(row, ["Debit", "Withdrawals"]);
  const creditText = getValue(row, ["Credit", "Deposits"]);

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
): "Income" | "Expense" | "Debt" {
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
  type: "Income" | "Expense" | "Debt"
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

    return "Other Income";
  }

  if (type === "Debt") {
    if (text.includes("loan")) {
      return "Loan Repayment";
    }

    if (text.includes("credit card")) {
      return "Credit Card";
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
    return "Food & Groceries";
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
    text.includes("pharmacy") ||
    text.includes("toiletries") ||
    text.includes("skincare")
  ) {
    return "Personal Care";
  }

  return "Other";
}