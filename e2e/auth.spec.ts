/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Auth. Sign up, log in, log out, and the login gate.
// (The signup cap is tested in signup-cap.spec.ts, which runs last.)
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures/test";
import { deleteTestUser, logIn, newEmail, newPassword, trackUser } from "./fixtures/test-users";
import { signInAs } from "./fixtures/supabase";
import { open } from "./fixtures/nav";

const APP_PAGES = ["/home", "/talk", "/patterns", "/doctor", "/settings"];

// The form's own message (Next.js also has an empty, hidden "alert" for page changes)
const formMessage = (page: Page) => page.locator("form p[role='alert']");

test.describe("Auth", () => {
  test("a new user can sign up and goes straight in, with no email confirmation step", async ({ page }) => {
    const email = newEmail();
    const password = newPassword();
    let userId: string | null = null;
    try {
      await open(page,"/");
      await page.getByRole("link", { name: "Let's begin" }).click();
      await expect(page.getByRole("heading", { name: "Create your private space" })).toBeVisible();

      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Create my account" }).click();

      // Logged in at once, on the two promises (the start of intake)
      // (Waits on Supabase over the internet, which can be slow when the whole suite runs at once)
      await expect(page.getByRole("heading", { name: "Before we start, two promises" })).toBeVisible({ timeout: 30_000 });
      userId = (await signInAs(email, password)).userId;
      trackUser(userId);
    } finally {
      if (!userId) userId = await signInAs(email, password).then((r) => r.userId).catch(() => null);
      if (userId) await deleteTestUser(userId);
    }
  });

  test("a short password is refused with a plain message, and no account is made", async ({ page }) => {
    const email = newEmail();
    await open(page,"/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("short");
    // Bypass the browser's own minlength check so the app's message is what we see
    await page.getByLabel("Password", { exact: true }).evaluate((el) => el.removeAttribute("minlength"));
    await page.getByRole("button", { name: "Create my account" }).click();
    await expect(formMessage(page)).toHaveText("Please choose a password with at least 8 characters.");
    await expect(signInAs(email, "short")).rejects.toThrow();
  });

  test("an existing user can log in and lands on Home", async ({ page, user }) => {
    await logIn(page, user);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(user.name!);
  });

  test("a wrong password shows a short, human message and stays on Log in", async ({ page, user }) => {
    await open(page,"/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill("not-her-password");
    await page.getByRole("button", { name: "Log in" }).click();
    const alert = formMessage(page);
    await expect(alert).toHaveText("That email and password don't match. Please try again.");
    await expect(alert).not.toContainText(/error|invalid_credentials|status|4\d\d/i);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("log out returns to Welcome and locks the app pages again", async ({ herPage: page }) => {
    await expect(page.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    await open(page, "/settings");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.getByRole("heading", { name: /Midlife is a new chapter/ })).toBeVisible({ timeout: 30_000 });

    await open(page,"/home");
    await expect(page).toHaveURL((url) => url.pathname === "/");
    await expect(page.getByRole("link", { name: "Let's begin" })).toBeVisible();
  });

  test("a logged-out visitor cannot open any app page", async ({ page }) => {
    for (const path of APP_PAGES) {
      await open(page,path);
      await expect(page, `${path} should send her to Welcome`).toHaveURL((url) => url.pathname === "/");
    }
  });
});
