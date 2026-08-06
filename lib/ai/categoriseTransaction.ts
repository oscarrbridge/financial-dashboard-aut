import { generateAIResponse } from "./generate";
import { autoCategorizeTransaction } from "@/lib/firebase/transactions";
import {
  getCategoriesForType,
  isValidCategoryForType,
  describeCategory,
  type TransactionType,
} from "@/lib/categories";

export type CategorisationItem = {
  description: string;
  type: TransactionType;
};

function parseAIJson(raw: string): unknown | null {
  const fenceStripped = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(fenceStripped);
  } catch {
    return null;
  }
}

function buildSinglePrompt(
  description: string,
  type: TransactionType
): string {
  const categories = getCategoriesForType(type).map(describeCategory);

  return `You are a transaction categorisation assistant for a personal finance app.
Given a single bank transaction description and its type, choose the single best
matching category from the allowed list. Respond with ONLY a JSON object of the
exact form {"category": "<one of the allowed categories, name only>"} and nothing else.

Transaction type: ${type}
Allowed categories (name and what it covers):
${categories.map((category) => `- ${category}`).join("\n")}

Transaction description: "${description}"

Respond with JSON only, matching this shape exactly: {"category": "<category>"}`;
}

function extractSingleCategory(parsed: unknown): string | null {
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "category" in parsed &&
    typeof (parsed as { category: unknown }).category === "string"
  ) {
    return (parsed as { category: string }).category;
  }

  return null;
}

export async function categoriseTransaction(
  description: string,
  type: TransactionType
): Promise<string> {
  const startedAt = Date.now();

  try {
    const raw = await generateAIResponse(buildSinglePrompt(description, type), {
      format: "json",
    });
    const parsed = parseAIJson(raw);
    const category = extractSingleCategory(parsed);

    console.log(
      `[categoriseTransaction] "${description}" resolved in ${Date.now() - startedAt}ms -> ${category ?? "(invalid response)"}`
    );

    if (category !== null && isValidCategoryForType(category, type)) {
      return category.trim();
    }
  } catch (error) {
    console.log(
      `[categoriseTransaction] "${description}" failed after ${Date.now() - startedAt}ms:`,
      error
    );
  }

  return autoCategorizeTransaction(description, type);
}

function buildBatchPrompt(items: CategorisationItem[]): string {
  const typesUsed = Array.from(new Set(items.map((item) => item.type)));

  const categoryLegend = typesUsed
    .map((type) => {
      const categories = getCategoriesForType(type).map(describeCategory);
      return `${type} categories:\n${categories
        .map((category) => `- ${category}`)
        .join("\n")}`;
    })
    .join("\n\n");

  const lines = items
    .map(
      (item, index) =>
        `${index}. type=${item.type}, description=${JSON.stringify(item.description)}`
    )
    .join("\n");

  return `You are a transaction categorisation assistant for a personal finance app.
You will be given a numbered list of bank transactions, each with a type
(Expense, Income, or Debt). For each transaction, choose the single best
matching category from the allowed categories for ITS type, listed below.

${categoryLegend}

Respond with ONLY a JSON object of the exact form:
{"results": [{"index": 0, "category": "<category name only>"}, {"index": 1, "category": "<category name only>"}, ...]}
Include exactly one entry per transaction, in any order, using the same "index"
values given below. Do not include any text outside the JSON object.

Transactions:
${lines}`;
}

function extractBatchResults(parsed: unknown): Map<number, string> | null {
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("results" in parsed) ||
    !Array.isArray((parsed as { results: unknown }).results)
  ) {
    return null;
  }

  const map = new Map<number, string>();

  for (const entry of (parsed as { results: unknown[] }).results) {
    if (
      typeof entry === "object" &&
      entry !== null &&
      "index" in entry &&
      "category" in entry &&
      typeof (entry as { index: unknown }).index === "number" &&
      typeof (entry as { category: unknown }).category === "string"
    ) {
      map.set(
        (entry as { index: number }).index,
        (entry as { category: string }).category
      );
    }
  }

  return map;
}

async function categoriseChunk(
  chunk: CategorisationItem[]
): Promise<string[]> {
  const startedAt = Date.now();
  let resultsByIndex: Map<number, string> | null = null;

  console.log(`[categoriseChunk] sending ${chunk.length} transaction(s) to the AI...`);

  try {
    const raw = await generateAIResponse(buildBatchPrompt(chunk), {
      format: "json",
    });
    resultsByIndex = extractBatchResults(parseAIJson(raw));

    console.log(
      `[categoriseChunk] resolved ${chunk.length} transaction(s) in ${Date.now() - startedAt}ms (${resultsByIndex ? resultsByIndex.size : 0} valid entries)`
    );
  } catch (error) {
    console.log(
      `[categoriseChunk] failed after ${Date.now() - startedAt}ms:`,
      error
    );
    resultsByIndex = null;
  }

  return chunk.map((item, index) => {
    const category = resultsByIndex?.get(index);

    if (category !== undefined && isValidCategoryForType(category, item.type)) {
      return category.trim();
    }

    return autoCategorizeTransaction(item.description, item.type);
  });
}

const CHUNK_SIZE = 20;

export async function categoriseTransactionsBatch(
  items: CategorisationItem[],
  onChunkResult?: (chunkStartIndex: number, categories: string[]) => void
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const chunkResults = await categoriseChunk(chunk);

    onChunkResult?.(i, chunkResults);
    results.push(...chunkResults);
  }

  return results;
}
