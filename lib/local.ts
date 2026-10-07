/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Things that depend on HER phone: her local date and time, and short-lived
// browser storage. Only use these in code that runs in the browser.
import { useSyncExternalStore } from "react";

// "2026-10-06" in her own time zone (11:58 pm and 12:01 am are different days)
export function localDate(d = new Date()): string {
  return d.toLocaleDateString("en-CA");
}

export function daysBetween(fromDate: string, toDate: string): number {
  const ms = new Date(toDate + "T00:00:00").getTime() - new Date(fromDate + "T00:00:00").getTime();
  return Math.round(ms / 86_400_000);
}

// True only in the browser, after the page has loaded.
// Lets a component read her clock and storage without a server/browser mismatch.
const noop = () => () => {};
export function useIsBrowser(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

// sessionStorage keys. Cleared when the tab closes, and on log out,
// so nothing she typed lingers on a shared family phone.
export const DRAFT_KEY = "laterup:draft"; // unsent text on Home
export const HANDOVER_KEY = "laterup:handover"; // Home -> Talk question (never in the URL)

export function readSession(key: string): string {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function writeSession(key: string, value: string) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    // Storage blocked (private mode). Nothing to do.
  }
}

export function clearSession() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("laterup:"))
      .forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
