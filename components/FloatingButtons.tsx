"use client";

// Two floating buttons, bottom-right on every page: SOS (terracotta) and Help (teal).
// They just open their pages (no pop-ups). Talk has both in its top bar instead,
// so nothing floats over the chat. Each is hidden on its own page.
// CLAUDE.md: never white text on terracotta, so SOS is terracotta on cream.
import Link from "next/link";
import { usePathname } from "next/navigation";

const WITH_BOTTOM_BAR = ["/home", "/patterns", "/doctor"];

const sosClass = "flex h-12 items-center gap-1.5 rounded-full border-[3px] border-accent bg-background pr-4 pl-3 font-bold text-accent shadow-lg";
const helpClass = "flex h-12 items-center gap-2 rounded-full bg-primary pr-5 pl-3 font-semibold text-white shadow-lg";

export default function FloatingButtons() {
  const path = usePathname();
  if (path === "/talk") return null;
  const aboveBar = WITH_BOTTOM_BAR.includes(path);
  // Welcome's two main buttons sit low on a phone, right where floating buttons would go,
  // so there SOS and Help sit at the end of the page instead (they still float on wide screens).
  const welcome = path === "/";

  const buttons = (
    <>
      {path !== "/sos" && (
        <Link href="/sos" aria-label="SOS: emergency numbers" className={sosClass}>
          <AlertIcon className="h-6 w-6" />
          SOS
        </Link>
      )}
      {path !== "/help" && (
        <Link href="/help" className={helpClass}>
          <HelpIcon className="h-6 w-6" />
          Help
        </Link>
      )}
    </>
  );

  return (
    <>
      {welcome && <div className="flex justify-center gap-2 pb-8 lg:hidden print:hidden">{buttons}</div>}
      {/* Space at the end of the page, so the floating buttons never cover the last line */}
      <div aria-hidden="true" className={`h-20 shrink-0 print:hidden ${welcome ? "hidden lg:block" : ""}`} />
      <div
        className={`fixed right-4 z-20 gap-2 print:hidden ${welcome ? "hidden lg:flex" : "flex"} ${
          aboveBar ? "bottom-[calc(5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
        }`}
      >
        {buttons}
      </div>
    </>
  );
}

// A question mark in a circle
export function HelpIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" />
    </svg>
  );
}

// An exclamation mark in a circle, for SOS
export function AlertIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <circle cx="12" cy="16.5" r=".7" fill="currentColor" />
    </svg>
  );
}
