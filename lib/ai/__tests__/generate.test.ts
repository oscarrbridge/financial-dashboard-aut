import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAIResponse } from "../generate";

describe("generateAIResponse", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the prompt and options to the internal route", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: "Groceries" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await generateAIResponse("Categorize: Countdown $42.50", {
      format: "json",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Categorize: Countdown $42.50",
        format: "json",
      }),
    });
  });

  it("returns the response string on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: "Hello there" }),
      })
    );

    const result = await generateAIResponse("Say hello");

    expect(result).toBe("Hello there");
  });

  it("throws when the route responds with a non-OK status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      })
    );

    await expect(generateAIResponse("Say hello")).rejects.toThrow(
      "AI request failed with status 500"
    );
  });
});
