import { NextRequest, NextResponse } from "next/server";

type GenerateRequestBody = {
  prompt: string;
  format?: "json";
};

export async function POST(request: NextRequest) {
  const { prompt, format } = (await request.json()) as GenerateRequestBody;

  const aiResponse = await fetch(process.env.AI_API_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      prompt,
      stream: false,
      ...(format ? { format } : {}),
    }),
  });

  if (!aiResponse.ok) {
    return NextResponse.json(
      { error: `AI request failed with status ${aiResponse.status}` },
      { status: 500 }
    );
  }

  const data = await aiResponse.json();

  return NextResponse.json({ response: data.response as string });
}
