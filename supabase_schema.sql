-- Run in Supabase SQL editor. Serverless function uses service role (never expose it in frontend).
create table if not exists public.jg_reports (
 id bigint generated always as identity primary key,
 lat double precision not null check(lat between 0 and 8),
 lng double precision not null check(lng between 99 and 120),
 type text not null,
 note text not null default '' check(length(note)<=180),
 created_at timestamptz not null default now()
);
create index if not exists jg_reports_created_at_idx on public.jg_reports(created_at desc);
alter table public.jg_reports enable row level security;
-- No anon policies: access via Vercel serverless function only.
