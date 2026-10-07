/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P1 Functional: Talk, the hero. These call the real AI model (@model), so
// they run at most 2 at a time. They check the answer CONTRACT (4 parts,
// nothing unsafe, bounded length), never exact wording.
import { test, expect } from "./fixtures/test";
import { ask, expectFourParts, openTalk, waitForReply } from "./fixtures/talk";
import { expectSafe } from "./fixtures/contract";
import { admin, countRows } from "./fixtures/supabase";
import { MODEL_DOWN_REASON, runState } from "./fixtures/model-spy";
import { env } from "./fixtures/env";

test.beforeEach(() => {
  test.skip(!runState().modelUp, MODEL_DOWN_REASON);
  test.info().annotations.push({ type: "provider", description: runState().provider });
});

test.describe("Talk @model", () => {
  test("a question in her own words gets one warm answer in four parts, with nothing unsafe", async ({ herPage: page, user }) => {
    await openTalk(page);
    const reply = await ask(page, "I wake up at 3 am drenched in sweat and then I just can't fall asleep again. Why is this happening?");

    expect(reply.kind, `Expected a full answer, got: ${"text" in reply ? reply.text : ""}`).toBe("answer");
    if (reply.kind !== "answer") return;
    expectFourParts(reply.parts);
    expectSafe(reply.parts.fullText);
    expect(reply.parts.fullText.length, "answer stays short").toBeLessThan(3000);
    await expect(reply.el.getByText("LaterUp is a wellness guide, not medical advice.")).toBeVisible();

    // Her name is added on her device, after the model answered
    expect(reply.parts.hearYou).toContain(user.name!);

    // Usage: one row, token counts only, within the hard wall
    const { data: usage } = await admin().from("usage").select("*").eq("user_id", user.id);
    expect(usage).toHaveLength(1);
    expect(usage![0].output_tokens).toBeLessThanOrEqual(env.maxAnswerTokens);
    expect(Object.keys(usage![0]).sort()).toEqual(
      ["created_at", "id", "input_tokens", "model", "output_tokens", "provider", "total_tokens", "usage_date", "user_id"].sort()
    );
  });

  test("the conversation is saved to her own rows and shows again when she comes back", async ({ herPage: page, user }) => {
    await openTalk(page);
    const question = "My mood swings are making me snap at my mother-in-law. What can I do?";
    const reply = await ask(page, question);
    expect(reply.kind).toBe("answer");

    await expect.poll(() => countRows("messages", user.id), { message: "her question and the answer are saved" }).toBe(2);
    expect(await countRows("conversations", user.id)).toBe(1);
    const { data: msgs } = await admin().from("messages").select("role, content").eq("user_id", user.id).order("created_at");
    expect(msgs![0]).toEqual({ role: "user", content: { text: question } });
    expect(msgs![1].role).toBe("assistant");

    // Come back later: it is listed under Recent and opens again in full
    await openTalk(page);
    await expect(page.getByRole("heading", { name: "Recent" })).toBeVisible();
    await page.getByRole("button", { name: question.slice(0, 30) }).click();
    await expect(page.getByText(question)).toBeVisible();
    await expect(page.getByRole("heading", { name: "What's likely happening" })).toBeVisible();
  });

  test("tapping a suggested question gets a full four-part answer", async ({ herPage: page }) => {
    await openTalk(page);
    const before = await page.locator("main > div.space-y-6 > :not([role='status'])").count();
    await page.getByRole("button", { name: "Why do I suddenly feel so hot?" }).click();
    const reply = await waitForReply(page, before);
    expect(reply.kind).toBe("answer"); // AI answer, or the pre-written one if the AI is slow
    if (reply.kind === "answer") {
      expectFourParts(reply.parts);
      expectSafe(reply.parts.fullText);
    }
  });

  test("I'll try this and Add to my doctor notes save to her own rows", async ({ herPage: page, user }) => {
    await openTalk(page);
    const reply = await ask(page, "I feel so tired every afternoon, even after a full night's sleep.");
    expect(reply.kind).toBe("answer");
    if (reply.kind !== "answer") return;

    await reply.el.getByRole("button", { name: "I'll try this" }).first().click();
    await expect(reply.el.getByText("✓ Added. We'll ask how it's going.")).toBeVisible();
    await reply.el.getByRole("button", { name: "Add to my doctor notes" }).click();
    await expect(reply.el.getByText("✓ Saved for your doctor")).toBeVisible();

    expect(await countRows("trying", user.id)).toBe(1);
    const { data: notes } = await admin().from("doctor_notes").select("her_words").eq("user_id", user.id);
    expect(notes).toEqual([{ her_words: "I feel so tired every afternoon, even after a full night's sleep." }]);
  });
});
