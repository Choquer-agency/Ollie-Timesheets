-- Debug query to check what's happening with user da7063e1-8c5a-4ecd-8559-94f20175320b
-- Run this to see the actual data

-- 1. Check if this user exists in auth
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as metadata_role
FROM auth.users
WHERE id = 'da7063e1-8c5a-4ecd-8559-94f20175320b';

-- 2. Check if there's an employee record
SELECT 
  id,
  name,
  email,
  user_id,
  owner_id,
  invitation_token,
  invitation_accepted_at,
  is_active
FROM employees
WHERE user_id = 'da7063e1-8c5a-4ecd-8559-94f20175320b'
   OR email = 'hello@penni.ca';

-- 3. Check what auth.uid() returns when this user is logged in
-- (This can only be run when logged in as that user)
SELECT auth.uid();

-- 4. Test if the RLS policy is working
-- Try to select as this specific user (requires RLS bypass)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"da7063e1-8c5a-4ecd-8559-94f20175320b"}';
SELECT * FROM employees WHERE user_id = 'da7063e1-8c5a-4ecd-8559-94f20175320b';
RESET ROLE;


