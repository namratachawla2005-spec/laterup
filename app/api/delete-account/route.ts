// "Delete my data" (Settings). Deletes her login account; every row she owns
// is removed with it ("on delete cascade" in supabase/schema.sql).
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // Only our own page sends JSON here; plain cross-site form posts are refused
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Who is asking? Only ever delete the logged-in woman's own account.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ ok: false }, { status: 500 });

  // Clear her login cookies. The account is already gone, so ignore any error.
  await supabase.auth.signOut().catch(() => {});

  return NextResponse.json({ ok: true });
}
