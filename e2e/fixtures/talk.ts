// Helpers for the Talk page: send a message the way she would, wait for
// whatever comes back, and read the 4 parts of an answer.
import { expect, type Locator, type Page, type Request } from "@playwright/test";
import { FALLBACK_INTRO } from "../../lib/answers";
import { open } from "./nav";

export type AnswerParts = {
  hearYou: string;
  whatsHappening: string;
  tryThis: string;
  doctorHeading: string;
  doctorSigns: string[];
  fullText: string;
};

export type Reply =
  | { kind: "answer"; el: Locator; text: string; parts: AnswerParts }
  | { kind: "fallback"; el: Locator; text: string }
  | { kind: "simple"; el: Locator; text: string }
  | { kind: "emergency"; text: string }
  | { kind: "notice"; text: string };

const DOCTOR_HEADING = /^(Talk to a doctor if|Please see a doctor soon)$/;

function chatItems(page: Page) {
  return page.locator("main > div.space-y-6 > :not([role='status'])");
}

export async function openTalk(page: Page) {
  await open(page, "/talk");
  await expect(page.getByLabel("Your message")).toBeVisible();
}

/** Type a message into Talk, send it, and wait for the reply (up to 60 s). */
export async function ask(page: Page, text: string): Promise<Reply> {
  const before = await chatItems(page).count();
  await page.getByLabel("Your message").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  return waitForReply(page, before);
}

export async function waitForReply(page: Page, before: number): Promise<Reply> {
  const items = chatItems(page);
  const emergencyHeading = page.locator("#emergency-heading");
  const notice = page.locator("form [role='alert']");

  await expect
    .poll(
      async () => {
        if (await emergencyHeading.isVisible()) return "emergency";
        if (await notice.isVisible()) return "notice";
        const loading = await page.locator("main [role='status']").count();
        if (loading === 0 && (await items.count()) >= before + 2) return "reply";
        return "waiting";
      },
      { timeout: 60_000, intervals: [250], message: "Talk never replied" }
    )
    .not.toBe("waiting");

  if (await emergencyHeading.isVisible()) {
    return { kind: "emergency", text: await page.locator("main [role='alert']").innerText() };
  }
  if (await notice.isVisible()) return { kind: "notice", text: await notice.innerText() };

  const el = items.last();
  const text = await el.innerText();
  if ((await el.locator("h3", { hasText: "What's likely happening" }).count()) > 0) {
    return { kind: "answer", el, text, parts: await readAnswer(el) };
  }
  if (text.includes(FALLBACK_INTRO)) return { kind: "fallback", el, text };
  return { kind: "simple", el, text };
}

export async function readAnswer(el: Locator): Promise<AnswerParts> {
  const section = (title: string | RegExp) =>
    el.locator("section").filter({ has: el.page().locator("h3").filter({ hasText: title }) });
  const body = async (title: string) => (await section(title).locator("p").first().innerText()).trim();

  const doctor = section(DOCTOR_HEADING);
  return {
    hearYou: (await el.locator(":scope > p").first().innerText()).trim(),
    whatsHappening: await body("What's likely happening"),
    tryThis: await body("One small thing to try"),
    doctorHeading: (await doctor.locator("h3").innerText()).trim(),
    doctorSigns: (await doctor.locator("li").allInnerTexts()).map((s) => s.trim()).filter(Boolean),
    fullText: await el.innerText(),
  };
}

/** The 4-part shape every real answer must have. */
export function expectFourParts(parts: AnswerParts) {
  expect(parts.hearYou, "Part 1: I hear you").not.toBe("");
  expect(parts.whatsHappening, "Part 2: What's likely happening").not.toBe("");
  expect(parts.tryThis, "Part 3: One small thing to try").not.toBe("");
  expect(parts.doctorHeading, "Part 4: doctor section").toMatch(DOCTOR_HEADING);
  expect(parts.doctorSigns.length, "Part 4 lists at least one sign").toBeGreaterThan(0);
}

/** Records every call the browser makes to /api/understand. */
export function watchUnderstand(page: Page): Request[] {
  const calls: Request[] = [];
  page.on("request", (req) => {
    if (new URL(req.url()).pathname === "/api/understand") calls.push(req);
  });
  return calls;
}
