# Past Week Dashboard Update

## Overview
This update modifies the Funding Agent Reporting Dashboard to focus on the past week and show daily response counts more effectively.

## Changes Made

### 1. Database View Update (`update-daily-counts-past-week.sql`)
- Modified `v_daily_counts` view to filter data to only show the past 7 days
- Added date filtering: `TO_DATE(webhook_received_date, 'MM-DD-YYYY') >= CURRENT_DATE - INTERVAL '7 days'`
- Ensures the view only returns recent data for better performance and focus

### 2. Dashboard Store Update (`src/store/dashboard.ts`)
- Changed default date range from 30 days to 7 days
- Updated `getDefaultDateRange()` function to use `startDate.setDate(startDate.getDate() - 7)`
- Provides better focus on recent activity

### 3. Dashboard Hook Update (`src/hooks/useDashboardData.ts`)
- Enhanced `useEmailDaily()` hook to fill in missing days with 0 counts
- Ensures all 7 days of the past week are shown in the chart
- Improves chart visualization by showing consistent date range

### 4. UI Component Update (`src/pages/Overview.tsx`)
- Updated chart title to "Daily Responses - Past Week"
- Added descriptive subtitle: "Email responses per day for the last 7 days"
- Updated aria-label for better accessibility

## How to Apply Changes

### Step 1: Update Database View
Run the SQL script in your Supabase SQL editor:
```sql
-- Run the contents of update-daily-counts-past-week.sql
```

### Step 2: Deploy Code Changes
The TypeScript/React changes are already applied to the source files.

### Step 3: Verify Changes
- The dashboard should now default to showing the last 7 days
- The daily responses chart should focus on the past week
- All days in the past week should be visible (even if some have 0 responses)

## Benefits

1. **Better Focus**: Dashboard now emphasizes recent activity rather than historical data
2. **Improved Performance**: Smaller dataset queries for faster loading
3. **Enhanced UX**: Users can quickly see what's happening this week
4. **Consistent Visualization**: Chart always shows 7 days regardless of data availability

## Data Structure

The updated `v_daily_counts` view returns:
- `channel`: The communication channel (email, etc.)
- `received_date`: Date in YYYY-MM-DD format
- `n`: Number of responses for that date
- Filtered to only show dates from the past 7 days

## Notes

- The view automatically updates daily as new data comes in
- Historical data older than 7 days is not accessible through this view
- If you need historical data, consider creating a separate view or using the alternative commented version in the SQL script
