-- ================================================
-- FIX EMPLOYEE ACCESS ISSUES
-- ================================================
-- This script diagnoses and fixes employee login issues
-- Run this in your Supabase SQL Editor
-- ================================================

-- STEP 1: Check if employees have user_id set
-- This shows which employees might have login issues
SELECT 
  id,
  name,
  email,
  user_id,
  is_active,
  CASE 
    WHEN user_id IS NULL THEN '⚠️  NO USER_ID - Cannot log in'
    WHEN NOT is_active THEN '⚠️  INACTIVE - Cannot log in'
    ELSE '✅ OK'
  END as status
FROM employees
ORDER BY created_at DESC;

-- STEP 2: Check auth users vs employees
-- This shows if there are auth users without employee records
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  e.id as employee_id,
  e.name as employee_name,
  e.user_id as employee_user_id,
  CASE 
    WHEN e.id IS NULL THEN '⚠️  Auth user has no employee record'
    WHEN e.user_id IS NULL THEN '⚠️  Employee record missing user_id'
    WHEN e.user_id != au.id THEN '⚠️  user_id mismatch!'
    ELSE '✅ Properly linked'
  END as link_status
FROM auth.users au
LEFT JOIN employees e ON e.user_id = au.id OR LOWER(e.email) = LOWER(au.email)
ORDER BY au.created_at DESC;

-- STEP 3: Fix missing user_id links (dry run - shows what would be updated)
-- This matches employees to auth users by email
SELECT 
  e.id as employee_id,
  e.name as employee_name,
  e.email as employee_email,
  au.id as matching_auth_user_id,
  au.email as matching_auth_email,
  'UPDATE employees SET user_id = ''' || au.id || ''' WHERE id = ''' || e.id || ''';' as suggested_fix
FROM employees e
INNER JOIN auth.users au ON LOWER(e.email) = LOWER(au.email)
WHERE e.user_id IS NULL
  AND e.is_active = true;

-- STEP 4: Actually fix the links (UNCOMMENT TO RUN)
-- WARNING: Only run this after reviewing Step 3 results
/*
UPDATE employees e
SET user_id = au.id
FROM auth.users au
WHERE LOWER(e.email) = LOWER(au.email)
  AND e.user_id IS NULL
  AND e.is_active = true;
*/

-- STEP 5: Verify RLS policies are allowing employee access
-- Check if the RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
ORDER BY tablename, policyname;

-- ================================================
-- INSTRUCTIONS:
-- ================================================
-- 1. Run STEP 1 to see which employees have issues
-- 2. Run STEP 2 to see auth user linkages
-- 3. Run STEP 3 to see suggested fixes (doesn't change anything)
-- 4. If Step 3 looks good, UNCOMMENT and run STEP 4 to fix
-- 5. Run STEP 5 to verify RLS policies are in place
-- ================================================




