-- DBIT AFPG — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists generations (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  page text,
  type text,
  student_name text,
  usn text,
  subject text,
  subject_code text,
  topic text,
  semester text,
  section text,
  branch text
);

-- Enable Row Level Security
alter table generations enable row level security;

-- Anyone (anon) can insert — used by the client-side analytics logger
create policy "anon_insert" on generations for insert with check (true);

-- Only authenticated users can read — secures the admin panel
create policy "auth_select" on generations for select using (auth.role() = 'authenticated');
