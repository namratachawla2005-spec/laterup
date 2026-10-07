// Talks to the model spy (e2e/model-spy/server.mjs) and records what this run
// can test. The spy only exists when the test server uses the local model.
import fs from "node:fs";
import path from "node:path";
import { env } from "./env";

export type SpyRequest = { at: string; message: string; raw: string };

/** Every request the app sent to the model whose body contains `text`. */
export async function spyRequests(contains?: string): Promise<SpyRequest[]> {
  const q = contains ? `?contains=${encodeURIComponent(contains)}` : "";
  const res = await fetch(`${env.spyUrl}/__spy/requests${q}`);
  return (await res.json()) as SpyRequest[];
}

export async function upstreamModelUp(): Promise<boolean> {
  try {
    const res = await fetch(`${env.spyUrl}/__spy/upstream`, { signal: AbortSignal.timeout(6000) });
    return ((await res.json()) as { up: boolean }).up;
  } catch {
    return false;
  }
}

// ---- What this run can test (written once by the setup project) ----
type RunState = { modelUp: boolean; provider: string; spy: boolean };
const RUN_FILE = path.join(env.stateDir, "run.json");

export function writeRunState(state: RunState) {
  fs.mkdirSync(env.stateDir, { recursive: true });
  fs.writeFileSync(RUN_FILE, JSON.stringify(state, null, 2));
}

export function runState(): RunState {
  try {
    return JSON.parse(fs.readFileSync(RUN_FILE, "utf8")) as RunState;
  } catch {
    return { modelUp: true, provider: env.provider, spy: env.spyEnabled };
  }
}

export const MODEL_DOWN_REASON =
  "The local model is not reachable (is the desktop with Ollama switched on?). Real-model tests are skipped, not passed.";
export const NO_SPY_REASON =
  "Needs the model spy, which only runs when the test server uses the local model (not on Haiku or the live site).";
