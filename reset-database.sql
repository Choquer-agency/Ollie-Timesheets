-- =====================================================
-- OLLIE TIMESHEETS - DATABASE RESET SCRIPT
-- =====================================================
-- This script deletes ALL data from your database
-- Use this to start fresh and test features from scratch
-- ⚠️ WARNING: This is irreversible! Make a backup first if needed.
-- =====================================================

-- Step 1: Delete breaks first (child of time_entries)
DELETE FROM breaks;

-- Step 2: Delete time_entries (child of employees)
DELETE FROM time_entries;

-- Step 3: Delete employees (references auth.users but is nullable)
DELETE FROM employees;

-- Step 4: Delete settings (references auth.users via owner_id)
DELETE FROM settings;

-- Step 5: Delete profiles (if it exists - references auth.users)
DELETE FROM profiles;

-- Step 6: Delete all auth users (this will cascade if RLS allows)
-- Note: You may need to do this from the Supabase dashboard
-- under Authentication > Users if RLS prevents direct deletion
DELETE FROM auth.users;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run these queries to confirm everything is deleted:

-- SELECT COUNT(*) as breaks_count FROM breaks;
-- SELECT COUNT(*) as time_entries_count FROM time_entries;
-- SELECT COUNT(*) as employees_count FROM employees;
-- SELECT COUNT(*) as settings_count FROM settings;
-- SELECT COUNT(*) as profiles_count FROM profiles;
-- SELECT COUNT(*) as users_count FROM auth.users;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- After running this script:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" to create your business owner account
-- 3. Auto-confirm the user
-- 4. Add metadata: {"full_name": "Your Name", "role": "owner"}
-- 5. Log in to your app with the new credentials
-- 6. Upload your company logo in settings
-- 7. Add a new employee with an email
-- 8. Check that the invitation email has your logo!
-- =====================================================

