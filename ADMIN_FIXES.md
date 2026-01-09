# Admin Issues Fixed

## Issue 1: Invitation Email Missing Token ✅

**Problem**: When adding an employee, the invitation email API was failing with "Missing required fields" error.

**Root Cause**: The `sendTeamInvitation` API call was missing the required `invitationToken` parameter.

**Fix Applied** ([App.tsx](App.tsx) lines ~100-140):
- Captured the return value from `addEmployee()` which includes `invitationToken`
- Updated the API call to include `invitationToken` parameter
- Added additional logging to track the token through the process

**Code Changes**:
```typescript
// Before:
await addEmployee({ ... });
await sendTeamInvitation({ employeeEmail, employeeName, ... });

// After:
const { invitationToken } = await addEmployee({ ... });
if (email && invitationToken) {
  await sendTeamInvitation({ 
    employeeEmail, 
    employeeName, 
    invitationToken,  // Now included
    ... 
  });
}
```

**Testing**:
- Add a new employee with an email address
- Verify the invitation email sends successfully
- Check that the employee receives the email with a valid invitation link

---

## Issue 2: Admin Employee Profile Shows Owner Info ✅

**Problem**: When an admin employee opened Settings → My Profile, they saw the business owner's name and email instead of their own.

**Root Cause**: The Settings modal was always pulling from `settings.ownerName` and `settings.ownerEmail`, which contains the business owner's information regardless of who is logged in.

**Fix Applied** ([App.tsx](App.tsx) lines ~276-530):
1. Added logic to detect if current user is an admin employee vs business owner
2. For admin employees:
   - Display their own name and email from their employee record
   - Make name/email fields read-only with explanatory text
   - Keep company settings (name, logo, bookkeeper) editable
3. For business owners:
   - Display owner name/email from settings (as before)
   - All fields remain editable

**Code Changes**:
```typescript
// Added detection:
const isAdminEmployee = currentUser !== 'ADMIN' && currentUser.isAdmin;
const currentEmployee = isAdminEmployee ? currentUser : null;

// Profile section now shows:
{isAdminEmployee ? (
  <input value={currentEmployee?.name} disabled />
  // + helper text
) : (
  <input value={localSettings.ownerName} onChange={...} />
)}
```

**User Experience**:
- **Business Owner**: Sees their own name/email, can edit everything
- **Admin Employee**: Sees their own name/email (read-only) with note: "To update your name, ask the business owner to edit it in Team Management"
- **Both**: Can edit company name, logo, and bookkeeper email

**Testing**:
1. Log in as business owner → Settings → My Profile → should see owner info (editable)
2. Log in as admin employee → Settings → My Profile → should see admin's own name/email (read-only)
3. Admin employee should be able to edit company name, logo, and bookkeeper email
4. Admin employee should see helper text explaining how to update their personal info

---

## Summary

Both issues are now fixed:
1. ✅ Invitation emails will send successfully with the required token
2. ✅ Admin employees see their own profile information in settings

These fixes maintain the principle that admin employees have full access to manage the business (team, timesheets, pay reports) but their personal profile information is managed by the business owner through Team Management.

