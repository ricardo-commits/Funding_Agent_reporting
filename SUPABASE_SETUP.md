# Supabase Integration Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### How to get these values:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key

## 2. Database Schema

Your Supabase database should have the following tables and views:

### Tables:
- `leads` - Lead information
- `responses` - Lead responses
- `campaigns` - Campaign data

### Views (for dashboard analytics):
- `v_channel_totals` - Total responses by channel
- `v_channel_positive` - Positive responses by channel
- `v_responses_by_weekday` - Response counts by weekday
- `v_daily_counts` - Daily response counts
- `v_campaign_split` - Campaign performance split

## 3. Required Database Views

Create these views in your Supabase SQL editor:

```sql
-- Channel totals view
CREATE VIEW v_channel_totals AS
SELECT 
  channel,
  COUNT(*) as total_replies
FROM responses 
GROUP BY channel;

-- Channel positive view
CREATE VIEW v_channel_positive AS
SELECT 
  channel,
  COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_replies,
  COUNT(*) as total_replies
FROM responses 
GROUP BY channel;

-- Responses by weekday view
CREATE VIEW v_responses_by_weekday AS
SELECT 
  TO_CHAR(received_date, 'Day') as weekday,
  COUNT(*) as count
FROM responses 
GROUP BY TO_CHAR(received_date, 'Day')
ORDER BY count DESC;

-- Daily counts view
CREATE VIEW v_daily_counts AS
SELECT 
  received_date,
  COUNT(*) as count
FROM responses 
GROUP BY received_date
ORDER BY received_date;

-- Campaign split view
CREATE VIEW v_campaign_split AS
SELECT 
  c.campaign_name,
  COUNT(r.id) as total_replies,
  COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END) as positive_replies,
  COUNT(CASE WHEN r.sentiment = 'negative' THEN 1 END) as negative_replies
FROM campaigns c
LEFT JOIN responses r ON c.id = r.campaign_id
GROUP BY c.id, c.campaign_name
ORDER BY total_replies DESC;
```

## 4. Authentication Setup

The app uses Supabase Auth. Make sure to:
1. Enable authentication in your Supabase project
2. Configure your preferred auth providers
3. Set up Row Level Security (RLS) policies as needed

## 5. Testing the Integration

1. Start your development server: `npm run dev`
2. Check the browser console for any Supabase connection errors
3. Navigate to different dashboard pages to test data loading

## 6. Troubleshooting

### Common Issues:
- **"Missing Supabase environment variables"**: Check your `.env.local` file
- **"Failed to fetch"**: Verify your Supabase URL and key
- **"Permission denied"**: Check your RLS policies in Supabase
- **"Table doesn't exist"**: Ensure all required tables and views are created

### Debug Mode:
Add this to your Supabase client for debugging:
```typescript
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'funding-agent-reporting',
    },
  },
})
```
