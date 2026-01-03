# Fix for Existing Employee Time Entries

## The Issue

Johnny's clock in/out data from today (and any other employee data created before the fix) was saved with the wrong `owner_id` in the database. The entries exist, but they're "invisible" to you because they're tagged with Johnny's user ID instead of yours.

## The Good News

✅ **No data was lost!** All of Johnny's time entries are still in the database.  
✅ **The fix is simple** - we just need to update the `owner_id` on those existing records.  
✅ **Future entries will work correctly** - the code fix has already been deployed.

## How to Fix Johnny's Existing Data

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: "Ollie Timesheet"
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script

Copy and paste this SQL script into the SQL Editor:

```sql
-- Fix existing time entries that were created with wrong owner_id
-- 
-- This updates time_entries and breaks to use the correct owner_id
-- based on the employee's owner_id from the employees table

-- Fix time_entries
UPDATE time_entries
SET owner_id = employees.owner_id
FROM employees
WHERE time_entries.employee_id = employees.id
  AND time_entries.owner_id != employees.owner_id;

-- Fix breaks
UPDATE breaks
SET owner_id = employees.owner_id
FROM time_entries
JOIN employees ON time_entries.employee_id = employees.id
WHERE breaks.time_entry_id = time_entries.id
  AND breaks.owner_id != employees.owner_id;

-- Verify the fix
SELECT 
  COUNT(*) as fixed_entries_count,
  'Time entries now visible' as status
FROM time_entries te
JOIN employees e ON te.employee_id = e.id
WHERE te.owner_id = e.owner_id;
```

### Step 3: Click "Run"

Click the **Run** button in the SQL Editor. You should see output showing how many entries were fixed.

### Step 4: Refresh Your Admin Dashboard

1. Go back to your timesheet app
2. Refresh the page (Cmd+R or F5)
3. Johnny's time entries should now be visible!

## What This Script Does

1. **Finds all time entries** where the `owner_id` doesn't match the employee's owner
2. **Updates them** to use the correct owner_id (your user ID)
3. **Fixes breaks too** to ensure everything is consistent
4. **Shows a count** of how many entries were fixed

## Why This Happened

Before the fix I just deployed:
- When Johnny clocked in → saved with `owner_id = Johnny's auth user ID`
- When you viewed the dashboard → looked for entries with `owner_id = your auth user ID`
- No match = entries invisible

After running this SQL script:
- Johnny's existing entries → updated to `owner_id = your auth user ID`
- When you view the dashboard → finds all entries with your owner_id
- Match! = entries now visible ✅

## Need Help?

If you run into any issues running the SQL script, let me know and I can help troubleshoot!

---

**Note**: The file `fix-existing-employee-entries.sql` contains the same SQL script for easy reference.

