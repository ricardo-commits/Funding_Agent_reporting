-- ===== 0) Extensions =====
create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- ===== 1) Helper functions FIRST =====
create or replace function public.tg_update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ===== 2) Enums =====
do $$
begin
  if not exists (select 1 from pg_type where typname = 'channel_enum') then
    create type channel_enum as enum ('email', 'linkedin');
  end if;

  if not exists (select 1 from pg_type where typname = 'response_label_enum') then
    create type response_label_enum as enum (
      'Interested',
      'Information Requested',
      'Meeting Request',
      'Not Interested',
      'Out of office',
      'Wrong person',
      'Referral',
      'Unsubscribe',
      'Do not contact',
      'Other'
    );
  end if;
end$$;

-- ===== 3) Tables =====
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null unique,
  sector text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  external_ref text,                         -- Clay/Airtable id if you have one
  full_name text,
  email text,
  linkedin_url text,
  company_name text,
  company_domain text,
  campaign_id uuid references public.campaigns(id) on delete set null,
  first_touch_channel channel_enum,
  outreach_copy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  channel channel_enum not null,
  response_label response_label_enum,
  response_text text,
  received_at timestamptz not null default now(),

  -- immutable generated columns (pin timezone to UTC)
  received_date date
    generated always as ( (received_at at time zone 'UTC')::date ) stored,
  received_weekday int
    generated always as ( extract(isodow from (received_at at time zone 'UTC')) ) stored
);

-- ===== 4) Triggers (after tables exist) =====
drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row
execute function public.tg_update_timestamp();

-- ===== 5) Indexes =====
create index if not exists idx_responses_received_at on public.responses(received_at desc);
create index if not exists idx_responses_campaign on public.responses(campaign_id);
create index if not exists idx_responses_label on public.responses(response_label);
create index if not exists idx_leads_campaign on public.leads(campaign_id);
create index if not exists idx_leads_company on public.leads(company_name);

-- ===== 6) Views for dashboards =====

-- Channel totals
create or replace view public.v_channel_totals as
select
  channel,
  count(*)::int as total_responses
from public.responses
group by channel;

-- Positive percentage by channel
create or replace view public.v_channel_positive as
select
  channel,
  count(*) filter (where response_label in ('Interested','Meeting Request','Information Requested'))::int as positive_count,
  count(*)::int as total_count,
  round(
    100.0 * count(*) filter (where response_label in ('Interested','Meeting Request','Information Requested'))
    / nullif(count(*), 0), 2
  ) as positive_pct
from public.responses
group by channel;

-- Responses by weekday
create or replace view public.v_responses_by_weekday as
select
  channel,
  received_weekday,
  count(*)::int as n_leads
from public.responses
group by channel, received_weekday
order by channel, received_weekday;

-- Calendar counts per day
create or replace view public.v_daily_counts as
select
  received_date,
  channel,
  count(*)::int as n
from public.responses
group by received_date, channel
order by received_date;

-- Campaign split
create or replace view public.v_campaign_split as
select
  c.campaign_name,
  count(r.*)::int as total_replies,
  count(r.*) filter (where r.response_label = 'Interested')::int as interested,
  count(r.*) filter (where r.response_label = 'Information Requested')::int as info_requested
from public.campaigns c
left join public.responses r on r.campaign_id = c.id
group by c.campaign_name
order by total_replies desc;

-- ===== 7) Optional: RLS scaffolding (commented) =====
-- alter table public.campaigns enable row level security;
-- alter table public.leads enable row level security;
-- alter table public.responses enable row level security;
-- create policy "anon read campaigns" on public.campaigns for select to anon using (true);
-- create policy "anon read leads" on public.leads for select to anon using (true);
-- create policy "anon read responses" on public.responses for select to anon using (true);
