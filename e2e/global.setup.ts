/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Runs once before the suite.
// 1. The signup cap (5) would stop tests creating their throwaway accounts, so
//    it is raised for the run. The real value is saved and put back by
//    global.teardown.ts, even if tests fail.
// 2. Checks whether the AI model can be reached, so real-model tests can be
//    skipped with a clear reason instead of timing out.
import fs from "node:fs";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { env } from "./fixtures/env";
import { getConfig, setConfig } from "./fixtures/supabase";
import { upstreamModelUp, writeRunState } from "./fixtures/model-spy";

const CAP_FILE = path.join(env.stateDir, "cap.json");
const RUN_CAP = 100_000;

setup("raise the signup cap for this run and check the model", async () => {
  fs.mkdirSync(env.stateDir, { recursive: true });

  // If an earlier run crashed, cap.json still holds the real value: keep it
  if (!fs.existsSync(CAP_FILE)) {
    const original = await getConfig("max_signups");
    expect(original, "app_config.max_signups should exist").not.toBeNull();
    fs.writeFileSync(CAP_FILE, JSON.stringify({ max_signups: original }));
  }
  await setConfig("max_signups", RUN_CAP);

  let modelUp = true;
  if (env.spyEnabled) modelUp = await upstreamModelUp();
  if (env.provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY ?? "";
    modelUp = !!key && !key.startsWith("REPLACE_ME");
  }
  writeRunState({ modelUp, provider: env.provider, spy: env.spyEnabled });
  console.log(`e2e: provider=${env.provider} spy=${env.spyEnabled} modelUp=${modelUp} baseURL=${env.baseURL}`);
});
