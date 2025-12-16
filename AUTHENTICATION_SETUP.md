# Authentication Setup Guide

## Overview
Your Ollie Timesheet application now has a complete authentication system with:
- Email/Password authentication
- Google OAuth
- Multi-step business signup flow
- Supabase integration for data persistence

## Google OAuth Setup

### 1. Supabase Callback URL
The callback URL you received is **correct**:
```
https://lbwgretbgatmhvqspnyp.supabase.co/auth/v1/callback
```

This is Supabase's authentication endpoint that handles OAuth redirects.

### 2. Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google Identity)
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **OAuth 2.0 Client ID**
6. Configure the OAuth consent screen if you haven't already
7. For **Application type**, select **Web application**
8. Add these **Authorized JavaScript origins**:
   - `http://localhost:5173` (for local development)
   - `https://lbwgretbgatmhvqspnyp.supabase.co` (Supabase domain)
   - Your production domain (when deployed)

9. Add these **Authorized redirect URIs**:
   - `https://lbwgretbgatmhvqspnyp.supabase.co/auth/v1/callback`
   - `http://localhost:5173` (for local development)

10. Copy your **Client ID** and **Client Secret**

### 3. Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and enable it
5. Paste your **Client ID** and **Client Secret** from Google Cloud Console
6. Save the configuration

### 4. Environment Variables

Make sure your `.env.local` file has these variables:
```env
VITE_SUPABASE_URL=https://lbwgretbgatmhvqspnyp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## How the Signup Flow Works

### Step 1: Company Information
When a business signs up, they provide:
- Company name
- Number of employees
- Email address
- Password

### Step 2: Employee Setup
The system automatically generates forms for each employee based on the count from Step 1:
- Full name (required)
- Email (optional)
- Position (required)
- Hourly rate (optional)
- Vacation days (default: 10)
- Sick days (default: 5)

Users can add more employees beyond the initial count using the "+ Add another employee" button.

### Step 3: Account Creation
When they submit:
1. Owner account is created in Supabase Auth
2. Settings record is created with company info
3. All employees are added to the database
4. User is automatically logged in and redirected to the main app

## Testing the Setup

### Test Email/Password Signup
1. Start your dev server: `npm run dev`
2. Click "Sign up" on the login page
3. Fill out company information
4. Add employee details
5. Submit to create account

### Test Google OAuth
1. Click "Continue with Google" on login or signup page
2. Select your Google account
3. Grant permissions
4. You'll be redirected back to the app

Note: For Google OAuth signup, users will need to complete a profile setup after their first login to add company and employee information.

## Application URL Configuration

The authentication system uses `window.location.origin` to determine the current app URL for redirects and email links. This automatically works for:
- Local development: `http://localhost:5173`
- Production: Your deployed domain

## Database Schema

The signup process creates records in these tables:
- `profiles` - User authentication profile
- `settings` - Company settings and owner information
- `employees` - All team members

## Security Notes

1. **Google OAuth Scopes**: The app requests basic profile information (email, name)
2. **Password Requirements**: Minimum 6 characters (enforced by Supabase)
3. **Session Management**: Handled automatically by Supabase Auth
4. **Token Refresh**: Auto-refresh tokens are enabled for persistent sessions

## Troubleshooting

### "Redirect URI mismatch" error
- Double-check that the callback URL in Google Cloud Console matches exactly:
  `https://lbwgretbgatmhvqspnyp.supabase.co/auth/v1/callback`

### Google OAuth button doesn't work
- Verify Google provider is enabled in Supabase Dashboard
- Check that Client ID and Secret are correct
- Look for errors in browser console

### Email signup not working
- Confirm Supabase email auth is enabled
- Check that email confirmations are configured (can be disabled for development)

### Users can't see their data
- Verify Row Level Security (RLS) policies are set up in Supabase
- Check that the user's ID is properly associated with their records

## Next Steps

After users sign up and log in, they can:
- View and manage their team members
- Track time with clock in/out functionality
- Review timesheets and approve time off
- Generate payroll reports
- Send reports to bookkeepers

## Sign Out
Users can sign out by clicking the sign out icon (exit arrow) in the top right corner when viewing as Admin.

