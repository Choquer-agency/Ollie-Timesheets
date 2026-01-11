-- ================================================
-- CHECK CURRENT RLS POLICIES
-- ================================================
-- This script shows all current policies to verify the fix
-- ================================================

-- Show all policies for employees and settings tables
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename IN ('employees', 'settings')
ORDER BY tablename, policyname;

-- ================================================
-- EXPECTED POLICIES:
-- ================================================
-- EMPLOYEES table should have:
-- 1. owner_full_access (FOR ALL, owner_id = auth.uid())
-- 2. employee_read_own_record (FOR SELECT, user_id = auth.uid())
--
-- SETTINGS table should have:
-- 1. owner_only (FOR ALL, owner_id = auth.uid())
-- 2. employee_read_owner_settings (FOR SELECT, owner_id IN (...))
-- ================================================




