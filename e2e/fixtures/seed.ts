/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
// Put rows straight into a test user's tables, so a test can start with
// "two weeks of check-ins" without tapping through two weeks.
import { admin, indiaDate } from "./supabase";

type CheckIn = { feeling: "good" | "okay" | "tough"; sleep?: "well" | "on_off" | "barely"; energy?: "low" | "okay" | "good"; bothering?: string[] };

async function must<T>(label: string, promise: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(`e2e: seeding ${label} failed (${error.message})`);
  return data as T;
}

/** One check-in per day, newest first: days[0] is today, days[1] yesterday, ... */
export async function seedCheckIns(userId: string, days: CheckIn[]) {
  const rows = days.map((d, i) => ({
    user_id: userId,
    date: indiaDate(-i),
    feeling: d.feeling,
    sleep: d.sleep ?? null,
    energy: d.energy ?? null,
    bothering: d.bothering ?? [],
  }));
  await must("check_ins", admin().from("check_ins").insert(rows));
}

export async function seedTrying(userId: string, action: string) {
  const rows = await must<{ id: string }[]>(
    "trying",
    admin().from("trying").insert({ user_id: userId, action, for_symptom: "poor_sleep", started_date: indiaDate(-3) }).select("id")
  );
  return rows[0].id;
}

export async function seedDoctorNote(userId: string, herWords: string) {
  await must(
    "doctor_notes",
    admin().from("doctor_notes").insert({ user_id: userId, date: indiaDate(), her_words: herWords, symptom_tags: ["hot_flashes"], summary: "Night sweats" })
  );
}

/** Usage rows for today (India date), as if she had already asked `count` questions. */
export async function seedUsage(userId: string, count: number) {
  const rows = Array.from({ length: count }, () => ({
    user_id: userId,
    usage_date: indiaDate(),
    provider: "ollama",
    model: "e2e-seed",
    input_tokens: 1,
    output_tokens: 1,
  }));
  await must("usage", admin().from("usage").insert(rows));
}

/**
 * At least one row in EVERY table she owns, each carrying `secret` where
 * there is text, so a test can look for it anywhere it must not appear.
 */
export async function seedEverything(userId: string, secret: string) {
  await must("profiles", admin().from("profiles").update({ name: secret.slice(0, 30) }).eq("id", userId));
  await seedCheckIns(userId, [{ feeling: "tough", sleep: "barely", energy: "low", bothering: ["poor_sleep"] }]);
  const conv = await must<{ id: string }[]>(
    "conversations",
    admin().from("conversations").insert({ user_id: userId, symptom_tags: ["poor_sleep"] }).select("id")
  );
  await must(
    "messages",
    admin().from("messages").insert({ conversation_id: conv[0].id, user_id: userId, role: "user", content: { text: `${secret} cannot sleep` } })
  );
  const tryingId = await seedTrying(userId, `${secret} warm milk at night`);
  await must(
    "trying_feedback",
    admin().from("trying_feedback").insert({ trying_id: tryingId, user_id: userId, date: indiaDate(), answer: "yes" })
  );
  await seedDoctorNote(userId, `${secret} night sweats every night`);
  await must("doctor_prep", admin().from("doctor_prep").update({ anything_else: `${secret} family history` }).eq("user_id", userId));
  await seedUsage(userId, 1);
  return { conversationId: conv[0].id, tryingId };
}
