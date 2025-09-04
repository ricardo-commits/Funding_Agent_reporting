# Database Schema Update Guide

This guide will help you update your Funding Agent Reporting project to work with the new database schema.

## 🚨 Current Issue

You're getting an error: `"column responses.created_at does not exist"`. This means your database has a different structure than expected - it doesn't have the standard timestamp columns.

## 🔧 Immediate Solution

### Step 1: Diagnose Your Database Structure

First, let's see what columns actually exist in your database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. **Run the `diagnose-database.sql` file** to see your current table structure

### Step 2: Run the Flexible Migration Script

After seeing your database structure:

1. **Run the `flexible-migration.sql` file** - this script handles missing columns gracefully
2. This script will:
   - Add missing columns safely
   - Find any existing timestamp columns and use them
   - Create fallbacks for missing data
   - Handle different table structures

### Step 3: Verify the Migration

After running the migration, test your connection:

1. Open your browser's developer console
2. Run: `window.testDatabaseConnection()`
3. Check the console output for any errors

### Step 4: Alternative Quick Test

If you want to quickly check what's in your database:

1. Copy the contents of `test-current-state.js`
2. Paste it in your browser console
3. Run: `testCurrentState()`

## 📋 What the Flexible Migration Does

The `flexible-migration.sql` script:

- ✅ **Detects existing columns** and works with your current structure
- ✅ **Finds timestamp columns** automatically (any column with 'time', 'date', or 'at' in the name)
- ✅ **Adds missing columns** (`received_at`, `response_text`, etc.)
- ✅ **Creates the new enum types**
- ✅ **Adds generated columns** (`received_date`, `received_weekday`)
- ✅ **Creates optimized views** with fallbacks for missing columns
- ✅ **Preserves all existing data**
- ✅ **Handles any table structure** gracefully

## 🔄 Updated Code Changes

I've updated the code to handle missing timestamp columns:

- **Data hooks** now fallback to `id` ordering if no timestamp columns exist
- **Views** have fallbacks for missing generated columns
- **Data transformation** provides fallbacks for missing timestamp fields
- **Type safety** maintained with proper error handling

## 📊 Database Views

The new schema includes optimized views:
- `v_channel_totals` - Total responses by channel
- `v_channel_positive` - Positive response percentages by channel
- `v_responses_by_weekday` - Responses grouped by weekday
- `v_daily_counts` - Daily response counts
- `v_campaign_split` - Campaign performance metrics

## 🆕 New Features

### Enum Types
- `channel_enum`: 'email' | 'linkedin'
- `response_label_enum`: 'Interested', 'Information Requested', 'Meeting Request', etc.

### Generated Columns
- `received_date`: Automatically calculated date from `received_at`
- `received_weekday`: Automatically calculated weekday number (1-7)

### Improved Performance
- Better indexing on frequently queried columns
- Optimized views for dashboard queries
- Proper foreign key relationships

## 🧪 Testing Your Application

1. Start your development server: `npm run dev`
2. Navigate to the dashboard
3. Check that all data is loading correctly
4. Test the filters and date ranges
5. Verify that charts and tables display properly

## 🚨 Troubleshooting

### If you still get errors after running flexible-migration.sql:

1. **Check the migration output** - look for any error messages
2. **Run the diagnostic script** - use `diagnose-database.sql` to see what exists
3. **Verify your Supabase connection** - check your environment variables
4. **Test with the browser console** - run `testCurrentState()`

### Common Issues

1. **"View does not exist" errors**
   - Make sure you ran the flexible migration script
   - Check that all views were created successfully

2. **"Column does not exist" errors**
   - Verify that the migration script completed successfully
   - Check that all new columns were added to existing tables

3. **Data not loading**
   - Check your Supabase connection settings
   - Verify that your environment variables are correct
   - Run the test connection function: `window.testDatabaseConnection()`

## 📝 Migration Notes

### Data Preservation
- The migration script preserves all existing data
- Old columns are kept for backward compatibility
- You can remove old columns after confirming everything works

### Performance Improvements
- The new schema includes better indexing
- Views are optimized for dashboard queries
- Generated columns reduce the need for complex date calculations

### Backward Compatibility
- Legacy hooks are maintained for existing components
- Old field names are mapped to new ones where needed
- Existing components should work without modification

## 🎯 Next Steps

After successful migration:
1. Test all dashboard features
2. Verify data accuracy
3. Consider removing old columns if no longer needed
4. Update any custom queries to use the new schema
5. Take advantage of the new enum types and generated columns

## 🆘 Support

If you need help with the migration:
1. Check the console for specific error messages
2. Run the diagnostic scripts provided
3. Verify your Supabase project configuration
4. Ensure all environment variables are set correctly
5. Test the database connection using the provided test functions

## 📁 Files to Use

- **`diagnose-database.sql`** - Run this first to see your current structure
- **`flexible-migration.sql`** - Run this to migrate your database safely
- **`test-current-state.js`** - Copy this to browser console for quick testing
- **`supabase-setup.sql`** - Use this for fresh installations only
