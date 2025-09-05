-- ===== ADD SAMPLE DATA SCRIPT =====
-- Run this if your database is empty to add sample campaigns and responses

-- Insert sample campaigns if none exist
INSERT INTO public.campaigns (campaign_name, sector, is_active)
SELECT 'Q4 Email Outreach', 'Technology', true
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns WHERE campaign_name = 'Q4 Email Outreach');

INSERT INTO public.campaigns (campaign_name, sector, is_active)
SELECT 'LinkedIn Connection Campaign', 'Professional Services', true
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns WHERE campaign_name = 'LinkedIn Connection Campaign');

INSERT INTO public.campaigns (campaign_name, sector, is_active)
SELECT 'Cold Email Sequence', 'SaaS', true
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns WHERE campaign_name = 'Cold Email Sequence');

INSERT INTO public.campaigns (campaign_name, sector, is_active)
SELECT 'Funding Agent Outreach', 'Financial Services', true
WHERE NOT EXISTS (SELECT 1 FROM public.campaigns WHERE campaign_name = 'Funding Agent Outreach');

-- Insert sample leads if none exist
INSERT INTO public.leads (full_name, email, company_name, campaign_id, first_touch_channel)
SELECT 
  'John Smith',
  'john.smith@techcorp.com',
  'TechCorp Inc',
  c.id,
  'email'
FROM public.campaigns c
WHERE c.campaign_name = 'Q4 Email Outreach'
  AND NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'john.smith@techcorp.com');

INSERT INTO public.leads (full_name, email, company_name, campaign_id, first_touch_channel)
SELECT 
  'Sarah Johnson',
  'sarah.j@startupfund.com',
  'StartupFund Ventures',
  c.id,
  'email'
FROM public.campaigns c
WHERE c.campaign_name = 'Funding Agent Outreach'
  AND NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'sarah.j@startupfund.com');

INSERT INTO public.leads (full_name, email, company_name, campaign_id, first_touch_channel)
SELECT 
  'Mike Chen',
  'mike.chen@saaspro.com',
  'SaaSPro Solutions',
  c.id,
  'email'
FROM public.campaigns c
WHERE c.campaign_name = 'Cold Email Sequence'
  AND NOT EXISTS (SELECT 1 FROM public.leads WHERE email = 'mike.chen@saaspro.com');

-- Insert sample responses if none exist
INSERT INTO public.responses (lead_id, campaign_id, response_label, response_text, channel, received_date_iso_clay)
SELECT 
  l.id,
  l.campaign_id,
  'Interested',
  'This looks interesting! I would like to learn more about your funding services.',
  'email',
  '2025-01-15'
FROM public.leads l
WHERE l.email = 'sarah.j@startupfund.com'
  AND NOT EXISTS (SELECT 1 FROM public.responses WHERE lead_id = l.id);

INSERT INTO public.responses (lead_id, campaign_id, response_label, response_text, channel, received_date_iso_clay)
SELECT 
  l.id,
  l.campaign_id,
  'Not Interested',
  'Thanks but we are not looking for funding at this time.',
  'email',
  '2025-01-14'
FROM public.leads l
WHERE l.email = 'john.smith@techcorp.com'
  AND NOT EXISTS (SELECT 1 FROM public.responses WHERE lead_id = l.id);

INSERT INTO public.responses (lead_id, campaign_id, response_label, response_text, channel, received_date_iso_clay)
SELECT 
  l.id,
  l.campaign_id,
  'Referral',
  'I am not interested, but I know someone who might be. Let me connect you.',
  'email',
  '2025-01-13'
FROM public.leads l
WHERE l.email = 'mike.chen@saaspro.com'
  AND NOT EXISTS (SELECT 1 FROM public.responses WHERE lead_id = l.id);

-- Verify the data was added
SELECT '=== VERIFICATION ===' as info;
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

-- Test the views now
SELECT '=== TESTING VIEWS AFTER DATA ADDITION ===' as info;
SELECT * FROM public.v_campaign_split LIMIT 5;
