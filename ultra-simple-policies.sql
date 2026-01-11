-- ================================================
-- ABSOLUTE SIMPLEST POLICIES - NO RECURSION POSSIBLE
-- ================================================
-- Strategy: ONLY check owner_id, nothing else
-- Let the application handle employee-level filtering
-- ================================================

-- Drop everything
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'employees'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON employees'; END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'time_entries'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON time_entries'; END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'breaks'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON breaks'; END LOOP;
    
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'settings'
    LOOP EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON settings'; END LOOP;
END $$;

-- ================================================
-- ULTRA SIMPLE: Everyone can access their owner's data
-- The app will handle what employees can actually see
-- ================================================

-- Function to check if user is part of an organization (owner OR employee)
CREATE OR REPLACE FUNCTION user_owner_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  -- If user is an owner, return their ID
  -- If user is an employee, return their owner's ID
  SELECT COALESCE(
    (SELECT owner_id FROM settings WHERE owner_id = auth.uid() LIMIT 1),
    (SELECT owner_id FROM employees WHERE user_id = auth.uid() LIMIT 1)
  );
$$;

-- EMPLOYEES
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access"
ON employees
FOR ALL
TO authenticated
USING (owner_id = user_owner_id())
WITH CHECK (owner_id = user_owner_id());

-- TIME ENTRIES  
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access"
ON time_entries
FOR ALL
TO authenticated
USING (owner_id = user_owner_id())
WITH CHECK (owner_id = user_owner_id());

-- BREAKS
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_access"
ON breaks
FOR ALL
TO authenticated
USING (owner_id = user_owner_id())
WITH CHECK (owner_id = user_owner_id());

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_only"
ON settings
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Verify
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE tablename IN ('employees', 'time_entries', 'breaks', 'settings')
GROUP BY tablename;

-- ================================================
-- THIS WORKS BECAUSE:
-- - user_owner_id() function is SECURITY DEFINER (bypasses RLS)
-- - It only checks settings and employees tables ONCE
-- - No recursive policy checks
-- - App handles employee-specific filtering (like hiding hourly rates)
-- ================================================




