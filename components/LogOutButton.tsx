/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

// Signs her out and returns to Welcome. Reused later in Settings.
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearSession } from "@/lib/local";

export default function LogOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function handleLogOut() {
    await createClient().auth.signOut();
    clearSession(); // no drafts left behind on a shared phone
    router.replace("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogOut} className={className}>
      Log out
    </button>
  );
}
