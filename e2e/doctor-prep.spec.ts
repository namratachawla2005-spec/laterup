/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Doctor Prep. Example mode, a real prep sheet, and the
// Hindi conversation starter.
import { test, expect } from "./fixtures/test";
import { admin, countRows } from "./fixtures/supabase";
import { seedCheckIns, seedDoctorNote } from "./fixtures/seed";
import { open } from "./fixtures/nav";

test.describe("Doctor Prep", () => {
  test("with no data she sees an honest empty state, and can still prepare", async ({ herPage: page }) => {
    await open(page,"/doctor");
    await expect(page.getByRole("heading", { name: "Ready for your doctor" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your summary will build itself" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Not sure how to begin?" })).toBeVisible();
    await expect(page.getByText("LaterUp is a wellness guide, not medical advice.").first()).toBeVisible();
  });

  test("example mode shows a sample prep sheet, with sharing off and nothing saved", async ({ herPage: page, user }) => {
    const { data: prepBefore } = await admin().from("doctor_prep").select("*").eq("user_id", user.id).single();

    await open(page,"/doctor");
    await page.getByRole("button", { name: "See an example" }).click();
    await expect(page.getByText("This is an example.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your summary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Questions you could ask" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Share on WhatsApp" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Copy text" })).toBeDisabled();
    await expect(page.getByText("Sharing is turned off in the example.")).toBeVisible();

    await page.getByRole("button", { name: "Exit example" }).click();
    await expect(page.getByText("This is an example.")).toHaveCount(0);

    const { data: prepAfter } = await admin().from("doctor_prep").select("*").eq("user_id", user.id).single();
    expect(prepAfter, "the example never writes to her prep").toEqual(prepBefore);
    expect(await countRows("doctor_notes", user.id)).toBe(0);
  });

  test("real data builds a prep summary she can show her doctor", async ({ herPage: page, user }) => {
    const herWords = "Night sweats wake me at 3 am, e2e note";
    await seedCheckIns(user.id, [
      { feeling: "tough", sleep: "barely", energy: "low", bothering: ["hot_flashes"] },
      { feeling: "okay", sleep: "on_off", energy: "okay", bothering: ["hot_flashes"] },
      { feeling: "tough", sleep: "barely", energy: "low", bothering: ["poor_sleep"] },
      { feeling: "good", sleep: "well", energy: "good" },
    ]);
    await seedDoctorNote(user.id, herWords);

    await open(page,"/doctor");
    await expect(page.getByRole("heading", { name: "Your summary" })).toBeVisible();
    await expect(page.getByText(herWords).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Questions you could ask" })).toBeVisible();
    const questions = page.locator("section[aria-labelledby='questions-heading'] li");
    expect(await questions.count()).toBeGreaterThanOrEqual(3);

    // "Show to doctor": a full-screen, large-text view of the same summary
    await page.getByRole("button", { name: "Show to doctor" }).click();
    const sheet = page.getByRole("dialog", { name: "Health summary" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText(herWords);
    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(sheet).toHaveCount(0);
  });

  test("the Hindi conversation starter renders in Devanagari with the Hindi font", async ({ herPage: page }) => {
    await open(page,"/doctor");
    const hindiButton = page.getByRole("button", { name: "हिंदी" });
    await hindiButton.click();
    await expect(hindiButton).toHaveAttribute("aria-pressed", "true");

    const starter = page.locator("section[aria-labelledby='starter-heading'] p[lang='hi']");
    await expect(starter).toBeVisible();
    const text = await starter.innerText();
    expect(text).toMatch(/डॉक्टर/);
    expect(text, "mostly Devanagari script").toMatch(/[ऀ-ॿ]{3,}/);
    expect(text).not.toMatch(/[A-Za-z]{3,}/); // no English left in the Hindi line

    const font = await starter.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toMatch(/Noto.?Sans.?Devanagari/i);
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].some((f) => /Devanagari/i.test(f.family) && f.status === "loaded");
    });
    expect(loaded, "the Devanagari web font actually loaded").toBe(true);
    await test.info().attach("hindi-starter", { body: await starter.screenshot(), contentType: "image/png" });

    await page.getByRole("button", { name: "English" }).click();
    await expect(page.locator("section[aria-labelledby='starter-heading'] p[lang='en']")).toContainText("Doctor,");
  });
});
