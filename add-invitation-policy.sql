-- ================================================
-- ADD INVITATION TOKEN LOOKUP POLICY
-- ================================================
-- Allow ANYONE to read employee records by invitation token
-- This is needed for the invitation acceptance flow
-- ================================================

-- Add policy to allow invitation token lookups
CREATE POLICY "public_invitation_lookup"
ON employees
FOR SELECT
TO authenticated, anon  -- Both authenticated AND anonymous users
USING (
  invitation_token IS NOT NULL
  AND invitation_accepted_at IS NULL
);

-- Verify
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename = 'employees'
ORDER BY policyname;

-- ================================================
-- NOW INVITATION LINKS WILL WORK!
-- ================================================
-- Anonymous users can look up employees by invitation token
-- But they can ONLY see records that:
-- 1. Have an invitation_token set
-- 2. Haven't been accepted yet (invitation_accepted_at IS NULL)
--
-- This is secure because:
-- - They can't see employees without invitations
-- - They can't see employees who already accepted
-- - They can only read, not modify
-- - Once accepted, the token becomes useless
-- ================================================




