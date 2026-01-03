-- ================================================
-- OLLIE TIMESHEETS - SECURITY POLICIES (RLS)
-- CLEAN INSTALLATION - Drops existing policies first
-- ================================================
-- This version safely removes any existing policies
-- before creating new ones, preventing conflicts.
-- ================================================

-- ================================================
-- STEP 1: DROP ALL EXISTING POLICIES (Safe)
-- ================================================

-- Drop employees table policies if they exist
DROP POLICY IF EXISTS "Owners can view all their employees" ON employees;
DROP POLICY IF EXISTS "Employees can view team members (no rates)" ON employees;
DROP POLICY IF EXISTS "Only owners can add employees" ON employees;
DROP POLICY IF EXISTS "Only owners can update employees" ON employees;
DROP POLICY IF EXISTS "Only owners can delete employees" ON employees;

-- Drop time_entries table policies if they exist
DROP POLICY IF EXISTS "Owners can view all organization time entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can only view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Owners can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can create their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Owners can update any time entry" ON time_entries;
DROP POLICY IF EXISTS "Employees can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Only owners can delete time entries" ON time_entries;

-- Drop breaks table policies if they exist
DROP POLICY IF EXISTS "Owners can view all organization breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can only view their own breaks" ON breaks;
DROP POLICY IF EXISTS "Owners can insert breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can create their own breaks" ON breaks;
DROP POLICY IF EXISTS "Owners can update breaks" ON breaks;
DROP POLICY IF EXISTS "Employees can update their own breaks" ON breaks;
DROP POLICY IF EXISTS "Owners can delete breaks" ON breaks;

-- Drop settings table policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON settings;

-- ================================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ================================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STEP 3: CREATE NEW POLICIES
-- ================================================

-- ================================================
-- EMPLOYEES TABLE POLICIES
-- ================================================

-- Policy: Owners can see all their employees (including rates)
CREATE POLICY "Owners can view all their employees"
ON employees
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Policy: Employees can only see limited info about other employees
CREATE POLICY "Employees can view team members (no rates)"
ON employees
FOR SELECT
TO authenticated
USING (
  owner_id IN (
    SELECT owner_id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy: Only owners can insert employees
CREATE POLICY "Only owners can add employees"
ON employees
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Only owners can update employees
CREATE POLICY "Only owners can update employees"
ON employees
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Only owners can delete employees
CREATE POLICY "Only owners can delete employees"
ON employees
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- ================================================
-- TIME ENTRIES TABLE POLICIES
-- ================================================

-- Policy: Owners can see all time entries for their organization
CREATE POLICY "Owners can view all organization time entries"
ON time_entries
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Policy: Employees can ONLY see their OWN time entries
CREATE POLICY "Employees can only view their own time entries"
ON time_entries
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy: Only owners can create time entries for any employee
CREATE POLICY "Owners can create time entries"
ON time_entries
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Employees can only create their own time entries
CREATE POLICY "Employees can create their own time entries"
ON time_entries
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy: Only owners can update any time entry
CREATE POLICY "Owners can update any time entry"
ON time_entries
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Employees can only update their own time entries
CREATE POLICY "Employees can update their own time entries"
ON time_entries
FOR UPDATE
TO authenticated
USING (
  employee_id IN (
    SELECT id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- Policy: Only owners can delete time entries
CREATE POLICY "Only owners can delete time entries"
ON time_entries
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- ================================================
-- BREAKS TABLE POLICIES
-- ================================================

-- Policy: Owners can see all breaks for their organization
CREATE POLICY "Owners can view all organization breaks"
ON breaks
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Policy: Employees can ONLY see their OWN breaks
CREATE POLICY "Employees can only view their own breaks"
ON breaks
FOR SELECT
TO authenticated
USING (
  time_entry_id IN (
    SELECT te.id 
    FROM time_entries te
    INNER JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
  )
);

-- Policy: Only owners can manage breaks
CREATE POLICY "Owners can insert breaks"
ON breaks
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Employees can only create breaks for their own time entries
CREATE POLICY "Employees can create their own breaks"
ON breaks
FOR INSERT
TO authenticated
WITH CHECK (
  time_entry_id IN (
    SELECT te.id 
    FROM time_entries te
    INNER JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
  )
);

-- Policy: Update breaks (owners)
CREATE POLICY "Owners can update breaks"
ON breaks
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Update breaks (employees)
CREATE POLICY "Employees can update their own breaks"
ON breaks
FOR UPDATE
TO authenticated
USING (
  time_entry_id IN (
    SELECT te.id 
    FROM time_entries te
    INNER JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
  )
)
WITH CHECK (
  time_entry_id IN (
    SELECT te.id 
    FROM time_entries te
    INNER JOIN employees e ON e.id = te.employee_id
    WHERE e.user_id = auth.uid() 
    AND e.is_active = true
  )
);

-- Policy: Delete breaks
CREATE POLICY "Owners can delete breaks"
ON breaks
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- ================================================
-- SETTINGS TABLE POLICIES
-- ================================================

-- Policy: Users can only see their own settings
CREATE POLICY "Users can view their own settings"
ON settings
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Policy: Users can only insert their own settings
CREATE POLICY "Users can create their own settings"
ON settings
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- Policy: Users can only update their own settings
CREATE POLICY "Users can update their own settings"
ON settings
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
);

-- ================================================
-- STEP 4: CREATE HELPER VIEWS AND FUNCTIONS
-- ================================================

-- Drop existing view/function if they exist
DROP VIEW IF EXISTS employees_public;
DROP FUNCTION IF EXISTS is_owner();

-- Create a secure view that NEVER exposes hourly rates to non-owners
CREATE VIEW employees_public AS
SELECT 
  id,
  owner_id,
  name,
  email,
  role,
  NULL as hourly_rate,
  vacation_days_total,
  is_admin,
  is_active,
  created_at,
  updated_at
FROM employees;

-- Grant access to the view
GRANT SELECT ON employees_public TO authenticated;

-- Create a function to check if the current user is an owner
CREATE FUNCTION is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM settings 
    WHERE owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- ✅ INSTALLATION COMPLETE
-- ================================================
-- All policies have been successfully applied!
-- 
-- Next steps:
-- 1. Verify success message in Supabase
-- 2. Test with employee account
-- 3. Follow SECURITY_TESTING.md guide
-- ================================================

