-- 003: more choices in the intake and the daily check-in (7 Oct, user request)
-- - "What's been bothering you most lately?": up to 5 instead of 3
-- - typed answers for "Something else" / "Other" (symptoms, diet, life at home, today's check-in)
-- Safe to run more than once.

-- Up to 5 symptoms
alter table public.profiles drop constraint if exists profiles_top_symptoms_check;
alter table public.profiles
  add constraint profiles_top_symptoms_check check (cardinality(top_symptoms) <= 5);

-- Her own words when she picks "Something else" / "Other"
alter table public.profiles
  add column if not exists symptoms_other text check (char_length(symptoms_other) <= 100);
alter table public.profiles
  add column if not exists diet_other text check (char_length(diet_other) <= 60);
alter table public.profiles
  add column if not exists life_context_other text check (char_length(life_context_other) <= 100);
alter table public.check_ins
  add column if not exists bothering_other text check (char_length(bothering_other) <= 100);

-- Row Level Security already covers these columns (same tables, same "own rows only" policies).
