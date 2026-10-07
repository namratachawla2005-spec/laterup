/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

// "How we protect you". Opens in place on the page (no pop-ups, per CLAUDE.md).
// Reused later in Settings.
import { useState } from "react";

export const PROTECT_POINTS = [
  "Your answers are saved to your own private account, and only you can see them",
  "We only ask for an email and password, to keep your account yours. No phone number.",
  "We never sell or share your information",
  "You can delete everything from Settings at any time",
];

export default function ProtectPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="protect-panel"
        className="inline-flex items-center gap-2 rounded-card-sm px-2 font-medium text-primary underline underline-offset-4"
      >
        How we protect you
        <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul id="protect-panel" className="mt-4 space-y-3 rounded-card bg-surface p-5 text-left">
          {PROTECT_POINTS.map((point) => (
            <li key={point} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-accent" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
