# Admin Account Setup Guide

## Problem
You're seeing "Access Denied" because the dashboard requires an admin account to access sensitive customer data.

## Solution
You can create an admin account in two ways:

### Option 1: Use the Admin Setup Page (Recommended)

1. **Navigate to the admin setup page**
   - Go to: `http://localhost:5173/admin-setup` (or your app URL + `/admin-setup`)
   - Or click the "Create Admin Account" button on the Access Denied page

2. **Create your user account**
   - Enter your email and password
   - Click "Create Admin Account"
   - The system will create your user account in Supabase

3. **Complete the manual setup**
   - Follow the instructions shown on screen
   - Go to your Supabase Dashboard → SQL Editor
   - Run the `supabase-setup.sql` script
   - Run the SQL command to assign admin role to your user

4. **Sign in to access the dashboard**
   - Return to the admin setup page
   - Click "Sign In" and enter your credentials
   - You'll be redirected to the dashboard

### Option 2: Manual Setup in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Create a user account**
   - Go to **Authentication** → **Users**
   - Click **"Add user"** or use the signup form in your app
   - Create a user with email and password

3. **Run the SQL setup script**
   - Go to **SQL Editor** in your Supabase dashboard
   - Copy and paste the contents of `supabase-setup.sql`
   - Click "Run" to execute the script

4. **Make the user an admin**
   - In the SQL Editor, run this command (replace with actual email):
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com'
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```

5. **Sign in to your app**
   - Use the email and password you created
   - You should now have admin access

## What the Setup Does

The admin setup process:

1. **Creates the `user_roles` table** - Stores user roles (admin, user, etc.)
2. **Enables Row Level Security (RLS)** - Protects sensitive data
3. **Creates RLS policies** - Controls who can access what data
4. **Sets up automatic role assignment** - New users get 'user' role by default
5. **Creates dashboard views** - For analytics and reporting

## Security Features

- **Authentication Required**: All dashboard access requires login
- **Role-Based Access**: Only admin users can access sensitive data
- **Row Level Security**: Database-level protection of customer data
- **Automatic Role Management**: New users are automatically assigned roles

## Troubleshooting

### "Table doesn't exist" error
- Run the `supabase-setup.sql` script in your Supabase SQL Editor
- This creates all required tables and views

### "Permission denied" error
- Make sure you've assigned the 'admin' role to your user
- Check that RLS policies are properly configured

### "User already exists" error
- The user account exists but doesn't have admin role
- Use the SQL command to update the role to 'admin'

### "Row-level security policy" error
- This happens when trying to insert into user_roles table
- **Solution**: Run the `supabase-setup.sql` script first to create the table and disable RLS temporarily
- Then run the admin role assignment SQL command
- The setup script will re-enable RLS with proper policies after admin creation

### "User already registered" error
- This happens when a user account already exists in Supabase
- **Solution 1**: Try signing in with the existing credentials
- **Solution 2**: Use the "Clear Session & Start Fresh" button on the admin setup page
- **Solution 3**: If you need to completely remove the user:
  1. Go to Supabase Dashboard → SQL Editor
  2. Run the `supabase-cleanup.sql` script (replace email with actual email)
  3. Then run the `supabase-setup.sql` script
  4. Try creating the account again
- **Solution 4**: Use a different email address for the admin account

## Next Steps

After creating your admin account:

1. **Access the dashboard** - You should now be able to view all data
2. **Create additional admin users** - Use the Settings page to add more admins
3. **Configure your data** - Import or add your customer data
4. **Set up monitoring** - Monitor access logs in Supabase dashboard

## Support

If you continue to have issues:
1. Check the browser console for error messages
2. Verify your Supabase environment variables are correct
3. Ensure all required tables and views exist in your database
4. Contact support with specific error messages
