-- ================================================
-- COMPLETE DATABASE RESET - CLEAN SLATE
-- ================================================
-- WARNING: This will DELETE ALL DATA from your database
-- This includes:
-- - All employees
-- - All time entries and breaks
-- - All settings
-- - All auth users (except the one running this script)
-- 
-- USE WITH CAUTION - This action CANNOT be undone!
-- ================================================

-- ================================================
-- STEP 1: Delete all time-related data
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '🗑️  Deleting all breaks...';
END $$;

DELETE FROM breaks;

DO $$ 
BEGIN
  RAISE NOTICE '🗑️  Deleting all time entries...';
END $$;

DELETE FROM time_entries;

-- ================================================
-- STEP 2: Delete all employees
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '🗑️  Deleting all employees...';
END $$;

DELETE FROM employees;

-- ================================================
-- STEP 3: Delete all settings
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '🗑️  Deleting all settings...';
END $$;

DELETE FROM settings;

-- ================================================
-- STEP 4: Delete all auth users (EXCEPT current user)
-- ================================================
-- This preserves YOUR account so you can still log in
DO $$ 
BEGIN
  RAISE NOTICE '🗑️  Deleting all auth users (except you)...';
END $$;

-- Note: You'll need to run this separately or manually delete users
-- from the Supabase Authentication dashboard because auth.users
-- requires special permissions

-- ================================================
-- STEP 5: Reset sequences (optional, for clean IDs)
-- ================================================
-- This ensures new records start with clean IDs
-- Only run if your tables use sequences

-- ALTER SEQUENCE IF EXISTS employees_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS time_entries_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS breaks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS settings_id_seq RESTART WITH 1;

-- ================================================
-- STEP 6: Verify everything is clean
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Checking if database is clean...';
END $$;

SELECT 
  'employees' as table_name, 
  COUNT(*) as remaining_records,
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '⚠️  Still has data!' END as status
FROM employees
UNION ALL
SELECT 
  'time_entries', 
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '⚠️  Still has data!' END
FROM time_entries
UNION ALL
SELECT 
  'breaks', 
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '⚠️  Still has data!' END
FROM breaks
UNION ALL
SELECT 
  'settings', 
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ Clean' ELSE '⚠️  Still has data!' END
FROM settings;

-- ================================================
-- STEP 7: Verify RLS policies are still in place
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Checking RLS policies...';
END $$;

SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ Policies exist' ELSE '⚠️  No policies!' END as status
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
GROUP BY tablename
ORDER BY tablename;

-- ================================================
-- NEXT STEPS AFTER RUNNING THIS SCRIPT:
-- ================================================
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Manually delete all users EXCEPT your owner account
-- 3. Log in to the Ollie Timesheets app
-- 4. You'll be prompted to complete setup as a new owner
-- 5. Fill in your company information
-- 6. Add employees through the Settings page
-- 7. Send invitations to employees
-- 
-- IMPORTANT: Keep your owner email/password handy!
-- ================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Database reset complete!';
  RAISE NOTICE '📋 Next: Manually delete auth users from Supabase Dashboard';
  RAISE NOTICE '🚀 Then log in to the app and start fresh!';
END $$;




