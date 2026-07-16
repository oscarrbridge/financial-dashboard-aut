import { describe, expect, it } from "vitest";
import {
  matchesTransactionFilter,
  normalizeCsvDate,
} from "../filterTransactions";

describe("normalizeCsvDate", () => {
  it("returns YYYY-MM-DD dates unchanged", () => {
    expect(normalizeCsvDate("2026-05-01")).toBe("2026-05-01");
  });

  it("normalizes YYYY/MM/DD dates", () => {
    expect(normalizeCsvDate("2026/05/01")).toBe("2026-05-01");
  });

  it("normalizes DD/MM/YYYY dates", () => {
    expect(normalizeCsvDate("1/5/2026")).toBe("2026-05-01");
  });

  it("normalizes DD-MM-YYYY dates", () => {
    expect(normalizeCsvDate("15-06-2026")).toBe("2026-06-15");
  });
});

describe("matchesTransactionFilter", () => {
  const baseTransaction = (date: string, description = "Lunch") => ({
    date,
    description,
  });

  it("includes transactions on the start and end dates", () => {
    const criteria = { startDate: "2026-05-01", endDate: "2026-06-15" };

    expect(
      matchesTransactionFilter(baseTransaction("2026-05-01"), criteria)
    ).toBe(true);
    expect(
      matchesTransactionFilter(baseTransaction("2026-06-15"), criteria)
    ).toBe(true);
  });

  it("excludes transactions before the start date", () => {
    const criteria = { startDate: "2026-05-02", endDate: "" };

    expect(
      matchesTransactionFilter(baseTransaction("2026-05-01"), criteria)
    ).toBe(false);
  });

  it("excludes transactions after the end date", () => {
    const criteria = { startDate: "", endDate: "2026-05-10" };

    expect(
      matchesTransactionFilter(baseTransaction("2026-05-11"), criteria)
    ).toBe(false);
  });

  it("accepts normalized CSV dates within range", () => {
    const criteria = { startDate: "2026-05-01", endDate: "2026-05-31" };

    expect(
      matchesTransactionFilter(baseTransaction("01/05/2026"), criteria)
    ).toBe(true);
    expect(
      matchesTransactionFilter(baseTransaction("15-05-2026"), criteria)
    ).toBe(true);
  });

  it("combines search text with date filtering", () => {
    const criteria = {
      searchText: "coffee",
      startDate: "2026-05-01",
      endDate: "2026-05-31",
    };

    expect(
      matchesTransactionFilter(
        baseTransaction("2026-05-10", "Coffee beans"),
        criteria
      )
    ).toBe(true);
    expect(
      matchesTransactionFilter(
        baseTransaction("2026-05-10", "Lunch"),
        criteria
      )
    ).toBe(false);
  });
});
