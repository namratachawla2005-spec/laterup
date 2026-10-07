"use client";

// Bottom navigation on Pages 2 to 5. Icon and word on every tab.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TalkIcon, PatternsIcon, DoctorIcon } from "./icons";

const TABS = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/talk", label: "Talk", Icon: TalkIcon },
  { href: "/patterns", label: "Patterns", Icon: PatternsIcon },
  { href: "/doctor", label: "Doctor", Icon: DoctorIcon },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 print:hidden border-t border-text/10 bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-helper ${
                  active ? "font-bold text-primary" : "text-text-muted"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
