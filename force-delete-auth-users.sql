-- ================================================
-- FORCE DELETE AUTH USERS - NUCLEAR OPTION
-- ================================================
-- This script forcefully deletes auth users
-- Use when standard dashboard deletion fails
-- ================================================

-- OPTION 1: Delete auth users except the one you're using
-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with YOUR owner email
DO $$ 
DECLARE
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🗑️  Force deleting auth users...';
  
  -- Loop through all users except your owner account
  FOR user_record IN 
    SELECT id, email 
    FROM auth.users 
    WHERE email != 'YOUR_EMAIL@EXAMPLE.COM'  -- CHANGE THIS TO YOUR EMAIL!
  LOOP
    BEGIN
      -- Delete from auth.users
      DELETE FROM auth.users WHERE id = user_record.id;
      deleted_count := deleted_count + 1;
      RAISE NOTICE 'Deleted: % (%)', user_record.email, user_record.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to delete: % - Error: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '✅ Deleted % auth users', deleted_count;
END $$;

-- ================================================
-- OPTION 2: Delete ALL auth users (including yours!)
-- WARNING: This will lock you out! Only use if you plan
-- to create a completely new owner account
-- ================================================
-- UNCOMMENT BELOW TO DELETE EVERYONE INCLUDING YOURSELF:
/*
DO $$ 
DECLARE
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🗑️  DELETING ALL AUTH USERS (INCLUDING YOU!)';
  
  FOR user_record IN 
    SELECT id, email FROM auth.users
  LOOP
    BEGIN
      DELETE FROM auth.users WHERE id = user_record.id;
      deleted_count := deleted_count + 1;
      RAISE NOTICE 'Deleted: % (%)', user_record.email, user_record.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to delete: % - Error: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '✅ Deleted % auth users', deleted_count;
  RAISE NOTICE '⚠️  You will need to create a new account!';
END $$;
*/

-- ================================================
-- OPTION 3: List all users first (to see what will be deleted)
-- ================================================
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email = 'YOUR_EMAIL@EXAMPLE.COM' THEN '⚠️  YOUR ACCOUNT - KEEP THIS!'
    ELSE '🗑️  Will be deleted'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ================================================
-- OPTION 4: If nothing else works - disable auth.users table entirely
-- Then re-enable after cleanup (EXTREME - USE AS LAST RESORT)
-- ================================================
/*
-- Disable all triggers on auth.users
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Delete users
DELETE FROM auth.users WHERE email != 'YOUR_EMAIL@EXAMPLE.COM';

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;
*/

-- ================================================
-- VERIFICATION: Check if users are deleted
-- ================================================
DO $$ 
BEGIN
  RAISE NOTICE '📊 Remaining auth users: %', (SELECT COUNT(*) FROM auth.users);
END $$;

SELECT COUNT(*) as remaining_users FROM auth.users;

-- ================================================
-- INSTRUCTIONS:
-- ================================================
-- 1. First run OPTION 3 to see all users
-- 2. Edit OPTION 1 and change 'YOUR_EMAIL@EXAMPLE.COM' to YOUR actual email
-- 3. Run OPTION 1 to delete all users except yours
-- 4. If OPTION 1 fails, try OPTION 4 (disable triggers)
-- 5. Run verification to confirm
-- 
-- If you're locked out after this:
-- - Go to Supabase Dashboard → Authentication → Users
-- - Use "Invite User" to create a new account
-- - Or sign up fresh through the app
-- ================================================


