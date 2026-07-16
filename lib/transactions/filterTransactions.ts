export type TransactionFilterable = {
  description: string;
  date: string;
};

export type TransactionFilterCriteria = {
  searchText?: string;
  startDate?: string;
  endDate?: string;
};

export const normalizeCsvDate = (dateValue: string): string => {
  if (!dateValue) {
    return "";
  }

  const trimmedDate = dateValue.trim();

  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(trimmedDate)) {
    return trimmedDate;
  }

  const dateParts = trimmedDate.includes("/")
    ? trimmedDate.split("/")
    : trimmedDate.split("-");

  if (dateParts.length === 3) {
    if (dateParts[0].length === 4) {
      const year = dateParts[0];
      const month = dateParts[1].padStart(2, "0");
      const day = dateParts[2].padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const day = dateParts[0].padStart(2, "0");
    const month = dateParts[1].padStart(2, "0");
    const year = dateParts[2];

    return `${year}-${month}-${day}`;
  }

  return trimmedDate;
};

export const matchesTransactionFilter = (
  transaction: TransactionFilterable,
  criteria: TransactionFilterCriteria
): boolean => {
  const searchValue = (criteria.searchText ?? "").toLowerCase();

  const matchesSearch = transaction.description
    .toLowerCase()
    .includes(searchValue);

  if (searchValue !== "" && !matchesSearch) {
    return false;
  }

  const normalizedTransactionDate = normalizeCsvDate(transaction.date);
  const startDate = criteria.startDate ?? "";
  const endDate = criteria.endDate ?? "";

  if (startDate !== "" && normalizedTransactionDate < startDate) {
    return false;
  }

  if (endDate !== "" && normalizedTransactionDate > endDate) {
    return false;
  }

  return true;
};
