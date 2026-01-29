-- ================================================
-- ADD BOOKKEEPER COLUMN TO EMPLOYEES TABLE
-- ================================================
-- This migration adds the is_bookkeeper column to enable
-- view-only access to timesheets and pay periods.
-- Bookkeepers cannot edit hours, manage team, or access settings.
-- ================================================

-- Add is_bookkeeper column with default false
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS is_bookkeeper BOOLEAN DEFAULT false;

-- Ensure existing employees have is_bookkeeper set to false
UPDATE employees 
SET is_bookkeeper = false 
WHERE is_bookkeeper IS NULL;

-- Add NOT NULL constraint after setting defaults
ALTER TABLE employees 
ALTER COLUMN is_bookkeeper SET NOT NULL;

-- ================================================
-- VERIFY: Check the column was added
-- ================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employees' 
AND column_name = 'is_bookkeeper';
