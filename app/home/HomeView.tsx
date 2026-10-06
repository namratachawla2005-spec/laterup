"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SYMPTOMS, labelFor } from "@/lib/intake";
import { SLEEP_OPTIONS, ENERGY_OPTIONS } from "@/lib/checkin";
import { suggestedQuestions } from "@/lib/questions";
import {
  localDate, daysBetween, useIsBrowser,
  readSession, writeSession, DRAFT_KEY, HANDOVER_KEY,
} from "@/lib/local";
import Wordmark from "@/components/Wordmark";
import WellnessNote from "@/components/WellnessNote";
import BottomNav from "@/components/BottomNav";
import { FormMessage } from "@/components/AuthFields";
import { GearIcon, LockIcon, SunIcon, PartSunIcon, CloudIcon } from "@/components/icons";

type Feeling = "good" | "okay" | "tough";
type CheckIn = { date: string; feeling: Feeling; bothering: string[]; sleep?: string | null; energy?: string | null };
type TryingItem = { id: string; action: string; for_symptom: string | null; started_date: string };
type Feedback = { trying_id: string; date: string; answer: string };

type Props = {
  userId: string;
  name: string | null;
  topSymptoms: string[];
  checkIns: CheckIn[];
  hasHistory: boolean;
  trying: TryingItem[];
  feedback: Feedback[];
};

const SAVE_ERROR = "We couldn't save that just now. Please try again.";
const MIN_CHARS = 3;
const MAX_CHARS = 1000;

// Home reads her phone's clock and storage, so it draws only in the browser
export default function HomeView(props: Props) {
  const isBrowser = useIsBrowser();
  return (
    <>
      <TopBar />
      {isBrowser ? <HomeContent {...props} /> : <main className="flex-1" />}
      <BottomNav />
    </>
  );
}

function TopBar() {
  return (
    <header className="mx-auto flex w-full max-w-md items-center justify-between px-5 pt-4">
      <Wordmark />
      <Link
        href="/settings"
        aria-label="Settings"
        className="-mr-3 flex h-tap w-tap items-center justify-center rounded-card-sm text-text-muted"
      >
        <GearIcon />
      </Link>
    </header>
  );
}

// ---------------- Greeting (Section 1) ----------------
function greetingFor(hour: number, name: string | null) {
  if (hour >= 22 || hour < 5) return name ? `Still awake, ${name}?` : "Still awake?";
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}` : `${part}.`;
}

function secondLineFor(opts: { hasHistory: boolean; yesterdayTough: boolean; trying: boolean; late: boolean }) {
  if (!opts.hasHistory) return "This is your space. Ask anything, there's no wrong question.";
  if (opts.yesterdayTough) return "Yesterday felt hard. How are you today?";
  if (opts.trying) return "Let's see how your small change is going.";
  if (opts.late) return "Can't sleep? Tell me what's on your mind.";
  return "How are you feeling today?";
}

function HomeContent({ userId, name, topSymptoms, checkIns, hasHistory, trying, feedback }: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [now] = useState(() => new Date());
  const today = localDate(now);
  const yesterday = localDate(new Date(now.getTime() - 86_400_000));
  const hour = now.getHours();

  const [items, setItems] = useState(trying);
  const [text, setText] = useState(() => readSession(DRAFT_KEY));
  const textRef = useRef<HTMLTextAreaElement>(null);

  // "Check in now" on Patterns links to /home#checkin
  useEffect(() => {
    if (window.location.hash === "#checkin") document.getElementById("checkin")?.scrollIntoView({ block: "start" });
  }, []);

  const yesterdayTough = checkIns.some((c) => c.date === yesterday && c.feeling === "tough");
  const secondLine = secondLineFor({
    hasHistory,
    yesterdayTough,
    trying: items.length > 0,
    late: hour >= 22 || hour < 5,
  });

  // Hand her words to Talk through sessionStorage, never the URL
  function openTalk(message: string) {
    writeSession(HANDOVER_KEY, message.trim());
    router.push("/talk");
  }

  function focusTextBox() {
    textRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    textRef.current?.focus({ preventScroll: true });
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-32">
      {/* Section 1: Greeting */}
      <h1 className="break-words text-[1.875rem] font-semibold leading-tight">{greetingFor(hour, name)}</h1>
      <p className="mt-1 text-text-muted">{secondLine}</p>

      {/* Section 2: What's on your mind (the hero of Home) */}
      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim().length >= MIN_CHARS) openTalk(text);
        }}
      >
        <label htmlFor="mind" className="text-xl font-semibold">
          What&apos;s on your mind?
        </label>
        <textarea
          id="mind"
          ref={textRef}
          rows={4}
          maxLength={MAX_CHARS}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            writeSession(DRAFT_KEY, e.target.value);
          }}
          placeholder={'Say it in your own words. For example: "I can\'t sleep and I\'ve been snapping at everyone."'}
          className="mt-3 block w-full resize-none rounded-card bg-surface px-4 py-3 text-body placeholder:text-text-muted focus:outline-none focus-visible:outline-3 focus-visible:outline-primary"
        />
        <button
          type="submit"
          disabled={text.trim().length < MIN_CHARS}
          className="mt-3 w-full rounded-card bg-primary px-6 font-semibold text-white disabled:bg-surface disabled:text-text-muted"
        >
          Help me understand
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-helper text-text-muted">
          <LockIcon className="h-4 w-4 text-accent" />
          Only you can see this.
        </p>
      </form>

      {/* Section 3: Suggested questions */}
      <section className="mt-8" aria-labelledby="suggest-heading">
        <h2 id="suggest-heading" className="font-semibold">
          Not sure where to start?
        </h2>
        <ul className="mt-3 space-y-2">
          {suggestedQuestions(topSymptoms).map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => openTalk(q)}
                className="w-full rounded-card-sm border-2 border-surface px-4 py-2 text-left text-text"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 4: Today's check-in */}
      <CheckInSection
        supabase={supabase}
        userId={userId}
        today={today}
        existing={checkIns.find((c) => c.date === today) ?? null}
        topSymptoms={topSymptoms}
        onTalk={focusTextBox}
      />

      {/* Section 5: What you're trying (only if she is trying something) */}
      {items.length > 0 && (
        <section className="mt-10" aria-label="What you're trying">
          <div className="space-y-4">
            {items.slice(0, 2).map((item) => (
              <TryingCard
                key={item.id}
                item={item}
                today={today}
                supabase={supabase}
                userId={userId}
                answeredToday={feedback.find((f) => f.trying_id === item.id && f.date === today)?.answer ?? null}
                onStopped={() => setItems(items.filter((i) => i.id !== item.id))}
              />
            ))}
          </div>
          {items.length > 2 && (
            <Link href="/patterns" className="mt-3 inline-flex min-h-tap items-center font-medium text-primary underline underline-offset-4">
              See all in Patterns
            </Link>
          )}
        </section>
      )}

      <div className="mt-12">
        <WellnessNote withEmergency />
      </div>
    </main>
  );
}

// ---------------- Section 4: Check-in ----------------
type Supabase = ReturnType<typeof createClient>;

const FEELINGS: { value: Feeling; label: string; Icon: typeof SunIcon }[] = [
  { value: "good", label: "Good", Icon: SunIcon },
  { value: "okay", label: "Okay", Icon: PartSunIcon },
  { value: "tough", label: "Tough", Icon: CloudIcon },
];

function CheckInSection({
  supabase, userId, today, existing, topSymptoms, onTalk,
}: {
  supabase: Supabase;
  userId: string;
  today: string;
  existing: CheckIn | null;
  topSymptoms: string[];
  onTalk: () => void;
}) {
  const [feeling, setFeeling] = useState<Feeling | null>(existing?.feeling ?? null);
  const [sleep, setSleep] = useState<string | null>(existing?.sleep ?? null);
  const [energy, setEnergy] = useState<string | null>(existing?.energy ?? null);
  const [bothering, setBothering] = useState<string[]>(existing?.bothering ?? []);
  const [stage, setStage] = useState<"pick" | "follow" | "done">(existing ? "done" : "pick");
  const [error, setError] = useState("");

  // Her top symptoms first, then "More" reveals all of them
  const mine = topSymptoms.filter((s) => s !== "something_else").slice(0, 3);
  const others = SYMPTOMS.map((s) => s.value).filter((s) => !mine.includes(s) && s !== "something_else");
  const [showAll, setShowAll] = useState(() => bothering.some((b) => others.includes(b)));
  const chipOptions = [...mine, ...(showAll ? others : []), "something_else"];

  // One check-in per day: saving again updates today's
  async function saveCheckIn(f: Feeling) {
    setError("");
    const { error } = await supabase
      .from("check_ins")
      .upsert({ user_id: userId, date: today, feeling: f, bothering, sleep, energy }, { onConflict: "user_id,date" });
    if (error) setError(SAVE_ERROR);
    return !error;
  }

  // The feeling alone is saved straight away, so one tap is a full check-in
  async function pickFeeling(f: Feeling) {
    setFeeling(f);
    if (await saveCheckIn(f)) setStage("follow");
  }

  async function done() {
    if (feeling && (await saveCheckIn(feeling))) setStage("done");
  }

  return (
    <section id="checkin" className="mt-10 scroll-mt-6" aria-labelledby="checkin-heading">
      <h2 id="checkin-heading" className="text-xl font-semibold">
        How&apos;s today?
      </h2>

      {stage === "done" ? (
        <div className="mt-3 rounded-card bg-surface p-5" aria-live="polite">
          <p>Thanks for checking in. 🌿</p>
          {feeling === "tough" && (
            <p className="mt-2">
              Tough days happen.{" "}
              <button type="button" onClick={onTalk} className="font-medium text-primary underline underline-offset-4">
                Want to talk about it?
              </button>
            </p>
          )}
          <button
            type="button"
            onClick={() => setStage("pick")}
            className="mt-2 -ml-2 rounded-card-sm px-2 text-helper font-medium text-text-muted underline underline-offset-4"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div role="group" aria-label="How's today? Good, Okay or Tough" className="mt-3 grid grid-cols-3 gap-3">
            {FEELINGS.map(({ value, label, Icon }) => {
              const on = feeling === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickFeeling(value)}
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-card font-medium ${
                    on ? "bg-primary text-white" : "bg-surface text-text"
                  }`}
                >
                  <Icon className={`h-8 w-8 ${on ? "text-white" : "text-accent"}`} />
                  {label}
                </button>
              );
            })}
          </div>

          {stage === "follow" && (
            <div className="mt-5 space-y-6">
              <ChoiceRow
                id="sleep-label"
                question="How did you sleep last night?"
                options={SLEEP_OPTIONS}
                value={sleep}
                onChange={setSleep}
              />
              <ChoiceRow
                id="energy-label"
                question="Energy today?"
                options={ENERGY_OPTIONS}
                value={energy}
                onChange={setEnergy}
              />
              <div>
              <p id="bothering-label">Anything bothering you today? Tap any.</p>
              <div role="group" aria-labelledby="bothering-label" className="mt-3 flex flex-wrap gap-2">
                {chipOptions.map((s) => {
                  const on = bothering.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setBothering(on ? bothering.filter((x) => x !== s) : [...bothering, s])}
                      className={`inline-flex items-center gap-2 rounded-card-sm px-4 py-2 ${
                        on ? "bg-primary text-white" : "bg-surface text-text"
                      }`}
                    >
                      {on && <span aria-hidden="true">✓</span>}
                      {labelFor(SYMPTOMS, s)}
                    </button>
                  );
                })}
                {!showAll && (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center rounded-card-sm px-3 font-medium text-primary underline underline-offset-4"
                  >
                    + More
                  </button>
                )}
              </div>
              </div>
              <button
                type="button"
                onClick={done}
                className="rounded-card border-2 border-primary px-8 font-semibold text-primary"
              >
                Done
              </button>
            </div>
          )}
        </>
      )}

      {error && <div className="mt-3"><FormMessage text={error} /></div>}
    </section>
  );
}

// One quick single-choice question (tap again to clear)
function ChoiceRow({
  id, question, options, value, onChange,
}: {
  id: string;
  question: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div>
      <p id={id}>{question}</p>
      <div role="group" aria-labelledby={id} className="mt-3 grid grid-cols-3 gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? null : o.value)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-card-sm px-2 py-2 ${on ? "bg-primary text-white" : "bg-surface text-text"}`}
            >
              {on && <span aria-hidden="true">✓</span>}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Section 5: "You're trying" card ----------------
const HELP_ANSWERS = [
  { value: "yes", label: "Yes" },
  { value: "a_little", label: "A little" },
  { value: "not_really", label: "Not really" },
];

function startedText(started: string, today: string) {
  const days = daysBetween(started, today);
  if (days <= 0) return "Started today";
  if (days === 1) return "Started yesterday";
  return `Started ${days} days ago`;
}

function TryingCard({
  item, today, supabase, userId, answeredToday, onStopped,
}: {
  item: TryingItem;
  today: string;
  supabase: Supabase;
  userId: string;
  answeredToday: string | null;
  onStopped: () => void;
}) {
  const [answered, setAnswered] = useState(answeredToday);
  const [error, setError] = useState("");

  async function answer(value: string) {
    setError("");
    const { error } = await supabase
      .from("trying_feedback")
      .upsert({ trying_id: item.id, user_id: userId, date: today, answer: value }, { onConflict: "trying_id,date" });
    if (error) setError(SAVE_ERROR);
    else setAnswered(value);
  }

  // Stopping removes it from Home; its history stays for Patterns
  async function stop() {
    setError("");
    const { error } = await supabase.from("trying").update({ active: false }).eq("id", item.id);
    if (error) setError(SAVE_ERROR);
    else onStopped();
  }

  return (
    <article className="rounded-card bg-surface p-5">
      <p>
        <span className="font-semibold text-accent">You&apos;re trying:</span> {item.action}
      </p>
      <p className="mt-1 text-helper text-text-muted">
        {item.for_symptom && `For: ${labelFor(SYMPTOMS, item.for_symptom)} · `}
        {startedText(item.started_date, today)}
      </p>

      {answered ? (
        <p className="mt-4" aria-live="polite">Noted. We&apos;ll show you how it&apos;s going in Patterns.</p>
      ) : (
        <div className="mt-4">
          <p id={`help-${item.id}`} className="font-semibold">Did it help?</p>
          <div role="group" aria-labelledby={`help-${item.id}`} className="mt-2 grid grid-cols-3 gap-2">
            {HELP_ANSWERS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => answer(a.value)}
                className="rounded-card-sm bg-background px-2 font-medium text-text"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="mt-3"><FormMessage text={error} /></div>}

      <button
        type="button"
        onClick={stop}
        className="mt-3 -ml-2 rounded-card-sm px-2 text-helper text-text-muted underline underline-offset-4"
      >
        Stop trying this
      </button>
    </article>
  );
}
