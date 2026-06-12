-- ============================================================
-- NextEdge Customer Portal — Supabase Schema + Seed Data
-- Run this entire file once in the Supabase SQL Editor
-- ============================================================

-- ── Tables ──────────────────────────────────────────────────

create table if not exists public.students (
  id              bigint primary key generated always as identity,
  name            text    not null,
  email           text    not null unique,
  phone           text,
  age             integer,
  gender          text    not null default 'Male',
  location        text,
  course          text    not null,
  enrollment_date date,
  status          text    not null default 'Active',
  progress        integer not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.expenses (
  id          bigint primary key generated always as identity,
  category    text           not null,
  description text           not null,
  amount      numeric(10,2)  not null,
  date        date           not null,
  recurring   boolean        not null default false,
  created_at  timestamptz    not null default now()
);

create table if not exists public.student_payments (
  id           bigint primary key generated always as identity,
  student_id   bigint         not null references public.students(id) on delete cascade,
  amount_paid  numeric(10,2)  not null default 0,
  payment_date date,
  method       text,
  status       text           not null default 'Unpaid',
  created_at   timestamptz    not null default now(),
  unique(student_id)
);

-- ── Row Level Security ───────────────────────────────────────
-- Team portal: anyone with the anon key can read and write.
-- Actual authentication is handled by the frontend login.

alter table public.students         enable row level security;
alter table public.expenses         enable row level security;
alter table public.student_payments enable row level security;

create policy "anon full access" on public.students         for all using (true) with check (true);
create policy "anon full access" on public.expenses         for all using (true) with check (true);
create policy "anon full access" on public.student_payments for all using (true) with check (true);

-- No seed data — tables start empty for real use.
-- To clear everything and start fresh at any time, run:
--
--   TRUNCATE public.student_payments RESTART IDENTITY CASCADE;
--   TRUNCATE public.students         RESTART IDENTITY CASCADE;
--   TRUNCATE public.expenses         RESTART IDENTITY CASCADE;
