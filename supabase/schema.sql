-- Open Research content store. Run once in the Supabase SQL Editor.
-- Reports = Global Research. Insights = Market Insights. Content is open by
-- design, so reads are public; writes go only through the service role.

create table if not exists public.reports (
  slug        text primary key,
  category    text not null,
  title       text not null,
  summary     text not null,
  key_points  text[] not null default '{}',
  body        text[] not null default '{}',
  sources     jsonb  not null default '[]',
  source      text not null,
  date        text not null,
  live        text,
  position    int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.insights (
  slug        text primary key,
  category    text not null,
  title       text not null,
  summary     text not null,
  key_points  text[] not null default '{}',
  body        text[] not null default '{}',
  sources     jsonb  not null default '[]',
  source      text not null,
  date        text not null,
  position    int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.reports  enable row level security;
alter table public.insights enable row level security;

-- Public read only. Inserts and updates require the service role (which bypasses RLS).
drop policy if exists "reports_public_read" on public.reports;
create policy "reports_public_read" on public.reports for select using (true);

drop policy if exists "insights_public_read" on public.insights;
create policy "insights_public_read" on public.insights for select using (true);

create index if not exists reports_category_idx  on public.reports (category);
create index if not exists insights_category_idx on public.insights (category);

-- Expose the tables to the REST data API: grant read to the public roles and
-- reload the API schema cache (a new table is otherwise a 404 until this runs).
grant usage on schema public to anon, authenticated;
grant select on public.reports  to anon, authenticated;
grant select on public.insights to anon, authenticated;
notify pgrst, 'reload schema';
