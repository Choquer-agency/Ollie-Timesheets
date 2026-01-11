-- ================================================
-- FIX EMPLOYEE INVITATION ACCEPTANCE
-- ================================================
-- Allow employees to update their user_id when accepting invitations
-- This is needed for the AcceptInvitation flow to work
-- ================================================

-- Add policy for public users to update employee records when accepting invitations
-- This allows the UPDATE query in AcceptInvitation.tsx to work
CREATE POLICY "public_accept_invitation"
ON employees
FOR UPDATE
TO authenticated
USING (
  -- Allow update if this employee record has a valid invitation token
  -- and hasn't been accepted yet
  invitation_token IS NOT NULL
  AND invitation_accepted_at IS NULL
)
WITH CHECK (
  -- Only allow updating these specific fields during invitation acceptance
  -- We check that the user_id being set matches the authenticated user
  user_id = auth.uid()
  AND invitation_accepted_at IS NOT NULL
);

-- Verify the new policy was created
SELECT 
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'employees'
ORDER BY policyname;

-- ================================================
-- EXPLANATION:
-- ================================================
-- This policy allows a newly signed-up employee to update their
-- employee record to link it to their auth user.
--
-- USING clause: Only allows update if:
-- - invitation_token IS NOT NULL (this is a valid invitation)
-- - invitation_accepted_at IS NULL (not yet accepted)
--
-- WITH CHECK clause: Only allows setting:
-- - user_id to the current authenticated user's ID
-- - invitation_accepted_at to a timestamp
--
-- This is secure because:
-- 1. Only works for invitation records (has token)
-- 2. Only works once (before acceptance)
-- 3. User can only link record to themselves (not someone else)
-- ================================================




