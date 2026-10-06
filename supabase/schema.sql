-- =====================================================================
-- LaterUp database setup (BUILD-SPEC section 5)
--
-- How to run: Supabase dashboard -> SQL Editor -> New query ->
-- paste this whole file -> Run.
-- Safe to run more than once: it never deletes data.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tables
-- Every user_id points at her login account. "on delete cascade" means
-- deleting her account removes every row she owns.
-- ---------------------------------------------------------------------

-- Her intake answers (Page 1). One row per woman.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text check (char_length(name) <= 30),          -- optional, never sent to AI
  age_group text,                                     -- e.g. "45-49"
  stage text,                                         -- internal label from Q3
  stage_answer text,                                  -- her exact Q3 answer
  top_symptoms text[] not null default '{}'
    check (cardinality(top_symptoms) <= 3),
  diet text,
  life_context text[] not null default '{}',
  doctor_status text,
  consent_given boolean not null default false,
  consent_date date,
  intake_step int not null default 0,                 -- where to resume intake
  intake_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Daily check-ins (Page 2). One per woman per day.
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  feeling text not null check (feeling in ('good', 'okay', 'tough')),
  bothering text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Talk conversations (Page 3)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  symptom_tags text[] not null default '{}',
  see_doctor_soon boolean not null default false,
  helpful boolean                                     -- null until she answers
);

-- Messages inside a conversation. Emergency messages are NEVER saved here.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null,
  created_at timestamptz not null default now()
);

-- Things she is trying ("I'll try this" on Page 3). Max 5 active, checked in the app.
create table if not exists public.trying (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  for_symptom text,
  started_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- "Did it help?" answers (Page 2). One per item per day.
create table if not exists public.trying_feedback (
  id uuid primary key default gen_random_uuid(),
  trying_id uuid not null references public.trying (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  answer text not null check (answer in ('yes', 'a_little', 'not_really')),
  created_at timestamptz not null default now(),
  unique (trying_id, date)
);

-- "Add to my doctor notes" (Page 3), shown on Page 5
create table if not exists public.doctor_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null default current_date,
  her_words text not null,
  symptom_tags text[] not null default '{}',
  summary text,
  see_doctor_soon boolean not null default false,
  created_at timestamptz not null default now()
);

-- Doctor Prep choices (Page 5). One row per woman.
create table if not exists public.doctor_prep (
  user_id uuid primary key references auth.users (id) on delete cascade,
  include jsonb not null default
    '{"aboutMe": true, "diet": false, "experiencing": true, "ownWords": true, "whatTried": true, "anythingElse": true}',
  excluded_note_ids uuid[] not null default '{}',
  anything_else text check (char_length(anything_else) <= 500),
  questions jsonb not null default '[]',
  after_visit_notes jsonb not null default '[]'
);

-- AI usage: token counts only, NEVER message text. Written only by the server.
create table if not exists public.usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  usage_date date not null default ((now() at time zone 'Asia/Kolkata')::date), -- India date
  provider text not null check (provider in ('ollama', 'anthropic')),
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  total_tokens int generated always as (input_tokens + output_tokens) stored
);

-- App settings (caps). No user link. Only the server and the dashboard can see it.
create table if not exists public.app_config (
  key text primary key,
  value int not null
);

insert into public.app_config (key, value) values
  ('max_signups', 5),
  ('daily_question_cap', 30)
on conflict (key) do nothing;   -- keeps any value you changed in the dashboard


-- ---------------------------------------------------------------------
-- 2. Indexes (keep lookups fast as data grows)
-- ---------------------------------------------------------------------
create index if not exists conversations_user_idx   on public.conversations (user_id, started_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists trying_user_idx          on public.trying (user_id);
create index if not exists trying_feedback_user_idx on public.trying_feedback (user_id);
create index if not exists doctor_notes_user_idx    on public.doctor_notes (user_id, date desc);
create index if not exists usage_user_date_idx      on public.usage (user_id, usage_date);


-- ---------------------------------------------------------------------
-- 3. Row Level Security: each woman can only ever see her own rows
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.check_ins       enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.trying          enable row level security;
alter table public.trying_feedback enable row level security;
alter table public.doctor_notes    enable row level security;
alter table public.doctor_prep     enable row level security;
alter table public.usage           enable row level security;
alter table public.app_config      enable row level security;

-- profiles: key column is id
drop policy if exists "own rows only" on public.profiles;
create policy "own rows only" on public.profiles
  for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own rows only" on public.check_ins;
create policy "own rows only" on public.check_ins
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.conversations;
create policy "own rows only" on public.conversations
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- messages: also the conversation must be hers
drop policy if exists "own rows only" on public.messages;
create policy "own rows only" on public.messages
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "own rows only" on public.trying;
create policy "own rows only" on public.trying
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trying_feedback: also the trying item must be hers
drop policy if exists "own rows only" on public.trying_feedback;
create policy "own rows only" on public.trying_feedback
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.trying t
      where t.id = trying_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "own rows only" on public.doctor_notes;
create policy "own rows only" on public.doctor_notes
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows only" on public.doctor_prep;
create policy "own rows only" on public.doctor_prep
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- usage: she may READ her own rows only. No insert/update/delete policy,
-- so only the server route (service role) can write. She can't fake or erase it.
drop policy if exists "read own usage" on public.usage;
create policy "read own usage" on public.usage
  for select to authenticated
  using (auth.uid() = user_id);

-- app_config: no policies at all, on purpose.

-- Extra lock on top of RLS: browsers can never touch app_config,
-- and can never write to usage.
revoke all on public.app_config from anon, authenticated;
revoke insert, update, delete on public.usage from anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. Signup cap (BUILD-SPEC 5.3), enforced by the database itself
-- ---------------------------------------------------------------------

-- Runs every time a new account is created.
-- Refuses the account if the cap is reached; otherwise creates her empty rows.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare cap int; current_count int;
begin
  select value into cap from app_config where key = 'max_signups';
  select count(*) into current_count from auth.users;   -- includes the new account
  if current_count > cap then
    raise exception 'signups_full';
  end if;
  insert into profiles (id) values (new.id);
  insert into doctor_prep (user_id) values (new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The Welcome page asks this before showing the sign-up form.
create or replace function public.signups_open()
returns boolean language sql security definer set search_path = public as $$
  select (select count(*) from auth.users) < (select value from app_config where key = 'max_signups');
$$;

grant execute on function public.signups_open() to anon, authenticated;


-- Done. You should see "Success. No rows returned".
