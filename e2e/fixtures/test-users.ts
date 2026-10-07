// Throwaway accounts used only by tests.
// Each test creates its own account and deletes it afterwards, so no test
// depends on another and real signup slots are never used up.
// Every id is also written to e2e/.state/users.txt, so the final cleanup can
// remove anything a crashed test left behind.
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { admin, signInAs } from "./supabase";
import { env } from "./env";
import { open } from "./nav";

export type TestUser = { id: string; email: string; password: string; name: string | null };

export type ProfileFields = {
  name: string | null;
  age_group: string | null;
  stage: string | null;
  stage_answer: string | null;
  top_symptoms: string[];
  diet: string | null;
  life_context: string[];
  doctor_status: string | null;
};

// A typical LaterUp user, used unless a test says otherwise
export const DEFAULT_PROFILE: ProfileFields = {
  name: "Asha",
  age_group: "45-49",
  stage: "perimenopause",
  stage_answer: "My periods have become irregular",
  top_symptoms: ["poor_sleep", "hot_flashes"],
  diet: "vegetarian",
  life_context: ["works_outside", "joint_family"],
  doctor_status: "not_yet",
};

const USERS_FILE = path.join(env.stateDir, "users.txt");

export function newEmail(): string {
  return `e2e-${Date.now().toString(36)}-${randomBytes(4).toString("hex")}@example.com`;
}

export function newPassword(): string {
  return `E2e-${randomBytes(9).toString("base64url")}`;
}

export function trackUser(id: string) {
  fs.mkdirSync(env.stateDir, { recursive: true });
  fs.appendFileSync(USERS_FILE, id + "\n");
}

export function trackedUsers(): string[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return [...new Set(fs.readFileSync(USERS_FILE, "utf8").split("\n").map((s) => s.trim()).filter(Boolean))];
}

export function clearTrackedUsers() {
  fs.rmSync(USERS_FILE, { force: true });
}

// A brief network blip shouldn't fail a test. Before retrying, check whether
// the account was made anyway, so no untracked account is ever left behind.
async function createAccount(email: string, password: string): Promise<string> {
  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
      if (data.user) return data.user.id;
      lastError = error?.message ?? "no user returned";
      if (error && !/fetch|network|timeout/i.test(error.message)) break; // a real refusal: don't retry
    } catch (err) {
      lastError = String(err);
    }
    const existing = await signInAs(email, password).catch(() => null);
    if (existing) return existing.userId;
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  throw new Error(`e2e: could not create test user (${lastError})`);
}

/**
 * Create a confirmed account. By default intake is already finished, so the
 * test starts on Home. Pass `intake: false` to start at the two promises.
 */
export async function createTestUser(
  opts: { intake?: boolean; profile?: Partial<ProfileFields> } = {}
): Promise<TestUser> {
  const email = newEmail();
  const password = newPassword();
  const id = await createAccount(email, password);
  trackUser(id);

  const profile = { ...DEFAULT_PROFILE, ...opts.profile };
  if (opts.intake !== false) {
    const { error: profileError } = await admin()
      .from("profiles")
      .update({
        ...profile,
        consent_given: true,
        consent_date: new Date().toLocaleDateString("en-CA"),
        intake_step: 8,
        intake_completed: true,
      })
      .eq("id", id);
    if (profileError) throw new Error(`e2e: could not set up profile (${profileError.message})`);
  }
  return { id, email, password, name: opts.intake === false ? null : profile.name };
}

export async function deleteTestUser(id: string) {
  // Ignore "not found": the test itself may have deleted the account
  await admin().auth.admin.deleteUser(id).catch(() => {});
}

/** Log in through the real Log in page, like she would. */
export async function logIn(page: Page, user: Pick<TestUser, "email" | "password">, landing: "/home" | "/" = "/home") {
  await open(page, "/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => url.pathname === landing);
  await expect(page.locator("main")).toBeVisible();
  await page.waitForLoadState("networkidle");
}
