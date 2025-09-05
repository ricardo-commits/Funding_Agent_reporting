# Response Sequence Feature

## Overview
This feature adds response sequence tracking to the Funding Agent Reporting dashboard, allowing you to analyze response patterns by sequence number (1st, 2nd, 3rd, etc.).

## What's New

### 1. Database Schema Update
- Added `response_sequence` column to the `responses` table
- Added index for better query performance
- Column tracks the sequence number of responses per lead

### 2. New Data Hook
- `useAllTimeResponsesBySequence()` - Fetches response data grouped by sequence
- Returns total counts and positive response counts for each sequence

### 3. New Chart Component
- `BarMulti` - Multi-dataset bar chart component for comparing multiple data series
- Supports custom colors and labels for each dataset

### 4. Enhanced Overview Page
- Added "Responses by Sequence" multi-bar chart
- Shows both total responses and positive responses by sequence
- Added "Response Sequence Analysis" section with percentage breakdowns

## Setup Instructions

### 1. Database Setup
Run the SQL scripts in order:

```sql
-- Add the response_sequence column
\i add-response-sequence-column.sql

-- Populate with sample data
\i add-sample-sequence-data.sql
```

### 2. Data Population
The `add-sample-sequence-data.sql` script will:
- Calculate sequence numbers based on `lead_id` and `received_at` timestamp
- Update all existing responses with their sequence numbers
- Show verification queries to confirm the data

## Features

### Multi-Bar Chart
- **Blue bars**: Total responses by sequence
- **Green bars**: Positive responses (Interested + Referral) by sequence
- **X-axis**: Sequence numbers (1st, 2nd, 3rd, 4th, etc.)
- **Y-axis**: Response counts

### Percentage Analysis
- **Response Distribution**: Shows what percentage of total responses occur at each sequence
- **Positive Response Distribution**: Shows what percentage of positive responses occur at each sequence

## Example Output

Based on your requirements, the chart will show data like:

```
Response by sequence:
1st: 10.9%
2nd: 39.7%
3rd: 40.5%
4th: 9.0%

Positive response by sequence:
1st: 11.9%
2nd: 54.2%
3rd: 20.3%
4th: 13.6%
```

## Technical Details

### Data Structure
```typescript
interface SequenceData {
  sequence: number;
  total_count: number;
  positive_count: number;
}
```

### Chart Configuration
- Uses Chart.js with react-chartjs-2
- Responsive design with proper scaling
- Custom colors for better visual distinction
- Legend and axis labels for clarity

### Performance
- Indexed `response_sequence` column for fast queries
- Cached data with 60-second stale time
- Efficient grouping and aggregation in the database

## Usage

1. Navigate to the Overview page
2. Scroll down to see the new "Responses by Sequence" chart
3. View the percentage breakdown in the "Response Sequence Analysis" section
4. Use the multi-bar chart to compare total vs positive responses

## Troubleshooting

### No Data Showing
- Ensure the `response_sequence` column has been added to the database
- Run the sample data script to populate sequence numbers
- Check that responses have valid `received_at` timestamps

### Chart Not Rendering
- Verify Chart.js is properly loaded
- Check browser console for JavaScript errors
- Ensure the `BarMulti` component is imported correctly

### Incorrect Percentages
- Verify that positive responses are correctly identified as 'Interested' or 'Referral'
- Check that sequence numbers are calculated correctly based on lead_id and timestamp
- Ensure data is properly grouped and aggregated

## Future Enhancements

Potential improvements for this feature:
- Filter by campaign or date range
- Export sequence analysis data
- Add trend analysis over time
- Include response rate calculations per sequence
- Add drill-down capability to see individual responses
