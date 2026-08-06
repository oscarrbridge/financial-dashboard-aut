# AI Library Foundation — Design

## Context

The app wants to add AI functionality in several places, starting with automatic
transaction categorization, and later financial insights. Rather than wiring an
API call directly into the first feature that needs it, this project builds the
reusable foundation: a way for the app to call the self-hosted Ollama-compatible
model at `https://llama.ducksplace.xyz/api/generate` and get text (or JSON) back.
No AI-specific feature is built yet — just the call path, following this repo's
existing `lib/` conventions.

## Architecture

The app currently has no `app/api/` routes — all existing calls (Firebase) happen
directly from client components. For the AI endpoint we introduce a server-side
proxy instead of calling it directly from the browser:

```
client component
   -> lib/ai/generate.ts        (generateAIResponse, runs in browser)
      -> fetch("/api/ai/generate")
         -> app/api/ai/generate/route.ts   (Next.js Route Handler, server-side)
            -> fetch(AI_API_URL, { model, prompt, stream: false, format })
               -> https://llama.ducksplace.xyz/api/generate
```

Reasons for the proxy over calling the endpoint directly from the client:
- Avoids depending on the external host allowing CORS from this app's domain.
- Keeps the AI endpoint URL out of the client bundle.
- Gives a single place to add auth, rate-limiting, or provider swaps later
  without changing the public `lib/ai` interface any consuming feature uses.

## Config

New server-only env vars in `.env` (no `NEXT_PUBLIC_` prefix — only the route
handler reads them):

```
AI_API_URL=https://llama.ducksplace.xyz/api/generate
AI_MODEL=llama3.1
```

## Components

**`app/api/ai/generate/route.ts`** (new)
- `POST` handler. Body: `{ prompt: string, format?: "json" }`.
- Reads `AI_API_URL` / `AI_MODEL` from `process.env`.
- Calls the Ollama endpoint with `{ model, prompt, stream: false, format }`
  (`format` omitted when not provided).
- Returns `{ response: string }` (Ollama's `response` field passed through) or
  a `500` with an error message on failure.

**`lib/ai/generate.ts`** (new)
- `export type GenerateOptions = { format?: "json" }`
- `export async function generateAIResponse(prompt: string, options?: GenerateOptions): Promise<string>`
- Calls `fetch("/api/ai/generate", { method: "POST", body: JSON.stringify({ prompt, ...options }) })`,
  parses the JSON body, and returns the `response` string. Throws on a
  non-OK response (no retry/timeout — matches existing `lib/` error-handling
  style, where errors propagate to the caller).
- Follows the existing convention (`lib/transactions/filterTransactions.ts`):
  plain exported functions, types co-located in the same file, no class-based
  service wrapper.

Streaming is explicitly out of scope for this pass (`stream: false` is always
sent) — it can be added later if a feature needs incremental output (e.g. a
chat UI).

`format: "json"` is plumbed through end-to-end now (cheap to include, avoids
reworking the signature later) but `generateAIResponse` still returns a plain
string; a caller that requests JSON mode is responsible for `JSON.parse`-ing
the result themselves. No categorization-specific function is built in this
pass.

## Testing

**`lib/ai/__tests__/generate.test.ts`** (new), Vitest, mocking global `fetch`,
following the pattern in `lib/transactions/__tests__/filterTransactions.test.ts`:
- Sends the expected request body/URL.
- Returns the parsed `response` string on success.
- Throws when the route handler responds non-OK.

The route handler itself is a thin passthrough; it is exercised manually
(`curl`/dev server) rather than unit tested, consistent with there being no
existing precedent for testing Route Handlers in this repo.

## Verification

- `pnpm test:run` — new Vitest suite passes.
- `pnpm dev`, then `curl -X POST localhost:3000/api/ai/generate -H "Content-Type: application/json" -d '{"prompt":"Say hello"}'` returns a real response from the model.
- `pnpm lint` / `tsc` clean.
