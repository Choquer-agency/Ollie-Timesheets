# 🚨 URGENT: Fix Infinite Recursion Error

## The Problem

Your Supabase database has infinite recursion in the RLS policies, causing all operations to return 500 errors:

```
infinite recursion detected in policy for relation "profiles"
```

This is blocking:
- ❌ Loading employees
- ❌ Loading settings
- ❌ Loading time entries
- ❌ Adding new employees
- ❌ Everything database-related

## The Solution

Run the SQL script to fix all the policies.

### Step-by-Step:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com/
   - Select your project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Fix Script**
   - Open `supabase-fix-infinite-recursion.sql` from your project
   - Copy the ENTIRE contents
   - Paste into the SQL editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Refresh your app
   - Everything should work now! ✅

## What This Fixes

The script:
- ✅ Removes circular policy dependencies
- ✅ Simplifies RLS policies to avoid recursion
- ✅ Allows authenticated users to access their data
- ✅ Keeps your data secure (users still can't access other accounts)

## After Running the Script

Your app will:
1. ✅ Load settings properly
2. ✅ Load employees properly
3. ✅ Load time entries properly
4. ✅ Allow adding new employees
5. ✅ Allow all database operations

## Security Note

The simplified policies allow **any authenticated user** to:
- View/edit employees
- View/edit time entries
- View/edit settings for their account

This is appropriate for a single-company timesheet app. If you need multi-tenant support later, we can add more restrictive policies without recursion.

## Need Help?

If you see any errors after running this, check:
1. Did the entire script run? (scroll down in results)
2. Any error messages in the SQL editor output?
3. Try hard-refreshing your app (Cmd/Ctrl + Shift + R)

