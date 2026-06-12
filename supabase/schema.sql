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

-- ── Seed: Students ──────────────────────────────────────────

insert into public.students (name, email, phone, age, gender, location, course, enrollment_date, status, progress) values
  ('Alice Mwangi',    'alice.mwangi@gmail.com',    '+254 712 001 001', 22, 'Female', 'Nairobi',  'Web Development',    '2024-01-10', 'Active',    78),
  ('Brian Otieno',    'brian.otieno@gmail.com',    '+254 722 002 002', 25, 'Male',   'Mombasa',  'Data Science',       '2024-02-05', 'Active',    55),
  ('Carol Njeri',     'carol.njeri@gmail.com',     '+254 733 003 003', 19, 'Female', 'Kisumu',   'UI/UX Design',       '2024-01-20', 'Active',    90),
  ('David Kamau',     'david.kamau@gmail.com',     '+254 745 004 004', 30, 'Male',   'Nakuru',   'Cybersecurity',      '2024-03-01', 'Active',    42),
  ('Eva Adhiambo',    'eva.adhiambo@gmail.com',    '+254 756 005 005', 27, 'Female', 'Nairobi',  'Cloud Computing',    '2024-02-15', 'Inactive',  30),
  ('Francis Mutua',   'francis.mutua@gmail.com',   '+254 768 006 006', 23, 'Male',   'Eldoret',  'Mobile Development', '2024-01-25', 'Active',    65),
  ('Grace Wairimu',   'grace.wairimu@gmail.com',   '+254 779 007 007', 21, 'Female', 'Thika',    'Web Development',    '2024-03-10', 'Active',    50),
  ('Henry Odhiambo',  'henry.odhiambo@gmail.com',  '+254 700 008 008', 28, 'Male',   'Nairobi',  'Data Science',       '2023-11-05', 'Completed', 100),
  ('Irene Chebet',    'irene.chebet@gmail.com',    '+254 711 009 009', 24, 'Female', 'Kericho',  'UI/UX Design',       '2024-04-01', 'Active',    20),
  ('James Nganga',    'james.nganga@gmail.com',    '+254 723 010 010', 32, 'Male',   'Nairobi',  'Cybersecurity',      '2023-10-20', 'Completed', 100),
  ('Karen Wambui',    'karen.wambui@gmail.com',    '+254 734 011 011', 20, 'Female', 'Nairobi',  'Web Development',    '2024-04-15', 'Active',    15),
  ('Liam Kipchoge',   'liam.kipchoge@gmail.com',   '+254 746 012 012', 26, 'Male',   'Eldoret',  'Cloud Computing',    '2024-02-28', 'On Hold',   45),
  ('Mary Auma',       'mary.auma@gmail.com',       '+254 757 013 013', 23, 'Female', 'Kisumu',   'Mobile Development', '2024-03-20', 'Active',    60),
  ('Nelson Mwenda',   'nelson.mwenda@gmail.com',   '+254 769 014 014', 29, 'Male',   'Meru',     'Data Science',       '2024-01-08', 'Active',    80),
  ('Olivia Nduta',    'olivia.nduta@gmail.com',    '+254 701 015 015', 22, 'Female', 'Nairobi',  'UI/UX Design',       '2024-05-01', 'Active',    10),
  ('Patrick Ochieng', 'patrick.ochieng@gmail.com', '+254 712 016 016', 35, 'Male',   'Homa Bay', 'Cybersecurity',      '2023-12-10', 'Completed', 100),
  ('Quinn Muriuki',   'quinn.muriuki@gmail.com',   '+254 724 017 017', 24, 'Male',   'Nairobi',  'Cloud Computing',    '2024-04-10', 'Active',    35),
  ('Rose Nyambura',   'rose.nyambura@gmail.com',   '+254 735 018 018', 20, 'Female', 'Nyeri',    'Web Development',    '2024-05-15', 'Inactive',  5),
  ('Samuel Waweru',   'samuel.waweru@gmail.com',   '+254 747 019 019', 27, 'Male',   'Nairobi',  'Mobile Development', '2024-02-01', 'Active',    72),
  ('Tina Moraa',      'tina.moraa@gmail.com',      '+254 758 020 020', 21, 'Female', 'Kisii',    'Data Science',       '2024-03-05', 'On Hold',   25),
  ('Victor Kariuki',  'victor.kariuki@gmail.com',  '+254 770 021 021', 31, 'Male',   'Nairobi',  'Web Development',    '2023-09-15', 'Completed', 100),
  ('Winnie Akinyi',   'winnie.akinyi@gmail.com',   '+254 702 022 022', 23, 'Female', 'Nairobi',  'UI/UX Design',       '2024-04-20', 'Active',    48),
  ('Xavier Njau',     'xavier.njau@gmail.com',     '+254 713 023 023', 26, 'Male',   'Machakos', 'Cybersecurity',      '2024-05-10', 'Active',    22),
  ('Yvonne Kerubo',   'yvonne.kerubo@gmail.com',   '+254 725 024 024', 19, 'Female', 'Nairobi',  'Cloud Computing',    '2024-05-20', 'Active',    12);

-- ── Seed: Student Payments (one row per student) ─────────────

insert into public.student_payments (student_id, amount_paid, payment_date, method, status)
select s.id,
       p.amount_paid,
       p.payment_date::date,
       p.method,
       p.status
from public.students s
join (values
  ('alice.mwangi@gmail.com',    4500, '2024-01-15', 'Bank Transfer', 'Paid'),
  ('brian.otieno@gmail.com',    2750, '2024-02-20', 'Cash',          'Partial'),
  ('carol.njeri@gmail.com',     4000, '2024-01-22', 'Bank Transfer', 'Paid'),
  ('david.kamau@gmail.com',     2500, '2024-03-10', 'Cash',          'Partial'),
  ('eva.adhiambo@gmail.com',       0,  null,          null,           'Unpaid'),
  ('francis.mutua@gmail.com',   5000, '2024-01-30', 'Bank Transfer', 'Paid'),
  ('grace.wairimu@gmail.com',   2250, '2024-03-15', 'Cash',          'Partial'),
  ('henry.odhiambo@gmail.com',  5500, '2023-11-10', 'Bank Transfer', 'Paid'),
  ('irene.chebet@gmail.com',       0,  null,          null,           'Unpaid'),
  ('james.nganga@gmail.com',    5000, '2023-10-25', 'Bank Transfer', 'Paid'),
  ('karen.wambui@gmail.com',       0,  null,          null,           'Unpaid'),
  ('liam.kipchoge@gmail.com',   3000, '2024-03-05', 'Cash',          'Partial'),
  ('mary.auma@gmail.com',       5000, '2024-03-25', 'Bank Transfer', 'Paid'),
  ('nelson.mwenda@gmail.com',   5500, '2024-01-12', 'Bank Transfer', 'Paid'),
  ('olivia.nduta@gmail.com',       0,  null,          null,           'Unpaid'),
  ('patrick.ochieng@gmail.com', 5000, '2023-12-15', 'Bank Transfer', 'Paid'),
  ('quinn.muriuki@gmail.com',   3000, '2024-04-15', 'Cash',          'Partial'),
  ('rose.nyambura@gmail.com',      0,  null,          null,           'Unpaid'),
  ('samuel.waweru@gmail.com',   5000, '2024-02-05', 'Bank Transfer', 'Paid'),
  ('tina.moraa@gmail.com',      2750, '2024-03-10', 'Cash',          'Partial'),
  ('victor.kariuki@gmail.com',  4500, '2023-09-20', 'Bank Transfer', 'Paid'),
  ('winnie.akinyi@gmail.com',   4000, '2024-04-25', 'Bank Transfer', 'Paid'),
  ('xavier.njau@gmail.com',     2500, '2024-05-15', 'Cash',          'Partial'),
  ('yvonne.kerubo@gmail.com',      0,  null,          null,           'Unpaid')
) as p(email, amount_paid, payment_date, method, status)
on s.email = p.email;

-- ── Seed: Expenses ───────────────────────────────────────────

insert into public.expenses (category, description, amount, date, recurring) values
  ('Salaries',      'Lead Instructor — Sarah Kamau',    10000, '2024-05-01', true),
  ('Salaries',      'Instructor — James Omondi',         9000, '2024-05-01', true),
  ('Salaries',      'Admin Assistant',                   6000, '2024-05-01', true),
  ('Rent',          'Office Space — Al Waab, Doha',     15000, '2024-05-01', true),
  ('Utilities',     'Electricity & Water — May 2024',    1800, '2024-05-05', true),
  ('Software',      'Adobe Creative Cloud',               450, '2024-05-01', true),
  ('Software',      'GitHub Teams',                       280, '2024-05-01', true),
  ('Marketing',     'Social Media Ads — May 2024',       2500, '2024-05-10', false),
  ('Equipment',     'Replacement Keyboard & Mouse (x3)', 650, '2024-05-08', false),
  ('Salaries',      'Lead Instructor — Sarah Kamau',    10000, '2024-04-01', true),
  ('Salaries',      'Instructor — James Omondi',         9000, '2024-04-01', true),
  ('Salaries',      'Admin Assistant',                   6000, '2024-04-01', true),
  ('Rent',          'Office Space — Al Waab, Doha',     15000, '2024-04-01', true),
  ('Utilities',     'Electricity & Water — Apr 2024',    1650, '2024-04-05', true),
  ('Software',      'Zoom Business Plan',                 620, '2024-04-01', true),
  ('Marketing',     'Flyer Printing & Distribution',     1200, '2024-04-15', false),
  ('Miscellaneous', 'Office Supplies — Apr 2024',         380, '2024-04-20', false),
  ('Salaries',      'Lead Instructor — Sarah Kamau',    10000, '2024-03-01', true),
  ('Salaries',      'Instructor — James Omondi',         9000, '2024-03-01', true),
  ('Salaries',      'Admin Assistant',                   6000, '2024-03-01', true),
  ('Rent',          'Office Space — Al Waab, Doha',     15000, '2024-03-01', true),
  ('Utilities',     'Electricity & Water — Mar 2024',    1700, '2024-03-05', true),
  ('Equipment',     'Projector for Training Room',       3200, '2024-03-18', false),
  ('Marketing',     'Google Ads Campaign — Mar 2024',    2000, '2024-03-12', false);
