# Employee Invitation Flow - Setup Instructions

## What's Fixed

When you invite team members, they were being sent to the homepage and asked to create a new company. Now they get a proper invitation flow:

1. ✅ Employee gets invitation email with unique link
2. ✅ They click "Join [Company Name]"
3. ✅ They see a welcome page showing their email
4. ✅ They only need to create a password
5. ✅ They're automatically linked to your company

## Setup Required

### Step 1: Run the Database Migration

**Go to Supabase SQL Editor** and run this migration:

```sql
-- Add invitation token system for employee onboarding
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_employees_invitation_token ON employees(invitation_token);

-- Set expiration for existing employees (7 days from now)
UPDATE employees 
SET invitation_expires_at = NOW() + INTERVAL '7 days'
WHERE invitation_expires_at IS NULL AND user_id IS NULL;
```

### Step 2: Wait for Deployment

The code changes have been pushed and Railway should deploy automatically in a few minutes.

## How It Works Now

### For Business Owners:
1. Add a team member in Settings → Team Management
2. Enter their name, email, and role
3. They receive a beautiful invitation email

### For Employees:
1. Click "Join [Company Name]" in the email
2. See welcome page: "Welcome, [Name]!"
3. Their email is pre-filled
4. They create a password
5. Click "Join Team"
6. They're logged in and see only their own timesheet

## Invitation Features

- **Unique Links**: Each invitation has a unique token
- **Expires After 7 Days**: Invitations expire for security
- **One-Time Use**: Can't be used twice
- **Pre-Filled Info**: Name and email from the invitation
- **No Company Setup**: Employees join your existing company

## Testing

After the migration and deployment:

1. Add a test employee with a real email
2. Check the invitation email
3. Click the "Join [Company Name]" button
4. Verify you see the accept invitation page (not the signup flow)
5. Create a password
6. Confirm you're logged in as that employee

## Files Changed

- `supabase-migration-employee-invitations.sql` - Database migration
- `pages/AcceptInvitation.tsx` - New invitation acceptance page
- `server/emailTemplates.js` - Updated to use invitation links
- `App.tsx` - Route handling for `/accept-invitation`
- `SupabaseStore.tsx` - Returns invitation token when creating employees
- `apiClient.ts` - Includes invitation token in API calls

## Security

- Invitations expire after 7 days
- Tokens are UUIDs (impossible to guess)
- One-time use (marked as accepted in database)
- Employees can only see their own data (RLS policies)

