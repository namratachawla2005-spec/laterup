"use client";

// Signs her out and returns to Welcome. Reused later in Settings.
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  async function handleLogOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogOut} className={className}>
      Log out
    </button>
  );
}
