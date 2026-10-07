/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Database helpers for tests (Node only).
// - admin(): the service role client. Used to create/delete test accounts,
//   seed rows, and check what was (or was NOT) written.
// - signInAs(): a normal logged-in client with the anon key, exactly like
//   her browser. Row Level Security applies to it.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

let adminClient: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  adminClient ??= createClient(env.supabaseUrl, env.serviceRoleKey, noSession);
  return adminClient;
}

export async function signInAs(email: string, password: string) {
  const client = createClient(env.supabaseUrl, env.anonKey, noSession);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`e2e: could not sign in test user (${error?.message})`);
  return { client, userId: data.user.id };
}

// Every table that holds her rows, and the column that points at her
export const USER_TABLES = [
  { table: "profiles", column: "id" },
  { table: "check_ins", column: "user_id" },
  { table: "conversations", column: "user_id" },
  { table: "messages", column: "user_id" },
  { table: "trying", column: "user_id" },
  { table: "trying_feedback", column: "user_id" },
  { table: "doctor_notes", column: "user_id" },
  { table: "doctor_prep", column: "user_id" },
  { table: "usage", column: "user_id" },
] as const;

export type UserTable = (typeof USER_TABLES)[number]["table"];

export async function countRows(table: UserTable, userId: string): Promise<number> {
  const column = USER_TABLES.find((t) => t.table === table)!.column;
  const { count, error } = await admin().from(table).select("*", { count: "exact", head: true }).eq(column, userId);
  if (error) throw new Error(`e2e: count ${table} failed (${error.message})`);
  return count ?? 0;
}

export async function countAllRows(userId: string): Promise<Record<UserTable, number>> {
  const entries = await Promise.all(USER_TABLES.map(async ({ table }) => [table, await countRows(table, userId)] as const));
  return Object.fromEntries(entries) as Record<UserTable, number>;
}

// India date, the same day boundary /api/understand uses for the daily cap
export function indiaDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export async function getConfig(key: string): Promise<number | null> {
  const { data } = await admin().from("app_config").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

export async function setConfig(key: string, value: number) {
  const { error } = await admin().from("app_config").update({ value }).eq("key", key);
  if (error) throw new Error(`e2e: could not set ${key} (${error.message})`);
}
