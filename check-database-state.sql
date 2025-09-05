-- ===== DATABASE STATE CHECK SCRIPT =====
-- Run this to check what's in your database and diagnose the campaign issue

-- Check if tables exist and have data
SELECT '=== TABLE COUNTS ===' as info;

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

-- Check if views exist
SELECT '=== AVAILABLE VIEWS ===' as info;
SELECT 
  schemaname || '.' || viewname as view_name
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname LIKE 'v_campaign%'
ORDER BY viewname;

-- Test the simple campaign view
SELECT '=== TESTING v_campaign_split ===' as info;
SELECT * FROM public.v_campaign_split LIMIT 5;

-- Test the complex campaign view
SELECT '=== TESTING v_campaign_performance_dated ===' as info;
SELECT * FROM public.v_campaign_performance_dated LIMIT 5;

-- Check if there are any campaigns at all
SELECT '=== ALL CAMPAIGNS ===' as info;
SELECT * FROM public.campaigns;

-- Check if there are any responses at all
SELECT '=== ALL RESPONSES ===' as info;
SELECT * FROM public.responses LIMIT 5;

-- Check if the issue is with the view joins
SELECT '=== TESTING VIEW JOINS ===' as info;
SELECT 
  c.campaign_name,
  c.id as campaign_id,
  count(r.*) as response_count
FROM public.campaigns c
LEFT JOIN public.responses r ON r.campaign_id = c.id
GROUP BY c.id, c.campaign_name
ORDER BY response_count DESC;
