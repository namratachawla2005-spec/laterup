/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// P0 Safety + P1 Functional: the public pages (About, Plans, Help, SOS,
// Forgot password), the SOS / Help buttons, and the footer on every page.
import { test, expect } from "./fixtures/test";
import type { Page } from "@playwright/test";
import { open } from "./fixtures/nav";
import { expectSafe } from "./fixtures/contract";

const PUBLIC_PAGES = [
  { path: "/about", heading: "About LaterUp" },
  { path: "/plans", heading: "Plans" },
  { path: "/help", heading: "Help" },
  { path: "/sos", heading: "Need help right now?" },
];
const APP_PAGES = ["/home", "/talk", "/patterns", "/doctor", "/settings"];
const WELLNESS = "LaterUp is a wellness guide, not medical advice.";
const COPYRIGHT = "© 2026 Namrata Chawla. All rights reserved.";
const HEALTH_WORDS = /bleed|flash|sweat|period|menopaus|sleep|mood|symptom/i;

async function expectFooter(page: Page, path: string) {
  await expect(page.getByText(WELLNESS).first(), `${path}: wellness line`).toBeVisible();
  await expect(page.getByText(COPYRIGHT).first(), `${path}: copyright line`).toBeAttached();
}

test.describe("Public pages (no login)", () => {
  for (const { path, heading } of PUBLIC_PAGES) {
    test(`${path} opens without logging in, with the wellness line and safe copy`, async ({ page }) => {
      await open(page, path);
      await expect(page).toHaveURL((url) => url.pathname === path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expectFooter(page, path);
      expect(await page.title()).not.toMatch(HEALTH_WORDS);
      expectSafe(await page.locator("main").innerText()); // no medicine names, doses, diagnoses or cures
    });
  }

  test("SOS lists the emergency numbers as tap-to-call links, with 112 and Tele-MANAS 14416", async ({ page }) => {
    await open(page, "/sos");
    for (const [number, href] of [["112", "tel:112"], ["108", "tel:108"], ["14416", "tel:14416"], ["181", "tel:181"]]) {
      await expect(page.locator(`a[href='${href}']`), `${number} is a call link`).toContainText(number);
    }
    const sites = page.locator("section[aria-labelledby='sites-heading'] a");
    for (const href of await sites.evaluateAll((els) => els.map((a) => (a as HTMLAnchorElement).href))) {
      expect(href, "government websites only, over https").toMatch(/^https:\/\/[^/]*(gov\.in|nic\.in|ncwwomenhelpline\.in)\b/);
    }
  });

  test("Plans shows prices only: no payment form and no card fields", async ({ page }) => {
    await open(page, "/plans");
    await expect(page.getByText("₹299")).toBeVisible();
    await expect(page.locator("form, input")).toHaveCount(0);
  });

  test("Forgot password is honestly 'Coming soon': the form is off and nothing is sent", async ({ page }) => {
    const resetCalls: string[] = [];
    page.on("request", (r) => {
      if (/\/auth\/v1\/recover/.test(r.url())) resetCalls.push(r.url());
    });
    await open(page, "/login");
    await page.getByRole("link", { name: "Forgot your password?" }).click();
    await expect(page.getByText("Password reset by email is coming soon.")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeDisabled();
    await expect(page.getByRole("button", { name: "Coming soon" })).toBeDisabled();
    await expectFooter(page, "/forgot-password");
    expect(resetCalls).toHaveLength(0);
  });

  test("Welcome links to About and Plans, and shows SOS and Help", async ({ page }) => {
    await open(page, "/");
    await expect(page.getByRole("link", { name: /About/ }).first()).toHaveAttribute("href", "/about");
    await expect(page.getByRole("link", { name: /Plans/ }).first()).toHaveAttribute("href", "/plans");
    await expect(page.getByRole("link", { name: "SOS: emergency numbers" }).first()).toHaveAttribute("href", "/sos");
    await expect(page.getByRole("link", { name: "Help" }).first()).toHaveAttribute("href", "/help");
    await expectFooter(page, "/");
  });
});

test.describe("SOS and Help on every app page", () => {
  test("every app page has SOS and Help (Talk in its top bar), the wellness line and the copyright", async ({ herPage: page }) => {
    for (const path of APP_PAGES) {
      await open(page, path);
      const sos = page.getByRole("link", { name: "SOS: emergency numbers" });
      await expect(sos, `${path}: SOS`).toHaveCount(1);
      await expect(sos).toBeVisible();
      await expect(sos).toHaveAttribute("href", "/sos");
      await expect(page.getByRole("link", { name: "Help", exact: true }), `${path}: Help`).toBeVisible();
      await expectFooter(page, path);
    }
  });

  test("a logged-in user is sent away from Forgot password, but can still open SOS and Help", async ({ herPage: page }) => {
    await open(page, "/forgot-password");
    await expect(page).toHaveURL((url) => url.pathname !== "/forgot-password");
    for (const path of ["/sos", "/help"]) {
      await open(page, path);
      await expect(page).toHaveURL((url) => url.pathname === path);
    }
  });
});
