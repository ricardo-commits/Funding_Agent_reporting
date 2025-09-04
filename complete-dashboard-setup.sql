-- ===== COMPLETE DASHBOARD DATABASE SETUP SCRIPT =====
-- This script sets up everything needed for your dashboard reporting system
-- It can be run multiple times safely and handles both fresh installs and updates

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
      'Referral',
      'Do not contact',
      'Not Interested',
      'Out of office',
      'Wrong person'
    );
  end if;
  
  if not exists (select 1 from pg_type where typname = 'smartlead_status_enum') then
    create type smartlead_status_enum as enum (
      'ACTIVE',
      'COMPLETED',
      'PAUSED',
      'DRAFT',
      'ARCHIVED'
    );
  end if;
end$$;

-- ===== 3) Tables =====

-- Campaigns table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null unique,
  sector text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Add missing columns if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'campaigns' and column_name = 'sector') then
    alter table public.campaigns add column sector text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'campaigns' and column_name = 'is_active') then
    alter table public.campaigns add column is_active boolean not null default true;
  end if;
end$$;

-- Leads table
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

-- Add missing columns if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'external_ref') then
    alter table public.leads add column external_ref text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'linkedin_url') then
    alter table public.leads add column linkedin_url text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'company_domain') then
    alter table public.leads add column company_domain text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'first_touch_channel') then
    alter table public.leads add column first_touch_channel channel_enum;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'outreach_copy') then
    alter table public.leads add column outreach_copy text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'updated_at') then
    alter table public.leads add column updated_at timestamptz not null default now();
  end if;
end$$;

-- Responses table
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  channel channel_enum not null,
  response_label response_label_enum,
  response_text text,
  received_at timestamptz not null,  -- Remove default now() to accept Clay dates
  
  -- Clay-specific fields for data mapping
  clay_external_id text,              -- Clay's unique identifier
  platform text,                      -- Platform (e.g., 'Smartlead')
  weekday text,                       -- Day name (e.g., 'Tuesday', 'Friday')
  time_of_day text,                   -- Time in AM/PM format (e.g., '3 AM', '12 PM')
  weekday_idx int,                    -- Numeric weekday (1-7)
  time_of_day_iso time,               -- Time in 24-hour format (e.g., '03:00:00')
  received_date_clay text,            -- Date from Clay (e.g., '07-07-2025')
  received_date_iso_clay text,        -- ISO date from Clay (e.g., '2025-07-07')

  -- immutable generated columns (pin timezone to UTC)
  received_date date
    generated always as ( (received_at at time zone 'UTC')::date ) stored,
  received_weekday int
    generated always as ( extract(isodow from (received_at at time zone 'UTC')) ) stored
);

-- Add missing columns if they don't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'response_text') then
    alter table public.responses add column response_text text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'received_at') then
    alter table public.responses add column received_at timestamptz not null;
  end if;
  
  -- Add Clay-specific columns if they don't exist
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'clay_external_id') then
    alter table public.responses add column clay_external_id text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'platform') then
    alter table public.responses add column platform text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'weekday') then
    alter table public.responses add column weekday text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'time_of_day') then
    alter table public.responses add column time_of_day text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'weekday_idx') then
    alter table public.responses add column weekday_idx int;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'time_of_day_iso') then
    alter table public.responses add column time_of_day_iso time;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'received_date_clay') then
    alter table public.responses add column received_date_clay text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'received_date_iso_clay') then
    alter table public.responses add column received_date_iso_clay text;
  end if;
end$$;

-- ===== 4) Data Migration & Updates =====

-- Update existing data to use proper timestamps
do $$
begin
  -- If responses table has created_at but no received_at, use created_at
  if exists (select 1 from information_schema.columns where table_name = 'responses' and column_name = 'created_at') then
    update public.responses 
    set received_at = created_at 
    where received_at is null;
  end if;
  
  -- Set default first_touch_channel for existing leads
  update public.leads 
  set first_touch_channel = 'email'::channel_enum 
  where first_touch_channel is null;
  
  -- Set default channel for existing responses if missing
  update public.responses 
  set channel = 'email'::channel_enum 
  where channel is null;
  
  -- Set default platform for existing responses if missing
  update public.responses 
  set platform = 'Smartlead' 
  where platform is null;
end$$;

-- ===== 5) Triggers (after tables exist) =====
drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row
execute function public.tg_update_timestamp();

-- ===== 6) Indexes =====
create index if not exists idx_responses_received_at on public.responses(received_at desc);
create index if not exists idx_responses_campaign on public.responses(campaign_id);
create index if not exists idx_responses_label on public.responses(response_label);
create index if not exists idx_responses_lead on public.responses(lead_id);
create index if not exists idx_leads_campaign on public.leads(campaign_id);
create index if not exists idx_leads_company on public.leads(company_name);
create index if not exists idx_leads_email on public.leads(email);
create index if not exists idx_campaigns_name on public.campaigns(campaign_name);

-- ===== 7) Views for dashboards =====

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
  count(*) filter (where response_label in ('Interested','Referral'))::int as positive_count,
  count(*)::int as total_count,
  round(
    100.0 * count(*) filter (where response_label in ('Interested','Referral'))
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
  count(r.*) filter (where r.response_label = 'Referral')::int as referral,
  count(r.*) filter (where r.response_label = 'Do not contact')::int as do_not_contact,
  count(r.*) filter (where r.response_label = 'Not Interested')::int as not_interested,
  count(r.*) filter (where r.response_label = 'Out of office')::int as out_of_office,
  count(r.*) filter (where r.response_label = 'Wrong person')::int as wrong_person
from public.campaigns c
left join public.responses r on r.campaign_id = c.id
group by c.campaign_name
order by total_replies desc;

-- Lead summary by campaign
create or replace view public.v_lead_summary as
select
  c.campaign_name,
  count(l.*)::int as total_leads,
  count(l.*) filter (where l.first_touch_channel = 'email')::int as email_leads,
  count(l.*) filter (where l.first_touch_channel = 'linkedin')::int as linkedin_leads
from public.campaigns c
left join public.leads l on l.campaign_id = c.id
group by c.campaign_name
order by total_leads desc;

-- Response rate by campaign
create or replace view public.v_response_rate as
select
  c.campaign_name,
  count(l.*)::int as total_leads,
  count(r.*)::int as total_responses,
  round(
    100.0 * count(r.*) / nullif(count(l.*), 0), 2
  ) as response_rate_pct
from public.campaigns c
left join public.leads l on l.campaign_id = c.id
left join public.responses r on r.lead_id = l.id
group by c.campaign_name
order by response_rate_pct desc;

-- ===== 8) Sample Data (Optional) =====

-- Insert sample campaigns if none exist
insert into public.campaigns (campaign_name, sector, is_active)
select 'Q4 Email Outreach', 'Technology', true
where not exists (select 1 from public.campaigns where campaign_name = 'Q4 Email Outreach');

insert into public.campaigns (campaign_name, sector, is_active)
select 'LinkedIn Connection Campaign', 'Professional Services', true
where not exists (select 1 from public.campaigns where campaign_name = 'LinkedIn Connection Campaign');

insert into public.campaigns (campaign_name, sector, is_active)
select 'Cold Email Sequence', 'SaaS', true
where not exists (select 1 from public.campaigns where campaign_name = 'Cold Email Sequence');

-- ===== 8.1) Clay Data Import Helper Function =====
-- Function to help convert Clay date/time data to proper timestamps
create or replace function public.clay_to_timestamp(
  clay_date text,           -- e.g., '07-07-2025'
  clay_time text            -- e.g., '3 AM' or '15:00:00'
)
returns timestamptz
language plpgsql
as $$
declare
  parsed_date date;
  parsed_time time;
  final_timestamp timestamptz;
begin
  -- Parse Clay date (MM-DD-YYYY format)
  if clay_date ~ '^\d{2}-\d{2}-\d{4}$' then
    parsed_date := to_date(clay_date, 'MM-DD-YYYY');
  else
    parsed_date := null;
  end if;
  
  -- Parse Clay time (handle both AM/PM and 24-hour formats)
  if clay_time ~ '^\d{1,2}:\d{2}:\d{2}$' then
    -- Already in 24-hour format
    parsed_time := clay_time::time;
  elsif clay_time ~ '^\d{1,2}\s*(AM|PM)$' then
    -- Convert AM/PM to 24-hour
    parsed_time := to_timestamp(clay_time, 'HH12 AM')::time;
  else
    parsed_time := null;
  end if;
  
  -- Combine date and time
  if parsed_date is not null and parsed_time is not null then
    final_timestamp := (parsed_date + parsed_time) at time zone 'UTC';
  else
    final_timestamp := null;
  end if;
  
  return final_timestamp;
end;
$$;

-- ===== 9) RLS Setup (Optional - Uncomment if needed) =====
-- alter table public.campaigns enable row level security;
-- alter table public.leads enable row level security;
-- alter table public.responses enable row level security;

-- ===== 10) Verification Queries =====

-- Check what was created
select 'Database setup complete!' as status;

-- Show table counts
select 
  'campaigns' as table_name, 
  count(*) as record_count 
from public.campaigns
union all
select 
  'leads' as table_name, 
  count(*) as record_count 
from public.leads
union all
select 
  'responses' as table_name, 
  count(*) as record_count 
from public.responses;

-- Show available views
select 
  'Available views:' as info;
select 
  schemaname || '.' || viewname as view_name
from pg_views 
where schemaname = 'public' 
  and viewname like 'v_%'
order by viewname;

-- Test a view
select 'Testing v_channel_totals view:' as info;
select * from public.v_channel_totals;

-- ===== 11) Clay Data Import Example =====
-- Example of how to insert Clay data with proper timestamp conversion
/*
-- Example INSERT statement for Clay data:
INSERT INTO public.responses (
  lead_id,
  campaign_id,
  channel,
  response_label,
  response_text,
  received_at,
  clay_external_id,
  platform,
  weekday,
  time_of_day,
  weekday_idx,
  time_of_day_iso,
  received_date_clay,
  received_date_iso_clay
) VALUES (
  'your-lead-uuid-here',
  'your-campaign-uuid-here',
  'email',
  'Interested',
  'Hello Thank you for getting',
  public.clay_to_timestamp('07-07-2025', '3 AM'),
  'clay-unique-id-123',
  'Smartlead',
  'Tuesday',
  '3 AM',
  2,
  '03:00:00',
  '07-07-2025',
  '2025-07-07'
);

-- Or use the function directly in queries:
SELECT public.clay_to_timestamp('07-07-2025', '3 AM') as converted_timestamp;
*/
