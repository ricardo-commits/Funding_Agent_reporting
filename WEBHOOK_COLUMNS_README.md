# Webhook Columns Migration Guide

This guide explains how to use the three webhook columns consistently across your Funding Agent Reporting project.

## 🎯 Overview

Your project now uses three standardized webhook columns for all date and time operations:

1. **`webhook_time_of_day`** - text (e.g., "9:00 AM", "2:30 PM")
2. **`webhook_received_date`** - text (e.g., "12-25-2024")
3. **`webhook_weekday`** - text (e.g., "Monday", "Tuesday")

## 🚀 Quick Start

### Step 1: Run the Database Migration

1. Go to your Supabase SQL Editor
2. Run the `update-to-webhook-columns.sql` script
3. This will:
   - Add missing webhook columns
   - Remove old timestamp columns
   - Update all database views
   - Create performance indexes

### Step 2: Verify the Migration

After running the migration, check that everything worked:

```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'responses';

-- Check sample data
SELECT webhook_received_date, webhook_time_of_day, webhook_weekday 
FROM responses LIMIT 5;
```

## 📅 Using the Webhook Columns

### Date Operations

```typescript
import { webhookDateToDate, webhookDateToISO } from '../lib/dateUtils';

// Convert webhook date to Date object
const date = webhookDateToDate('12-25-2024'); // Returns Date object

// Convert to ISO format for filtering
const isoDate = webhookDateToISO('12-25-2024'); // Returns '2024-12-25'
```

### Time Operations

```typescript
import { webhookTimeToDate, formatWebhookTime } from '../lib/dateUtils';

// Convert webhook time to Date object
const time = webhookTimeToDate('9:00 AM'); // Returns Date object

// Format for display
const formattedTime = formatWebhookTime('9:00 AM'); // Returns '9:00 AM'
```

### Weekday Operations

```typescript
import { webhookWeekdayToNumber, webhookWeekdayToDate } from '../lib/dateUtils';

// Convert to number (Monday=1, Sunday=7)
const weekdayNum = webhookWeekdayToNumber('Monday'); // Returns 1

// Get next occurrence of that weekday
const nextMonday = webhookWeekdayToDate('Monday'); // Returns Date object
```

## 🔄 Updated Database Views

The migration creates these views that use webhook columns:

- **`v_channel_totals`** - Channel response counts
- **`v_channel_positive`** - Positive response percentages
- **`v_responses_by_weekday`** - Responses grouped by weekday
- **`v_daily_counts`** - Daily response counts
- **`v_campaign_split`** - Campaign performance metrics
- **`v_time_of_day_analysis`** - Time of day patterns
- **`v_daily_counts_with_time`** - Enhanced daily counts with time

## 📊 Example Queries

### Get responses by weekday

```sql
SELECT webhook_weekday, COUNT(*) as count
FROM responses 
WHERE webhook_weekday IS NOT NULL
GROUP BY webhook_weekday
ORDER BY webhook_weekday;
```

### Get responses by date range

```sql
SELECT webhook_received_date, COUNT(*) as count
FROM responses 
WHERE TO_DATE(webhook_received_date, 'MM-DD-YYYY') 
  BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY webhook_received_date
ORDER BY TO_DATE(webhook_received_date, 'MM-DD-YYYY');
```

### Get time of day patterns

```sql
SELECT webhook_time_of_day, COUNT(*) as count
FROM responses 
WHERE webhook_time_of_day IS NOT NULL
GROUP BY webhook_time_of_day
ORDER BY webhook_time_of_day;
```

## 🛠️ Utility Functions

The `src/lib/dateUtils.ts` file provides helper functions:

- **`webhookDateToDate()`** - Convert webhook date to Date object
- **`webhookDateToISO()`** - Convert to ISO format
- **`webhookTimeToDate()`** - Convert webhook time to Date object
- **`webhookWeekdayToNumber()`** - Convert weekday to number
- **`webhookWeekdayToDate()`** - Get next occurrence of weekday
- **`getCombinedDateTime()`** - Combine date and time
- **`formatWebhookDate()`** - Format for display
- **`formatWebhookTime()`** - Format time for display

## 🔧 React Hook Updates

Your React hooks have been updated to use webhook columns:

```typescript
// Before (using old columns)
.select('received_weekday')

// After (using webhook columns)
.select('webhook_weekday')
```

## 📝 Data Format Standards

### Date Format
- **Input**: `MM-DD-YYYY` (e.g., "12-25-2024")
- **Output**: `YYYY-MM-DD` (e.g., "2024-12-25") for sorting/filtering

### Time Format
- **Input**: `HH:MM AM/PM` (e.g., "9:00 AM", "2:30 PM")
- **Alternative**: `HH:MM` (24-hour format, e.g., "14:30")

### Weekday Format
- **Input**: Full weekday names (e.g., "Monday", "Tuesday")
- **Case**: Title case recommended

## 🚨 Common Issues & Solutions

### Issue: "Column does not exist"
**Solution**: Run the migration script to add missing columns

### Issue: Date parsing errors
**Solution**: Ensure dates are in `MM-DD-YYYY` format

### Issue: Time format not recognized
**Solution**: Use standard formats like "9:00 AM" or "14:30"

### Issue: Weekday not matching
**Solution**: Use full weekday names: "Monday", not "Mon"

## 🔍 Testing Your Setup

Test the webhook columns with this simple query:

```sql
-- Test webhook columns
SELECT 
  webhook_received_date,
  webhook_time_of_day,
  webhook_weekday,
  COUNT(*) as count
FROM responses 
GROUP BY webhook_received_date, webhook_time_of_day, webhook_weekday
LIMIT 10;
```

## 📚 Next Steps

1. **Update your data ingestion** to populate webhook columns
2. **Test the new views** with your existing data
3. **Update any custom queries** to use webhook columns
4. **Monitor performance** with the new indexes

## 🆘 Need Help?

If you encounter issues:

1. Check the migration script output for errors
2. Verify column existence with `information_schema.columns`
3. Test with sample data first
4. Check the console for parsing errors

The webhook columns provide a consistent, text-based approach to handling dates and times that's more flexible than traditional timestamp columns.
