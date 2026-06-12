-- ============================================================
-- NextEdge Courses Table — run this in Supabase SQL Editor
-- ============================================================

create table if not exists public.courses (
  id          bigint primary key generated always as identity,
  name        text          not null unique,
  color       text          not null default '#6366f1',
  icon        text          not null default '💻',
  duration    text          not null default '3 months',
  instructor  text,
  fee         numeric(10,2) not null default 0,
  active      boolean       not null default true,
  created_at  timestamptz   not null default now()
);

alter table public.courses enable row level security;
create policy "anon full access" on public.courses for all using (true) with check (true);

-- Seed the 6 existing courses (matching current app data exactly)
insert into public.courses (name, color, icon, duration, instructor, fee) values
  ('Web Development',    '#6366f1', '💻', '6 months', 'Sarah Kamau',   4500),
  ('Data Science',       '#0ea5e9', '📊', '8 months', 'James Omondi',  5500),
  ('Cybersecurity',      '#ef4444', '🔐', '5 months', 'Paul Mutua',    5000),
  ('Cloud Computing',    '#f59e0b', '☁️', '6 months', 'Grace Wanjiku', 6000),
  ('UI/UX Design',       '#10b981', '🎨', '4 months', 'Linda Achieng', 4000),
  ('Mobile Development', '#8b5cf6', '📱', '7 months', 'Kevin Njoroge', 5000);
