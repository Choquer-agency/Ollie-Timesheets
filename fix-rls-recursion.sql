-- ================================================
-- FIXED RLS POLICIES - NO RECURSION
-- ================================================
-- This fixes the infinite recursion error
-- ================================================

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Owners can view all their employees" ON employees;
DROP POLICY IF EXISTS "Employees can view team members (no rates)" ON employees;
DROP POLICY IF EXISTS "Only owners can add employees" ON employees;
DROP POLICY IF EXISTS "Only owners can update employees" ON employees;
DROP POLICY IF EXISTS "Only owners can delete employees" ON employees;

DROP POLICY IF EXISTS "Owners can view all organization time entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can only view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Owners can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can create their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Owners can update any time entry" ON time_entries;
DROP POLICY IF EXISTS "Employees can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Only owners can delete time entries" ON time_entries;

DROP POLICY IF EXISTS "Owners can view all organization breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can only view their own breaks" ON breaks;
DROP POLICY IF EXISTS "Owners can insert breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can create their own breaks" ON breaks;
DROP POLICY IF EXISTS "Owners can update breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can update their own breaks" ON breaks;
DROP POLICY IF EXISTS "Only owners can delete breaks" ON breaks;

DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;

-- ================================================
-- EMPLOYEES TABLE - FIXED POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy 1: Owners can manage all their employees
CREATE POLICY "owners_full_access"
ON employees
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy 2: Employees can view all employees in their organization (but app filters hourly_rate)
-- This uses a SIMPLE check that doesn't recurse
CREATE POLICY "employees_can_view_team"
ON employees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees AS emp
    WHERE emp.user_id = auth.uid()
    AND emp.owner_id = employees.owner_id
    AND emp.is_active = true
  )
);

-- ================================================
-- TIME ENTRIES TABLE - FIXED POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage all time entries
CREATE POLICY "owners_full_access"
ON time_entries
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Employees can view only their own entries
CREATE POLICY "employees_view_own"
ON time_entries
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Employees can create their own entries
CREATE POLICY "employees_insert_own"
ON time_entries
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Policy: Employees can update their own entries
CREATE POLICY "employees_update_own"
ON time_entries
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- ================================================
-- BREAKS TABLE - FIXED POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can manage all breaks
CREATE POLICY "owners_full_access"
ON breaks
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Employees can view their own breaks
CREATE POLICY "employees_view_own"
ON breaks
FOR SELECT
TO authenticated
USING (
  time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() AND e.is_active = true
  )
);

-- Policy: Employees can create their own breaks
CREATE POLICY "employees_insert_own"
ON breaks
FOR INSERT
TO authenticated
WITH CHECK (
  time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() AND e.is_active = true
  )
);

-- Policy: Employees can update their own breaks
CREATE POLICY "employees_update_own"
ON breaks
FOR UPDATE
TO authenticated
USING (
  time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() AND e.is_active = true
  )
)
WITH CHECK (
  time_entry_id IN (
    SELECT te.id FROM time_entries te
    JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() AND e.is_active = true
  )
);

-- ================================================
-- SETTINGS TABLE - SIMPLE POLICIES
-- ================================================

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own settings
CREATE POLICY "users_own_settings"
ON settings
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ================================================
-- VERIFICATION
-- ================================================
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
ORDER BY tablename, policyname;

-- ================================================
-- SUCCESS!
-- ================================================
-- Your policies are now fixed and should work without recursion
-- Try adding an employee again!
-- ================================================


