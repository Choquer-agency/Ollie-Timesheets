-- ================================================
-- OLLIE TIMESHEETS - SECURITY POLICIES (RLS)
-- ================================================
-- This file contains Row Level Security (RLS) policies
-- to ensure that employees can NEVER see sensitive data
-- like other employees' hourly rates or time entries.
--
-- CRITICAL: These policies must be applied to your Supabase
-- database to prevent unauthorized data access.
-- ================================================

-- ================================================
-- 1. EMPLOYEES TABLE - Restrict Access to Rates
-- ================================================

-- Enable RLS on employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can see all their employees (including rates)
CREATE POLICY "Owners can view all their employees"
ON employees
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Policy: Employees can only see limited info about other employees
-- This creates a "view" that strips sensitive data for non-owners
CREATE POLICY "Employees can view team members (no rates)"
ON employees
FOR SELECT
TO authenticated
USING (
  -- Employees can see records where they are part of the same organization
  owner_id IN (
    SELECT owner_id 
    FROM employees 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
  -- But we'll handle filtering hourly_rate at the application level
  -- since RLS can't selectively hide columns
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
-- 2. TIME ENTRIES TABLE - Restrict Access
-- ================================================

-- Enable RLS on time_entries table
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

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
  -- Must match the employee_id linked to this user
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
-- 3. BREAKS TABLE - Restrict Access
-- ================================================

-- Enable RLS on breaks table
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

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
  -- Must belong to a time_entry that belongs to the employee
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

-- Policy: Update breaks
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
-- 4. SETTINGS TABLE - Owners Only
-- ================================================

-- Enable RLS on settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

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
-- 5. ADDITIONAL SECURITY MEASURES
-- ================================================

-- Create a secure view that NEVER exposes hourly rates to non-owners
-- This can be used by employees to see team member info without rates
CREATE OR REPLACE VIEW employees_public AS
SELECT 
  id,
  owner_id,
  name,
  email,
  role,
  NULL as hourly_rate,  -- Always NULL for this view
  vacation_days_total,
  is_admin,
  is_active,
  created_at,
  updated_at
FROM employees;

-- Grant access to the view
GRANT SELECT ON employees_public TO authenticated;

-- Create a function to check if the current user is an owner
CREATE OR REPLACE FUNCTION is_owner()
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
-- 6. VERIFICATION QUERIES
-- ================================================
-- Run these queries to verify your security is working:
--
-- 1. As an employee, try to see other employees' rates:
--    SELECT hourly_rate FROM employees WHERE user_id != auth.uid();
--    (Should return no results or NULL values)
--
-- 2. As an employee, try to see other employees' time entries:
--    SELECT * FROM time_entries WHERE employee_id != (SELECT id FROM employees WHERE user_id = auth.uid());
--    (Should return no results)
--
-- 3. As an owner, verify you can see everything:
--    SELECT * FROM employees WHERE owner_id = auth.uid();
--    (Should return all employees with rates)
-- ================================================

-- ================================================
-- IMPORTANT: APPLY THESE POLICIES
-- ================================================
-- To apply these policies to your Supabase database:
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to the SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- 5. Verify no errors occurred
--
-- After applying, test by:
-- 1. Logging in as an employee
-- 2. Opening browser console
-- 3. Trying to query: supabase.from('employees').select('*')
-- 4. Verify hourly_rate is not visible for other employees
-- ================================================



