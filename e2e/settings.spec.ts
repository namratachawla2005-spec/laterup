/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Settings. My profile, Change password, Text size, Edit my answers.
// ("Delete my data" is in privacy.spec.ts; "Log out" in auth.spec.ts.)
import { test, expect } from "./fixtures/test";
import { admin, signInAs } from "./fixtures/supabase";
import { newPassword } from "./fixtures/test-users";
import { open } from "./fixtures/nav";

test.describe("Settings", () => {
  test.beforeEach(async ({ herPage: page }) => {
    await open(page, "/settings");
  });

  test("My profile shows only what she already gave: name, email, age group", async ({ herPage: page, user }) => {
    const profile = page.locator("section[aria-labelledby='profile-heading']");
    await expect(profile).toContainText(user.name!);
    await expect(profile).toContainText(user.email);
    await expect(profile).toContainText("45 to 49");
    await expect(profile).toContainText("Member since");
  });

  test("Change password refuses a wrong current password", async ({ herPage: page, user }) => {
    await page.getByRole("button", { name: "Change password" }).click();
    await page.getByLabel("Current password", { exact: true }).fill("not-her-password");
    await page.getByLabel("New password", { exact: true }).fill(newPassword());
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByText("That current password isn't right. Please try again.")).toBeVisible();
    // Her old password still works
    await expect(signInAs(user.email, user.password)).resolves.toBeTruthy();
  });

  test("Change password with the right current password: the new one works, the old one doesn't", async ({ herPage: page, user }) => {
    const fresh = newPassword();
    await page.getByRole("button", { name: "Change password" }).click();
    await page.getByLabel("Current password", { exact: true }).fill(user.password);
    await page.getByLabel("New password", { exact: true }).fill(fresh);
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page.getByText("Your password has been changed.")).toBeVisible();

    await expect(signInAs(user.email, fresh)).resolves.toBeTruthy();
    await expect(signInAs(user.email, user.password)).rejects.toThrow();
  });

  test("Text size 'Larger' applies at once and is remembered on this device", async ({ herPage: page }) => {
    const larger = page.getByRole("button", { name: "Larger" });
    await larger.click();
    await expect(larger).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-text-size", "larger");

    await open(page, "/home"); // every page, not just Settings
    await expect(page.locator("html")).toHaveAttribute("data-text-size", "larger");

    await open(page, "/settings");
    await page.getByRole("button", { name: "Standard" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-text-size", "standard");
  });

  test("Edit my answers saves changes to her profile", async ({ herPage: page, user }) => {
    await page.getByRole("button", { name: /Edit my answers/ }).click();
    await expect(page.getByText("Question 1 of 7")).toBeVisible();
    await page.getByLabel("What would you like us to call you?").fill("Radha");
    for (let i = 0; i < 7; i++) await page.getByRole("button", { name: "Next" }).click();

    await expect(page.getByText("Your answers are saved.")).toBeVisible();
    const { data } = await admin().from("profiles").select("name, intake_completed").eq("id", user.id).single();
    expect(data).toEqual({ name: "Radha", intake_completed: true });
  });
});
