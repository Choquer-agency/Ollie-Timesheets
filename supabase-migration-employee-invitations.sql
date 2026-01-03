-- Add invitation token system for employee onboarding
-- This allows employees to accept invitations without creating a new company

-- Step 1: Add invitation_token and invitation_expires_at columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP;

-- Step 2: Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_employees_invitation_token ON employees(invitation_token);

-- Step 3: Create a function to generate new invitation tokens (useful for resending)
CREATE OR REPLACE FUNCTION regenerate_invitation_token(employee_id UUID)
RETURNS UUID AS $$
DECLARE
  new_token UUID;
BEGIN
  new_token := gen_random_uuid();
  UPDATE employees 
  SET invitation_token = new_token,
      invitation_expires_at = NOW() + INTERVAL '7 days',
      invitation_accepted_at = NULL
  WHERE id = employee_id;
  RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Set expiration for existing employees (7 days from now)
UPDATE employees 
SET invitation_expires_at = NOW() + INTERVAL '7 days'
WHERE invitation_expires_at IS NULL AND user_id IS NULL;

