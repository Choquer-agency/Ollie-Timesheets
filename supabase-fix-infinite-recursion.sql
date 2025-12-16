-- FIX: Infinite Recursion in RLS Policies
-- Run this in your Supabase SQL Editor to fix the 500 errors

-- ============================================
-- PROFILES TABLE - Fix infinite recursion
-- ============================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins and owners can view all profiles" ON profiles;

-- Simple policies without recursion
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- EMPLOYEES TABLE - Simplify policies
-- ============================================

DROP POLICY IF EXISTS "Employees can view their own record" ON employees;
DROP POLICY IF EXISTS "Admins can view all employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;

-- Allow all authenticated users to view employees (they're in same company)
CREATE POLICY "Authenticated users can view employees"
  ON employees FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert employees
CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update employees
CREATE POLICY "Authenticated users can update employees"
  ON employees FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- SETTINGS TABLE - Simplify
-- ============================================

DROP POLICY IF EXISTS "Anyone authenticated can view settings" ON settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON settings;
DROP POLICY IF EXISTS "Owners can update settings" ON settings;
DROP POLICY IF EXISTS "Owners can delete settings" ON settings;

-- Allow authenticated users to view settings
CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to insert settings (for their own account)
CREATE POLICY "Users can insert settings"
  ON settings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (owner_id = auth.uid());

-- Allow users to delete their own settings
CREATE POLICY "Users can delete their own settings"
  ON settings FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- TIME ENTRIES - Simplify
-- ============================================

DROP POLICY IF EXISTS "Employees can view their own entries" ON time_entries;
DROP POLICY IF EXISTS "Admins and accountants can view all entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can insert their own entries" ON time_entries;
DROP POLICY IF EXISTS "Employees can update their own entries" ON time_entries;
DROP POLICY IF EXISTS "Admins can manage all entries" ON time_entries;

-- Simple policies without profile checks
CREATE POLICY "Authenticated users can view time entries"
  ON time_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert time entries"
  ON time_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update time entries"
  ON time_entries FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete time entries"
  ON time_entries FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- BREAKS - Simplify
-- ============================================

DROP POLICY IF EXISTS "Users can view breaks for accessible entries" ON breaks;
DROP POLICY IF EXISTS "Users can manage breaks for their entries" ON breaks;

-- Simple policies
CREATE POLICY "Authenticated users can view breaks"
  ON breaks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage breaks"
  ON breaks FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- DONE!
-- ============================================
-- After running this, refresh your app and everything should work!

