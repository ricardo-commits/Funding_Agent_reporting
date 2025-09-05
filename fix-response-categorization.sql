-- ===== FIX RESPONSE CATEGORIZATION SCRIPT =====
-- This script will help diagnose why positive/negative response counts are 0

-- First, let's see what's actually in the responses table
SELECT '=== RESPONSES TABLE STRUCTURE ===' as info;
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'responses'
ORDER BY ordinal_position;

-- Check what response labels actually exist
SELECT '=== EXISTING RESPONSE LABELS ===' as info;
SELECT 
  response_label,
  count(*) as count
FROM public.responses
GROUP BY response_label
ORDER BY count DESC;

-- Check if there are any responses at all
SELECT '=== TOTAL RESPONSES COUNT ===' as info;
SELECT count(*) as total_responses FROM public.responses;

-- Check campaign responses with actual data
SELECT '=== CAMPAIGN RESPONSES BREAKDOWN ===' as info;
SELECT 
  c.campaign_name,
  count(r.*) as total_responses,
  count(r.*) filter (where r.response_label = 'Interested') as interested,
  count(r.*) filter (where r.response_label = 'Referral') as referral,
  count(r.*) filter (where r.response_label = 'Do not contact') as do_not_contact,
  count(r.*) filter (where r.response_label = 'Not Interested') as not_interested,
  count(r.*) filter (where r.response_label = 'Out of office') as out_of_office,
  count(r.*) filter (where r.response_label = 'Wrong person') as wrong_person,
  count(r.*) filter (where r.response_label IS NULL) as uncategorized
FROM public.campaigns c
LEFT JOIN public.responses r ON r.campaign_id = c.id
GROUP BY c.id, c.campaign_name
ORDER BY total_responses DESC;

-- Check if the view is working correctly
SELECT '=== TESTING v_campaign_split VIEW ===' as info;
SELECT * FROM public.v_campaign_split LIMIT 5;

-- Check if the view is working correctly
SELECT '=== TESTING v_campaign_performance_dated VIEW ===' as info;
SELECT * FROM public.v_campaign_performance_dated LIMIT 5;

-- If the views aren't working, let's create a simple working view
SELECT '=== CREATING SIMPLE WORKING VIEW ===' as info;

-- Drop and recreate the simple view to ensure it works
DROP VIEW IF EXISTS public.v_campaign_split_simple;

CREATE OR REPLACE VIEW public.v_campaign_split_simple AS
SELECT
  c.campaign_name,
  count(r.*)::int as total_replies,
  count(r.*) filter (where r.response_label = 'Interested')::int as interested,
  count(r.*) filter (where r.response_label = 'Referral')::int as referral,
  count(r.*) filter (where r.response_label = 'Do not contact')::int as do_not_contact,
  count(r.*) filter (where r.response_label = 'Not Interested')::int as not_interested,
  count(r.*) filter (where r.response_label = 'Out of office')::int as out_of_office,
  count(r.*) filter (where r.response_label = 'Wrong person')::int as wrong_person
FROM public.campaigns c
LEFT JOIN public.responses r ON r.campaign_id = c.id
GROUP BY c.campaign_name
ORDER BY total_replies DESC;

-- Test the new view
SELECT '=== TESTING NEW SIMPLE VIEW ===' as info;
SELECT * FROM public.v_campaign_split_simple LIMIT 5;

-- If there are no responses, let's add some sample responses to test
SELECT '=== ADDING SAMPLE RESPONSES IF NONE EXIST ===' as info;

-- Insert sample responses for testing (only if none exist)
INSERT INTO public.responses (lead_id, campaign_id, response_label, response_text, channel, received_date_iso_clay)
SELECT 
  l.id,
  l.campaign_id,
  'Interested',
  'This looks interesting! I would like to learn more.',
  'email',
  '2025-01-15'
FROM public.leads l
WHERE l.campaign_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.responses WHERE lead_id = l.id)
LIMIT 1;

INSERT INTO public.responses (lead_id, campaign_id, response_label, response_text, channel, received_date_iso_clay)
SELECT 
  l.id,
  l.campaign_id,
  'Not Interested',
  'Thanks but not interested at this time.',
  'email',
  '2025-01-14'
FROM public.leads l
WHERE l.campaign_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.responses WHERE lead_id = l.id AND response_label = 'Not Interested')
LIMIT 1;

-- Final verification
SELECT '=== FINAL VERIFICATION ===' as info;
SELECT 
  'campaigns' as table_name, 
  count(*) as record_count 
FROM public.campaigns
UNION ALL
SELECT 
  'leads' as table_name, 
  count(*) as record_count 
FROM public.leads
UNION ALL
SELECT 
  'responses' as table_name, 
  count(*) as record_count 
FROM public.responses;

-- Test the views again
SELECT '=== FINAL VIEW TEST ===' as info;
SELECT * FROM public.v_campaign_split_simple LIMIT 5;
