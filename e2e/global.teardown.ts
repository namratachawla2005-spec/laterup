/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Runs once after everything, pass or fail:
// puts the real signup cap back and deletes any test account left behind.
import fs from "node:fs";
import path from "node:path";
import { env } from "./fixtures/env";
import { setConfig } from "./fixtures/supabase";
import { clearTrackedUsers, deleteTestUser, trackedUsers } from "./fixtures/test-users";

export default async function globalTeardown() {
  for (const id of trackedUsers()) await deleteTestUser(id);
  clearTrackedUsers();

  const capFile = path.join(env.stateDir, "cap.json");
  if (fs.existsSync(capFile)) {
    const { max_signups } = JSON.parse(fs.readFileSync(capFile, "utf8")) as { max_signups: number };
    await setConfig("max_signups", max_signups);
    fs.rmSync(capFile);
    console.log(`e2e: signup cap restored to ${max_signups}`);
  }
}
