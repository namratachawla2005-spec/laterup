/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { localDate, useIsBrowser } from "@/lib/local";
import { addDays, type PatternsData } from "@/lib/patterns";
import {
  reassurance, suggestedQuestions, mergeQuestions, conversationStarter, aboutMeLines, experiencingLines, triedLines,
  leadingSymptoms, footerText, toPlainText, shortDate, fullDate,
  DEFAULT_INCLUDE, MAX_QUESTIONS, MAX_OWN_WORDS, MAX_ANYTHING_ELSE,
  type DoctorProfile, type DoctorNote, type Prep, type Include, type Question, type Summary, type SummarySection,
} from "@/lib/doctor";
import { examplePatterns, EXAMPLE_PROFILE, exampleDoctorNotes, examplePrep } from "@/lib/example";
import BottomNav from "@/components/BottomNav";
import WellnessNote from "@/components/WellnessNote";
import HealthSummary from "@/components/doctor/HealthSummary";
import HomeWoman from "@/components/HomeWoman";
import MotifBackground, { HeadingWaves } from "@/components/MotifBackground";

type Props = {
  userId: string;
  profile: DoctorProfile;
  data: PatternsData;
  firstCheckIn: string | null;
  notes: DoctorNote[];
  prep: Prep;
};

export default function DoctorView(props: Props) {
  // Counts depend on her own date, so this draws only in the browser
  const isBrowser = useIsBrowser();
  return (
    <>
      <MotifBackground motif="waves">
        {isBrowser ? <DoctorContent {...props} /> : <main className="flex-1" />}
      </MotifBackground>
      <BottomNav />
    </>
  );
}

const MAX_CUSTOM_QUESTION = 200;
const MAX_VISIT_NOTE = 500;

function DoctorContent({ userId, profile: realProfile, data: realData, firstCheckIn: realFirst, notes: realNotes, prep: realPrep }: Props) {
  const [supabase] = useState(() => createClient());
  const [today] = useState(() => localDate());
  const [example, setExample] = useState(false);
  const [realState, setRealState] = useState({ prep: { ...realPrep, include: { ...DEFAULT_INCLUDE, ...realPrep.include } }, notes: realNotes });
  const [exampleState, setExampleState] = useState(() => ({ prep: examplePrep(today), notes: exampleDoctorNotes(today) }));
  const [showDoctor, setShowDoctor] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Conversation times -> her local dates
  const [real] = useState<PatternsData>(() => ({
    ...realData,
    conversations: realData.conversations.map((c) => ({ ...c, date: localDate(new Date(c.date)) })),
  }));

  const data = example ? examplePatterns(today) : real;
  const profile = example ? EXAMPLE_PROFILE : realProfile;
  const firstCheckIn = example ? addDays(today, -27) : realFirst;
  const { prep, notes } = example ? exampleState : realState;
  const setState = example ? setExampleState : setRealState;

  // ---------------- Saving (her real choices only; the example is never saved) ----------------
  async function savePrep(patch: Partial<Prep>) {
    setState((s) => ({ ...s, prep: { ...s.prep, ...patch } }));
    if (example) return true;
    const { error } = await supabase.from("doctor_prep").upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
    return !error;
  }

  async function removeNote(id: string) {
    if (!example) {
      const { error } = await supabase.from("doctor_notes").delete().eq("id", id);
      if (error) return false;
    }
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
    return true;
  }

  // ---------------- What the page shows ----------------
  const soonNotes = notes.filter((n) => n.see_doctor_soon);
  const ownNotes = notes.filter((n) => !n.see_doctor_soon).slice(0, MAX_OWN_WORDS);
  const isEmpty = !example && data.checkIns.length < 3 && notes.length === 0;

  const symptoms = leadingSymptoms(data, profile, today);
  const questions = mergeQuestions(suggestedQuestions(symptoms, soonNotes), prep.questions);
  const starter = conversationStarter(symptoms, firstCheckIn, today);

  const include = prep.include;
  const about = aboutMeLines(profile, include.diet);
  const experiencing = experiencingLines(data, profile, today);
  const tried = triedLines(data);
  const includedOwn = ownNotes.filter((n) => !prep.excluded_note_ids.includes(n.id));
  const noteLine = (n: DoctorNote) => `${shortDate(n.date)}: "${n.her_words}"`;

  const sections: SummarySection[] = [];
  if (include.aboutMe && about.length) sections.push({ title: "About me", lines: about });
  if (include.experiencing) sections.push({ title: "What I've been experiencing (last 30 days)", ...experiencing });
  if (include.ownWords && includedOwn.length) sections.push({ title: "In my own words", lines: includedOwn.map(noteLine) });
  if (include.whatTried && tried.length) sections.push({ title: "What I've tried", lines: tried });
  if (include.anythingElse && prep.anything_else.trim()) sections.push({ title: "Anything else", lines: [prep.anything_else.trim()] });

  const summary: Summary = {
    prepared: fullDate(today),
    mentionFirst: soonNotes.map(noteLine),
    sections,
    questions: questions.filter((q) => q.included).map((q) => q.text),
    footer: footerText(today),
  };
  const printSummary = fitOnePage(summary);

  function setInclude(key: keyof Include, on: boolean) {
    savePrep({ include: { ...include, [key]: on } });
  }

  function startExample(on: boolean) {
    setExample(on);
    if (on) setExampleState({ prep: examplePrep(today), notes: exampleDoctorNotes(today) });
    window.scrollTo(0, 0);
  }

  return (
    <>
      <main className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-28 print:hidden">
        {example && (
          <div role="status" className="mb-6 rounded-card border-2 border-accent/40 bg-surface p-4">
            <p>
              <strong>This is an example.</strong> Your real summary will build as you use LaterUp.
            </p>
            <button
              type="button"
              onClick={() => startExample(false)}
              className="mt-2 rounded-card border-2 border-primary px-5 font-semibold text-primary"
            >
              Exit example
            </button>
          </div>
        )}

        {/* the same woman as the other pages, talking with a doctor */}
        <HomeWoman scene="doctor" className="mb-3 h-[136px] w-60" />
        <h1 className="text-[1.75rem] font-semibold leading-tight">Ready for your doctor</h1>
        <p className="mt-2">{reassurance(profile.doctor_status)}</p>

        {isEmpty ? (
          <EmptyState onExample={() => startExample(true)} />
        ) : (
          <>
            {soonNotes.length > 0 && <MentionFirst notes={soonNotes} onRemove={removeNote} />}

            <SummaryEditor
              include={include}
              onInclude={setInclude}
              about={about}
              experiencing={experiencing}
              ownNotes={ownNotes}
              excluded={prep.excluded_note_ids}
              onExcludeNote={(id, out) =>
                savePrep({ excluded_note_ids: out ? [...prep.excluded_note_ids, id] : prep.excluded_note_ids.filter((x) => x !== id) })
              }
              onRemoveNote={removeNote}
              tried={tried}
              anythingElse={prep.anything_else}
              onAnythingElse={(text) => savePrep({ anything_else: text })}
              isEmptySummary={sections.length === 0 && soonNotes.length === 0}
              footer={summary.footer}
            />
          </>
        )}

        <QuestionsSection questions={questions} onChange={(qs) => savePrep({ questions: qs })} />
        <StarterSection english={starter.english} hindi={starter.hindi} />
        <WhichDoctor />

        {!isEmpty && (
          <TakeItWithYou
            example={example}
            plainText={toPlainText(summary)}
            onShow={() => setShowDoctor(true)}
          />
        )}

        {(!isEmpty || prep.after_visit_notes.length > 0) && (
          <AfterVisit
            notes={prep.after_visit_notes}
            example={example}
            onSave={(list) => savePrep({ after_visit_notes: list })}
            flash={savedFlash}
            setFlash={setSavedFlash}
            today={today}
          />
        )}

        {!isEmpty && !example && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => startExample(true)}
              className="-ml-2 rounded-card-sm px-2 text-text-muted underline underline-offset-4"
            >
              See an example
            </button>
          </div>
        )}

        <div className="mt-8">
          <WellnessNote withEmergency />
        </div>
      </main>

      {/* Paper version: only appears when printing */}
      <div className="hidden bg-white print:block">
        <HealthSummary summary={printSummary} print />
      </div>

      {showDoctor && <ShowToDoctor summary={summary} onClose={() => setShowDoctor(false)} />}
    </>
  );
}

// ---------------- Print: one A4 page ----------------
// Roughly how many printed lines the summary takes (about 95 characters fit on a line).
function printedLines(s: Summary): number {
  const lines = (list: string[]) => list.reduce((n, l) => n + Math.ceil(l.length / 95), 0);
  return 8 + 2 * (s.sections.length + 2) + lines(s.mentionFirst) + lines(s.questions)
    + s.sections.reduce((n, sec) => n + lines(sec.lines) + (sec.intro ? 1 : 0), 0);
}

// If it's too long, show fewer "own words" notes (oldest go first).
// "Mention first" and the questions are always kept.
function fitOnePage(s: Summary): Summary {
  const fits = 44;
  let fitted = s;
  for (let keep = 3; keep >= 0 && printedLines(fitted) > fits; keep--) {
    fitted = {
      ...s,
      sections: s.sections
        .map((sec) => (sec.title === "In my own words" ? { ...sec, lines: sec.lines.slice(0, keep) } : sec))
        .filter((sec) => sec.lines.length > 0),
    };
  }
  return fitted;
}

// ---------------- Small shared pieces ----------------
const h2Class = "text-xl font-semibold text-accent";
const outlineButton = "rounded-card border-2 border-primary px-5 font-semibold text-primary";
const linkButton = "rounded-card-sm px-2 text-text-muted underline underline-offset-4";

// An "Include" switch. Shows the word On / Off too, never colour alone.
function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`Include ${label}`}
      onClick={() => onChange(!on)}
      className="flex shrink-0 items-center gap-2 rounded-card-sm px-1 text-helper"
    >
      <span className={`w-7 text-right ${on ? "font-semibold text-primary" : "text-text-muted"}`}>{on ? "On" : "Off"}</span>
      <span className={`relative block h-7 w-12 rounded-full transition-colors ${on ? "bg-primary" : "bg-text-muted/35"}`}>
        <span className={`absolute top-1 block h-5 w-5 rounded-full bg-white shadow transition-[left] ${on ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

// "Remove" with a gentle confirm in place (never a pop-up)
function RemoveWithConfirm({ question, onRemove }: { question: string; onRemove: () => Promise<boolean> }) {
  const [asking, setAsking] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} className={`-ml-2 ${linkButton}`}>
        Remove
      </button>
    );
  }
  return (
    <div className="mt-2 rounded-card-sm bg-background p-3">
      <p>{question}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={async () => setFailed(!(await onRemove()))}
          className="rounded-card-sm bg-primary px-4 font-semibold text-white"
        >
          Yes, remove
        </button>
        <button type="button" onClick={() => setAsking(false)} className="rounded-card-sm border-2 border-primary px-4 font-semibold text-primary">
          Keep it
        </button>
      </div>
      {failed && <p className="mt-2 text-helper">That didn&apos;t work just now. Please try again.</p>}
    </div>
  );
}

// ---------------- Section 1: Please mention these first ----------------
function MentionFirst({ notes, onRemove }: { notes: DoctorNote[]; onRemove: (id: string) => Promise<boolean> }) {
  return (
    <section className="mt-6 rounded-card border-l-4 border-gentle bg-background p-5 shadow-[inset_0_0_0_1px_var(--color-surface)]" aria-labelledby="first-heading">
      <h2 id="first-heading" className={h2Class}>Please mention these first</h2>
      <ul className="mt-3 space-y-3">
        {notes.map((n) => (
          <li key={n.id}>
            <p>
              {shortDate(n.date)} · &ldquo;{n.her_words}&rdquo;
            </p>
            <RemoveWithConfirm question="Are you sure? This seemed important to mention." onRemove={() => onRemove(n.id)} />
          </li>
        ))}
      </ul>
      <p className="mt-3">These are worth checking with your doctor soon.</p>
    </section>
  );
}

// ---------------- Section 2: Your summary ----------------
function Part({
  title, label, on, onChange, children,
}: { title: React.ReactNode; label: string; on: boolean; onChange: (on: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="border-t border-text/10 pt-4 first:border-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="pt-1 font-semibold">{title}</h3>
        <Toggle label={label} on={on} onChange={onChange} />
      </div>
      <div className={on ? "mt-1" : "mt-1 text-text-muted"}>{children}</div>
    </div>
  );
}

function SummaryEditor(props: {
  include: Include;
  onInclude: (key: keyof Include, on: boolean) => void;
  about: string[];
  experiencing: { intro?: string; lines: string[] };
  ownNotes: DoctorNote[];
  excluded: string[];
  onExcludeNote: (id: string, out: boolean) => void;
  onRemoveNote: (id: string) => Promise<boolean>;
  tried: string[];
  anythingElse: string;
  onAnythingElse: (text: string) => void;
  isEmptySummary: boolean;
  footer: string;
}) {
  const { include, onInclude } = props;
  const [text, setText] = useState(props.anythingElse);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function typeAnythingElse(value: string) {
    setText(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => props.onAnythingElse(value), 800);
  }

  return (
    <section className="mt-8" aria-labelledby="summary-heading">
      <h2 id="summary-heading" className={h2Class}>Your summary</h2>
      <p className="mt-1 text-helper text-text-muted">Turn off anything you&apos;d rather not share.</p>

      <div className="mt-4 space-y-4 rounded-card bg-surface p-5">
        <Part title="About me" label="About me" on={include.aboutMe} onChange={(v) => onInclude("aboutMe", v)}>
          {props.about.length ? (
            <ul>{props.about.map((l) => <li key={l}>{l}</li>)}</ul>
          ) : (
            <p className="text-text-muted">Nothing here yet.</p>
          )}
          {include.aboutMe && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-helper text-text-muted">Diet</span>
              <Toggle label="Diet" on={include.diet} onChange={(v) => onInclude("diet", v)} />
            </div>
          )}
        </Part>

        <Part
          title={<>What I&apos;ve been experiencing <span className="font-normal text-text-muted">(last 30 days)</span></>}
          label="What I've been experiencing"
          on={include.experiencing}
          onChange={(v) => onInclude("experiencing", v)}
        >
          {props.experiencing.intro && <p>{props.experiencing.intro}</p>}
          <ul className="list-disc pl-5">{props.experiencing.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </Part>

        <Part title="In my own words" label="In my own words" on={include.ownWords} onChange={(v) => onInclude("ownWords", v)}>
          {props.ownNotes.length === 0 ? (
            <p className="text-text-muted">
              When you tap <strong>Add to my doctor notes</strong> on Talk, your words will appear here.
            </p>
          ) : (
            <ul className="mt-1 space-y-3">
              {props.ownNotes.map((n) => {
                const on = !props.excluded.includes(n.id);
                return (
                  <li key={n.id} className="rounded-card-sm bg-background p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className={on ? "" : "text-text-muted"}>
                        {shortDate(n.date)} · &ldquo;{n.her_words}&rdquo;
                      </p>
                      <Toggle label={`note from ${shortDate(n.date)}`} on={on} onChange={(v) => props.onExcludeNote(n.id, !v)} />
                    </div>
                    <RemoveWithConfirm question="Remove this note for good?" onRemove={() => props.onRemoveNote(n.id)} />
                  </li>
                );
              })}
            </ul>
          )}
        </Part>

        <Part title="What I've tried" label="What I've tried" on={include.whatTried} onChange={(v) => onInclude("whatTried", v)}>
          {props.tried.length ? (
            <ul className="list-disc pl-5">{props.tried.map((l) => <li key={l}>{l}</li>)}</ul>
          ) : (
            <p className="text-text-muted">
              When you tap <strong>I&apos;ll try this</strong> on Talk, it will show here with how it went.
            </p>
          )}
        </Part>

        <Part title="Anything else" label="Anything else" on={include.anythingElse} onChange={(v) => onInclude("anythingElse", v)}>
          <label htmlFor="anything-else" className="sr-only">Anything else for my doctor</label>
          <textarea
            id="anything-else"
            value={text}
            maxLength={MAX_ANYTHING_ELSE}
            rows={3}
            onChange={(e) => typeAnythingElse(e.target.value)}
            onBlur={() => { if (timer.current) clearTimeout(timer.current); props.onAnythingElse(text); }}
            placeholder="For example: medicines or supplements you take, other health conditions, or family history."
            className="mt-1 w-full rounded-card-sm border border-text/15 bg-background p-3 text-text placeholder:text-text-muted"
          />
          {text.length > MAX_ANYTHING_ELSE - 100 && (
            <p className="text-helper text-text-muted">{MAX_ANYTHING_ELSE - text.length} characters left</p>
          )}
        </Part>

        {props.isEmptySummary && (
          <p role="status" className="rounded-card-sm bg-background p-3">
            Your summary is empty. Turn on anything you&apos;d like to share.
          </p>
        )}

        <p className="border-t border-text/10 pt-4 text-helper text-text-muted">{props.footer}</p>
      </div>
    </section>
  );
}

// ---------------- Section 3: Questions you could ask ----------------
function QuestionsSection({ questions, onChange }: { questions: Question[]; onChange: (qs: Question[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const ticked = questions.filter((q) => q.included).length;
  const full = ticked >= MAX_QUESTIONS;

  function addOwn() {
    const text = draft.trim();
    if (!text || questions.some((q) => q.text === text)) return;
    onChange([...questions, { text, included: !full, custom: true }]);
    setDraft("");
    setAdding(false);
  }

  return (
    <section className="mt-10" aria-labelledby="questions-heading">
      <h2 id="questions-heading" className={h2Class}>Questions you could ask</h2>
      <p className="mt-1 text-helper text-text-muted">Tick the ones you want to bring. You can add your own.</p>

      <ul className="mt-4 space-y-2 rounded-card bg-surface p-4">
        {questions.map((q, i) => {
          const id = `q-${i}`;
          return (
            <li key={q.text} className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={q.included}
                disabled={!q.included && full}
                onChange={(e) => onChange(questions.map((x) => (x.text === q.text ? { ...x, included: e.target.checked } : x)))}
                className="mt-3 h-6 w-6 shrink-0 accent-primary"
              />
              <div className="flex-1">
                <label htmlFor={id} className={`block py-2 ${q.included ? "" : "text-text-muted"}`}>{q.text}</label>
                {q.custom && (
                  <button
                    type="button"
                    onClick={() => onChange(questions.filter((x) => x.text !== q.text))}
                    className={`-ml-2 -mt-2 ${linkButton}`}
                    aria-label={`Remove my question: ${q.text}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {full && (
        <p className="mt-2 text-helper text-text-muted">
          You can bring up to {MAX_QUESTIONS} questions. Doctors have limited time, and fewer questions get better answers.
        </p>
      )}

      {adding ? (
        <div className="mt-3">
          <label htmlFor="own-question" className="block font-medium">Your question</label>
          <input
            id="own-question"
            type="text"
            value={draft}
            maxLength={MAX_CUSTOM_QUESTION}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addOwn(); }}
            className="mt-1 w-full rounded-card-sm border border-text/15 bg-surface px-3 text-text"
          />
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={addOwn} disabled={!draft.trim()} className="rounded-card bg-primary px-5 font-semibold text-white disabled:bg-surface disabled:text-text-muted">
              Add
            </button>
            <button type="button" onClick={() => { setAdding(false); setDraft(""); }} className={linkButton}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`mt-3 ${outlineButton}`}>
          + Add my own question
        </button>
      )}
    </section>
  );
}

// ---------------- Section 4: Not sure how to begin? ----------------
function StarterSection({ english, hindi }: { english: string; hindi: string }) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  return (
    <section className="mt-10" aria-labelledby="starter-heading">
      <h2 id="starter-heading" className={h2Class}>Not sure how to begin?</h2>
      <p className="mt-1 text-helper text-text-muted">You can read this out, or just show the screen.</p>
      <div className="mt-4 rounded-card bg-surface p-5">
        <div role="group" aria-label="Language" className="inline-flex rounded-card bg-background p-1">
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
            className={`rounded-card-sm px-4 font-medium ${lang === "en" ? "bg-primary text-white" : "text-text"}`}
          >
            English
          </button>
          <button
            type="button"
            lang="hi"
            aria-pressed={lang === "hi"}
            onClick={() => setLang("hi")}
            className={`rounded-card-sm px-4 font-medium ${lang === "hi" ? "bg-primary text-white" : "text-text"}`}
          >
            हिंदी
          </button>
        </div>
        <p lang={lang} className="mt-4 text-[1.25rem] leading-relaxed" aria-live="polite">
          &ldquo;{lang === "en" ? english : hindi}&rdquo;
        </p>
      </div>
    </section>
  );
}

// ---------------- Section 5: Which doctor should I see? ----------------
function WhichDoctor() {
  return (
    <details className="group mt-10 rounded-card bg-surface">
      <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 rounded-card px-5 py-3 text-xl font-semibold text-accent [&::-webkit-details-marker]:hidden">
        Which doctor should I see?
        <span aria-hidden="true" className="text-text-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="space-y-3 px-5 pb-5">
        <p>
          A <strong>gynaecologist</strong> is usually the best person to talk to about menopause. If that&apos;s hard to
          arrange, a <strong>general physician</strong> or your <strong>family doctor</strong> is a good place to start;
          they can guide you further.
        </p>
        <p>If your clinic has a <strong>menopause clinic</strong>, that&apos;s even better.</p>
      </div>
    </details>
  );
}

// ---------------- Section 6: Take it with you ----------------
function TakeItWithYou({ example, plainText, onShow }: { example: boolean; plainText: string; onShow: () => void }) {
  const [sharing, setSharing] = useState<null | "whatsapp" | "copy">(null);
  const [status, setStatus] = useState("");

  async function shareAnyway() {
    if (sharing === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(plainText)}`, "_blank", "noopener");
      setStatus("");
    } else {
      try {
        await navigator.clipboard.writeText(plainText);
        setStatus("Copied");
      } catch {
        setStatus("Couldn't copy just now. Please try again.");
      }
    }
    setSharing(null);
  }

  return (
    <section className="mt-10" aria-labelledby="take-heading">
      <div className="flex items-center gap-6">
        <h2 id="take-heading" className={h2Class}>Take it with you</h2>
        <HeadingWaves />
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <button type="button" onClick={onShow} className="rounded-card bg-primary px-5 font-semibold text-white">
          Show to doctor
        </button>
        <button type="button" onClick={() => window.print()} className={outlineButton}>
          Save as PDF / Print
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={example}
            onClick={() => { setSharing("whatsapp"); setStatus(""); }}
            className={`${outlineButton} disabled:border-text-muted/40 disabled:text-text-muted`}
          >
            Share on WhatsApp
          </button>
          <button
            type="button"
            disabled={example}
            onClick={() => { setSharing("copy"); setStatus(""); }}
            className={`${outlineButton} disabled:border-text-muted/40 disabled:text-text-muted`}
          >
            Copy text
          </button>
        </div>
        {example && <p className="text-helper text-text-muted">Sharing is turned off in the example.</p>}
        <p aria-live="polite" className="text-helper font-medium text-primary">{status}</p>
      </div>

      {sharing && (
        <div role="region" aria-labelledby="before-share" className="mt-2 rounded-card border-2 border-gentle bg-background p-5">
          <h3 id="before-share" className="font-semibold">Before you share</h3>
          <p className="mt-2">
            This summary has personal health information. It will be visible to anyone you send it to. LaterUp can&apos;t
            take it back once it&apos;s sent.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={shareAnyway} className="rounded-card bg-primary px-5 font-semibold text-white">
              Share anyway
            </button>
            <button type="button" onClick={() => setSharing(null)} className={outlineButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------------- "Show to doctor": full screen, large text, no app buttons ----------------
function ShowToDoctor({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Keep the screen on while she shows it, if the phone allows it
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {});

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lock?.release().catch(() => {});
    };
  }, [onClose]);

  // Drawn at the top level of the page, so nothing (bottom bar, SOS / Help buttons) shows on top
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Health summary" className="fixed inset-0 z-50 overflow-y-auto bg-white print:hidden">
      <div className="sticky top-0 flex justify-end bg-white/95 p-2">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="flex h-tap w-tap items-center justify-center rounded-card-sm text-text">
          <span aria-hidden="true" className="text-3xl leading-none">×</span>
        </button>
      </div>
      <div className="mx-auto max-w-2xl px-6 pb-12">
        <HealthSummary summary={summary} />
      </div>
    </div>,
    document.body
  );
}

// ---------------- Section 7: After your visit ----------------
function AfterVisit({
  notes, example, onSave, flash, setFlash, today,
}: {
  notes: Prep["after_visit_notes"];
  example: boolean;
  onSave: (list: Prep["after_visit_notes"]) => Promise<boolean>;
  flash: boolean;
  setFlash: (v: boolean) => void;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [failed, setFailed] = useState(false);

  async function save(list: Prep["after_visit_notes"]) {
    const ok = await onSave(list);
    setFailed(!ok);
    return ok;
  }

  async function addNote() {
    const text = draft.trim();
    if (!text) return;
    const first = notes.length === 0;
    if (await save([{ id: crypto.randomUUID(), date: today, text }, ...notes])) {
      setDraft("");
      if (first) setFlash(true);
    }
  }

  return (
    <section className="mt-10" aria-labelledby="after-heading">
      <h2 id="after-heading">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-3 rounded-card bg-surface px-5 text-left text-xl font-semibold text-accent"
        >
          After your visit
          <span aria-hidden="true" className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        </button>
      </h2>

      {open && (
        <div className="mt-3 px-1">
          {example ? (
            <p className="text-helper text-text-muted">Notes are turned off in the example.</p>
          ) : (
            <>
              <label htmlFor="visit-note" className="block">What did your doctor say? Write anything you want to remember.</label>
              <textarea
                id="visit-note"
                value={draft}
                maxLength={MAX_VISIT_NOTE}
                rows={3}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="For example: tests to do, things to try, when to go back."
                className="mt-2 w-full rounded-card-sm border border-text/15 bg-surface p-3 text-text placeholder:text-text-muted"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={!draft.trim()}
                className="mt-2 rounded-card bg-primary px-5 font-semibold text-white disabled:bg-surface disabled:text-text-muted"
              >
                Save note
              </button>
            </>
          )}
          {flash && <p role="status" className="mt-3 font-medium">Well done for going. That&apos;s not always easy.</p>}
          {failed && <p className="mt-3 text-helper">That didn&apos;t save just now. Please try again.</p>}

          <ul className="mt-4 space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-card-sm bg-surface p-4">
                <p className="text-helper text-text-muted">{fullDate(n.date)}</p>
                {editing === n.id ? (
                  <>
                    <label htmlFor={`edit-${n.id}`} className="sr-only">Edit note</label>
                    <textarea
                      id={`edit-${n.id}`}
                      value={editText}
                      maxLength={MAX_VISIT_NOTE}
                      rows={3}
                      onChange={(e) => setEditText(e.target.value)}
                      className="mt-1 w-full rounded-card-sm border border-text/15 bg-background p-3 text-text"
                    />
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        disabled={!editText.trim()}
                        onClick={async () => {
                          if (await save(notes.map((x) => (x.id === n.id ? { ...x, text: editText.trim() } : x)))) setEditing(null);
                        }}
                        className="rounded-card-sm bg-primary px-4 font-semibold text-white disabled:bg-background disabled:text-text-muted"
                      >
                        Save
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className={linkButton}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1 whitespace-pre-line">{n.text}</p>
                    {!example && (
                      <div className="mt-1 flex gap-2">
                        <button type="button" onClick={() => { setEditing(n.id); setEditText(n.text); }} className={`-ml-2 ${linkButton}`}>
                          Edit
                        </button>
                        <RemoveWithConfirm question="Delete this note?" onRemove={() => save(notes.filter((x) => x.id !== n.id))} />
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ---------------- Empty state: fewer than 3 check-ins and no doctor notes ----------------
function EmptyState({ onExample }: { onExample: () => void }) {
  return (
    <section className="mt-8 rounded-card bg-surface p-5" aria-labelledby="build-heading">
      <h2 id="build-heading" className={h2Class}>Your summary will build itself</h2>
      <p className="mt-2">
        As you check in and talk to LaterUp, we&apos;ll gather what matters for your doctor here, in your own words.
      </p>
      <p className="mt-2">You can still get ready now: we&apos;ve added some questions to ask, and words to help you start.</p>
      <button type="button" onClick={onExample} className={`mt-4 w-full ${outlineButton}`}>
        See an example
      </button>
    </section>
  );
}
