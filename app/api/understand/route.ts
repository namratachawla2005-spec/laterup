// /api/understand (BUILD-SPEC section 3.2). The only place the AI is called.
// Never logs message content. Records only token counts in `usage`.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { askModel, type ChatMessage } from "@/lib/brain";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { emergencyCheck, isOffTopic, seeDoctorSoonCheck } from "@/lib/safety";
import { parseModelAnswer, answerProblems, withDefaults, withSoonLine, isSimpleReply } from "@/lib/answers";

const MAX_CHARS = Number(process.env.MAX_MESSAGE_CHARS) || 1000;
const DEFAULT_DAILY_CAP = 30;

const LIMIT_MESSAGE =
  "You've asked a lot today, and that's okay. Let's carry on tomorrow. If something feels urgent or isn't settling, please talk to a doctor. Your Doctor Prep page has everything ready.";

// What Talk gets back. Always status 200 with a "type", except 400/401.
const reply = (body: Record<string, unknown>) => NextResponse.json(body);

type HistoryItem = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  // 1. Logged in?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ type: "error" }, { status: 401 });

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ type: "error" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ type: "error" }, { status: 400 });

  // 2. Length
  if (message.length > MAX_CHARS) return reply({ type: "length" });

  // 3. Emergency: never sent to the model, never saved, never counted
  const emergency = emergencyCheck(message);
  if (emergency) return reply({ type: "emergency", kind: emergency });

  // 4. Obvious off-topic: warm redirect, no model call
  if (isOffTopic(message)) return reply({ type: "redirect" });

  // 5. Daily cap (counted from real usage records, India date)
  const admin = createAdminClient();
  const indiaToday = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const [{ data: capRow }, { count: usedToday }] = await Promise.all([
    admin.from("app_config").select("value").eq("key", "daily_question_cap").single(),
    admin.from("usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("usage_date", indiaToday),
  ]);
  const cap = capRow?.value ?? DEFAULT_DAILY_CAP;
  if ((usedToday ?? 0) >= cap) return reply({ type: "limit", message: LIMIT_MESSAGE });

  // 6. Her minimum profile (never her name) and recent check-ins
  const [{ data: profile }, { data: checkIns }] = await Promise.all([
    supabase
      .from("profiles")
      .select("age_group, stage, top_symptoms, diet, life_context, doctor_status")
      .eq("id", user.id)
      .single(),
    supabase.from("check_ins").select("feeling").order("date", { ascending: false }).limit(3),
  ]);
  const seeDoctorSoon = seeDoctorSoonCheck(message, profile ?? {});

  const history: ChatMessage[] = (Array.isArray(body.history) ? (body.history as HistoryItem[]) : [])
    .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
    .slice(-6)
    .map((h) => ({ role: h.role, content: h.content.slice(0, 2000) }));

  const turn = JSON.stringify({
    message,
    profile: {
      ageGroup: profile?.age_group ?? null,
      stage: profile?.stage ?? null,
      topSymptoms: profile?.top_symptoms ?? [],
      diet: profile?.diet ?? null,
      lifeContext: profile?.life_context ?? [],
      doctorStatus: profile?.doctor_status ?? null,
    },
    seeDoctorSoon,
    recentCheckins: (checkIns ?? []).map((c) => c.feeling),
  });

  let result;
  try {
    result = await askModel({
      system: SYSTEM_PROMPT,
      messages: [...history, { role: "user", content: turn }],
      json: true,
    });
  } catch {
    // Model unreachable, slow or not set up. Talk shows the pre-written answer or fallback.
    return reply({ type: "fallback" });
  }

  // 8. Record usage: token counts only, never the text
  await admin.from("usage").insert({
    user_id: user.id,
    provider: result.provider,
    model: result.model,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
  });

  // 7. Check the answer before it is shown
  const answer = parseModelAnswer(result.text);
  if (!answer || answerProblems(answer).length > 0) return reply({ type: "fallback" });

  // 9. Done
  if (isSimpleReply(answer)) return reply({ type: "simple", text: answer.hearYou });
  return reply({ type: "answer", answer: withSoonLine(withDefaults(answer), seeDoctorSoon), seeDoctorSoon });
}
