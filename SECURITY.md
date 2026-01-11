# 🔐 Security Documentation - Ollie Timesheets

This document outlines the security measures implemented in Ollie Timesheets to protect sensitive employee data, particularly hourly rates.

## 🎯 Security Objectives

1. **Employees CANNOT see other employees' hourly rates**
2. **Employees CANNOT access the admin dashboard**
3. **Employees CANNOT edit other employees' time entries**
4. **All access control is enforced at multiple layers**

---

## 🛡️ Multi-Layer Security Architecture

### Layer 1: Database Row Level Security (RLS)
**Location:** `supabase-security-policies.sql`

Supabase RLS policies enforce security at the database level, preventing unauthorized queries even if someone bypasses the frontend.

#### Key Policies:

**Employees Table:**
- ✅ Owners can see all employee data (including rates)
- ✅ Employees can see team member names/roles but NOT rates
- ❌ Employees CANNOT insert, update, or delete employee records

**Time Entries Table:**
- ✅ Owners can see all time entries for their organization
- ✅ Employees can ONLY see their own time entries
- ❌ Employees CANNOT see other employees' time entries

**Breaks Table:**
- ✅ Follows the same pattern as time entries
- ❌ Employees can only access breaks for their own time entries

**Settings Table:**
- ✅ Only accessible by the owner who created them
- ❌ Employees have NO access to settings

#### How to Apply RLS Policies:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `supabase-security-policies.sql`
4. Run the SQL script
5. Verify no errors

---

### Layer 2: Application Logic Filtering
**Location:** `SupabaseStore.tsx`

Even before data reaches the UI, we filter sensitive information at the application level.

#### Key Security Measures:

```typescript
// Lines 156-175: Filter hourly rates for non-admin users
mappedEmployees = employeesData.map(emp => {
  const mapped: Employee = {
    id: emp.id,
    name: emp.name,
    email: emp.email || undefined,
    role: emp.role,
    // SECURITY: Only expose hourly rates to owners/admins
    hourlyRate: userIsOwner ? (emp.hourly_rate || undefined) : undefined,
    vacationDaysTotal: emp.vacation_days_total,
    isAdmin: emp.is_admin,
    isActive: emp.is_active
  };
  return mapped;
});
```

```typescript
// Lines 214-237: Filter time entries for employees
// Employees can ONLY load their own time entries
if (mappedUserEmployee && !userIsOwner) {
  entriesQuery = entriesQuery.eq('employee_id', mappedUserEmployee.id);
}
```

---

### Layer 3: UI Access Control
**Location:** `App.tsx`

The UI enforces visual access restrictions to prevent employees from seeing admin-only features.

#### Key Restrictions:

**Settings Modal** (Line 1802):
```typescript
{currentUser === 'ADMIN' && (
  <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
)}
```
- ✅ Settings button is ONLY visible to admins
- ❌ Employees cannot open the Settings modal

**Settings Button** (Line 1764):
```typescript
{currentUser === 'ADMIN' ? (
  <>
    <button onClick={() => setIsSettingsOpen(true)}>Settings</button>
  </>
) : (
  // No settings button for employees
  <>
    <button onClick={() => signOut()}>Sign Out</button>
  </>
)}
```

**View Switching Disabled** (Line 53-58 in `SupabaseStore.tsx`):
```typescript
const setCurrentUser = (user: Employee | 'ADMIN') => {
  console.warn('setCurrentUser is disabled - users cannot switch views');
  // Do nothing - view switching is not allowed
};
```

---

### Layer 4: Backend Operation Security
**Location:** `SupabaseStore.tsx`

All sensitive operations include role-based access checks.

#### Security Checks:

**Adding Employees** (Lines 556-560):
```typescript
const addEmployee = async (data) => {
  if (currentUserState !== 'ADMIN') {
    throw new Error('Only administrators can add employees');
  }
  // ... rest of function
};
```

**Updating Employees** (Lines 608-612):
```typescript
const updateEmployee = async (id, updates) => {
  if (currentUserState !== 'ADMIN') {
    throw new Error('Only administrators can update employees');
  }
  // ... rest of function
};
```

**Deleting Time Entries** (Lines 536-540):
```typescript
const deleteEntry = async (entryId) => {
  if (currentUserState !== 'ADMIN') {
    throw new Error('Only administrators can delete time entries');
  }
  // ... rest of function
};
```

**Clock In/Out Restrictions** (Lines 270-274):
```typescript
const clockIn = async (employeeId) => {
  if (currentUserState !== 'ADMIN' && currentUserState.id !== employeeId) {
    throw new Error('You can only clock in for yourself');
  }
  // ... rest of function
};
```

---

## 🧪 Security Testing Checklist

### Test 1: Verify Employees Cannot See Rates in Browser

1. Log in as an employee (not admin)
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Try to access employee data:
   ```javascript
   // This should show hourlyRate as undefined for all employees
   console.log(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
   ```
5. Inspect Network tab → Look for API calls to `/employees`
6. Verify `hourly_rate` is either missing or `null`

### Test 2: Verify Employees Cannot Access Settings

1. Log in as an employee
2. Look for Settings button in top navigation
3. **Expected:** Settings button should NOT be visible
4. Try manually navigating by changing URL (if applicable)
5. **Expected:** Should be blocked or redirected

### Test 3: Verify Employees Cannot See Other Time Entries

1. Log in as an employee
2. Open Browser DevTools → Console
3. Try to query time entries:
   ```javascript
   supabase.from('time_entries').select('*')
   ```
4. **Expected:** Should only return entries for the logged-in employee

### Test 4: Verify Database RLS is Active

1. Log in to Supabase Dashboard
2. Go to Authentication → Users
3. Copy an employee's JWT token
4. Use Supabase SQL Editor to run:
   ```sql
   SELECT hourly_rate FROM employees WHERE owner_id != auth.uid();
   ```
5. **Expected:** Should return no results or NULL values

### Test 5: Verify Admin Can See Everything

1. Log in as the owner/admin
2. Go to Settings → Team Management
3. **Expected:** Should see all employees with their hourly rates
4. Go to Payroll → Pay Period
5. **Expected:** Should see total pay calculations

---

## 🚨 What If Security Is Breached?

### Immediate Actions:

1. **Revoke Access:**
   - Go to Supabase Dashboard → Authentication
   - Disable or delete the compromised user account

2. **Rotate Credentials:**
   - Reset Supabase API keys if exposed
   - Update environment variables

3. **Audit Logs:**
   - Check Supabase logs for unauthorized queries
   - Review which data was accessed

4. **Notify Affected Users:**
   - If hourly rates were exposed, inform affected employees

---

## 📋 Security Best Practices

### For Developers:

1. **Never disable RLS policies** in production
2. **Always test with non-admin accounts** after making changes
3. **Use TypeScript strict mode** to catch type-related security issues
4. **Keep dependencies updated** to patch security vulnerabilities
5. **Never log sensitive data** (like hourly rates) to console in production

### For Administrators:

1. **Use strong passwords** for admin accounts
2. **Enable 2FA** on Supabase dashboard
3. **Regularly review** who has admin access
4. **Audit employee list** periodically for inactive accounts
5. **Keep RLS policies up to date** when adding new features

---

## 🔍 Code Review Checklist

Before deploying changes that touch employee data:

- [ ] Verify RLS policies still apply to new tables/columns
- [ ] Check that no `console.log` statements expose sensitive data
- [ ] Ensure new API endpoints have role-based access checks
- [ ] Test with both admin and employee accounts
- [ ] Review browser DevTools for data leaks
- [ ] Confirm hourly rates are filtered for non-admin users
- [ ] Verify database queries include proper `WHERE` clauses

---

## 📞 Security Contact

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the repository owner directly
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## 🔄 Security Update History

### v1.0.0 (Current)
- ✅ Implemented RLS policies for all tables
- ✅ Added application-level filtering of hourly rates
- ✅ Disabled view switching for employees
- ✅ Added role-based access checks for all sensitive operations
- ✅ Created comprehensive security documentation

---

## 📚 Additional Resources

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10 Web Application Security Risks](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** January 2026  
**Reviewed By:** Security Team  
**Next Review:** Quarterly or after major feature additions





