/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// LaterUp end-to-end tests. Run with: npm run test:e2e
// See e2e/README.md for what is covered and how to run against the live site.
import { defineConfig, devices } from "@playwright/test";
import { env } from "./fixtures/env";

// Tests tagged @model call the AI route. They run in their own project with
// a longer timeout, capped at 2 at once (the local model's limit) in case the
// overall worker count is ever raised again.
const MODEL_TAG = /@model/;

const testServerEnv: Record<string, string> = {
  ...(process.env as Record<string, string>),
  ...(env.provider === "anthropic" ? { AI_PROVIDER: "anthropic" } : {}),
  ...(env.spyEnabled ? { AI_PROVIDER: "ollama", OLLAMA_BASE_URL: env.spyUrl } : {}),
};

export default defineConfig({
  testDir: ".",
  outputDir: "../test-results",
  // One test at a time: Supabase is on the free plan, and parallel bursts of
  // logins and queries made it slow down and drop requests (seen in testing).
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky safety test is a failing safety test
  reporter: [["list"], ["html", { outputFolder: "../playwright-report", open: "never" }]],
  globalTeardown: "./global.teardown.ts",
  timeout: 60_000,
  // Pages wait on Supabase over the internet; under a full parallel run that can take 10+ s
  expect: { timeout: 20_000 },

  use: {
    baseURL: env.baseURL,
    // Phone first: most of her visits are on a phone
    ...devices["Pixel 7"],
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  projects: [
    // Raises the signup cap for the run (restored at the end) and checks the model
    { name: "setup", testMatch: /global\.setup\.ts/, teardown: "signup-cap" },

    {
      name: "app",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /signup-cap\.spec\.ts/,
      grepInvert: MODEL_TAG,
      dependencies: ["setup"],
    },
    {
      name: "model",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /signup-cap\.spec\.ts/,
      grep: MODEL_TAG,
      dependencies: ["setup"],
      workers: 2,
      timeout: 120_000,
    },

    // Runs last, after every other test: it closes signups for a moment
    { name: "signup-cap", testMatch: /signup-cap\.spec\.ts/, workers: 1, fullyParallel: false },
  ],

  webServer: env.externalBaseUrl
    ? undefined
    : [
        ...(env.spyEnabled
          ? [
              {
                command: "node e2e/model-spy/server.mjs",
                cwd: env.root,
                url: `${env.spyUrl}/__spy/health`,
                env: { SPY_PORT: String(env.spyPort), SPY_UPSTREAM: env.realOllamaUrl },
                reuseExistingServer: false,
                stdout: "ignore" as const,
              },
            ]
          : []),
        {
          // A production build on its own port, so it never disturbs `npm run dev`
          command: `npm run build && npx next start -p ${env.appPort}`,
          cwd: env.root,
          url: env.baseURL,
          env: testServerEnv,
          reuseExistingServer: false,
          timeout: 300_000,
          stdout: "ignore" as const,
        },
      ],
});
