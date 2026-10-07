/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// The LaterUp logo and name in terracotta. One word, capital U.
import Logo from "./Logo";

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-accent ${className}`}>
      <Logo className="h-9 w-9" />
      LaterUp
    </p>
  );
}
