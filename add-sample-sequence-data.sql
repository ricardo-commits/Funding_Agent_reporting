-- Add sample response_sequence data for testing
-- This script will populate the response_sequence column with sample data

-- First, let's see what responses we have
SELECT 
  id,
  response_label,
  received_at,
  ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY received_at) as sequence_num
FROM responses 
WHERE response_sequence IS NULL
LIMIT 10;

-- Update responses with sequence numbers based on lead_id and received_at
UPDATE responses 
SET response_sequence = subquery.sequence_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY lead_id ORDER BY received_at) as sequence_num
  FROM responses
  WHERE response_sequence IS NULL
) AS subquery
WHERE responses.id = subquery.id;

-- Verify the update
SELECT 
  response_sequence,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE response_label IN ('Interested', 'Referral')) as positive_count
FROM responses 
WHERE response_sequence IS NOT NULL
GROUP BY response_sequence
ORDER BY response_sequence;

-- Show some sample data
SELECT 
  lead_id,
  response_sequence,
  response_label,
  received_at
FROM responses 
WHERE response_sequence IS NOT NULL
ORDER BY lead_id, response_sequence
LIMIT 20;
