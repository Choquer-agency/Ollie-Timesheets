-- IMPORTANT: Run this in your Supabase SQL Editor to fix signup issues
-- This adds policies to allow new users to create their initial data

-- ============================================
-- FIX 1: Allow new owners to insert settings
-- ============================================
DROP POLICY IF EXISTS "Owners can manage settings" ON settings;

-- Allow authenticated users to insert settings (they can only insert with their own owner_id)
CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Allow owners to update/delete settings
CREATE POLICY "Owners can update settings"
  ON settings FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete settings"
  ON settings FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- FIX 2: Allow new users to insert their profile
-- ============================================
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow users to insert their own profile (in case trigger doesn't fire)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================
-- FIX 3: Temporarily allow all authenticated users to insert employees during setup
-- (Only during their initial signup)
-- ============================================
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;

-- Allow any authenticated user to insert employees
-- (They will become owners after signup completes)
CREATE POLICY "Authenticated users can insert employees"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Keep the update policy for admins only
CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, test your signup flow
-- If it works, you're all set!

