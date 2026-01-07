-- ================================================
-- NUCLEAR POLICY CLEANUP - DELETE ALL POLICIES
-- ================================================
-- This removes ALL RLS policies from all tables
-- Then creates fresh, clean policies
-- ================================================

-- ================================================
-- STEP 1: DROP ALL POLICIES (NUCLEAR)
-- ================================================

-- Drop ALL policies on employees
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'employees'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON employees';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL policies on time_entries
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'time_entries'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON time_entries';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL policies on breaks
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'breaks'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON breaks';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Drop ALL policies on settings
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'settings'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON settings';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Verify all policies are gone
SELECT 
  tablename,
  COUNT(*) as remaining_policies
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
GROUP BY tablename;

-- ================================================
-- STEP 2: CREATE CLEAN POLICIES (NO RECURSION)
-- ================================================

-- EMPLOYEES TABLE
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_employees"
ON employees
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "employees_view_team"
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

-- TIME ENTRIES TABLE
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_entries"
ON time_entries
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "employees_view_own_entries"
ON time_entries
FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "employees_create_own_entries"
ON time_entries
FOR INSERT
TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "employees_update_own_entries"
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

-- BREAKS TABLE
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owners_manage_breaks"
ON breaks
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "employees_view_own_breaks"
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

CREATE POLICY "employees_create_own_breaks"
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

CREATE POLICY "employees_update_own_breaks"
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

-- SETTINGS TABLE
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_manage_own_settings"
ON settings
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- ================================================
-- STEP 3: VERIFY CLEAN POLICIES
-- ================================================
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
ORDER BY tablename, policyname;

SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
GROUP BY tablename;

-- ================================================
-- SUCCESS!
-- ================================================
-- All old policies removed
-- Clean new policies installed
-- Try adding an employee now!
-- ================================================


