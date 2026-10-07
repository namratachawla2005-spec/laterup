/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Intake. The consent gate, the 7 questions, and Home.
import { test, expect } from "./fixtures/test";
import { createTestUser, deleteTestUser, logIn, type TestUser } from "./fixtures/test-users";
import { admin } from "./fixtures/supabase";

test.describe("Intake", () => {
  let newUser: TestUser;
  test.beforeEach(async () => {
    newUser = await createTestUser({ intake: false });
  });
  test.afterEach(async () => {
    await deleteTestUser(newUser.id);
  });

  test("Continue stays disabled until she ticks the consent box", async ({ page }) => {
    await logIn(page, newUser, "/");
    await expect(page.getByRole("heading", { name: "Before we start, two promises" })).toBeVisible();

    const cont = page.getByRole("button", { name: "Continue" });
    await expect(cont).toBeDisabled();
    await page.getByLabel("I understand LaterUp is a wellness guide, not medical advice.").check();
    await expect(cont).toBeEnabled();

    // Nothing saved until she taps Continue
    const { data } = await admin().from("profiles").select("consent_given").eq("id", newUser.id).single();
    expect(data?.consent_given).toBe(false);
  });

  test("completing intake saves her answers and lands on Home, greeting her by name", async ({ page }) => {
    await logIn(page, newUser, "/");
    await page.getByLabel("I understand LaterUp is a wellness guide, not medical advice.").check();
    await page.getByRole("button", { name: "Continue" }).click();

    const next = () => page.getByRole("button", { name: "Next" }).click();
    const pick = (label: string) => page.getByRole("button", { name: label, exact: true }).click();

    await expect(page.getByText("Question 1 of 7")).toBeVisible();
    await page.getByLabel("What would you like us to call you?").fill("Meera");
    await next();
    await pick("45 to 49");
    await next();
    await pick("My periods have become irregular");
    await next();
    await pick("Poor sleep");
    await pick("Hot flashes or night sweats");
    await next();
    await pick("Vegetarian");
    await next();
    await pick("I live in a joint family");
    await pick("I care for parents or in-laws");
    await next();
    await pick("Not yet");
    await next();

    await expect(page.getByRole("heading", { name: "Thank you, Meera." })).toBeVisible();
    await page.getByRole("button", { name: "Take me to LaterUp" }).click();

    // Home: greeting with her name, and the day's starting points
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Meera");
    await expect(page.getByLabel("What's on your mind?")).toBeVisible();
    await expect(page.getByRole("heading", { name: "How's today?" })).toBeVisible();
    await expect(page.getByText("LaterUp is a wellness guide, not medical advice.").first()).toBeVisible();

    // Saved to her profile row
    const { data } = await admin().from("profiles").select("*").eq("id", newUser.id).single();
    expect(data).toMatchObject({
      name: "Meera",
      age_group: "45-49",
      stage: "perimenopause",
      diet: "vegetarian",
      doctor_status: "not_yet",
      consent_given: true,
      intake_completed: true,
    });
    expect([...data!.top_symptoms].sort()).toEqual(["hot_flashes", "poor_sleep"]);
    expect([...data!.life_context].sort()).toEqual(["cares_for_elders", "joint_family"]);
  });

  test("Back and Skip for now never lose or invent an answer", async ({ page }) => {
    await logIn(page, newUser, "/");
    await page.getByLabel("I understand LaterUp is a wellness guide, not medical advice.").check();
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: "Skip for now" }).click(); // skip the name
    await expect(page.getByText("Question 2 of 7")).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Question 1 of 7")).toBeVisible();

    const { data } = await admin().from("profiles").select("name, intake_completed").eq("id", newUser.id).single();
    expect(data).toEqual({ name: null, intake_completed: false });
  });

  test("she can pick up to 5 symptoms, and her own words for 'Something else' and 'Other' are saved", async ({ page }) => {
    await logIn(page, newUser, "/");
    await page.getByLabel("I understand LaterUp is a wellness guide, not medical advice.").check();
    await page.getByRole("button", { name: "Continue" }).click();
    const next = () => page.getByRole("button", { name: "Next" }).click();
    const pick = (label: string) => page.getByRole("button", { name: label, exact: true }).click();

    await page.getByRole("button", { name: "Skip for now" }).click();
    await pick("50 to 54");
    await next();
    await pick("My periods stopped less than a year ago");
    await next();

    await expect(page.getByText("Pick up to 5")).toBeVisible();
    for (const s of ["Poor sleep", "Headaches", "Weight changes", "Tiredness or low energy", "Something else"]) await pick(s);
    await expect(page.getByRole("button", { name: "Hair or skin changes", exact: true })).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText("You've picked 5.")).toBeVisible();
    await page.getByLabel("What else has been bothering you?").fill("Dry eyes in the evening");
    await next();

    await pick("Other");
    await page.getByRole("textbox", { name: "How do you usually eat?" }).fill("Pescatarian, mostly Bengali food");
    await next();
    await pick("I live in a nuclear family");
    await pick("Other");
    await page.getByLabel("Tell us a little about your life at home").fill("I run a small tailoring shop");
    await next();
    await pick("I'm not comfortable talking about it");
    await next();
    await expect(page.getByRole("heading", { name: "Thank you for sharing." })).toBeVisible();

    const { data } = await admin().from("profiles").select("*").eq("id", newUser.id).single();
    expect(data!.top_symptoms).toHaveLength(5);
    expect(data).toMatchObject({
      symptoms_other: "Dry eyes in the evening",
      diet: "other",
      diet_other: "Pescatarian, mostly Bengali food",
      life_context_other: "I run a small tailoring shop",
      doctor_status: "not_comfortable",
      intake_completed: true,
    });
    expect([...data!.life_context].sort()).toEqual(["nuclear_family", "other"]);
  });

  test("'Nothing right now, I'm feeling good' clears other symptoms and gets a warm thank-you", async ({ page }) => {
    await logIn(page, newUser, "/");
    await page.getByLabel("I understand LaterUp is a wellness guide, not medical advice.").check();
    await page.getByRole("button", { name: "Continue" }).click();
    const skip = () => page.getByRole("button", { name: "Skip for now" }).click();

    await skip(); // name
    await skip(); // age
    await skip(); // stage
    const sleep = page.getByRole("button", { name: "Poor sleep", exact: true });
    const none = page.getByRole("button", { name: "Nothing right now, I'm feeling good", exact: true });
    await sleep.click();
    await none.click();
    await expect(none).toHaveAttribute("aria-pressed", "true");
    await expect(sleep).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Next" }).click();
    await skip(); // diet
    await skip(); // life
    await skip(); // doctor

    await expect(page.getByText("Lovely to hear you're feeling good.")).toBeVisible();
    const { data } = await admin().from("profiles").select("top_symptoms").eq("id", newUser.id).single();
    expect(data!.top_symptoms).toEqual(["none"]);
  });
});
