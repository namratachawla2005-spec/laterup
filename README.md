# LaterUp

**Midlife is a new chapter. You don't have to figure it out alone.**

LaterUp is a private, personalized wellness companion for women in the years before, during and after menopause, built India-first. She types what she's feeling in her own words and gets a warm, practical answer; tries small things and notices what helps; and walks into a doctor's room prepared, in English or Hindi.

> **Prototype for demo and evaluation only. Not for real-world use.** LaterUp is not a doctor and not medical advice. In an emergency, call 112.

**Live:** https://laterup.vercel.app

## Try it in two minutes

1. Open the live link and tap **Let's begin**. Sign up with any email (no confirmation step).
2. Answer the short intake (every question can be skipped).
3. On **Home**, tap a suggested question, or type your own. The answer comes from Claude Haiku.
4. Open **Patterns** and **Doctor Prep**, and tap **See an example** to see a full sample story.
5. **SOS** and **Help** are on every page.

## Pages

| Page | What it does |
|---|---|
| Welcome and intake | Sign up, consent, 7 optional questions |
| Home | "What's on your mind?", suggested questions, one-tap daily check-in |
| Talk | One warm 4-part answer: what may be happening, one small thing to try, when to see a doctor |
| Patterns | Good, okay and tough days, sleep and energy, what seems to help (observations, never causes) |
| Doctor Prep | One-page summary in her own words, questions to ask, an English / Hindi opening sentence, print or share |
| Settings | Profile, edit answers, change password, text size, delete my data |
| About, Plans, Help, SOS | Public pages: story, pricing preview, how it works, emergency numbers |

## How it's built

- **Next.js** (App Router, TypeScript) and **Tailwind CSS**
- **Supabase** for login and database, with Row Level Security on every table
- **One AI connector** (`lib/brain.ts`): Claude Haiku 4.5 on the live site; a local 27B open model (Qwen 3.8, via Ollama) for free development. One environment variable switches between them.
- Hosted on **Vercel**, deployed from this repository

## Safety and privacy, in short

- Emergency check on the phone and on the server before any AI call; emergency messages are never sent to the AI or saved
- Every AI answer is checked for medicine names, doses, diagnosis phrasing and promises before it is shown, and is labelled "Written by AI and checked for safety"
- Her name is never sent to the AI; usage logs hold token counts only
- Signup cap, daily question cap and a monthly AI spend limit
- "LaterUp is a wellness guide, not medical advice" on every page

Full details: [COPYRIGHT_AND_LEGAL.md](./COPYRIGHT_AND_LEGAL.md).

## Running it locally

Create `.env.local` (never committed) with: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER` (`ollama` or `anthropic`), `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `MAX_MESSAGE_CHARS`, `MAX_ANSWER_TOKENS`. Then:

```bash
npm install
npm run dev
```

Database setup is in `supabase/`. Build plan and page briefs are in `docs/`.

## License and legal

© 2026 Namrata Chawla. All rights reserved.

This is original work shared for evaluation and as a portfolio piece. No open-source licence is granted: please don't copy, reuse, distribute or use it commercially without written permission. See [COPYRIGHT_AND_LEGAL.md](./COPYRIGHT_AND_LEGAL.md) for complete legal details, responsible AI practices and usage terms.

Contact: namrata.chawla.2005@gmail.com
