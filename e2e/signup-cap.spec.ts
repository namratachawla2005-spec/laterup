// P1 Functional: the signup cap (BUILD-SPEC 5.3).
// Runs LAST, on its own: for a moment it closes signups completely, which
// would stop other tests creating accounts. The cap is then put back.
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { env } from "./fixtures/env";
import { getConfig, setConfig, signInAs } from "./fixtures/supabase";
import { deleteTestUser, newEmail, newPassword } from "./fixtures/test-users";
import { open } from "./fixtures/nav";

test.describe("Signup cap", () => {
  let runCap: number;
  test.beforeAll(async () => {
    runCap = (await getConfig("max_signups"))!;
    await setConfig("max_signups", 0);
  });
  test.afterAll(async () => {
    await setConfig("max_signups", runCap); // global.teardown.ts restores the real value after this
  });

  test("when signups are full, Sign up shows the private-preview message, not an error", async ({ page }) => {
    await open(page,"/signup");
    await expect(page.getByRole("heading", { name: "Signups are full for now" })).toBeVisible();
    await expect(page.getByText("LaterUp is in private preview, signups are currently full.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create my account" })).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText(/error|exception|signups_full/i);
  });

  test("the database itself refuses a new account, even if the page check is bypassed", async () => {
    const email = newEmail();
    const password = newPassword();
    const anon = createClient(env.supabaseUrl, env.anonKey, { auth: { persistSession: false } });
    const { data, error } = await anon.auth.signUp({ email, password });
    expect(error, "signup must be refused").not.toBeNull();
    expect(data.session).toBeNull();
    // Belt and braces: if an account somehow appeared, remove it
    const leaked = await signInAs(email, password).catch(() => null);
    if (leaked) await deleteTestUser(leaked.userId);
    expect(leaked, "no account was created").toBeNull();
  });
});
