-- Run once in Supabase > SQL Editor for the JomGerak project.
-- Anonymous submissions are beta-only. Add CAPTCHA + rate limiting before public scale.
create table if not exists public.jg_reports (
 id bigint generated always as identity primary key,
 lat double precision not null check(lat between 0 and 8),
 lng double precision not null check(lng between 99 and 120),
 type text not null check(type in ('Kesesakan Trafik','Kemalangan','Jalan Rosak','Jalan Ditutup','Banjir','Halangan','Bahaya di Jalan')),
 note text not null default '' check(length(note)<=180),
 created_at timestamptz not null default now()
);
create index if not exists jg_reports_created_at_idx on public.jg_reports(created_at desc);
alter table public.jg_reports enable row level security;
grant usage on schema public to anon;
grant select,insert on public.jg_reports to anon;
grant usage,select on sequence public.jg_reports_id_seq to anon;
drop policy if exists jg_reports_public_read on public.jg_reports;
create policy jg_reports_public_read on public.jg_reports for select to anon using (created_at >= now() - interval '24 hours');
drop policy if exists jg_reports_public_insert on public.jg_reports;
create policy jg_reports_public_insert on public.jg_reports for insert to anon with check (
 lat between 0 and 8 and lng between 99 and 120 and length(note)<=180
 and type in ('Kesesakan Trafik','Kemalangan','Jalan Rosak','Jalan Ditutup','Banjir','Halangan','Bahaya di Jalan')
 and created_at between now() - interval '1 minute' and now() + interval '1 minute'
);
-- No UPDATE or DELETE policies: anonymous users cannot edit/delete reports.
