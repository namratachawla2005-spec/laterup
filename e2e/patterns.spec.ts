/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Patterns. Honest observations from her own check-ins.
// Never invented, never a cause, and the example never mixes with her data.
import { test, expect } from "./fixtures/test";
import type { Page } from "@playwright/test";
import { countAllRows } from "./fixtures/supabase";
import { seedCheckIns, seedTrying } from "./fixtures/seed";
import { expectNoCausalClaim } from "./fixtures/contract";
import { open } from "./fixtures/nav";

const MEENA_HABIT = "Last chai before 4 pm + 10 minutes of slow breathing";

async function allInsights(page: Page): Promise<string[]> {
  const card = page.locator("section[aria-labelledby='noticed-heading']");
  if ((await card.count()) === 0) return [];
  const seen: string[] = [];
  const another = card.getByRole("button", { name: "See another" });
  for (let i = 0; i < 6; i++) {
    const text = (await card.locator("p").first().innerText()).trim();
    if (seen.includes(text)) break;
    seen.push(text);
    if ((await another.count()) === 0) break;
    await another.click();
  }
  return seen;
}

test.describe("Patterns", () => {
  test("with too little data she sees the honest 'not enough yet' state, and no insight", async ({ herPage: page, user }) => {
    await seedCheckIns(user.id, [{ feeling: "tough" }, { feeling: "okay" }]);
    await open(page,"/patterns");
    await expect(page.getByRole("heading", { name: "Your patterns will grow here" })).toBeVisible();
    await expect(page.getByText("2 of 7 check-ins to your first pattern")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Something we noticed" })).toHaveCount(0);
  });

  test("with fewer than 7 check-ins, the days show but nothing is concluded from them", async ({ herPage: page, user }) => {
    await seedCheckIns(user.id, [
      { feeling: "tough", sleep: "barely" },
      { feeling: "tough", sleep: "barely" },
      { feeling: "good", sleep: "well" },
      { feeling: "good", sleep: "well" },
      { feeling: "okay" },
    ]);
    await open(page,"/patterns");
    await expect(page.getByRole("heading", { name: "How your days have been" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Something we noticed" })).toHaveCount(0);
  });

  test("real observations quote her own numbers, are labelled as patterns, and never claim a cause", async ({ herPage: page, user }) => {
    // 10 days: 5 bad nights that were all tough days, 5 good nights that were all good days
    const bad = { feeling: "tough", sleep: "barely", energy: "okay" } as const;
    const good = { feeling: "good", sleep: "well", energy: "okay" } as const;
    await seedCheckIns(user.id, [bad, good, bad, good, bad, good, bad, good, bad, good]);

    await open(page,"/patterns");
    await expect(page.getByRole("heading", { name: "Something we noticed" })).toBeVisible();
    const insights = await allInsights(page);
    expect(insights.join("\n")).toContain("On days after you slept badly, 5 of 5 were tough days. On other days, none of 5 were tough.");
    for (const text of insights) expectNoCausalClaim(text);
    await expect(page.getByText("This is a pattern from your check-ins, not a medical finding.")).toBeVisible();
    await expect(page.getByText(/\d+\s?%/)).toHaveCount(0); // never percentages
  });

  test("example mode shows Meena's sample, clearly labelled, never mixed with her data, and saves nothing", async ({ herPage: page, user }) => {
    const herHabit = "Jeera water after lunch (e2e)";
    await seedCheckIns(user.id, [{ feeling: "good" }, { feeling: "okay" }, { feeling: "good" }, { feeling: "tough" }, { feeling: "good" }]);
    await seedTrying(user.id, herHabit);
    const before = await countAllRows(user.id);

    await open(page,"/patterns");
    await expect(page.getByText(herHabit)).toBeVisible();
    await expect(page.getByText(MEENA_HABIT)).toHaveCount(0);

    await page.getByRole("button", { name: "See an example" }).click();
    await expect(page.getByText("This is an example.")).toBeVisible();
    await expect(page.getByText(MEENA_HABIT).first()).toBeVisible();
    await expect(page.getByText(herHabit), "her real data is hidden in the example").toHaveCount(0);

    await page.getByRole("button", { name: "Exit example" }).click();
    await expect(page.getByText("This is an example.")).toHaveCount(0);
    await expect(page.getByText(herHabit)).toBeVisible();
    await expect(page.getByText(MEENA_HABIT)).toHaveCount(0);

    expect(await countAllRows(user.id), "the example writes nothing").toEqual(before);
  });
});
