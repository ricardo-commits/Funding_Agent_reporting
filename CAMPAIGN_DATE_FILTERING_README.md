# Campaign Date Filtering with Received Date ISO Clay

This update adds the ability to filter campaign data on your dashboard based on when responses were received, using the `received_date_iso_clay` column from the responses table.

## 🚀 What's New

### 1. Database Changes
- Added `received_date_iso_clay` column to the `campaigns` table
- Created new database views for date-filtered campaign data:
  - `v_campaigns_with_dates` - Campaigns with response date information
  - `v_campaign_performance_dated` - Campaign performance metrics with date filtering
- Added performance indexes for faster date filtering

### 2. New Dashboard Components
- **ResponseDateRangePicker** - Filter campaigns by response received dates
- **CampaignsByResponseDate** - Display campaigns filtered by response dates
- Enhanced filter toolbar with both lead dates and response dates

### 3. New Hooks
- `useCampaignsWithDates()` - Fetch campaigns with date filtering
- `useCampaignPerformanceDated()` - Fetch campaign performance with date filtering

## 📋 Setup Instructions

### Step 1: Run the Database Migration
Execute the `campaign-date-filtering.sql` script in your Supabase SQL Editor:

```sql
-- This will create the necessary views and columns
-- Run the entire script to set up date filtering
```

### Step 2: Verify the Setup
Check that the new views were created:

```sql
-- Check available views
SELECT schemaname || '.' || viewname as view_name
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname LIKE 'v_campaign%'
ORDER BY viewname;

-- Test the new view
SELECT * FROM v_campaigns_with_dates LIMIT 5;
```

## 🎯 How to Use

### 1. Filter by Response Dates
- Use the **Response Date Range Picker** (with message icon) to select a date range
- This filters campaigns based on when responses were received
- The filter works independently from the lead creation date filter

### 2. View Filtered Campaigns
- Campaigns are automatically filtered based on your selected response date range
- See response counts for different time periods (last 7 days, last 30 days)
- View latest and earliest response dates for each campaign

### 3. Combine Filters
- Use both date filters together:
  - **Date Range Picker** - Filters by lead creation dates
  - **Response Date Range Picker** - Filters by response received dates
- Combine with campaign and channel filters for precise data analysis

## 🔧 Technical Details

### Database Schema
```sql
-- New column in campaigns table
ALTER TABLE campaigns ADD COLUMN received_date_iso_clay text;

-- New view for date filtering
CREATE VIEW v_campaigns_with_dates AS
SELECT 
  c.*,
  max(r.received_date_iso_clay) as latest_response_date,
  min(r.received_date_iso_clay) as earliest_response_date,
  count(r.*) as total_responses,
  -- Additional metrics...
FROM campaigns c
LEFT JOIN responses r ON r.campaign_id = c.id
GROUP BY c.id, c.campaign_name, c.sector, c.is_active, c.created_at, c.received_date_iso_clay;
```

### TypeScript Types
```typescript
interface CampaignWithDates {
  id: string
  campaign_name: string
  sector?: string
  is_active: boolean
  created_at: string
  received_date_iso_clay?: string
  latest_response_date?: string
  earliest_response_date?: string
  total_responses: number
  responses_last_7_days: number
  responses_last_30_days: number
}
```

### React Hooks
```typescript
// Fetch campaigns filtered by response dates
const { data: campaigns } = useCampaignsWithDates();

// Fetch campaign performance with date filtering
const { data: performance } = useCampaignPerformanceDated();
```

## 📊 Example Use Cases

### 1. Recent Campaign Performance
- Filter to see campaigns that received responses in the last 7 days
- Identify which campaigns are currently active and engaging

### 2. Seasonal Analysis
- Compare campaign performance across different date ranges
- Analyze response patterns during specific time periods

### 3. Campaign Lifecycle Tracking
- Monitor when campaigns start receiving responses
- Track response patterns over time

## 🚨 Important Notes

### Data Requirements
- The `received_date_iso_clay` column must contain valid ISO date strings (YYYY-MM-DD format)
- Campaigns without responses will still appear but with 0 response counts

### Performance Considerations
- Date filtering queries use database indexes for optimal performance
- Large date ranges may impact query performance

### Backward Compatibility
- Existing functionality remains unchanged
- New date filtering is additive and doesn't break existing features

## 🔍 Troubleshooting

### Common Issues

1. **No campaigns showing up**
   - Check that the `received_date_iso_clay` column contains valid dates
   - Verify the database views were created successfully

2. **Date filter not working**
   - Ensure dates are in ISO format (YYYY-MM-DD)
   - Check browser console for any JavaScript errors

3. **Performance issues**
   - Verify database indexes were created
   - Consider reducing the date range size

### Debug Queries
```sql
-- Check if the new column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND column_name = 'received_date_iso_clay';

-- Test date filtering
SELECT * FROM v_campaigns_with_dates 
WHERE latest_response_date >= '2024-01-01' 
  AND latest_response_date <= '2024-12-31';
```

## 📈 Future Enhancements

- Add more granular time filtering (hourly, weekly, monthly)
- Implement date-based campaign performance analytics
- Add export functionality for filtered campaign data
- Create date-based campaign comparison tools

---

For technical support or questions about this feature, please refer to the database schema documentation or contact the development team.
