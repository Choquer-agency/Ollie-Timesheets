# 🧪 Security Testing Guide

This guide walks you through testing the security measures to ensure employees cannot see hourly rates.

## Prerequisites

Before testing:
1. Apply RLS policies from `supabase-security-policies.sql` to your Supabase database
2. Have at least 2 user accounts:
   - One admin/owner account
   - One employee account

---

## Test Suite

### Test 1: Verify RLS Policies Are Active

**Goal:** Confirm database-level security is working

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query:
   ```sql
   -- Check if RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('employees', 'time_entries', 'breaks', 'settings');
   ```
3. **Expected Result:** All tables should show `rowsecurity = true`

**✅ Pass Criteria:** All tables have RLS enabled

---

### Test 2: Employee Cannot Query Rates via Console

**Goal:** Verify employees cannot access hourly rates through browser console

**Steps:**
1. Log in as an **employee** (not admin)
2. Open Browser DevTools (Press F12 or Right-click → Inspect)
3. Go to the Console tab
4. Paste and run:
   ```javascript
   // Try to query employees table directly
   const { data, error } = await supabase
     .from('employees')
     .select('id, name, hourly_rate')
   
   console.log('Employees data:', data);
   ```
5. Check the results

**✅ Pass Criteria:** 
- `hourly_rate` should be `null` or undefined for all employees
- OR the query should return an error due to RLS

**❌ Fail Criteria:**
- If you see actual hourly rate values, RLS is NOT working correctly

---

### Test 3: Employee Cannot See Rates in React State

**Goal:** Verify application-level filtering is working

**Steps:**
1. Log in as an **employee**
2. Open Browser DevTools → Console
3. Install React Developer Tools extension if not already installed
4. Go to React DevTools → Components tab
5. Find the `SupabaseStoreProvider` component
6. Expand the state and look at `employees` array
7. Click on each employee object

**✅ Pass Criteria:**
- `hourlyRate` should be `undefined` for ALL employees
- Employee names, roles, and other non-sensitive data should be visible

**❌ Fail Criteria:**
- If any `hourlyRate` values are visible, the filtering is broken

---

### Test 4: Employee Cannot Access Settings

**Goal:** Verify UI access control is working

**Steps:**
1. Log in as an **employee**
2. Look at the top navigation bar
3. Try to find the Settings icon/button

**✅ Pass Criteria:**
- Settings button should NOT be visible
- Only Sign Out button should appear

**❌ Fail Criteria:**
- If Settings button is visible, UI access control is broken

---

### Test 5: Employee Cannot See Other Time Entries

**Goal:** Verify data isolation between employees

**Steps:**
1. Log in as **Employee A**
2. Note the time entries visible on the dashboard
3. Log out
4. Log in as **Employee B**
5. Check the time entries

**✅ Pass Criteria:**
- Each employee should ONLY see their own time entries
- No overlap between employees' data

**❌ Fail Criteria:**
- If Employee B can see Employee A's time entries, RLS is not working

---

### Test 6: Admin CAN See All Rates

**Goal:** Verify admin functionality still works

**Steps:**
1. Log in as **admin/owner**
2. Click Settings in the top navigation
3. Go to Team Management section
4. Look at the employee list table

**✅ Pass Criteria:**
- All employees should be listed
- Hourly rates should be visible in the "Rate" column
- You can edit employee information including rates

**❌ Fail Criteria:**
- If rates are missing or you can't edit them, admin access is broken

---

### Test 7: Network Traffic Analysis

**Goal:** Verify no sensitive data is sent over the network to employees

**Steps:**
1. Log in as an **employee**
2. Open DevTools → Network tab
3. Refresh the page
4. Filter for XHR/Fetch requests
5. Click on requests to `/rest/v1/employees`
6. Look at the Response tab

**✅ Pass Criteria:**
- The response should NOT include `hourly_rate` field
- OR `hourly_rate` should be `null` for all records

**❌ Fail Criteria:**
- If actual hourly rate values are in the response, data is leaking

---

### Test 8: Direct Database Query (Admin Test)

**Goal:** Verify RLS policies work at the SQL level

**Steps:**
1. Log in to Supabase Dashboard
2. Go to SQL Editor
3. Get an employee's user ID from Authentication → Users
4. Run this query with the employee's JWT:
   ```sql
   -- Set the user context to simulate being logged in as employee
   SELECT set_config('request.jwt.claim.sub', '<employee_user_id>', true);
   
   -- Try to query other employees' rates
   SELECT id, name, hourly_rate 
   FROM employees 
   WHERE owner_id = '<owner_id>';
   ```

**✅ Pass Criteria:**
- Query should return employees but `hourly_rate` should be NULL
- OR query should be blocked entirely by RLS

---

### Test 9: Attempt Unauthorized Updates

**Goal:** Verify employees cannot modify other employees' data

**Steps:**
1. Log in as **Employee A**
2. Open Browser Console
3. Get another employee's ID (you can see this in React DevTools)
4. Try to update that employee:
   ```javascript
   const { data, error } = await supabase
     .from('employees')
     .update({ hourly_rate: 100 })
     .eq('id', '<other_employee_id>')
   
   console.log('Update result:', { data, error });
   ```

**✅ Pass Criteria:**
- Update should fail with a permissions error
- Error message should mention RLS or policy violation

**❌ Fail Criteria:**
- If update succeeds, security is seriously broken

---

### Test 10: Cross-Account Time Entry Access

**Goal:** Verify employees cannot view/edit other employees' time entries

**Steps:**
1. Log in as **Employee A**
2. Create a time entry (clock in/out)
3. Note the entry ID from Network tab or React DevTools
4. Log out and log in as **Employee B**
5. Try to query Employee A's time entry:
   ```javascript
   const { data, error } = await supabase
     .from('time_entries')
     .select('*')
     .eq('id', '<employee_a_entry_id>')
   
   console.log('Query result:', { data, error });
   ```

**✅ Pass Criteria:**
- Query should return empty array or error
- Employee B should NOT see Employee A's data

---

## 🚨 What to Do If Tests Fail

### If RLS Tests Fail:
1. Re-apply `supabase-security-policies.sql`
2. Verify no syntax errors in the SQL
3. Check Supabase Dashboard → Database → Policies to see active policies
4. Contact Supabase support if issues persist

### If Application Filtering Fails:
1. Check `SupabaseStore.tsx` lines 156-175
2. Verify the filtering logic is present
3. Clear browser cache and reload
4. Check for any errors in the browser console

### If UI Access Control Fails:
1. Check `App.tsx` line 1802
2. Verify conditional rendering logic
3. Check that `currentUser` is set correctly
4. Review authentication flow

---

## 📊 Test Results Template

Use this template to document your testing:

```
Date Tested: ___________
Tested By: ___________
Environment: [ ] Dev [ ] Staging [ ] Production

Test Results:
- [ ] Test 1: RLS Policies Active
- [ ] Test 2: Console Query Protection
- [ ] Test 3: React State Filtering
- [ ] Test 4: Settings Access Restriction
- [ ] Test 5: Time Entry Isolation
- [ ] Test 6: Admin Access Working
- [ ] Test 7: Network Traffic Clean
- [ ] Test 8: Direct Database Query Blocked
- [ ] Test 9: Unauthorized Updates Blocked
- [ ] Test 10: Cross-Account Access Blocked

Overall Status: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

## 🔄 Automated Testing (Future Enhancement)

Consider setting up automated tests using:
- **Cypress** or **Playwright** for end-to-end testing
- **Supabase Test Helpers** for database policy testing
- **Jest** for unit testing security functions

Example test framework structure:
```javascript
describe('Security Tests', () => {
  describe('Employee Access', () => {
    it('should not expose hourly rates to employees', async () => {
      // Test implementation
    });
    
    it('should block access to other employees time entries', async () => {
      // Test implementation
    });
  });
  
  describe('Admin Access', () => {
    it('should allow admin to view all hourly rates', async () => {
      // Test implementation
    });
  });
});
```

---

## ✅ Security Certification

Once all tests pass, consider:
1. Documenting test results
2. Having a second person verify
3. Scheduling regular security audits (quarterly)
4. Creating a security incident response plan

---

**Last Updated:** January 2026  
**Next Review Date:** _________



