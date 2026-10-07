"use client";

// Talk: she says it in her own words, LaterUp answers in 4 warm parts.
// Order for every message: length check -> emergency check -> topic check ->
// answer (pre-written for the 15 suggested questions; AI comes in part 2).
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { localDate, readSession, writeSession, useIsBrowser, DRAFT_KEY, HANDOVER_KEY } from "@/lib/local";
import { suggestedQuestions } from "@/lib/questions";
import {
  MAX_MESSAGE_CHARS, COUNTER_FROM, LENGTH_MESSAGE, OFF_TOPIC_MESSAGE, SHORT_MESSAGE_REPLY,
  emergencyCheck, seeDoctorSoonCheck, isOffTopic, isTooShort, type Emergency,
} from "@/lib/safety";
import {
  findPrewritten, personalisePrewritten, withDefaults, addNameToAnswer,
  FALLBACK_INTRO, FALLBACK_DOCTOR_LIST, type Answer,
} from "@/lib/answers";
import AnswerView, { type TryResult } from "@/components/talk/AnswerView";
import EmergencyCard from "@/components/talk/EmergencyCard";
import BottomNav from "@/components/BottomNav";
import WellnessNote from "@/components/WellnessNote";
import { BackIcon, ClockIcon, TalkIcon } from "@/components/icons";
import HomeWoman from "@/components/HomeWoman";
import MotifBackground, { Waves } from "@/components/MotifBackground";
import { AlertIcon, HelpIcon } from "@/components/FloatingButtons";

export type RecentConversation = { id: string; startedAt: string; firstLine: string };

type Profile = {
  name: string | null;
  top_symptoms: string[];
  diet: string | null;
  stage: string | null;
  age_group: string | null;
  doctor_status: string | null;
};

type Item =
  | { id: string; kind: "user"; text: string; at: string }
  | { id: string; kind: "answer"; answer: Answer; seeDoctorSoon: boolean; herWords: string; fresh: boolean }
  | { id: string; kind: "simple"; text: string }
  | { id: string; kind: "fallback"; retry: string };

type Result =
  | { kind: "answer"; answer: Answer; seeDoctorSoon: boolean }
  | { kind: "simple"; text: string }
  | { kind: "emergency"; emergency: "physical" | "self_harm" }
  | { kind: "notice"; text: string }
  | { kind: "fallback" };

const MAX_TRYING = 5;
const newId = () => crypto.randomUUID();
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function TalkView(props: { userId: string; profile: Profile; recent: RecentConversation[] }) {
  // Reads her storage (Home handover) and clock, so it draws only in the browser
  const isBrowser = useIsBrowser();
  return (
    <>
      {isBrowser ? <TalkContent {...props} /> : <main className="flex-1" />}
      <BottomNav />
    </>
  );
}

function TalkContent({ userId, profile, recent: initialRecent }: { userId: string; profile: Profile; recent: RecentConversation[] }) {
  const [supabase] = useState(() => createClient());
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [emergency, setEmergency] = useState<Emergency>(null);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const [recent, setRecent] = useState(initialRecent);

  // The saved conversation this chat belongs to (created on the first real answer)
  const conversation = useRef<{ id: string; tags: string[]; soon: boolean } | null>(null);
  const lastUserRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // A question handed over from Home (sessionStorage, never the URL): send it once
  const [handover] = useState(() => {
    const text = readSession(HANDOVER_KEY);
    writeSession(HANDOVER_KEY, "");
    return text;
  });
  const handled = useRef(false);
  useEffect(() => {
    if (handover && !handled.current) {
      handled.current = true;
      if (readSession(DRAFT_KEY).trim() === handover) writeSession(DRAFT_KEY, ""); // it's been sent now
      void send(handover);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep her newest message in view
  const userCount = items.filter((i) => i.kind === "user").length;
  useEffect(() => {
    lastUserRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [userCount]);

  // ---------------- Sending ----------------
  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;
    setNotice("");

    // 1. Length
    if (text.length > MAX_MESSAGE_CHARS) {
      setNotice(LENGTH_MESSAGE);
      return;
    }

    // 2. Emergency: show help instead. Never sent anywhere, never saved.
    const em = emergencyCheck(text);
    if (em) {
      setInput("");
      writeSession(DRAFT_KEY, "");
      setEmergency(em);
      window.scrollTo(0, 0);
      return;
    }

    setInput("");
    const userItem: Item = { id: newId(), kind: "user", text, at: new Date().toISOString() };
    setItems((prev) => [...prev, userItem]); // every message keeps its reply

    // 3. Off-topic or just "hi": a warm reply, nothing else
    if (isOffTopic(text)) {
      setItems((prev) => [...prev, { id: newId(), kind: "simple", text: OFF_TOPIC_MESSAGE }]);
      return;
    }
    if (isTooShort(text)) {
      setItems((prev) => [...prev, { id: newId(), kind: "simple", text: SHORT_MESSAGE_REPLY }]);
      return;
    }

    // 4. The answer
    setLoading(true);
    const result = await getAnswer(text, historyForApi(items));
    setLoading(false);

    const dropMine = () => setItems((prev) => prev.filter((i) => i.id !== userItem.id));
    switch (result.kind) {
      case "answer":
        setItems((prev) => [...prev, { id: newId(), kind: "answer", answer: result.answer, seeDoctorSoon: result.seeDoctorSoon, herWords: text, fresh: true }]);
        void saveExchange(text, result.answer, result.seeDoctorSoon);
        return;
      case "simple":
        setItems((prev) => [...prev, { id: newId(), kind: "simple", text: result.text }]);
        return;
      case "emergency": // caught by the server: same help, nothing saved
        dropMine();
        setEmergency(result.emergency);
        window.scrollTo(0, 0);
        return;
      case "notice":
        dropMine();
        setNotice(result.text);
        return;
      default:
        setItems((prev) => [...prev, { id: newId(), kind: "fallback", retry: text }]);
    }
  }

  // The last 6 turns, for follow-ups. Her name is never included.
  function historyForApi(list: Item[]) {
    return list
      .flatMap((i) => {
        if (i.kind === "user") return [{ role: "user", content: i.text }];
        if (i.kind === "simple") return [{ role: "assistant", content: i.text }];
        if (i.kind === "answer") {
          const { whatsHappening, tryThis, seeDoctorIf } = i.answer;
          return [{ role: "assistant", content: JSON.stringify({ whatsHappening, tryThis: { main: tryThis.main }, seeDoctorIf }) }];
        }
        return [];
      })
      .slice(-6);
  }

  // AI first (/api/understand). If it fails, is slow (15 s) or unsafe:
  // the pre-written answer for the 15 suggested questions, else the gentle fallback.
  // Pre-written answers never count against her daily cap.
  async function getAnswer(text: string, history: { role: string; content: string }[]): Promise<Result> {
    const deviceSoon = seeDoctorSoonCheck(text, profile);
    const pre = findPrewritten(text);
    const backup = (): Result =>
      pre
        ? { kind: "answer", answer: withDefaults(personalisePrewritten(pre, profile, deviceSoon)), seeDoctorSoon: deviceSoon }
        : { kind: "fallback" };

    try {
      const res = await fetch("/api/understand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return backup();
      const data = await res.json();
      switch (data.type) {
        case "answer":
          return { kind: "answer", answer: addNameToAnswer(data.answer as Answer, profile.name), seeDoctorSoon: !!data.seeDoctorSoon };
        case "simple":
          return { kind: "simple", text: String(data.text) };
        case "redirect":
          return { kind: "simple", text: OFF_TOPIC_MESSAGE };
        case "emergency":
          return { kind: "emergency", emergency: data.kind === "self_harm" ? "self_harm" : "physical" };
        case "length":
          return { kind: "notice", text: LENGTH_MESSAGE };
        case "limit":
          return pre ? backup() : { kind: "simple", text: String(data.message) };
        default:
          return backup();
      }
    } catch {
      return backup(); // offline, slow or unreachable
    }
  }

  function retry(item: Extract<Item, { kind: "fallback" }>) {
    // Remove the failed attempt (her message + fallback), then send again
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      return prev.filter((_, i) => i !== idx && i !== idx - 1);
    });
    void send(item.retry);
  }

  // ---------------- Saving to her own rows ----------------
  async function saveExchange(text: string, answer: Answer, soon: boolean) {
    try {
      let conv = conversation.current;
      if (!conv) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: userId, symptom_tags: answer.symptomTags, see_doctor_soon: soon })
          .select("id")
          .single();
        if (error || !data) return;
        conv = { id: data.id, tags: answer.symptomTags, soon };
        conversation.current = conv;
        setRecent((r) => [{ id: data.id, startedAt: new Date().toISOString(), firstLine: text }, ...r].slice(0, 5));
      } else {
        const tags = Array.from(new Set([...conv.tags, ...answer.symptomTags]));
        conv = { ...conv, tags, soon: conv.soon || soon };
        conversation.current = conv;
        await supabase.from("conversations").update({ symptom_tags: tags, see_doctor_soon: conv.soon }).eq("id", conv.id);
      }
      const now = Date.now();
      await supabase.from("messages").insert([
        { conversation_id: conv.id, user_id: userId, role: "user", content: { text }, created_at: new Date(now).toISOString() },
        { conversation_id: conv.id, user_id: userId, role: "assistant", content: { kind: "answer", answer, seeDoctorSoon: soon }, created_at: new Date(now + 1).toISOString() },
      ]);
    } catch {
      // Saving failed: she still has her answer on screen. Nothing technical to show.
    }
  }

  async function tryThis(action: string, forSymptom: string | null): Promise<TryResult> {
    const { data: active, error } = await supabase.from("trying").select("action").eq("active", true);
    if (error) return "error";
    if (active.some((a) => a.action === action)) return "added"; // already trying it
    if (active.length >= MAX_TRYING) return "limit";
    const { error: insertError } = await supabase
      .from("trying")
      .insert({ user_id: userId, action, for_symptom: forSymptom, started_date: localDate() });
    return insertError ? "error" : "added";
  }

  async function saveNote(item: Extract<Item, { kind: "answer" }>): Promise<boolean> {
    const { error } = await supabase.from("doctor_notes").insert({
      user_id: userId,
      date: localDate(),
      her_words: item.herWords,
      symptom_tags: item.answer.symptomTags,
      summary: item.answer.whatsHappening,
      see_doctor_soon: item.seeDoctorSoon,
    });
    return !error;
  }

  async function rateHelpful(helpful: boolean) {
    // Supabase only sends a request once it is awaited
    if (conversation.current) await supabase.from("conversations").update({ helpful }).eq("id", conversation.current.id);
  }

  // ---------------- Recent conversations ----------------
  async function reopen(id: string) {
    const [{ data: conv }, { data: msgs }] = await Promise.all([
      supabase.from("conversations").select("id, symptom_tags, see_doctor_soon").eq("id", id).single(),
      supabase.from("messages").select("role, content, created_at").eq("conversation_id", id).order("created_at"),
    ]);
    if (!conv || !msgs) return;
    conversation.current = { id: conv.id, tags: conv.symptom_tags ?? [], soon: conv.see_doctor_soon };
    const loaded: Item[] = [];
    let lastText = "";
    for (const m of msgs) {
      const c = m.content as { text?: string; answer?: Answer; seeDoctorSoon?: boolean };
      if (m.role === "user" && c.text) {
        lastText = c.text;
        loaded.push({ id: newId(), kind: "user", text: c.text, at: m.created_at });
      } else if (m.role === "assistant" && c.answer) {
        loaded.push({ id: newId(), kind: "answer", answer: c.answer, seeDoctorSoon: !!c.seeDoctorSoon, herWords: lastText, fresh: false });
      }
    }
    setItems(loaded);
  }

  async function removeConversation(id: string) {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (!error) setRecent((r) => r.filter((c) => c.id !== id));
  }

  // ---------------- Screen ----------------
  if (emergency) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-28">
        <EmergencyCard kind={emergency} />
        <div className="mt-8"><WellnessNote /></div>
      </main>
    );
  }

  const empty = items.length === 0 && !loading;
  const lastUserId = [...items].reverse().find((i) => i.kind === "user")?.id;

  return (
    <>
      <MotifBackground motif="waves">
        <header className="mx-auto flex w-full max-w-md items-center gap-2 px-5 pt-4">
          <Link href="/home" aria-label="Back to Home" className="-ml-3 flex h-tap w-tap items-center justify-center rounded-card-sm text-text-muted">
            <BackIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold">Talk</h1>
          <Link href="/sos" aria-label="SOS: emergency numbers" className="ml-auto inline-flex min-h-tap items-center gap-1 rounded-card-sm px-2 font-bold text-accent">
            <AlertIcon className="h-6 w-6" />
            SOS
          </Link>
          <Link href="/help" className="-mr-2 inline-flex min-h-tap items-center gap-1.5 rounded-card-sm px-2 font-medium text-primary">
            <HelpIcon className="h-6 w-6" />
            Help
          </Link>
        </header>

        <main className="mx-auto w-full max-w-md flex-1 px-5 pt-4 pb-56">
          {empty && (
            <EmptyState
              topSymptoms={profile.top_symptoms}
              recent={recent}
              onAsk={send}
              onOpen={reopen}
              onDelete={removeConversation}
            />
          )}

          <div className="space-y-6">
            {items.map((item) => {
              if (item.kind === "user") {
                return (
                  <div key={item.id} ref={item.id === lastUserId ? lastUserRef : undefined} className="flex scroll-mt-4 flex-col items-end">
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-card rounded-br-sm bg-surface px-4 py-3">{item.text}</p>
                    <p className="mt-1 text-helper text-text-muted">{timeLabel(item.at)}</p>
                  </div>
                );
              }
              if (item.kind === "simple") {
                return <p key={item.id} className="text-[1.25rem] leading-relaxed">{item.text}</p>;
              }
              if (item.kind === "fallback") {
                const isLatest = item.id === items[items.length - 1]?.id;
                return <Fallback key={item.id} onRetry={isLatest && !loading ? () => retry(item) : undefined} />;
              }
              return (
                <AnswerView
                  key={item.id}
                  answer={item.answer}
                  seeDoctorSoon={item.seeDoctorSoon}
                  animate={item.fresh}
                  onTry={(action) => tryThis(action, item.answer.symptomTags[0] ?? null)}
                  onSaveNote={() => saveNote(item)}
                  onHelpful={rateHelpful}
                  onFollowUp={send}
                />
              );
            })}
            {loading && <Loading />}
          </div>
        </main>
      </MotifBackground>

      {/* Text box fixed at the bottom, above the navigation bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 border-t border-text/10 bg-background"
      >
        <div className="mx-auto max-w-md px-5 py-3">
          {notice && <p role="alert" className="mb-2 rounded-card-sm border-l-4 border-gentle bg-surface px-4 py-2 text-helper">{notice}</p>}
          <div className="flex items-end gap-3">
            <label htmlFor="talk-input" className="sr-only">Your message</label>
            <textarea
              id="talk-input"
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={empty ? "Say it in your own words..." : "Ask a follow-up, or tell me more..."}
              className="block max-h-40 flex-1 resize-none rounded-card bg-surface px-4 py-3 text-body placeholder:text-text-muted focus:outline-none focus-visible:outline-3 focus-visible:outline-primary"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || loading}
              className="flex h-tap w-tap shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-white disabled:bg-transparent disabled:text-primary"
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
                <path d="M10 16V4M5 9l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {input.length > COUNTER_FROM && (
            <p className="mt-1 text-helper text-text-muted" aria-live="polite">
              {Math.max(0, MAX_MESSAGE_CHARS - input.length)} characters left
            </p>
          )}
        </div>
      </form>
    </>
  );
}

// ---------------- Pieces ----------------

function EmptyState({
  topSymptoms, recent, onAsk, onOpen, onDelete,
}: {
  topSymptoms: string[];
  recent: RecentConversation[];
  onAsk: (q: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center">
        <HomeWoman scene="thinking" className="h-[130px] w-40 shrink-0" />
        {/* a wave in the space beside her, on phones (wide screens have them in the margins) */}
        <Waves className="mx-auto h-8 w-24 lg:hidden" />
      </div>
      <h2 className="text-[1.75rem] font-semibold leading-tight">What&apos;s on your mind?</h2>
      <p className="mt-1 text-text-muted">No question is too small. Only you can see this.</p>

      <ul className="mt-5 space-y-2">
        {suggestedQuestions(topSymptoms).map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => onAsk(q)}
              className="flex w-full items-center justify-between gap-3 rounded-card-sm border-2 border-primary/30 px-4 py-2 text-left"
            >
              {q}
              <BackIcon className="h-5 w-5 shrink-0 rotate-180 text-primary" />
            </button>
          </li>
        ))}
      </ul>

      {recent.length > 0 && (
        <section className="mt-10" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="flex items-center gap-2 font-semibold">
            <ClockIcon className="h-5 w-5 text-primary" />
            Recent
          </h2>
          <ul className="mt-3 divide-y divide-text/10">
            {recent.map((c) => (
              <li key={c.id} className="py-2">
                {confirmId === c.id ? (
                  <div className="flex flex-wrap items-center gap-2 py-1">
                    <span>Delete this conversation?</span>
                    <button type="button" onClick={() => { onDelete(c.id); setConfirmId(null); }} className="rounded-card-sm border-2 border-primary px-4 font-semibold text-primary">Delete</button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-card-sm px-3 text-text-muted underline underline-offset-4">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onOpen(c.id)} className="flex min-w-0 flex-1 items-start gap-3 rounded-card-sm py-1 text-left">
                      <TalkIcon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block truncate">{c.firstLine}</span>
                        <span className="block text-helper text-text-muted">
                          {new Date(c.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(c.id)}
                      aria-label={`Delete conversation from ${new Date(c.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                      className="shrink-0 rounded-card-sm px-3 text-helper text-text-muted underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const LOADING_LINES = ["Reading what you shared...", "Thinking about your stage...", "Putting it simply..."];

// Gentle loading: a slow-breathing terracotta dot and changing words. No spinner.
function Loading() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => Math.min(i + 1, LOADING_LINES.length - 1)), 2000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-3 text-text-muted" role="status">
      <span aria-hidden="true" className="breathe block h-4 w-4 rounded-full bg-accent" />
      {LOADING_LINES[index]}
    </div>
  );
}

// "Try again" only on the latest one
function Fallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-[1.25rem] leading-relaxed">{FALLBACK_INTRO}</p>
      <section className="rounded-card bg-surface p-5">
        <h3 className="text-[1.0625rem] font-semibold text-accent">Talk to a doctor if</h3>
        <ul className="mt-2 space-y-2">
          {FALLBACK_DOCTOR_LIST.map((s) => (
            <li key={s} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-text" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-card border-2 border-primary px-6 font-semibold text-primary">
          Try again
        </button>
      )}
    </div>
  );
}
