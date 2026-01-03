# CRITICAL: Data Isolation Security Fix

## Problem
Your timesheet app had a **critical security vulnerability** where different business owners could see each other's employees and time entries. This happened because the database queries were not filtered by `owner_id`.

## What This Migration Does
1. Adds `owner_id` column to `employees`, `time_entries`, and `breaks` tables
2. Creates database indexes for better performance
3. Implements Row Level Security (RLS) policies to enforce data isolation **at the database level**
4. Updates application code to always include `owner_id` in queries and inserts

## How to Apply the Migration

### Step 1: Run the SQL Migration in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Open the file `supabase-migration-add-owner-id.sql`
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. **IMPORTANT**: Before running, decide how to handle existing data:

   **Option A - Clear All Existing Data (Recommended for testing):**
   - Uncomment these lines in the SQL file (around line 19-21):
   ```sql
   DELETE FROM breaks;
   DELETE FROM time_entries;
   DELETE FROM employees;
   ```

   **Option B - Try to Associate Existing Data (if you have real data):**
   - Uncomment these lines instead (around line 25-27):
   ```sql
   UPDATE employees SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;
   UPDATE time_entries SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;
   UPDATE breaks SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;
   ```

7. Click **Run** to execute the migration
8. Verify no errors appear in the output

### Step 2: Make owner_id Required (After Testing)

After you've confirmed everything works:

1. Go back to Supabase SQL Editor
2. Run these commands to make `owner_id` required:
```sql
ALTER TABLE employees ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE time_entries ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE breaks ALTER COLUMN owner_id SET NOT NULL;
```

### Step 3: Deploy the Updated Code

The code changes have already been made and committed. Simply push to trigger deployment:

```bash
git add -A
git commit -m "Fix critical security issue: Add data isolation by owner_id"
git push
```

### Step 4: Test Data Isolation

1. Create a test account (Account A) with your Google email
2. Add a few test employees and time entries
3. Sign out
4. Create a second test account (Account B) with a different email
5. Add different employees and time entries
6. **Verify**: Account A cannot see Account B's data and vice versa
7. Try accessing the app as both accounts - you should only see your own data

## What Changed in the Code

### Database Schema (`supabaseClient.ts`)
- Added `owner_id: string` to `employees`, `time_entries`, and `breaks` tables

### Data Loading (`SupabaseStore.tsx`)
- All SELECT queries now filter by `.eq('owner_id', user.id)`
- Example: `supabase.from('employees').select('*').eq('owner_id', user.id)`

### Data Insertion (`SupabaseStore.tsx`)
- All INSERT operations now include `owner_id: user!.id`
- This ensures new records are automatically tied to the current user

### Row Level Security (RLS)
The SQL migration creates database policies that enforce:
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- Even if the application code has bugs, the database will block unauthorized access

## Security Benefits

1. **Database-Level Enforcement**: Even if there's a bug in your app code, RLS policies prevent data leakage
2. **Multi-Tenant Ready**: Each business owner has completely isolated data
3. **Performance**: Indexes on `owner_id` ensure fast queries
4. **Future-Proof**: All new features will automatically inherit this security model

## Testing Checklist

- [ ] SQL migration runs without errors
- [ ] Existing data is handled correctly (cleared or associated)
- [ ] Can create new account and add employees
- [ ] Can add time entries and breaks
- [ ] Second account cannot see first account's data
- [ ] First account cannot see second account's data
- [ ] Settings are properly isolated per account
- [ ] Payroll reports only show own employees

## Rollback Plan (If Needed)

If something goes wrong, you can rollback by:

1. Disabling RLS temporarily:
```sql
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE breaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

2. Removing the columns (will lose data!):
```sql
ALTER TABLE employees DROP COLUMN IF EXISTS owner_id;
ALTER TABLE time_entries DROP COLUMN IF EXISTS owner_id;
ALTER TABLE breaks DROP COLUMN IF EXISTS owner_id;
```

## Questions?

If you encounter any issues:
1. Check the Supabase logs for policy violations
2. Verify RLS is enabled on all tables
3. Confirm all INSERT statements include `owner_id`
4. Check that queries filter by `owner_id`

