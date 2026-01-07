-- Debug query to check what's happening with the invited employee
-- Replace the email with the employee's actual email

-- 1. Check auth users
SELECT 
  id as auth_user_id,
  email,
  raw_user_meta_data->>'role' as metadata_role,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users
WHERE email = 'emily@penni.ca'  -- REPLACE WITH ACTUAL EMPLOYEE EMAIL
ORDER BY created_at DESC;

-- 2. Check employee records for this email
SELECT 
  id,
  owner_id,
  user_id,
  name,
  email,
  role,
  is_admin,
  is_active,
  invitation_token,
  invitation_accepted_at,
  created_at
FROM employees
WHERE email = 'emily@penni.ca'  -- REPLACE WITH ACTUAL EMPLOYEE EMAIL
   OR user_id = '5295b184-f798-4bf2-8f4d-5aee6b6be2c4'  -- REPLACE WITH ACTUAL USER ID
ORDER BY created_at DESC;

-- 3. Check if there's a settings record for this user (there shouldn't be!)
SELECT 
  id,
  owner_id,
  company_name,
  owner_name,
  owner_email,
  created_at
FROM settings
WHERE owner_id = '5295b184-f798-4bf2-8f4d-5aee6b6be2c4'  -- REPLACE WITH ACTUAL USER ID
ORDER BY created_at DESC;

-- 4. Get the business owner's settings (this is what the employee SHOULD see)
SELECT 
  s.id,
  s.owner_id,
  s.company_name,
  s.owner_name,
  s.owner_email,
  e.owner_id as employee_owner_id,
  e.user_id as employee_user_id
FROM settings s
INNER JOIN employees e ON e.owner_id = s.owner_id
WHERE e.email = 'emily@penni.ca'  -- REPLACE WITH ACTUAL EMPLOYEE EMAIL
ORDER BY s.created_at DESC;

-- ================================================
-- WHAT TO LOOK FOR:
-- ================================================
-- Query 1: Should show user with role='employee' in metadata
-- Query 2: Should show ONE employee record with:
--          - user_id = the auth user id
--          - owner_id = the business owner's id (NOT the employee's id)
--          - invitation_accepted_at should be filled
-- Query 3: Should return NO ROWS (employee shouldn't have settings)
-- Query 4: Should show the business owner's company info
-- ================================================


