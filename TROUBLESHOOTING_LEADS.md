# Troubleshooting: Why Are There No Leads?

This guide will help you identify and fix the issue with leads not showing up in your application.

## 🔍 Quick Diagnostic Steps

### Step 1: Run the Diagnostic Script
1. Open your browser's developer console (F12)
2. Copy and paste the contents of `debug-leads-issue.js`
3. Run: `debugLeadsIssue()`
4. Check the console output for specific issues

### Step 2: Check Database Structure
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the `diagnose-database.sql` script
4. Verify that all required tables and columns exist

## 🚨 Common Issues and Solutions

### Issue 1: No Data in Database
**Symptoms:** Diagnostic shows 0 leads in database
**Solution:** 
1. Run the `insert-sample-data.sql` script in your Supabase SQL Editor
2. This will create sample campaigns, leads, and responses

### Issue 2: No Email Leads (Only Other Channels)
**Symptoms:** Total leads > 0, but email leads = 0
**Solution:**
1. Check if leads have `first_touch_channel = 'email'`
2. Use the "Show All Leads" button in the updated Leads page
3. Or modify the query to show all leads regardless of channel

### Issue 3: Database Schema Mismatch
**Symptoms:** Errors about missing columns or tables
**Solution:**
1. Run the `flexible-migration.sql` script
2. This handles missing columns and creates required views

### Issue 4: Supabase Connection Issues
**Symptoms:** Connection errors or authentication failures
**Solution:**
1. Check your `.env` file has correct Supabase credentials
2. Verify your Supabase project is active
3. Check RLS (Row Level Security) policies

### Issue 5: Missing Views
**Symptoms:** Errors about views not existing
**Solution:**
1. Run the `fix-views.sql` script
2. Or run the complete `flexible-migration.sql` script

## 🛠️ Step-by-Step Fix Process

### Option A: Quick Fix (Recommended)
1. **Run sample data script:**
   ```sql
   -- Copy and paste insert-sample-data.sql into Supabase SQL Editor
   ```

2. **Test the application:**
   - Refresh your app
   - Navigate to the Leads page
   - You should now see sample leads

### Option B: Complete Database Setup
1. **Run diagnostic:**
   ```sql
   -- Copy and paste diagnose-database.sql into Supabase SQL Editor
   ```

2. **Run migration:**
   ```sql
   -- Copy and paste flexible-migration.sql into Supabase SQL Editor
   ```

3. **Add sample data:**
   ```sql
   -- Copy and paste insert-sample-data.sql into Supabase SQL Editor
   ```

4. **Test the application**

## 📊 Expected Data After Sample Insertion

After running the sample data script, you should have:
- **3 campaigns:** Q4 Email Outreach, LinkedIn Connection Campaign, Cold Email Sequence
- **5 leads:** Mix of email and LinkedIn channels
- **5 responses:** Various response types (Interested, Information Requested, etc.)

## 🔧 Advanced Troubleshooting

### Check RLS Policies
If you have Row Level Security enabled:
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Check Table Permissions
```sql
-- Check if your user can access the tables
SELECT table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('leads', 'responses', 'campaigns');
```

### Verify Environment Variables
Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🎯 Testing Your Fix

1. **Browser Console Test:**
   ```javascript
   // Run this in browser console
   debugLeadsIssue()
   ```

2. **Manual Database Check:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT COUNT(*) as total_leads FROM leads;
   SELECT COUNT(*) as email_leads FROM leads WHERE first_touch_channel = 'email';
   ```

3. **Application Test:**
   - Navigate to Leads page
   - Check if leads are displayed
   - Try clicking on a lead to see details
   - Test the "Show All Leads" toggle

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** for specific error messages
2. **Run the diagnostic script** and share the output
3. **Verify your Supabase project** is active and accessible
4. **Check your network connection** and firewall settings
5. **Try clearing browser cache** and refreshing the page

## 📝 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "relation does not exist" | Missing table | Run migration script |
| "column does not exist" | Missing column | Run flexible migration |
| "permission denied" | RLS policy | Check RLS settings |
| "authentication failed" | Wrong credentials | Check .env file |
| "network error" | Connection issue | Check internet/Supabase status |

## 🎉 Success Indicators

You'll know the issue is fixed when:
- ✅ The diagnostic script shows leads in the database
- ✅ The Leads page displays lead data
- ✅ You can click on leads to see details
- ✅ No console errors related to data loading
- ✅ The "Show All Leads" toggle works

## 📞 Need More Help?

If you're still stuck:
1. Share the output from `debugLeadsIssue()`
2. Share any error messages from the browser console
3. Share the results from `diagnose-database.sql`
4. Check if your Supabase project is in the correct region and active
