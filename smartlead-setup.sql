-- Smartlead Campaigns Table Setup
-- This script creates the table structure for storing Smartlead campaign data

-- Create smartlead_campaigns table
CREATE TABLE IF NOT EXISTS public.smartlead_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  campaign_external_id TEXT,
  sent_count INTEGER,
  bounce_count INTEGER,
  total_count INTEGER,
  reply_count INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smartlead_campaigns_name ON public.smartlead_campaigns(campaign_name);
CREATE INDEX IF NOT EXISTS idx_smartlead_campaigns_active ON public.smartlead_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_smartlead_campaigns_external_id ON public.smartlead_campaigns(campaign_external_id);

-- Create a view for active campaigns with data
CREATE OR REPLACE VIEW public.v_smartlead_active_campaigns AS
SELECT 
  id,
  campaign_name,
  is_active,
  created_at,
  campaign_external_id,
  sent_count,
  bounce_count,
  total_count,
  reply_count,
  CASE 
    WHEN sent_count > 0 THEN ROUND((reply_count::DECIMAL / sent_count * 100), 2)
    ELSE 0 
  END as reply_rate,
  CASE 
    WHEN sent_count > 0 THEN ROUND((bounce_count::DECIMAL / sent_count * 100), 2)
    ELSE 0 
  END as bounce_rate
FROM public.smartlead_campaigns
WHERE is_active = true 
  AND sent_count IS NOT NULL 
  AND sent_count > 0;

-- Create a view for campaign metrics summary
CREATE OR REPLACE VIEW public.v_smartlead_metrics AS
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(*) FILTER (WHERE is_active = true AND sent_count > 0) as active_campaigns,
  COALESCE(SUM(sent_count), 0) as total_sent,
  COALESCE(SUM(bounce_count), 0) as total_bounces,
  COALESCE(SUM(reply_count), 0) as total_replies,
  CASE 
    WHEN SUM(sent_count) > 0 THEN ROUND((SUM(reply_count)::DECIMAL / SUM(sent_count) * 100), 2)
    ELSE 0 
  END as average_reply_rate,
  CASE 
    WHEN SUM(sent_count) > 0 THEN ROUND((SUM(bounce_count)::DECIMAL / SUM(sent_count) * 100), 2)
    ELSE 0 
  END as average_bounce_rate
FROM public.smartlead_campaigns
WHERE is_active = true;

-- Insert sample data from your CSV
INSERT INTO public.smartlead_campaigns (
  id, 
  campaign_name, 
  is_active, 
  created_at, 
  campaign_external_id, 
  sent_count, 
  bounce_count, 
  total_count, 
  reply_count
) VALUES 
  ('123b1be8-4fe9-488a-a532-de3844c07846', 'Funding Agent: IT Support', true, '2025-09-03 14:12:07.554931+00', '2259633', 7582, 44, 19903, 35),
  ('59779d04-9059-4f15-a7ee-924c46cce765', 'Funding Agent: Legal & Compliance', true, '2025-09-03 14:12:07.53566+00', '2260309', 5035, 47, 9525, 68),
  ('944f5bac-c108-45ff-93f7-5ff8a4c47a43', 'Funding Agent: Marketing & Advertising', true, '2025-09-03 14:12:07.526896+00', '2260257', 9813, 122, 41418, 75),
  ('9e1e1a9f-4a80-4227-87ad-5cee400cab82', 'Funding Agent: Accounting', true, '2025-09-03 14:12:10.295623+00', '2260306', 4413, 28, 8210, 23),
  ('db8af6ca-d1c5-4856-88fb-c85cc779375d', 'Funding Agent: Hospitality', true, '2025-09-03 14:12:07.534048+00', '2260358', 4114, 18, 7592, 38),
  ('e4cf370c-4cc8-4493-8248-6038ed1369ce', 'Funding Agent: Consulting', true, '2025-09-03 14:12:10.382792+00', '2259154', 8381, 85, 29823, 81),
  ('f1cd3f6a-1927-4973-9ea0-05b4ddc7abc5', 'Funding Agent: Always on Referral', true, '2025-09-03 14:13:30.396712+00', '2101004', 63, 4, 63, 3)
ON CONFLICT (id) DO UPDATE SET
  campaign_name = EXCLUDED.campaign_name,
  is_active = EXCLUDED.is_active,
  campaign_external_id = EXCLUDED.campaign_external_id,
  sent_count = EXCLUDED.sent_count,
  bounce_count = EXCLUDED.bounce_count,
  total_count = EXCLUDED.total_count,
  reply_count = EXCLUDED.reply_count,
  updated_at = now();

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT ON public.smartlead_campaigns TO authenticated;
GRANT SELECT ON public.v_smartlead_active_campaigns TO authenticated;
GRANT SELECT ON public.v_smartlead_metrics TO authenticated;
