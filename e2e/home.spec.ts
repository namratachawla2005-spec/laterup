/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Home. The daily check-in, saved to her own row.
import { test, expect } from "./fixtures/test";
import type { Page } from "@playwright/test";
import { admin } from "./fixtures/supabase";

const feelingGroup = (page: Page) => page.getByRole("group", { name: "How's today? Good, Okay or Tough" });
const botheringGroup = (page: Page) => page.getByRole("group", { name: "Anything bothering you today? Tap any." });

async function todaysCheckIn(userId: string) {
  const { data } = await admin().from("check_ins").select("feeling, sleep, energy, bothering, bothering_other").eq("user_id", userId);
  return data ?? [];
}

test.describe("Home: daily check-in", () => {
  test("one tap on how today feels saves the day straight away", async ({ herPage: page, user }) => {
    await feelingGroup(page).getByRole("button", { name: "Tough" }).click();
    await expect.poll(() => todaysCheckIn(user.id)).toEqual([
      expect.objectContaining({ feeling: "tough", sleep: null, energy: null }),
    ]);
  });

  test("sleep, energy and what's bothering her are saved when she taps Done", async ({ herPage: page, user }) => {
    await feelingGroup(page).getByRole("button", { name: "Okay" }).click();
    await page.getByRole("group", { name: /sleep/i }).getByRole("button", { name: "On and off" }).click();
    await page.getByRole("group", { name: /energy/i }).getByRole("button", { name: "Low" }).click();
    await botheringGroup(page).getByRole("button", { name: "Poor sleep" }).click();
    await botheringGroup(page).getByRole("button", { name: "Something else" }).click();
    await page.getByLabel("What else is bothering you?").fill("Tingling in my feet");
    await page.getByRole("button", { name: "Done" }).click();

    await expect(page.getByText("Thanks for checking in!")).toBeVisible();
    await expect.poll(() => todaysCheckIn(user.id)).toEqual([
      {
        feeling: "okay",
        sleep: "on_off",
        energy: "low",
        bothering: ["poor_sleep", "something_else"],
        bothering_other: "Tingling in my feet",
      },
    ]);
  });

  test("'Everything is good' clears the symptoms, and picking a symptom clears it", async ({ herPage: page, user }) => {
    await feelingGroup(page).getByRole("button", { name: "Good" }).click();
    const good = botheringGroup(page).getByRole("button", { name: "Everything is good" });
    const sleep = botheringGroup(page).getByRole("button", { name: "Poor sleep" });

    await sleep.click();
    await good.click();
    await expect(good).toHaveAttribute("aria-pressed", "true");
    await expect(sleep).toHaveAttribute("aria-pressed", "false");

    await sleep.click();
    await expect(good).toHaveAttribute("aria-pressed", "false");
    await good.click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Thanks for checking in!")).toBeVisible();

    await expect.poll(async () => (await todaysCheckIn(user.id))[0]?.bothering).toEqual(["none"]);
  });

  test("a tough day offers a gentle way to talk, without guilt", async ({ herPage: page }) => {
    await feelingGroup(page).getByRole("button", { name: "Tough" }).click();
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByText("Tough days happen.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Want to talk about it?" })).toBeVisible();
  });
});
