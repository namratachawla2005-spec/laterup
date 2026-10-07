/**
 * Copyright © 2026 Namrata Chawla. All rights reserved.
 * LaterUp: confidential and proprietary, shared for evaluation only.
 * Unauthorized use or distribution is prohibited. See COPYRIGHT_AND_LEGAL.md.
 */
"use client";

// Page 1, Steps 2 to 4: Promises, the 7 questions, Thank you.
// Each answer is saved to her profile straight away, so she can resume anywhere.
// step 0 = promises, 1 to 7 = questions, 8 = thank you
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import WellnessNote from "@/components/WellnessNote";
import { FormMessage } from "@/components/AuthFields";
import RisingSun from "./RisingSun";
import {
  AGE_GROUPS, STAGES, SYMPTOMS, DIETS, LIFE_CONTEXT, DOCTOR_STATUS,
  MAX_NAME_LENGTH, MAX_SYMPTOMS, labelFor, buildReflection,
  type Option, type Profile,
} from "@/lib/intake";

type Answers = {
  name: string;
  age_group: string | null;
  stage: string | null;
  top_symptoms: string[];
  diet: string | null;
  life_context: string[];
  doctor_status: string | null;
};

type Question =
  | { id: "name"; kind: "text"; title: string }
  | { id: "age_group" | "stage" | "diet" | "doctor_status"; kind: "single"; title: string; options: Option[] }
  | { id: "top_symptoms" | "life_context"; kind: "multi"; title: string; helper: string; options: Option[]; max?: number; exclusive?: string };

const QUESTIONS: Question[] = [
  { id: "name", kind: "text", title: "What would you like us to call you?" },
  { id: "age_group", kind: "single", title: "Which age group are you in?", options: AGE_GROUPS },
  { id: "stage", kind: "single", title: "Which of these sounds most like you right now?", options: STAGES },
  { id: "top_symptoms", kind: "multi", title: "What's been bothering you most lately?", helper: "Pick up to 3", options: SYMPTOMS, max: MAX_SYMPTOMS },
  { id: "diet", kind: "single", title: "How do you usually eat?", options: DIETS },
  { id: "life_context", kind: "multi", title: "What does your life look like these days?", helper: "Pick all that apply", options: LIFE_CONTEXT, exclusive: "prefer_not_to_say" },
  { id: "doctor_status", kind: "single", title: "Have you spoken to a doctor about these changes?", options: DOCTOR_STATUS },
];
const TOTAL = QUESTIONS.length;
const SAVE_ERROR = "We couldn't save that just now. Please try again.";

// What gets written to the profile for each question
function fieldsFor(q: Question, a: Answers) {
  switch (q.id) {
    case "name":
      return { name: a.name.trim() || null };
    case "stage":
      return { stage: a.stage, stage_answer: a.stage ? labelFor(STAGES, a.stage) : null };
    default:
      return { [q.id]: a[q.id] };
  }
}

function isAnswered(q: Question, a: Answers) {
  if (q.kind === "text") return a.name.trim().length > 0;
  if (q.kind === "single") return a[q.id] !== null;
  return a[q.id].length > 0;
}

// mode "intake": first time, from Page 1. mode "edit": "Edit my answers" in Settings,
// starts at Question 1, never touches intake progress, and calls onExit when done.
export default function IntakeFlow({
  profile,
  mode = "intake",
  onExit,
}: {
  profile: Profile;
  mode?: "intake" | "edit";
  onExit?: (saved: boolean) => void;
}) {
  const router = useRouter();
  const editing = mode === "edit";
  const [step, setStep] = useState(() =>
    editing ? 1 : !profile.consent_given ? 0 : Math.min(Math.max(profile.intake_step, 1), TOTAL + 1)
  );
  const [consent, setConsent] = useState(profile.consent_given);
  const [answers, setAnswers] = useState<Answers>({
    name: profile.name ?? "",
    age_group: profile.age_group,
    stage: profile.stage,
    top_symptoms: profile.top_symptoms ?? [],
    diet: profile.diet,
    life_context: profile.life_context ?? [],
    doctor_status: profile.doctor_status,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Move focus and scroll to the new heading on each step (screen readers, small phones)
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, [step]);

  async function save(fields: Record<string, unknown>, nextStep: number) {
    setError("");
    const progress = editing
      ? {}
      : { intake_step: nextStep, ...(nextStep > TOTAL ? { intake_completed: true } : {}) };
    const update = { ...fields, ...progress };

    if (Object.keys(update).length > 0) {
      setSaving(true);
      const { error } = await createClient().from("profiles").update(update).eq("id", profile.id);
      setSaving(false);
      if (error) {
        setError(SAVE_ERROR);
        return;
      }
    }

    if (editing && nextStep > TOTAL) onExit?.(true);
    else setStep(nextStep);
  }

  function goBack() {
    setError("");
    if (editing && step === 1) onExit?.(false);
    else setStep(step - 1);
  }

  // ---------------- Step 2: Promises ----------------
  if (step === 0) {
    return (
      <Screen>
        <h1 ref={headingRef} tabIndex={-1} className="text-[1.75rem] font-semibold leading-tight text-balance focus:outline-none">
          Before we start, two promises
        </h1>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-accent">Your privacy</h2>
          <p className="mt-2">
            Everything you share is saved securely to your private account. Only you can see it.
            We never sell or share your information. You can delete everything at any time.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-accent">Honesty</h2>
          <p className="mt-2">
            LaterUp helps you understand your body and prepare for conversations with your doctor.
            It is not a doctor, and it does not diagnose or prescribe. For any medical decision,
            please talk to a qualified doctor.
          </p>
        </section>

        <aside className="mt-8 rounded-card border-2 border-gentle p-5">
          <p>
            If you ever have severe chest pain, very heavy bleeding, fainting, or thoughts of
            harming yourself, please contact a doctor or emergency services right away. In India,
            you can call <a href="tel:112" className="font-semibold text-primary underline underline-offset-4">112</a>.
          </p>
        </aside>

        <label className="mt-8 flex min-h-tap cursor-pointer items-start gap-4 rounded-card-sm py-2">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-6 w-6 shrink-0 accent-primary"
          />
          <span>I understand LaterUp is a wellness guide, not medical advice.</span>
        </label>

        <div className="mt-6 space-y-4">
          <FormMessage text={error} />
          <PrimaryButton
            disabled={!consent || saving}
            onClick={() =>
              save(
                { consent_given: true, consent_date: new Date().toLocaleDateString("en-CA") },
                Math.max(profile.intake_step, 1)
              )
            }
          >
            {saving ? "Just a moment..." : "Continue"}
          </PrimaryButton>
        </div>
      </Screen>
    );
  }

  // ---------------- Step 4: Thank you ----------------
  if (step > TOTAL) {
    const { headline, body } = buildReflection({
      name: answers.name.trim() || null,
      top_symptoms: answers.top_symptoms,
      age_group: answers.age_group,
      doctor_status: answers.doctor_status,
    });
    return (
      <Screen>
        <div className="flex flex-1 flex-col justify-center py-8">
          <RisingSun className="w-40" />
          <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-[1.875rem] font-semibold leading-tight text-balance focus:outline-none">
            {headline}
          </h1>
          <p className="mt-4 text-[1.25rem] leading-relaxed">{body}</p>
          <div className="mt-10">
            <PrimaryButton
              onClick={() => {
                router.push("/home");
                router.refresh();
              }}
            >
              Take me to LaterUp
            </PrimaryButton>
          </div>
        </div>
      </Screen>
    );
  }

  // ---------------- Step 3: The 7 questions ----------------
  const q = QUESTIONS[step - 1];
  const answered = isAnswered(q, answers);
  const next = () => save(fieldsFor(q, answers), step + 1);
  const skip = () => save({}, step + 1); // skipping never changes saved answers

  return (
    <Screen>
      <button
        type="button"
        onClick={goBack}
        className="-ml-2 inline-flex items-center gap-1 self-start rounded-card-sm px-2 font-medium text-text-muted"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
          <path d="M12.5 5 7.5 10l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <div className="mt-4">
        <p className="text-helper text-text-muted">Question {step} of {TOTAL}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
      </div>

      <form
        className="mt-8 flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (answered && !saving) next();
        }}
      >
        <h1 ref={headingRef} tabIndex={-1} className="text-[1.75rem] font-semibold leading-tight text-balance focus:outline-none">
          {q.kind === "text" ? <label htmlFor="name">{q.title}</label> : q.title}
        </h1>

        {q.kind === "multi" && <p className="mt-2 text-text-muted">{q.helper}</p>}

        <div className="mt-6">
          {q.kind === "text" && (
            <>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                maxLength={MAX_NAME_LENGTH}
                placeholder="Your first name or a nickname"
                aria-describedby="name-help"
                value={answers.name}
                onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                className="w-full rounded-card-sm border-2 border-transparent bg-surface px-4 text-body placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <p id="name-help" className="mt-2 text-helper text-text-muted">
                This is just for us to greet you. Only you can see it.
              </p>
            </>
          )}

          {q.kind === "single" && (
            <div role="group" aria-label={q.title} className="space-y-3">
              {q.options.map((o) => (
                <OptionButton
                  key={o.value}
                  label={o.label}
                  selected={answers[q.id] === o.value}
                  onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                />
              ))}
            </div>
          )}

          {q.kind === "multi" && (
            <MultiChoice
              question={q}
              selected={answers[q.id]}
              onChange={(values) => setAnswers({ ...answers, [q.id]: values })}
            />
          )}
        </div>

        <div className="mt-8 space-y-4">
          <FormMessage text={error} />
          {answered && (
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Just a moment..." : "Next"}
            </PrimaryButton>
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={skip}
              disabled={saving}
              className="rounded-card-sm px-4 font-medium text-text-muted underline underline-offset-4"
            >
              Skip for now
            </button>
          </div>
        </div>
      </form>
    </Screen>
  );
}

// ---------------- Small building blocks ----------------

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-6 pb-10">
      {children}
      <div className="mt-auto pt-12">
        <WellnessNote />
      </div>
    </main>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-card bg-primary px-6 font-semibold text-white disabled:bg-surface disabled:text-text-muted"
    >
      {children}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path d="M4.5 10.5 8.5 14.5 15.5 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One full-width row. Selected = teal with a tick (never colour alone).
function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-card-sm px-4 py-3 text-left ${
        selected ? "bg-primary text-white" : "bg-surface text-text"
      }`}
    >
      <span>{label}</span>
      {selected && <CheckIcon />}
    </button>
  );
}

// Soft rounded tags for "pick several" questions
function MultiChoice({
  question,
  selected,
  onChange,
}: {
  question: Extract<Question, { kind: "multi" }>;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const { max, exclusive } = question;
  const full = max !== undefined && selected.length >= max;

  function toggle(value: string) {
    if (selected.includes(value)) return onChange(selected.filter((v) => v !== value));
    if (value === exclusive) return onChange([value]); // "Prefer not to say" clears the rest
    if (full) return;
    onChange([...selected.filter((v) => v !== exclusive), value]);
  }

  return (
    <>
      <div role="group" aria-label={question.title} className="flex flex-wrap gap-3">
        {question.options.map((o) => {
          const isOn = selected.includes(o.value);
          const blocked = full && !isOn;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={isOn}
              aria-disabled={blocked}
              onClick={() => toggle(o.value)}
              className={`inline-flex items-center gap-2 rounded-card-sm px-4 py-2 text-left ${
                isOn ? "bg-primary text-white" : "bg-surface text-text"
              } ${blocked ? "opacity-50" : ""}`}
            >
              {isOn && <CheckIcon />}
              {o.label}
            </button>
          );
        })}
      </div>
      {max !== undefined && (
        <p aria-live="polite" className="mt-4 text-helper text-text-muted">
          {full ? `You've picked ${max}. Tap one to remove it if you'd like to change.` : ""}
        </p>
      )}
    </>
  );
}
