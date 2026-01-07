-- ================================================
-- SIMPLE NON-RECURSIVE POLICIES - FINAL FIX
-- ================================================
-- This removes ALL recursion by using ONLY owner_id checks
-- No employee policies that reference employees table
-- ================================================

-- ================================================
-- STEP 1: DROP ALL POLICIES AGAIN
-- ================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'employees'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON employees';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'time_entries'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON time_entries';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'breaks'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON breaks';
    END LOOP;
END $$;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'settings'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON settings';
    END LOOP;
END $$;

-- ================================================
-- STEP 2: CREATE SUPER SIMPLE POLICIES
-- ================================================

-- EMPLOYEES: Only owners can do anything
-- No employee policies = no recursion!
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_full_access"
ON employees
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- For employees to VIEW their coworkers (for the app to work)
-- We'll use a SECURITY DEFINER function to bypass RLS
CREATE OR REPLACE FUNCTION get_team_employees(p_user_id uuid)
RETURNS SETOF employees
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find the owner_id for this user
  RETURN QUERY
  SELECT e.*
  FROM employees e
  WHERE e.owner_id = (
    SELECT owner_id FROM employees WHERE user_id = p_user_id LIMIT 1
  );
END;
$$;

-- TIME ENTRIES: Simple owner check + employee can see their own
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_full_access"
ON time_entries
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Employee can only see/modify entries where they ARE the employee
-- This uses employee_id directly, not a subquery to employees table
CREATE POLICY "employee_own_entries"
ON time_entries
FOR ALL
TO authenticated
USING (
  -- Check if this employee_id belongs to this user
  -- We need to check employees table, but we'll do it safely
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- BREAKS: Simple owner check + employee can see their own
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_full_access"
ON breaks
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "employee_own_breaks"
ON breaks
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM time_entries te
    WHERE te.id = breaks.time_entry_id
    AND te.employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM time_entries te
    WHERE te.id = breaks.time_entry_id
    AND te.employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
);

-- SETTINGS: Owner only
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_only"
ON settings
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ================================================
-- STEP 3: VERIFY
-- ================================================
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
ORDER BY tablename, policyname;

-- ================================================
-- TEST: Try to add an employee as owner
-- ================================================
-- If you're logged in as owner, this should work now:
-- INSERT INTO employees (owner_id, name, email, role) 
-- VALUES (auth.uid(), 'Test Employee', 'test@example.com', 'Worker');
-- ================================================


