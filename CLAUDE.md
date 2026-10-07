# CLAUDE.md: LaterUp

Read this file before every task. Scope, architecture and plan are in `docs/BUILD-SPEC.md`. Full detail for each page, including exact copy, is in `docs/pages/`.

## What we are building

LaterUp is a private, personalized wellness companion for women going through perimenopause, menopause and midlife. It helps her understand what she is experiencing, try small practical things, notice what actually works for her, and feel ready to talk to a doctor.

- **Name:** LaterUp (one word, capital U). Never "Later Up".
- **Headline:** "Midlife is a new chapter. You don't have to figure it out alone."
- **Audience:** Indian women aged 40 to 55 first, then South Asia, then global. Most menopause apps assume a Western lifestyle. LaterUp is built for women who often work, run a household, cook, live in joint families and care for parents or in-laws. Use Indian foods, routines and family context in all examples and suggestions.
- **Core journey:** Understand (Talk), Try ("I'll try this"), Notice (Patterns), Act (Doctor Prep).
- **The hero:** the Talk page. She types what she feels in her own words and gets one warm, personalized, 4-part answer. If that answer feels generic, the app fails. Polish goes here first.

This is a 2-day demo build for an evaluation assignment (Mosaic Wellness), due 8 October 2026. The builder is not a programmer. Favour simple, readable code over clever code. Finish one page fully before starting the next.

## Pages (5, plus a small Settings screen)

| # | Page | Route | Brief |
|---|---|---|---|
| 1 | Welcome and Intake | `/` | `docs/pages/01-welcome-intake.md` |
| 2 | Home | `/home` | `docs/pages/02-home.md` |
| 3 | Talk (Understanding, the hero) | `/talk` | `docs/pages/03-talk.md` |
| 4 | Patterns | `/patterns` | `docs/pages/04-patterns.md` |
| 5 | Doctor Prep | `/doctor` | `docs/pages/05-doctor-prep.md` |
| | Settings | `/settings` | Described in `02-home.md` |
| | About LaterUp (public, no login) | `/about` | Added 7 Oct at the user's request: why we started, what LaterUp is and isn't, privacy promise |
| | Plans (public, no login) | `/plans` | Added 7 Oct at the user's request: pricing only (Free, Plus, workplaces), no payments |
| | Help (public, no login) | `/help` | Added 7 Oct at the user's request: what LaterUp is, how each page works, tips |
| | SOS (public, no login) | `/sos` | Added 7 Oct at the user's request: emergency numbers and government websites only. Floating SOS (terracotta) and Help (teal) buttons on every page; in Talk's top bar instead |

Plus the auth screens (Sign up, Log in, Forgot password, Reset password) that gate the app. Forgot password (7 Oct, user request) shows a greyed-out form marked "Coming soon": no email service is connected. `/reset-password` is built and ready for when email is set up. Do not add any other pages. If something seems missing, ask me first.

## Tech stack (do not change without asking)

- Next.js (App Router) with TypeScript
- Tailwind CSS for styling
- **Supabase for auth and database.** Email and password login, with email confirmation turned OFF so reviewers get in instantly. Every table protected by Row Level Security so each woman can only ever read and write her own rows.
- **A single AI "brain connector" file** that every part of the app calls. It talks to either the local Ollama model or the Claude API, chosen by an environment variable. The rest of the app never knows or cares which model answered. See BUILD-SPEC section 3.
- **Two server routes**, the only places model keys and the Supabase service role key are used:
  - `/api/understand`: runs the emergency, length, topic and daily-cap checks, calls the brain connector, validates the answer, and records token usage.
  - `/api/delete-account`: deletes her account and every row she owns.
- Local dev model: Ollama at `http://192.168.1.4:11434`, model `qwen3.8-q5-65k:latest`, sent with `think: false`.
- Demo model: Anthropic Claude API, model `claude-haiku-4-5-20251001`. Key from `ANTHROPIC_API_KEY`.
- Deployed on Vercel from a GitHub repository.
- No other backend, no other paid services, no extra libraries unless I approve them.

## Secrets (never leak these)

- The Supabase **anon** key is safe in browser code. The Supabase **service role** key is server-only and must never reach the browser.
- The model API key is server-only.
- Keys live in `.env.local` locally and in Vercel environment variables. `.env.local` is never committed; check `.gitignore` first.

## Rules for working with me

1. Before writing code for a page, tell me in 3 to 5 plain sentences what you will build. Then build it.
2. After each page, tell me exactly how to test it in the browser, on a phone-sized screen too.
3. Explain errors in plain language and fix them yourself.
4. Never put secret keys in code or in any file sent to the browser.
5. Do not add pages, features or libraries that are not in `docs/BUILD-SPEC.md` or `docs/pages/`. If something seems missing, ask me first.
6. Commit to git after each working page with a short clear message.
7. If a page brief and this file disagree, this file wins. Tell me about the conflict.

## Design system

| Token | Use | Value |
|---|---|---|
| background | Page background, warm cream | `#FAF5EE` |
| surface | Cards, text boxes, option chips | `#F1E7DA` |
| accent | Brand wordmark, card titles, icons, tough-day dots, terracotta | `#C2673F` |
| primary | Main buttons, selected options, active tab, deep teal | `#1F5C5A` |
| gentle | "See a doctor soon" and emergency borders, clay rose | `#D49A89` |
| text | Main text, warm charcoal | `#2E2A26` |
| text-muted | Helper text, notes | `#6B625A` |

- **Fonts:** `DM Sans` (Google Fonts) for everything, fallback `system-ui, sans-serif`. `Noto Sans Devanagari` for Hindi text.
- **Sizes:** body text 18px minimum (many users are in their 40s and 50s), helper text 15px minimum.
- **Shapes:** rounded corners 12 to 16px, every tap target at least 48px tall, generous whitespace, one clear primary action per screen.
- **Colour rules:** white text only on deep teal, never on terracotta. Never red or green for good and bad. No pink.
- **Feel:** warm, calm, private, reassuring, like a wise friend. Never clinical, childish, fear-based or overly decorative.
- **Never:** streaks, badges, points, pop-ups, autoplay, notifications, line charts, pie charts or percentages shown to the user.
- **Mobile first.** Every page must work on a phone, tablet and desktop.
- **Accessible:** real labels on form fields, visible focus states, strong contrast, never rely on colour alone, respect "reduce motion".

## Safety rules (non-negotiable, apply to all text in the app and all AI answers)

- Never diagnose. Never tell her she is perimenopausal, menopausal or postmenopausal. Never say a symptom is caused by menopause. Say hormonal changes common in midlife "can play a part" or "may be linked".
- Never recommend, start, stop or change medication, hormone therapy, supplements or doses. Never name a medicine.
- Never claim a food, herb or practice cures or treats anything.
- Never promise outcomes. Say "Try this and notice how you feel", never "This will improve your sleep".
- **Calm, one step at a time.** If she seems to be asking many anxious questions quickly, open with a steadying line ("Let's take this one step at a time, there's no rush") and answer the single most important thing, not everything at once.
- Patterns are observations, never causes.
- Never invent data or insights. If there is not enough data, say so honestly.
- Emergency check runs on the device AND in the server route before any model call. Emergency messages are never sent to the model and never saved. Show 112, and for self-harm also Tele-MANAS 14416. The emergency path is never blocked by any usage cap.
- Every AI answer ends with a "Talk to a doctor if" section. Answers are checked for medicine names, doses and diagnosis phrasing before showing.
- Every page shows: "LaterUp is a wellness guide, not medical advice."
- No guilt messaging.
- Errors shown to users are short and human. Never show technical error text.

## Privacy rules

- Login uses email and password only. Collect only what the page briefs list.
- Her name is never sent to the model.
- `/api/understand` never logs message content. It records only token counts in the `usage` table. Her own conversation is saved to her own rows (protected by Row Level Security) so she can return to it; emergency messages are never saved anywhere.
- Row Level Security on every table: each user sees only her own rows.
- Health details never appear in URLs, page titles or browser tab names.
- Sharing (WhatsApp, Copy) only happens when she taps it, after a privacy reminder.
- "Delete my data" in Settings clears all her rows and signs her out.

## Copy

Use the exact text given in `docs/pages/` for headings, questions, options and messages. Do not rewrite it. If copy breaks a safety rule above, flag it to me instead of changing it silently.
