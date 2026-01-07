# Employee Login Fix - Routing Issue

## Problem Summary

When a business invites an employee and the employee accepts the invitation:
1. ✅ Employee sets their password successfully
2. ✅ Employee's `user_id` is linked to the employee record in the database
3. ❌ **Employee gets redirected to business setup page instead of employee dashboard**

## Root Cause

The issue is caused by **Row Level Security (RLS) policies** in Supabase that prevent employees from reading their own records:

### Console Errors (406 - Not Acceptable)
```
Failed to load resource: the server responded with a status of 406
- /rest/v1/settings?select=*&owner_id=eq.[user-id]
- /rest/v1/employees?select=...&user_id=eq.[user-id]
```

### What's Happening

1. Employee logs in after accepting invitation
2. `SupabaseStore.tsx` tries to determine if user is owner or employee:
   - First checks `settings` table for owner record → **406 ERROR (RLS blocks it)**
   - Then checks `employees` table for employee record → **406 ERROR (RLS blocks it)**
3. Both queries fail, so no employee record is found
4. Code sets `needsSetup = true` (line 254 in SupabaseStore.tsx)
5. App shows business setup page (`OAuthSetup`) instead of employee dashboard

### Current RLS Policies (simple-policies-final.sql)

**Employees table:**
```sql
CREATE POLICY "owner_full_access"
ON employees FOR ALL
USING (owner_id = auth.uid());
```
- ✅ Owners can access all their employees
- ❌ Employees CANNOT read their own record!

**Settings table:**
```sql
CREATE POLICY "owner_only"
ON settings FOR ALL
USING (owner_id = auth.uid());
```
- ✅ Owners can access their settings
- ❌ Employees CANNOT read their owner's settings (needed for company name, logo, etc.)

## Solution

Run the SQL script `fix-employee-self-access.sql` in your Supabase SQL Editor:

### New Policies to Add

1. **Allow employees to read their own record:**
```sql
CREATE POLICY "employee_read_own_record"
ON employees FOR SELECT
USING (user_id = auth.uid());
```

2. **Allow employees to read their owner's settings:**
```sql
CREATE POLICY "employee_read_owner_settings"
ON settings FOR SELECT
USING (
  owner_id IN (
    SELECT owner_id FROM employees WHERE user_id = auth.uid()
  )
);
```

## How to Apply the Fix

### Step 1: Run the SQL Script
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `fix-employee-self-access.sql`
4. Click "Run"

### Step 2: Verify the Fix
The script will show you all policies on the employees and settings tables. You should see:

**Employees table policies:**
- `owner_full_access` (existing)
- `employee_read_own_record` (NEW)

**Settings table policies:**
- `owner_only` (existing)
- `employee_read_owner_settings` (NEW)

### Step 3: Test the Employee Flow
1. Have a business owner invite a new employee
2. Employee clicks invitation link and sets password
3. Employee should now be taken directly to their employee dashboard
4. Employee should see:
   - Clock In/Out buttons
   - Their time entries
   - Company name and logo in the header

## Expected Behavior After Fix

### For Employees:
- ✅ Can read their own employee record (`user_id = auth.uid()`)
- ✅ Can read their owner's settings (company info)
- ✅ Can read/write their own time entries and breaks
- ❌ Cannot read other employees' data
- ❌ Cannot modify settings or other employees

### For Owners:
- ✅ Can read/write all employees
- ✅ Can read/write all settings
- ✅ Can read/write all time entries
- ✅ Full admin access (unchanged)

## Code Flow After Fix

```typescript
// SupabaseStore.tsx - loadData()

// 1. Check if user is owner
const settingsData = await supabase
  .from('settings')
  .eq('owner_id', user.id)
  .single();
// ✅ Returns null for employees (no error)

// 2. Check if user is employee  
const myEmployeeRecord = await supabase
  .from('employees')
  .eq('user_id', user.id)
  .single();
// ✅ Now returns the employee record! (was failing before)

// 3. Load owner's settings for employee
const ownerSettings = await supabase
  .from('settings')
  .eq('owner_id', resolvedOwnerId)
  .single();
// ✅ Now works! (was failing before)

// 4. Set currentUser correctly
if (userIsOwner) {
  setCurrentUserState('ADMIN'); // Owner → Admin view
} else if (myEmployeeRecord) {
  setCurrentUserState(mappedEmployee); // Employee → Employee view ✅
} else {
  setNeedsSetup(true); // Only for OAuth users without records
}
```

## Why This is Safe

1. **No data leakage:** Employees can only see:
   - Their own record (not other employees)
   - Their owner's company settings (needed for UI)
   - Their own time entries/breaks

2. **No recursion:** These policies use simple direct checks:
   - `user_id = auth.uid()` (direct column check)
   - `owner_id IN (SELECT ...)` (one-level subquery)

3. **Backwards compatible:** 
   - Doesn't change any owner permissions
   - Doesn't change any employee write permissions
   - Only adds necessary READ permissions for employees

## Testing Checklist

After applying the fix, test:

- [ ] Employee accepts invitation → sees employee dashboard (not setup page)
- [ ] Employee can clock in/out
- [ ] Employee sees company name/logo in header
- [ ] Employee cannot access settings/admin features
- [ ] Owner can still access admin dashboard
- [ ] Owner can still see all employees and data
- [ ] No console errors (406) when employee logs in

## Additional Notes

The `AcceptInvitation.tsx` page already sets a localStorage flag:
```typescript
localStorage.setItem('just_accepted_invitation', 'true');
```

This flag tells `SupabaseStore.tsx` to retry the employee lookup with delays, accounting for database replication. However, this workaround doesn't help if the RLS policies are blocking access entirely. With the fix applied, this retry logic will work correctly.


