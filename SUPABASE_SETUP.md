# Supabase Setup Guide for Ollie Timesheets

This guide will help you set up Supabase for multi-user access, including authentication for your accountant and team members.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Ollie Timesheets (or your company name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier works great to start
4. Click "Create new project" and wait ~2 minutes for setup

## Step 2: Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

3. Create a file called `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_key_here
```

⚠️ **Important**: Never commit this file to git! It's already in `.gitignore`.

## Step 3: Run the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

You should see: "Success. No rows returned"

This creates:
- ✅ `profiles` - User accounts and roles
- ✅ `employees` - Employee records  
- ✅ `time_entries` - Clock in/out records
- ✅ `breaks` - Break tracking
- ✅ `settings` - Company settings
- ✅ Row Level Security (RLS) policies for data access
- ✅ Automatic triggers and functions

## Step 4: Configure Email Authentication

1. Go to **Authentication** → **Providers** in Supabase
2. **Email** provider should be enabled by default
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize the "Confirm signup" and "Invite user" templates with your branding

### Email Settings for Production

For production, you'll want to set up a custom SMTP server:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your email provider (SendGrid, AWS SES, etc.)
3. Or use Resend for both auth emails AND timesheet emails!

## Step 5: Create Your First User (Owner)

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: Your admin email
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this
   - **User Metadata**: Add this JSON:
   ```json
   {
     "full_name": "Your Name",
     "role": "owner"
   }
   ```
4. Click **Create User**

## Step 6: Set Up Initial Data

After creating your owner user, run this SQL to set up initial settings:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Insert initial settings (replace 'YOUR_USER_ID' with the actual UUID)
INSERT INTO settings (owner_id, company_name, owner_name, owner_email, bookkeeper_email)
VALUES (
  'YOUR_USER_ID',
  'My Agency',
  'Your Name', 
  'your@email.com',
  'accountant@email.com'
);
```

## Step 7: User Roles Explained

The app supports 4 roles:

| Role | Can Do |
|------|--------|
| **owner** | Full access - manage everything, view all data |
| **admin** | Manage team, approve timesheets, view all data |
| **employee** | Clock in/out, view own timesheet, request changes |
| **accountant** | View all timesheets (read-only), export reports |

## Step 8: Invite Your Accountant

### Option A: Through Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Invite User**
3. Enter accountant's email
4. In **User Metadata**, add:
   ```json
   {
     "full_name": "Accountant Name",
     "role": "accountant"
   }
   ```
5. They'll receive an email to set their password

### Option B: Through the App (After Supabase integration is complete)

1. Log in as owner/admin
2. Go to Settings → Team Management
3. Add team member with email
4. Invitation email will be sent automatically

## Step 9: Data Migration (If you have existing data)

If you've been using the app with localStorage, you'll need to migrate your data:

1. Export your data:
   - Open browser console
   - Run: `console.log(JSON.stringify(localStorage))`
   - Copy the output

2. We can create a migration script to import this data into Supabase

**Would you like me to create this migration script?**

## Step 10: Security Best Practices

✅ **Enable email confirmations** (Auth → Settings → Enable email confirmations)
✅ **Set up password requirements** (Auth → Settings → Password requirements)
✅ **Enable MFA** for owner/admin accounts (optional but recommended)
✅ **Regularly review access** in Authentication → Users
✅ **Monitor usage** in Settings → Usage

## Troubleshooting

### Can't log in?
- Check that user is created in Authentication → Users
- Verify email is confirmed (or auto-confirm is enabled)
- Check user metadata has correct role

### Data not showing?
- Verify RLS policies are enabled
- Check user role in profiles table
- Look at Network tab in browser dev tools for errors

### Permission errors?
- RLS policies control access
- Make sure your role is set correctly
- Owner/admin can see everything
- Employees only see their own data
- Accountants have read-only access

## Next Steps

Once Supabase is set up:
1. Update the frontend to use Supabase auth
2. Replace localStorage with Supabase queries
3. Test with multiple users
4. Invite your accountant!

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Check the Supabase logs: Project → Logs

---

**Ready to integrate?** The next step is updating the frontend code to use Supabase instead of localStorage. Let me know when you're ready!

