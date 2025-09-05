-- Campaign Date Filtering Setup
-- This script adds received date ISO clay filtering capabilities to campaigns

-- ===== 1) Add received_date_iso_clay to campaigns table =====
-- This allows filtering campaigns by when they received responses

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'campaigns' and column_name = 'received_date_iso_clay') then
    alter table public.campaigns add column received_date_iso_clay text;
  end if;
end$$;

-- ===== 2) Create a new view for campaign filtering by received date =====
-- This view joins campaigns with responses to get the latest received date for filtering

create or replace view public.v_campaigns_with_dates as
select
  c.id,
  c.campaign_name,
  c.sector,
  c.is_active,
  c.created_at,
  c.received_date_iso_clay,
  -- Get the latest received date from responses for this campaign
  max(r.received_date_iso_clay) as latest_response_date,
  -- Get the earliest received date from responses for this campaign
  min(r.received_date_iso_clay) as earliest_response_date,
  -- Count total responses for this campaign
  count(r.*)::int as total_responses,
  -- Count responses in the last 7 days
  count(r.*) filter (where r.received_date_iso_clay >= (current_date - interval '7 days')::text)::int as responses_last_7_days,
  -- Count responses in the last 30 days
  count(r.*) filter (where r.received_date_iso_clay >= (current_date - interval '30 days')::text)::int as responses_last_30_days
from public.campaigns c
left join public.responses r on r.campaign_id = c.id
group by c.id, c.campaign_name, c.sector, c.is_active, c.created_at, c.received_date_iso_clay
order by c.campaign_name;

-- ===== 3) Create a view for campaign performance with date filtering =====
-- This view allows filtering campaigns by response dates

create or replace view public.v_campaign_performance_dated as
select
  c.campaign_name,
  c.sector,
  c.is_active,
  c.latest_response_date,
  c.earliest_response_date,
  c.total_responses,
  c.responses_last_7_days,
  c.responses_last_30_days,
  -- Response breakdown by label
  count(r.*) filter (where r.response_label = 'Interested')::int as interested,
  count(r.*) filter (where r.response_label = 'Referral')::int as referral,
  count(r.*) filter (where r.response_label = 'Do not contact')::int as do_not_contact,
  count(r.*) filter (where r.response_label = 'Not Interested')::int as not_interested,
  count(r.*) filter (where r.response_label = 'Out of office')::int as out_of_office,
  count(r.*) filter (where r.response_label = 'Wrong person')::int as wrong_person,
  -- Calculate positive response rate
  round(
    100.0 * count(r.*) filter (where r.response_label in ('Interested', 'Referral', 'Meeting Request', 'Information Requested')) / 
    nullif(count(r.*), 0), 2
  ) as positive_response_rate
from public.v_campaigns_with_dates c
left join public.responses r on r.campaign_id = c.id
group by 
  c.campaign_name, c.sector, c.is_active, c.latest_response_date, 
  c.earliest_response_date, c.total_responses, c.responses_last_7_days, c.responses_last_30_days
order by c.total_responses desc;

-- ===== 4) Create indexes for better performance =====
-- Index on the received_date_iso_clay column for faster filtering

create index if not exists idx_responses_received_date_iso_clay on public.responses(received_date_iso_clay);
create index if not exists idx_campaigns_received_date_iso_clay on public.campaigns(received_date_iso_clay);

-- ===== 5) Update function to help with date filtering =====
-- Function to convert ISO date string to proper date for comparison

create or replace function public.iso_date_in_range(
  iso_date text,
  start_date text,
  end_date text
)
returns boolean
language plpgsql
as $$
begin
  -- Convert ISO date strings to dates for comparison
  return iso_date::date >= start_date::date and iso_date::date <= end_date::date;
end;
$$;

-- ===== 6) Verification queries =====

-- Check if the new view was created
select 'New views created successfully!' as status;

-- Show the structure of the new view
select 
  column_name, 
  data_type,
  is_nullable
from information_schema.columns 
where table_name = 'v_campaigns_with_dates'
order by ordinal_position;

-- Test the new view with sample data
select 
  campaign_name,
  latest_response_date,
  total_responses,
  responses_last_7_days
from public.v_campaigns_with_dates
limit 5;

-- Show available views for campaigns
select 
  schemaname || '.' || viewname as view_name
from pg_views 
where schemaname = 'public' 
  and viewname like 'v_campaign%'
order by viewname;
