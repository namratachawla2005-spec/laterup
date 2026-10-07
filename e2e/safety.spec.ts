// P0 Safety. The most important file in the suite.
// Every test checks what must NOT happen (no model call, no saved row),
// not only the message she sees.
import { test, expect } from "./fixtures/test";
import type { Page } from "@playwright/test";
import { ask, openTalk, watchUnderstand } from "./fixtures/talk";
import { countRows, getConfig } from "./fixtures/supabase";
import { seedUsage } from "./fixtures/seed";
import { runState, spyRequests } from "./fixtures/model-spy";
import { LENGTH_MESSAGE, OFF_TOPIC_MESSAGE } from "../lib/safety";
import { PREWRITTEN_QUESTIONS } from "../lib/answers";

const LIMIT_START = "You've asked a lot today, and that's okay.";

async function expectNothingSavedOrCounted(userId: string) {
  expect(await countRows("conversations", userId), "no conversation saved").toBe(0);
  expect(await countRows("messages", userId), "no message saved").toBe(0);
  expect(await countRows("doctor_notes", userId), "no doctor note saved").toBe(0);
  expect(await countRows("usage", userId), "no usage counted").toBe(0);
}

async function expectModelNeverSaw(text: string) {
  if (!runState().spy) return; // only provable when the spy is in the path
  expect(await spyRequests(text), "the model must never receive this").toEqual([]);
}

async function understand(page: Page, message: string) {
  const res = await page.request.post("/api/understand", { data: { message, history: [] } });
  return { status: res.status(), body: (await res.json()) as Record<string, unknown> };
}

test.describe("Safety: emergencies", () => {
  test("a physical emergency shows 112, and is never sent to the model or saved", async ({ herPage: page, user }) => {
    const calls = watchUnderstand(page);
    await openTalk(page);
    const phrase = "I have sudden chest pain and my left arm feels weak";
    const reply = await ask(page, phrase);

    expect(reply.kind).toBe("emergency");
    await expect(page.getByRole("heading", { name: "Please get help right now." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Call 112" })).toHaveAttribute("href", "tel:112");
    await expect(page.getByText(phrase)).toHaveCount(0); // her words are not left on screen

    expect(calls, "no request may reach /api/understand").toHaveLength(0);
    await expectNothingSavedOrCounted(user.id);
    await expectModelNeverSaw(phrase);
  });

  test("a self-harm message shows Tele-MANAS 14416 and 112, and is never sent or saved", async ({ herPage: page, user }) => {
    const calls = watchUnderstand(page);
    await openTalk(page);
    const phrase = "Some days I feel I want to die, nothing matters anymore";
    const reply = await ask(page, phrase);

    expect(reply.kind).toBe("emergency");
    await expect(page.getByRole("heading", { name: /You matter/ })).toBeVisible();
    await expect(page.getByText("Tele-MANAS")).toBeVisible();
    await expect(page.getByRole("link", { name: "Call 14416" })).toHaveAttribute("href", "tel:14416");
    await expect(page.getByRole("link", { name: "Call 112" })).toHaveAttribute("href", "tel:112");

    expect(calls).toHaveLength(0);
    await expectNothingSavedOrCounted(user.id);
    await expectModelNeverSaw(phrase);
  });

  test("an emergency phrased in Hinglish is caught too", async ({ herPage: page, user }) => {
    const calls = watchUnderstand(page);
    await openTalk(page);
    const reply = await ask(page, "Mujhe saans nahi aa rahi aur chakkar aa raha hai");
    expect(reply.kind).toBe("emergency");
    await expect(page.getByRole("link", { name: "Call 112" })).toBeVisible();
    expect(calls).toHaveLength(0);
    await expectNothingSavedOrCounted(user.id);
  });

  test("the server catches emergencies too, if the device check is skipped", async ({ herPage: page, user }) => {
    const physical = "I fainted twice today and passed out in the kitchen";
    const selfHarm = "I keep thinking about how to kill myself";

    expect((await understand(page, physical)).body).toEqual({ type: "emergency", kind: "physical" });
    expect((await understand(page, selfHarm)).body).toEqual({ type: "emergency", kind: "self_harm" });

    await expectNothingSavedOrCounted(user.id);
    await expectModelNeverSaw(physical);
    await expectModelNeverSaw(selfHarm);
  });
});

test.describe("Safety: topic and length", () => {
  test("an off-topic request gets the warm redirect, with no model call", async ({ herPage: page, user }) => {
    const calls = watchUnderstand(page);
    await openTalk(page);
    const reply = await ask(page, "Can you write python code to sort a list for my son?");

    expect(reply.kind).toBe("simple");
    expect(reply.kind === "simple" && reply.text).toBe(OFF_TOPIC_MESSAGE);
    expect(calls).toHaveLength(0);
    await expectNothingSavedOrCounted(user.id);
  });

  test("the server redirects off-topic requests without calling the model", async ({ herPage: page, user }) => {
    const message = "Please do my daughter's homework assignment on the French revolution";
    expect((await understand(page, message)).body).toEqual({ type: "redirect" });
    expect(await countRows("usage", user.id)).toBe(0);
    await expectModelNeverSaw(message);
  });

  test("a message over 1,000 characters gets the gentle length message and is not sent", async ({ herPage: page, user }) => {
    const calls = watchUnderstand(page);
    await openTalk(page);
    const long = "I feel tired and hot and I cannot sleep at night. ".repeat(25).slice(0, 1001);
    expect(long.length).toBe(1001);

    await page.getByLabel("Your message").fill(long);
    await expect(page.getByText("0 characters left")).toBeVisible();
    const reply = await ask(page, long);

    expect(reply.kind).toBe("notice");
    expect(reply.kind === "notice" && reply.text).toBe(LENGTH_MESSAGE);
    expect(calls).toHaveLength(0);
    await expectNothingSavedOrCounted(user.id);
  });

  test("the server refuses an over-long message without calling the model", async ({ herPage: page, user }) => {
    const long = "x".repeat(1001);
    expect((await understand(page, long)).body).toEqual({ type: "length" });
    expect(await countRows("usage", user.id)).toBe(0);
  });
});

test.describe("Safety: the daily limit", () => {
  test("at the daily cap: the warm limit message shows, pre-written answers and emergencies still work, nothing is counted", async ({
    herPage: page,
    user,
  }) => {
    const cap = (await getConfig("daily_question_cap")) ?? 30;
    await seedUsage(user.id, cap);

    // 1. The server refuses a new AI question, from usage records, not the UI
    const direct = await understand(page, "Why do my knees ache in the morning?");
    expect(direct.body.type).toBe("limit");
    expect(String(direct.body.message)).toContain(LIMIT_START);

    // 2. In Talk, she sees the warm limit message
    await openTalk(page);
    const limited = await ask(page, "Why do my knees ache so much in the mornings lately?");
    expect(limited.kind).toBe("simple");
    expect(limited.kind === "simple" && limited.text).toContain(LIMIT_START);

    // 3. A suggested question still gets its full pre-written answer
    await openTalk(page);
    const suggestion = page.getByRole("button", { name: "Why can't I sleep through the night anymore?" });
    expect(PREWRITTEN_QUESTIONS).toContain("Why can't I sleep through the night anymore?");
    await suggestion.click();
    await expect(page.getByRole("heading", { name: "What's likely happening" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /^(Talk to a doctor if|Please see a doctor soon)$/ })).toBeVisible();

    // 4. The emergency path is never blocked by the cap
    await openTalk(page);
    const emergency = await ask(page, "I have chest pain and I can't breathe");
    expect(emergency.kind).toBe("emergency");
    await expect(page.getByRole("link", { name: "Call 112" })).toBeVisible();

    // 5. None of this added a usage row
    expect(await countRows("usage", user.id)).toBe(cap);
  });
});
