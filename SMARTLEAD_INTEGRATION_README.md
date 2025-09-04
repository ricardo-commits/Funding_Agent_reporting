# Smartlead Integration for Funding Agent Dashboard

This document describes the integration of Smartlead campaign data into your Funding Agent dashboard.

## Overview

The dashboard now includes Smartlead campaign metrics alongside your existing email response data. This provides a comprehensive view of your outreach campaigns, including:

- **Campaign Performance**: Sent vs. replies by campaign
- **Reply Rates**: Individual campaign reply rate percentages
- **Overall Metrics**: Total sent, replies, bounces, and active campaigns
- **Real-time Data**: Live data from your Smartlead campaigns

## Features Added

### 1. Smartlead KPI Cards
- **Smartlead Total Sent**: Total emails sent across all campaigns
- **Smartlead Total Replies**: Total replies received
- **Smartlead Reply Rate**: Average reply rate across campaigns
- **Active Campaigns**: Number of campaigns with data

### 2. Smartlead Charts
- **Campaign Performance Bar Chart**: Side-by-side comparison of sent vs. replies by campaign
- **Campaign Reply Rates Doughnut Chart**: Reply rate percentages for each campaign

### 3. Data Integration
- Campaign data from your CSV is now stored in a proper database table
- Real-time metrics calculated from the database
- Integration with existing dashboard filtering and layout

## Setup Instructions

### 1. Database Setup
Run the SQL script to create the necessary tables and views:

```bash
# Connect to your Supabase database and run:
psql -h your-supabase-host -U your-username -d your-database -f smartlead-setup.sql
```

Or copy and paste the contents of `smartlead-setup.sql` into your Supabase SQL editor.

### 2. Data Import
The setup script automatically imports your CSV data into the `smartlead_campaigns` table. The data includes:

- IT Support: 7,582 sent, 35 replies (0.46% rate)
- Legal & Compliance: 5,035 sent, 68 replies (1.35% rate)
- Marketing & Advertising: 9,813 sent, 75 replies (0.76% rate)
- Accounting: 4,413 sent, 23 replies (0.52% rate)
- Hospitality: 4,114 sent, 38 replies (0.92% rate)
- Consulting: 8,381 sent, 81 replies (0.97% rate)
- Always on Referral: 63 sent, 3 replies (4.76% rate)

### 3. Dashboard Access
The Smartlead data is automatically loaded when you visit the Overview page. No additional configuration is needed.

## Data Structure

### smartlead_campaigns Table
```sql
CREATE TABLE smartlead_campaigns (
  id UUID PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  campaign_external_id TEXT,
  sent_count INTEGER,
  bounce_count INTEGER,
  total_count INTEGER,
  reply_count INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Views Created
- **v_smartlead_active_campaigns**: Active campaigns with calculated reply/bounce rates
- **v_smartlead_metrics**: Aggregated metrics across all campaigns

## Updating Campaign Data

### Option 1: Database Update
Update the `smartlead_campaigns` table directly:

```sql
UPDATE smartlead_campaigns 
SET sent_count = 8000, reply_count = 40, updated_at = now()
WHERE campaign_name = 'Funding Agent: IT Support';
```

### Option 2: CSV Import
Create a new CSV with updated data and run:

```sql
-- Clear existing data
DELETE FROM smartlead_campaigns;

-- Import new CSV data
COPY smartlead_campaigns FROM 'your-updated-data.csv' WITH CSV HEADER;
```

### Option 3: API Integration
For production use, consider creating an API endpoint to sync data from Smartlead:

```typescript
// Example API endpoint structure
POST /api/smartlead/sync
{
  "campaigns": [
    {
      "campaign_name": "Funding Agent: IT Support",
      "sent_count": 8000,
      "reply_count": 40,
      // ... other fields
    }
  ]
}
```

## Dashboard Customization

### Adding New Metrics
To add new Smartlead metrics, update the `SmartleadMetrics` interface in `src/types/dashboard.ts`:

```typescript
export interface SmartleadMetrics {
  // ... existing fields
  new_metric: number;
}
```

### Adding New Charts
Create new chart components in the Overview page:

```typescript
// Example: Add bounce rate chart
<Card>
  <CardHeader>
    <CardTitle>Campaign Bounce Rates</CardTitle>
  </CardHeader>
  <CardContent>
    <BarChart data={bounceRateData} />
  </CardContent>
</Card>
```

## Troubleshooting

### Common Issues

1. **No Data Displayed**
   - Check if the `smartlead_campaigns` table exists
   - Verify data was imported correctly
   - Check browser console for errors

2. **Charts Not Rendering**
   - Ensure Chart.js is properly configured
   - Check if data arrays are empty
   - Verify chart component props

3. **Database Connection Errors**
   - Check Supabase connection settings
   - Verify table permissions
   - Check network connectivity

### Debug Commands
```sql
-- Check if data exists
SELECT COUNT(*) FROM smartlead_campaigns;

-- Verify view data
SELECT * FROM v_smartlead_metrics;

-- Check campaign data
SELECT * FROM smartlead_campaigns WHERE is_active = true;
```

## Performance Considerations

- Data is cached for 60 seconds (configurable in hooks)
- Views are used for complex aggregations
- Indexes are created on frequently queried columns
- Consider pagination for large datasets

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **Campaign Filtering**: Filter dashboard by specific campaigns
- **Date Range Filtering**: Historical campaign performance
- **Export Functionality**: Download campaign reports
- **Alerting**: Notifications for low reply rates
- **A/B Testing**: Compare campaign variations

## Support

For issues or questions about the Smartlead integration:

1. Check the browser console for error messages
2. Verify database table structure and data
3. Review the integration code in `src/hooks/useDashboardData.ts`
4. Check the dashboard types in `src/types/dashboard.ts`

The integration is designed to be robust and handle missing data gracefully, displaying fallback values when needed.
