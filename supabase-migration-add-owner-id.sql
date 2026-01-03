-- Migration: Add owner_id to employees and time_entries for multi-tenant data isolation
-- This ensures each company owner can only see their own data

-- Step 1: Add owner_id column to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Step 2: Add owner_id column to time_entries table  
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Step 3: Add owner_id column to breaks table (for consistency)
ALTER TABLE breaks ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Step 4: For existing data, set owner_id based on the settings table
-- (This assumes you want to keep existing data - adjust as needed for testing)
-- If you want to clear all existing data instead, uncomment the DELETE statements below:

-- DELETE FROM breaks;
-- DELETE FROM time_entries;
-- DELETE FROM employees;

-- Or, if you want to try to associate existing records with an owner:
-- UPDATE employees SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;
-- UPDATE time_entries SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;
-- UPDATE breaks SET owner_id = (SELECT owner_id FROM settings LIMIT 1) WHERE owner_id IS NULL;

-- Step 5: Make owner_id NOT NULL after data is populated (run this after confirming data is correct)
-- ALTER TABLE employees ALTER COLUMN owner_id SET NOT NULL;
-- ALTER TABLE time_entries ALTER COLUMN owner_id SET NOT NULL;
-- ALTER TABLE breaks ALTER COLUMN owner_id SET NOT NULL;

-- Step 6: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_owner_id ON employees(owner_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_owner_id ON time_entries(owner_id);
CREATE INDEX IF NOT EXISTS idx_breaks_owner_id ON breaks(owner_id);

-- Step 7: Add Row Level Security (RLS) policies to enforce data isolation at the database level
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own employees" ON employees;
DROP POLICY IF EXISTS "Users can only insert their own employees" ON employees;
DROP POLICY IF EXISTS "Users can only update their own employees" ON employees;
DROP POLICY IF EXISTS "Users can only delete their own employees" ON employees;

DROP POLICY IF EXISTS "Users can only see their own time_entries" ON time_entries;
DROP POLICY IF EXISTS "Users can only insert their own time_entries" ON time_entries;
DROP POLICY IF EXISTS "Users can only update their own time_entries" ON time_entries;
DROP POLICY IF EXISTS "Users can only delete their own time_entries" ON time_entries;

DROP POLICY IF EXISTS "Users can only see their own breaks" ON breaks;
DROP POLICY IF EXISTS "Users can only insert their own breaks" ON breaks;
DROP POLICY IF EXISTS "Users can only update their own breaks" ON breaks;
DROP POLICY IF EXISTS "Users can only delete their own breaks" ON breaks;

DROP POLICY IF EXISTS "Users can only see their own settings" ON settings;
DROP POLICY IF EXISTS "Users can only insert their own settings" ON settings;
DROP POLICY IF EXISTS "Users can only update their own settings" ON settings;

-- Employees policies
CREATE POLICY "Users can only see their own employees"
  ON employees FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only insert their own employees"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can only update their own employees"
  ON employees FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only delete their own employees"
  ON employees FOR DELETE
  USING (auth.uid() = owner_id);

-- Time entries policies
CREATE POLICY "Users can only see their own time_entries"
  ON time_entries FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only insert their own time_entries"
  ON time_entries FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can only update their own time_entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only delete their own time_entries"
  ON time_entries FOR DELETE
  USING (auth.uid() = owner_id);

-- Breaks policies
CREATE POLICY "Users can only see their own breaks"
  ON breaks FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only insert their own breaks"
  ON breaks FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can only update their own breaks"
  ON breaks FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only delete their own breaks"
  ON breaks FOR DELETE
  USING (auth.uid() = owner_id);

-- Settings policies (already have owner_id)
CREATE POLICY "Users can only see their own settings"
  ON settings FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can only insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can only update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = owner_id);

-- Note: After running this migration, you need to:
-- 1. Update your application code to always include owner_id in queries
-- 2. Test thoroughly with multiple accounts
-- 3. Consider running the NOT NULL constraint after verifying data integrity

