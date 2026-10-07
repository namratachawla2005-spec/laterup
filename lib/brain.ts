/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// The brain connector (BUILD-SPEC section 3.1).
// The ONLY file that talks to an AI model. Everything else calls askModel()
// and never knows or cares which model answered.
//
// AI_PROVIDER=ollama     -> local Qwen on the desktop (development, free)
// AI_PROVIDER=anthropic  -> Claude Haiku (live demo)
//
// Server only: model keys must never reach the browser.
// Never log message content from here.

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AskModelInput = {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number; // hard wall on answer length
  timeoutMs?: number; // give up after this long
  json?: boolean; // ask for a JSON-only reply (Ollama supports this directly)
};

export type AskModelResult = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  provider: "ollama" | "anthropic";
  model: string;
};

// A short reason, safe to check in code. Never shown to her as-is.
export class BrainError extends Error {
  constructor(public reason: "timeout" | "unreachable" | "bad_response" | "not_configured") {
    super(`brain: ${reason}`);
  }
}

const DEFAULT_MAX_TOKENS = Number(process.env.MAX_ANSWER_TOKENS) || 300;
const DEFAULT_TIMEOUT_MS = 15_000;

export async function askModel(input: AskModelInput): Promise<AskModelResult> {
  if (typeof window !== "undefined") {
    throw new Error("askModel must only run on the server");
  }

  const provider = process.env.AI_PROVIDER === "anthropic" ? "anthropic" : "ollama";
  const maxTokens = input.maxTokens ?? DEFAULT_MAX_TOKENS;
  const signal = AbortSignal.timeout(input.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    return provider === "anthropic"
      ? await askAnthropic(input, maxTokens, signal)
      : await askOllama(input, maxTokens, signal);
  } catch (err) {
    if (err instanceof BrainError) throw err;
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new BrainError("timeout");
    }
    throw new BrainError("unreachable");
  }
}

// ---------------------------------------------------------------------
// Ollama adapter (local Qwen)
// ---------------------------------------------------------------------
async function askOllama(
  input: AskModelInput,
  maxTokens: number,
  signal: AbortSignal
): Promise<AskModelResult> {
  const baseUrl = process.env.OLLAMA_BASE_URL;
  const model = process.env.OLLAMA_MODEL;
  if (!baseUrl || !model) throw new BrainError("not_configured");

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: input.system }, ...input.messages],
      stream: false,
      think: false, // skip the visible "Thinking..." step
      keep_alive: "60m", // stay loaded between questions (reloading takes ~20 s)
      ...(input.json ? { format: "json" } : {}),
      options: { num_predict: maxTokens },
    }),
  });
  if (!res.ok) throw new BrainError("bad_response");

  const data = await res.json();
  const text = data?.message?.content;
  if (typeof text !== "string") throw new BrainError("bad_response");

  return {
    text,
    inputTokens: data.prompt_eval_count ?? 0,
    outputTokens: data.eval_count ?? 0,
    provider: "ollama",
    model,
  };
}

// ---------------------------------------------------------------------
// Anthropic adapter (Claude Haiku), plain HTTPS call, no extra library
// ---------------------------------------------------------------------
async function askAnthropic(
  input: AskModelInput,
  maxTokens: number,
  signal: AbortSignal
): Promise<AskModelResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;
  if (!apiKey || apiKey.startsWith("REPLACE_ME") || !model) {
    throw new BrainError("not_configured");
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    signal,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: input.system,
      messages: input.messages,
    }),
  });
  if (!res.ok) throw new BrainError("bad_response");

  const data = await res.json();
  const text = Array.isArray(data?.content)
    ? data.content
        .filter((block: { type: string }) => block.type === "text")
        .map((block: { text: string }) => block.text)
        .join("")
    : undefined;
  if (typeof text !== "string" || !text) throw new BrainError("bad_response");

  return {
    text,
    inputTokens: data.usage?.input_tokens ?? 0,
    outputTokens: data.usage?.output_tokens ?? 0,
    provider: "anthropic",
    model,
  };
}
