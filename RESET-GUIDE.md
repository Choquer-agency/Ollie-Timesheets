# Complete Database Reset Guide

## ⚠️ WARNING
This will delete **ALL DATA** from your Ollie Timesheets database. This action **CANNOT BE UNDONE**.

## When to Use This
- RLS policy issues preventing employee login
- Data corruption or inconsistency issues
- Starting fresh after testing
- Need a clean slate

## Reset Process

### Step 1: Run the SQL Reset Script
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open `reset-database-clean-slate.sql`
4. **Read the warnings carefully**
5. Click **Run** to execute the script

### Step 2: Delete Auth Users Manually
The script cannot delete auth users directly due to permissions. You need to do this manually:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. **Delete all users EXCEPT your owner account**
   - ⚠️ Make sure you know which account is yours!
   - Keep the email/password for your owner account handy
3. Confirm the deletions

### Step 3: First Login as Owner
1. Go to your **Ollie Timesheets app**
2. Log in with your **owner credentials** (email/password)
3. You may be prompted to complete setup - fill in:
   - Company name
   - Owner name
   - Owner email
   - Bookkeeper email (optional)

### Step 4: Recreate Your Team
1. Go to **Settings** (gear icon in top right)
2. Scroll to **Team Management**
3. Add each employee:
   - Name
   - Email
   - Role
   - Hourly rate
   - Vacation days
4. Click **Send Invitation** for each employee

### Step 5: Employees Accept Invitations
1. Employees receive invitation emails
2. They click the invitation link
3. Set their password
4. Start using the app!

## What Gets Deleted
- ✅ All time entries and breaks
- ✅ All employees
- ✅ All company settings
- ✅ All auth users (except yours, if deleted manually)

## What Gets Preserved
- ✅ Database structure (tables, columns)
- ✅ RLS security policies
- ✅ Database functions and views
- ✅ Your owner auth account (if you skip deleting it)

## After Reset Checklist
- [ ] All old auth users deleted from Supabase
- [ ] Logged in as owner successfully
- [ ] Company settings configured
- [ ] Employees added and invitations sent
- [ ] Test employee login with one account
- [ ] Verify employee can clock in/out
- [ ] Verify admin can see employee data

## Rollback Options
⚠️ **There is no rollback!** Once you run this script, all data is permanently deleted.

**Prevention:** Before running, consider:
1. Exporting current data if you want to reference it later
2. Taking screenshots of your current settings
3. Making a list of all employees and their information

## Need Help?
If you encounter issues after the reset:
1. Check browser console for errors
2. Check Supabase logs for RLS policy issues
3. Verify RLS policies are still in place (Step 7 of reset script)
4. Make sure employee invitations are being sent (check email logs)

## Common Post-Reset Issues

### Issue: "Needs Setup" screen after logging in
**Solution:** Your owner account needs to create settings:
- Log in and complete the setup form
- Enter company name and owner information

### Issue: Employees can't log in after accepting invitation
**Solution:** Check that:
- Employee set their password successfully
- Employee is marked as `is_active = true` in database
- Employee has `user_id` field set in employees table

### Issue: RLS policies blocking access
**Solution:** Re-run the RLS policy script:
- Go to `supabase-security-policies.sql`
- Run in SQL Editor
- Or use `supabase-security-policies-clean.sql` for a fresh install


