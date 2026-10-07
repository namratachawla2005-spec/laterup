/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P0 Privacy: Row Level Security between two real accounts, "Delete my data",
// and no health details in URLs or tab titles.
import { test, expect } from "./fixtures/test";
import { admin, countAllRows, signInAs, USER_TABLES } from "./fixtures/supabase";
import { createTestUser, deleteTestUser, logIn, type TestUser } from "./fixtures/test-users";
import { seedEverything } from "./fixtures/seed";
import { indiaDate } from "./fixtures/supabase";
import { open } from "./fixtures/nav";

test.describe("Privacy: Row Level Security", () => {
  let a: TestUser;
  let b: TestUser;
  let aRows: { conversationId: string; tryingId: string };
  const secret = `Secretword${Math.random().toString(36).slice(2, 8)}`;

  test.beforeEach(async () => {
    [a, b] = await Promise.all([createTestUser(), createTestUser({ profile: { name: "Bindu" } })]);
    aRows = await seedEverything(a.id, secret);
  });
  test.afterEach(async () => {
    await Promise.all([deleteTestUser(a.id), deleteTestUser(b.id)]);
  });

  test("account B cannot read any of account A's rows, in any table", async () => {
    const { client } = await signInAs(b.email, b.password);
    for (const { table, column } of USER_TABLES) {
      const { data, error } = await client.from(table).select("*").eq(column, a.id);
      expect(error, `${table}: read should not error`).toBeNull();
      expect(data, `${table}: B must see none of A's rows`).toEqual([]);

      // And an unfiltered read returns only B's own rows
      const { data: all } = await client.from(table).select(column);
      for (const row of all ?? []) expect((row as Record<string, string>)[column], `${table}: only her own rows`).toBe(b.id);
    }
  });

  test("account B cannot change, delete or add rows for account A", async () => {
    const { client } = await signInAs(b.email, b.password);

    // Update and delete silently match nothing under RLS
    await client.from("profiles").update({ name: "Hacked" }).eq("id", a.id);
    await client.from("check_ins").delete().eq("user_id", a.id);
    await client.from("conversations").delete().eq("id", aRows.conversationId);
    await client.from("doctor_notes").update({ her_words: "Hacked" }).eq("user_id", a.id);

    // Inserts pretending to be A, or into A's conversation, are refused
    const asA = await client.from("check_ins").insert({ user_id: a.id, date: indiaDate(-5), feeling: "good" });
    expect(asA.error, "insert as A is refused").not.toBeNull();
    const intoAConv = await client
      .from("messages")
      .insert({ conversation_id: aRows.conversationId, user_id: b.id, role: "user", content: { text: "x" } });
    expect(intoAConv.error, "insert into A's conversation is refused").not.toBeNull();
    const feedback = await client
      .from("trying_feedback")
      .insert({ trying_id: aRows.tryingId, user_id: b.id, date: indiaDate(), answer: "yes" });
    expect(feedback.error, "feedback on A's item is refused").not.toBeNull();

    // She can't fake or erase usage, or touch app settings
    expect((await client.from("usage").insert({ user_id: b.id, provider: "ollama", model: "x" })).error).not.toBeNull();
    expect((await client.from("usage").delete().eq("user_id", b.id).select()).data ?? []).toEqual([]);
    const config = await client.from("app_config").select("*");
    expect(config.data ?? [], "app_config is hidden").toEqual([]);

    // A's data is untouched
    const { data: profile } = await admin().from("profiles").select("name").eq("id", a.id).single();
    expect(profile?.name).toBe(secret);
    const counts = await countAllRows(a.id);
    expect(counts.check_ins).toBe(1);
    expect(counts.conversations).toBe(1);
    expect(counts.messages).toBe(1);
    const { data: note } = await admin().from("doctor_notes").select("her_words").eq("user_id", a.id).single();
    expect(note?.her_words).toContain(secret);
  });

  test("account B's pages never show account A's words", async ({ page }) => {
    await logIn(page, b);
    for (const path of ["/home", "/talk", "/patterns", "/doctor", "/settings"]) {
      await open(page,path);
      await expect(page.locator("main").first()).toBeVisible();
      await expect(page.locator("body"), `${path} must not show A's data`).not.toContainText(secret);
    }
  });
});

test.describe("Privacy: Delete my data", () => {
  test("removes her account and every row she owns, then signs her out", async ({ page }) => {
    const user = await createTestUser();
    try {
      await seedEverything(user.id, "Deleteme");
      const before = await countAllRows(user.id);
      for (const [table, n] of Object.entries(before)) expect(n, `${table} seeded`).toBeGreaterThan(0);

      await logIn(page, user);
      await open(page, "/settings");
      await page.getByRole("button", { name: "Delete my data" }).click();
      await expect(page.getByText("Are you sure? This will remove everything and can't be undone.")).toBeVisible();
      await page.getByRole("button", { name: "Yes, delete everything" }).click();

      await expect(page.getByRole("heading", { name: /Midlife is a new chapter/ })).toBeVisible({ timeout: 30_000 });

      // Nothing orphaned: every table is empty for her, and the login is gone
      const after = await countAllRows(user.id);
      expect(after).toEqual(Object.fromEntries(Object.keys(before).map((t) => [t, 0])));
      const { data } = await admin().auth.admin.getUserById(user.id);
      expect(data.user).toBeNull();
      await expect(signInAs(user.email, user.password)).rejects.toThrow();

      // And her browser no longer gets in
      await open(page,"/home");
      await expect(page).toHaveURL((url) => url.pathname === "/");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("Cancel keeps everything", async ({ herPage: page, user }) => {
    await open(page, "/settings");
    await page.getByRole("button", { name: "Delete my data" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("button", { name: "Delete my data" })).toBeVisible();
    expect((await admin().auth.admin.getUserById(user.id)).data.user?.id).toBe(user.id);
  });
});

test.describe("Privacy: URLs and tab titles", () => {
  test("no health detail appears in the URL or the browser tab title, on any page", async ({ herPage: page }) => {
    const words = "heavy bleeding and hot flashes at night";
    const health = /bleed|flash|sweat|period|menopaus|sleep|mood|symptom/i;

    // Her words travel from Home to Talk without touching the URL
    await page.getByLabel("What's on your mind?").fill(`[e2e:stub] I have ${words}`);
    await page.getByRole("button", { name: "Help me understand" }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/talk" && url.search === "" && url.hash === "");
    await expect(page.getByText(words)).toBeVisible();
    expect(await page.title()).toBe("LaterUp");

    for (const path of ["/home", "/talk", "/patterns", "/doctor", "/settings"]) {
      await open(page,path);
      await expect(page.locator("main").first()).toBeVisible();
      expect(await page.title(), `${path} tab title`).toBe("LaterUp");
      expect(page.url(), `${path} URL`).not.toMatch(health);
    }
  });

  test("the AI and delete routes refuse visitors who are not logged in", async ({ request }) => {
    const understand = await request.post("/api/understand", { data: { message: "Why am I so tired?" } });
    expect(understand.status()).toBe(401);

    const del = await request.post("/api/delete-account", { headers: { "Content-Type": "text/plain" }, data: "x" });
    expect(del.status(), "cross-site style form post refused").toBe(400);
    const delJson = await request.post("/api/delete-account", { data: {} });
    expect(delJson.status()).toBe(401);
  });
});
