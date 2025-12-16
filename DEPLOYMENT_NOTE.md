# Important Deployment Note

## Authentication Now Required

The application has been updated to **require authentication** for all users. The demo/mock data has been removed.

### What Changed
- ✅ Authentication is now enforced on all routes
- ✅ Demo employees and time entries removed
- ✅ All data now comes from Supabase
- ✅ Users must sign up or log in to access the app

### After Deployment
When you deploy these changes to Railway, users will see:
1. **Login page** as the default landing page
2. Option to sign up with email/password or Google OAuth
3. Multi-step signup flow for businesses to add their team

### Environment Variables on Railway
Make sure these are set in your Railway environment:
```
VITE_SUPABASE_URL=https://lbwgretbgatmhvqspnyp.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### Google OAuth on Production
Update your Google Cloud Console to include:
- **Authorized JavaScript origins:**
  - `https://ollie-timesheets-production.up.railway.app`
  
- **Authorized redirect URIs:**
  - `https://lbwgretbgatmhvqspnyp.supabase.co/auth/v1/callback`

### Testing After Deployment
1. Visit `https://ollie-timesheets-production.up.railway.app`
2. You should see the login page
3. Click "Sign up" to create a new account
4. Complete the 2-step signup process
5. You'll be logged in and can start using the app

### Supabase RLS (Row Level Security)
Make sure your Supabase tables have proper RLS policies set up so users can only access their own data. If you need help setting these up, let me know!

## Deployment Checklist
- [ ] Environment variables set on Railway
- [ ] Google OAuth redirect URIs updated
- [ ] Supabase RLS policies configured (recommended)
- [ ] Deploy to Railway
- [ ] Test login/signup flow
- [ ] Create your first account!

