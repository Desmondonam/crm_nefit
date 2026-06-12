-- B2B Companies pipeline
-- Run this in Supabase SQL Editor

create table if not exists public.companies (
  id                bigint primary key generated always as identity,
  name              text not null,
  industry          text not null default 'Technology',
  size              text default '11-50',
  website           text,
  location          text,
  -- primary contact at the company
  contact_name      text,
  contact_role      text,
  contact_email     text,
  contact_phone     text,
  -- pipeline
  source            text not null default 'LinkedIn',
  stage             text not null default 'Identified',
  assigned_to       text,
  next_follow_up    date,
  notes             text,
  lost_reason       text,
  -- training details
  training_interest text,
  deal_value        numeric(12,2),
  -- tracking
  won_at            timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.company_activities (
  id          bigint primary key generated always as identity,
  company_id  bigint not null references public.companies(id) on delete cascade,
  type        text not null default 'Note',
  title       text not null,
  description text,
  created_by  text default 'NextEdge Team',
  created_at  timestamptz not null default now()
);

alter table public.companies           enable row level security;
alter table public.company_activities  enable row level security;

create policy "anon full access" on public.companies          for all using (true) with check (true);
create policy "anon full access" on public.company_activities for all using (true) with check (true);
