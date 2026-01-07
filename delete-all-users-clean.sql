-- ================================================
-- FORCE DELETE ALL AUTH USERS - READY TO RUN
-- ================================================
-- This will delete ALL auth users including yours
-- You'll need to create a new owner account after
-- ================================================

DO $$ 
DECLARE
  user_record RECORD;
  deleted_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🗑️  DELETING ALL AUTH USERS...';
  
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
  
  RAISE NOTICE '✅ Attempted to delete % auth users', deleted_count;
END $$;

-- Check remaining users
SELECT COUNT(*) as remaining_users FROM auth.users;

-- ================================================
-- IF THE ABOVE FAILS, RUN THIS NUCLEAR OPTION:
-- ================================================
-- Disable triggers, delete, re-enable

-- Step 1: Disable triggers
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Step 2: Delete all users
DELETE FROM auth.users;

-- Step 3: Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- Step 4: Verify
SELECT COUNT(*) as remaining_users FROM auth.users;

-- ================================================
-- AFTER THIS RUNS:
-- ================================================
-- 1. Go to Ollie Timesheets app
-- 2. Click "Sign Up" 
-- 3. Create a new owner account
-- 4. Set up your company fresh
-- ================================================


