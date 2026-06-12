-- ============================================================
-- NextEdge Leads Pipeline — run this in Supabase SQL Editor
-- ============================================================

create table if not exists public.leads (
  id              bigint primary key generated always as identity,
  name            text           not null,
  email           text,
  phone           text,
  age             integer,
  gender          text           default 'Male',
  location        text,
  source          text           not null default 'WhatsApp',
  course_interest text           not null,
  stage           text           not null default 'New Inquiry',
  assigned_to     text,
  next_follow_up  date,
  notes           text,
  lost_reason     text,
  converted_at    timestamptz,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

create table if not exists public.lead_activities (
  id          bigint primary key generated always as identity,
  lead_id     bigint      not null references public.leads(id) on delete cascade,
  type        text        not null default 'Note',
  title       text        not null,
  description text,
  created_by  text        default 'NextEdge Team',
  created_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.leads            enable row level security;
alter table public.lead_activities  enable row level security;

create policy "anon full access" on public.leads           for all using (true) with check (true);
create policy "anon full access" on public.lead_activities for all using (true) with check (true);
