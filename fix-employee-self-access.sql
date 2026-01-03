-- ================================================
-- FIX EMPLOYEE SELF-ACCESS
-- ================================================
-- This adds policies allowing employees to:
-- 1. Read their own employee record
-- 2. Read their owner's settings (company name, logo, etc.)
-- This is needed for employees to log in after accepting an invitation
-- ================================================

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "employee_read_own_record" ON employees;
DROP POLICY IF EXISTS "employee_read_owner_settings" ON settings;

-- Add policy for employees to read their own record
CREATE POLICY "employee_read_own_record"
ON employees
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add policy for employees to read their owner's settings
-- Employees need to see company name, logo, etc.
CREATE POLICY "employee_read_owner_settings"
ON settings
FOR SELECT
TO authenticated
USING (
  owner_id IN (
    SELECT owner_id FROM employees WHERE user_id = auth.uid()
  )
);

-- Verify the new policies were created
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('employees', 'settings')
ORDER BY tablename, policyname;

-- ================================================
-- EXPLANATION:
-- ================================================
-- These policies allow employees to access their own data:
-- 
-- 1. employee_read_own_record: 
--    Employees can read ONLY their own employee record (user_id = auth.uid())
-- 
-- 2. employee_read_owner_settings:
--    Employees can read their owner's settings (company name, logo, etc.)
--    by looking up their owner_id from their employee record
-- 
-- This fixes the issue where:
-- 1. Business owner invites employee
-- 2. Employee accepts invitation and sets password
-- 3. Employee's user_id is linked to the employee record
-- 4. Employee logs in but gets 406 errors trying to read employees/settings
-- 5. App thinks employee needs to complete business setup (wrong!)
-- 6. Employee is incorrectly redirected to business setup page
--
-- With these policies:
-- - Employees can read their own record AND their owner's settings
-- - Owners can still read/write all their employees and settings
-- - No recursion issues because we're checking user_id/owner_id directly
-- ================================================

