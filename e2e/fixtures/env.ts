// Settings the tests need, read from .env.local (the same file the app uses).
// The service role key is used ONLY here, in Node, to create and delete
// throwaway test accounts and to check rows. It never reaches a browser.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..", "..");
const ENV_FILE = path.join(ROOT, ".env.local");
if (fs.existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`e2e: ${name} is missing. Add it to .env.local.`);
  return value;
}

// PLAYWRIGHT_BASE_URL set = test an already running site (e.g. the live Vercel URL).
// Not set = Playwright builds and starts its own copy of the app on port 3100.
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

// Which AI the test server uses. Defaults to .env.local; override with E2E_AI_PROVIDER.
const provider = externalBaseUrl
  ? "remote"
  : process.env.E2E_AI_PROVIDER === "anthropic" || process.env.E2E_AI_PROVIDER === "ollama"
    ? process.env.E2E_AI_PROVIDER
    : process.env.AI_PROVIDER === "anthropic"
      ? "anthropic"
      : "ollama";

export const env = {
  root: ROOT,
  stateDir: path.join(ROOT, "e2e", ".state"),
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  externalBaseUrl,
  appPort: 3100,
  baseURL: externalBaseUrl ?? "http://localhost:3100",

  provider: provider as "ollama" | "anthropic" | "remote",
  // The model spy sits between the test server and the local model (Ollama only)
  spyEnabled: provider === "ollama",
  spyPort: 11500,
  spyUrl: "http://127.0.0.1:11500",
  realOllamaUrl: process.env.OLLAMA_BASE_URL ?? "",

  maxMessageChars: Number(process.env.MAX_MESSAGE_CHARS) || 1000,
  maxAnswerTokens: Number(process.env.MAX_ANSWER_TOKENS) || 300,
};
