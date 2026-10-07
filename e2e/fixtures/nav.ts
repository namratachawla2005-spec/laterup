import type { Page } from "@playwright/test";

/**
 * Open a page and wait until it has fully loaded, so taps work.
 * (A tap that lands while the page is still loading can be lost, on a busy
 * test machine as on a slow phone. She would simply tap again; a test can't.)
 */
export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}
