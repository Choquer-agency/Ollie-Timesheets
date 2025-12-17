# Testing the Dynamic Company Logo Feature

This guide walks you through testing the dynamic logo feature from a fresh database.

## Prerequisites

- ✅ Supabase project set up
- ✅ Database schema deployed
- ✅ Email server running (for sending invitation emails)
- ✅ Resend API key configured

## Step 1: Reset Your Database

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open the file `reset-database.sql`
4. Copy the contents and paste into the SQL editor
5. Click **Run**
6. All data should be deleted

**Alternative:** You can run just the DELETE statements one by one if you encounter any issues.

## Step 2: Create a Fresh Owner Account

### Option A: Through Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: `owner@test.com` (or your email)
   - **Password**: Create a test password
   - **Auto Confirm User**: ✅ Check this box
   - **User Metadata**: Add this JSON:
   ```json
   {
     "full_name": "Test Owner",
     "role": "owner"
   }
   ```
4. Click **Create User**
5. Copy the user ID that appears in the users list

### Step 2b: Initialize Settings

1. In SQL Editor, run this (replace `YOUR_USER_ID` with the actual UUID):

```sql
-- Get your user ID first (if you don't have it)
SELECT id, email FROM auth.users;

-- Insert initial settings
INSERT INTO settings (
  owner_id, 
  company_name, 
  owner_name, 
  owner_email, 
  bookkeeper_email,
  company_logo_url
)
VALUES (
  'YOUR_USER_ID',
  'Test Company',
  'Test Owner',
  'owner@test.com',
  'bookkeeper@test.com',
  NULL  -- No logo yet
);
```

## Step 3: Log In to Your App

1. Start your frontend: `npm run dev`
2. Start your backend: `npm run server:dev`
3. Open the app in your browser
4. Log in with:
   - Email: `owner@test.com`
   - Password: (the password you set)

## Step 4: Test WITHOUT a Company Logo (Default Behavior)

### Test Case 1: Default Ollie Logo

1. Go to Settings or wherever you manage employees
2. Click "Add Employee"
3. Fill in:
   - Name: `John Doe`
   - Email: `delivered@resend.dev` (Resend's test email)
   - Role: `Designer`
   - Hourly Rate: `50`
4. Click Save/Send Invitation
5. Check the email in [Resend Dashboard](https://resend.com/emails)
6. **Verify**: The email should show the **Ollie Timesheets logo** (the default)

## Step 5: Upload Your Company Logo

1. In your app, go to Settings
2. Look for the "Company Logo" or "Logo Upload" section
3. Upload a logo image (PNG, JPG, or SVG)
4. The logo should be uploaded to Supabase Storage
5. **Verify**: Check that `settings.company_logo_url` is populated:

```sql
SELECT company_name, company_logo_url FROM settings;
```

You should see a URL like:
```
https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/company-logos/abc123.png
```

## Step 6: Test WITH a Company Logo (Dynamic Behavior)

### Test Case 2: Custom Company Logo

1. Add another employee:
   - Name: `Jane Smith`
   - Email: `delivered@resend.dev`
   - Role: `Developer`
   - Hourly Rate: `65`
2. Click Save/Send Invitation
3. Check the email in [Resend Dashboard](https://resend.com/emails)
4. **Verify**: The email should now show **YOUR company's logo** instead of Ollie's

## Step 7: Verify the Implementation

### Check the Email HTML

1. In Resend Dashboard, click on the email
2. Click "View Raw" or "HTML"
3. Look for the `<img>` tag near the top
4. **Without logo**: Should have `src="https://...Ollie%20Timesheets.svg"`
5. **With logo**: Should have `src="https://...your-logo-file.png"`

### Check Console Logs

When sending the invitation, check the browser console for:

```
Sending invitation with settings: {
  companyName: "Test Company",
  companyLogoUrl: "https://...your-logo-url..."
}
```

## Expected Results

| Scenario | Logo in Email |
|----------|---------------|
| No logo uploaded | Default Ollie Timesheets logo |
| Logo uploaded | Your custom company logo |
| Logo URL is invalid/broken | Should fallback to Ollie logo (edge case) |

## Troubleshooting

### Logo not appearing in email?

1. **Check database**: 
   ```sql
   SELECT company_logo_url FROM settings;
   ```
   Is it NULL or empty?

2. **Check upload**: Did the logo actually upload to Supabase Storage?
   - Go to Supabase Dashboard → Storage
   - Check your bucket for the uploaded file

3. **Check permissions**: Is the storage bucket public?
   - Storage bucket must have public read access

4. **Check console**: Are there any errors in browser console when sending invitation?

5. **Check backend logs**: Is `companyLogoUrl` being received by the backend?
   ```
   Sending team invitation with logo: https://...
   ```

### Email not sending?

1. Check backend server is running
2. Check Resend API key is configured in `.env`
3. Check console for API errors
4. Verify email address is valid

### Logo URL is public?

Test by opening the URL directly in a browser:
```
https://your-supabase-url.supabase.co/storage/v1/object/public/bucket-name/logo.png
```

If you get a 404 or permission error, the bucket isn't public.

## Success Criteria

✅ First invitation shows Ollie logo (no custom logo set)  
✅ After uploading logo, new invitations show custom logo  
✅ Logo is visible and loads correctly in email clients  
✅ Console logs confirm logo URL is being passed through  
✅ Database `company_logo_url` field is populated correctly  

## Cleanup (Optional)

To test again from scratch, simply re-run `reset-database.sql` and start over!

