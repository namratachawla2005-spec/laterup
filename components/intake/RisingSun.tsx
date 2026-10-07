/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// A still, abstract rising sun: a terracotta half-sun on the horizon with two soft rings.
// Decorative only, hidden from screen readers.
export default function RisingSun({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 124"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M8 120 A112 112 0 0 1 232 120" fill="none" stroke="var(--color-surface)" strokeWidth="14" />
      <path d="M40 120 A80 80 0 0 1 200 120" fill="none" stroke="var(--color-gentle)" strokeWidth="6" opacity="0.55" />
      <path d="M68 120 A52 52 0 0 1 172 120 Z" fill="var(--color-accent)" />
      <line x1="0" y1="121" x2="240" y2="121" stroke="var(--color-text)" strokeOpacity="0.18" strokeWidth="2" />
    </svg>
  );
}
