import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateAIResponse } from "../generate";
import {
  categoriseTransaction,
  categoriseTransactionsBatch,
} from "../categoriseTransaction";

vi.mock("../generate", () => ({ generateAIResponse: vi.fn() }));

const mockedGenerate = vi.mocked(generateAIResponse);

beforeEach(() => {
  mockedGenerate.mockReset();
});

describe("categoriseTransaction", () => {
  it("returns the category from a valid AI response", async () => {
    mockedGenerate.mockResolvedValue('{"category":"Groceries"}');

    const category = await categoriseTransaction("Countdown Auckland", "Expense");

    expect(category).toBe("Groceries");
  });

  it("falls back to the keyword matcher when the AI call fails", async () => {
    mockedGenerate.mockRejectedValue(new Error("network error"));

    const category = await categoriseTransaction("Weekly wage payment", "Income");

    expect(category).toBe("Wages");
  });
});

describe("categoriseTransactionsBatch", () => {
  it("returns AI categories in order, falling back per-item for bad entries", async () => {
    mockedGenerate.mockResolvedValue(
      JSON.stringify({
        results: [
          { index: 0, category: "Groceries" },
          { index: 1, category: "Not A Real Category" },
        ],
      })
    );

    const categories = await categoriseTransactionsBatch([
      { description: "Countdown Auckland", type: "Expense" },
      { description: "Weekly wage payment", type: "Income" },
    ]);

    expect(categories).toEqual(["Groceries", "Wages"]);
  });

  it("chunks at 30 items and reports progress via onChunkResult", async () => {
    mockedGenerate.mockResolvedValue(JSON.stringify({ results: [] }));

    const items = Array.from({ length: 35 }, () => ({
      description: "Weekly wage payment",
      type: "Income" as const,
    }));
    const onChunkResult = vi.fn();

    await categoriseTransactionsBatch(items, onChunkResult);

    expect(mockedGenerate).toHaveBeenCalledTimes(2);
    expect(onChunkResult).toHaveBeenNthCalledWith(1, 0, Array(30).fill("Wages"));
    expect(onChunkResult).toHaveBeenNthCalledWith(2, 30, Array(5).fill("Wages"));
  });
});
