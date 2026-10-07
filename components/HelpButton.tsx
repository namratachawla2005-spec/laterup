"use client";

// Floating "? Help" button, bottom-right on every page. It just opens the Help page
// (no pop-up). Talk has Help in its top bar instead, so nothing floats over the chat.
import Link from "next/link";
import { usePathname } from "next/navigation";

const WITH_BOTTOM_BAR = ["/home", "/patterns", "/doctor"];
const HIDDEN_ON = ["/help", "/talk"];

export default function HelpButton() {
  const path = usePathname();
  if (HIDDEN_ON.includes(path)) return null;
  const aboveBar = WITH_BOTTOM_BAR.includes(path);

  return (
    <>
      {/* Space at the end of the page, so the button never covers the last line */}
      <div aria-hidden="true" className="h-20 shrink-0 print:hidden" />
      <Link
        href="/help"
        className={`fixed right-4 z-20 flex h-12 items-center gap-2 rounded-full bg-primary pr-5 pl-3 font-semibold text-white shadow-lg print:hidden ${
          aboveBar ? "bottom-[calc(5rem+env(safe-area-inset-bottom))]" : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))]"
        }`}
      >
        <HelpIcon className="h-6 w-6" />
        Help
      </Link>
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
