/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
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
