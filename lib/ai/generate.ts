export type GenerateOptions = {
  format?: "json";
};

export async function generateAIResponse(
  prompt: string,
  options?: GenerateOptions
): Promise<string> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data = await response.json();

  return data.response as string;
}
