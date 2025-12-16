# Testing Guide for Resend Email Integration

This guide will help you test all the email functionality in Ollie Timesheets.

## Prerequisites

Before testing, make sure:

✅ Backend server is running: `npm run server:dev`  
✅ Frontend is running: `npm run dev`  
✅ Resend API key is configured in `server/.env`  
✅ You can access [Resend Dashboard](https://resend.com/emails) to view sent emails  

## Test Email Address

For testing without sending to real email addresses, use:
- **Test Email**: `delivered@resend.dev`

This is a Resend-provided test address that will show as "delivered" in your dashboard without actually sending the email.

## Test 1: Bookkeeper Report Email

**What it tests**: Sending formatted pay period reports to your accountant.

### Steps:

1. Open the app at http://localhost:5173
2. Switch to "Admin (Owner)" view if not already
3. Click on the **"Pay Period"** tab
4. Adjust the date range to include some data (e.g., last 14 days)
5. Go to **Settings** → **App Configuration**
6. Set **Bookkeeper Email** to `delivered@resend.dev`
7. Save settings
8. Go back to **Pay Period** tab
9. Click **"Send to Bookkeeper"**
10. Click **"Send report"** in the confirmation modal

### Expected Result:

✅ "Report sent successfully!" message appears  
✅ Email appears in [Resend Dashboard](https://resend.com/emails)  
✅ Email contains:
   - Period date range
   - Table with employee hours, sick days, vacation, and pay
   - Total payroll amount
   - Professional HTML formatting

### Check in Resend Dashboard:

- Subject: `[Company Name]: Timesheet Report (Start Date - End Date)`
- To: `delivered@resend.dev`
- Status: Delivered
- Preview the HTML to see the formatted report

---

## Test 2: Team Member Invitation Email

**What it tests**: Sending welcome/onboarding emails to new employees.

### Steps:

1. Make sure you're in Admin view
2. Click the **Settings** gear icon (top right)
3. Go to **"Team Management"** tab
4. Click **"+ Add Member"**
5. Fill in the form:
   - **Full Name**: Test Employee
   - **Email**: `delivered@resend.dev`
   - **Role**: Designer
   - **Rate**: 50
   - **Vacation Days**: 10
6. Click **"Add member"**

### Expected Result:

✅ "Invitation email sent successfully!" message appears  
✅ Employee is added to the team list  
✅ Email appears in Resend Dashboard  

### Check Email Contents:

✅ Welcome message with employee name  
✅ Instructions for clocking in/out  
✅ Break policy information  
✅ Time off request instructions  
✅ Link to open the app  
✅ Professional HTML formatting with your company branding  

---

## Test 3: Missing Clockout Alert

**What it tests**: Automatic reminder emails when employees forget to clock out.

### Setup:

This one requires creating a missing clockout scenario.

### Steps:

1. **Create test data with missing clockout** (run in browser console):

```javascript
// Get yesterday's date
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayISO = yesterday.toISOString().split('T')[0];

// Get current localStorage data
const entries = JSON.parse(localStorage.getItem('agency_time_entries_v1') || '[]');
const employees = JSON.parse(localStorage.getItem('agency_time_employees_v1') || '[]');

// Find an employee with email
const testEmployee = employees[0];

// Add entry with missing clockout
entries.push({
  id: 'test-missing-' + Date.now(),
  employeeId: testEmployee.id,
  date: yesterdayISO,
  clockIn: new Date(yesterday.setHours(9, 0, 0)).toISOString(),
  clockOut: null, // Missing!
  breaks: [],
  isSickDay: false,
  isVacationDay: false
});

// Save back to localStorage
localStorage.setItem('agency_time_entries_v1', JSON.stringify(entries));

// Reload the page to trigger the alert check
location.reload();
```

2. Update the employee's email to the test address:
   - Go to Settings → Team Management
   - Edit the first employee
   - Set email to `delivered@resend.dev`
   - Save

3. **Refresh the page** - The app checks for missing clockouts on mount

### Expected Result:

✅ Email sent automatically on page load  
✅ Email appears in Resend Dashboard  
✅ Alert is only sent once per day (tracked in localStorage)  

### Check Email Contents:

✅ Warning icon/badge  
✅ Date of missing clockout  
✅ Clear call-to-action button: "Fix my timecard"  
✅ Instructions on how to resolve  

---

## Test 4: Change Request Notification (to Admin)

**What it tests**: Notifying admins when employees request timecard changes.

### Steps:

1. **Switch to Employee view**:
   - Click the dropdown in top right
   - Select any active employee (e.g., "Alice Chen")

2. **Submit a change request**:
   - Click "Adjust Today's Time / Mark Sick or Vacation" link
   - Modify the clock in or clock out time
   - OR mark as sick day/vacation
   - Click **"Submit for approval"**

3. **Check your email setup**:
   - Make sure owner email in Settings is set to `delivered@resend.dev`

### Expected Result:

✅ "Change request submitted" message appears  
✅ Email sent to admin automatically  
✅ Email appears in Resend Dashboard  

### Check Email Contents:

✅ Employee name who made the request  
✅ Date of the entry  
✅ Summary of requested changes  
✅ "Review request" button linking to the app  
✅ Professional notification design  

---

## Test 5: Change Approval Notification (to Employee)

**What it tests**: Notifying employees when their change requests are approved/rejected.

### Steps:

1. **Create a change request first** (follow Test 4)

2. **Switch to Admin view**

3. **Review and approve the change**:
   - In the Daily Review tab, find the entry with "Review" badge
   - Click on it to open the modal
   - Make any adjustments or keep the employee's proposed changes
   - Add admin notes (optional): "Approved - thanks for updating"
   - Click **"Save Changes"**

4. The employee whose email is set to `delivered@resend.dev` will receive notification

### Expected Result:

✅ Change is saved/applied  
✅ Email sent to employee automatically  
✅ Email appears in Resend Dashboard  

### Check Email Contents:

✅ Approval status (approved/rejected)  
✅ Date affected  
✅ Admin notes (if provided)  
✅ Different styling for approved vs rejected  
✅ Green checkmark for approved, red X for rejected  

---

## Troubleshooting

### No emails appearing in Resend Dashboard?

1. **Check backend server logs**:
   ```bash
   # You should see console output when emails are sent
   ```

2. **Verify Resend API key**:
   - Open `server/.env`
   - Confirm API key starts with `re_` and is properly set

3. **Test backend directly**:
   ```bash
   curl -X POST http://localhost:3001/api/health
   # Should return: {"status":"ok","message":"Ollie Timesheets Email Server is running"}
   ```

4. **Check browser console**:
   - Open DevTools → Console
   - Look for any error messages starting with "Failed to send..."

### Email sent but contains wrong data?

- Check that employee records have email addresses set
- Verify settings (company name, owner email, bookkeeper email)
- Look at the email preview in Resend Dashboard to debug formatting

### Rate limit errors?

- Wait 1 minute - the server has a rate limit of 10 emails per minute per IP
- For testing, you can temporarily increase this in `server/index.js`

### "Missing required fields" error?

- Check browser console for which field is missing
- Ensure all form fields are filled in correctly
- Verify email addresses are valid format

---

## Testing Checklist

Use this checklist to verify all email functionality:

- [ ] **Bookkeeper Report** - Sends formatted payroll report
- [ ] **Team Invitation** - Sends welcome email with onboarding info
- [ ] **Missing Clockout Alert** - Automatically sent next day
- [ ] **Change Request to Admin** - Notifies when employee submits request
- [ ] **Approval to Employee** - Notifies when request is processed

- [ ] All emails appear in Resend Dashboard
- [ ] All emails have correct subject lines
- [ ] All emails contain expected data
- [ ] All emails look professional (check HTML preview)
- [ ] No duplicate emails are sent

---

## Production Testing

Before going live with real email addresses:

1. **Verify domain** (if using custom from address):
   - Go to Resend Dashboard → Domains
   - Add and verify your domain
   - Update `FROM_EMAIL` in `server/.env`

2. **Test with your own email first**:
   - Use your personal email instead of `delivered@resend.dev`
   - Verify emails arrive in inbox (not spam)

3. **Check spam scores**:
   - Resend provides spam score analysis
   - Aim for score < 5

4. **Monitor deliverability**:
   - Watch Resend Dashboard for bounce rates
   - Check delivery rates

5. **Set up custom SMTP** (optional):
   - For higher deliverability
   - Configure in Resend settings

---

## Next Steps

Once all tests pass:

1. Update `server/.env` with production FROM_EMAIL
2. Set real email addresses in Settings
3. Test with 1-2 real team members first
4. Monitor Resend Dashboard for any issues
5. Roll out to full team

**Ready to test?** Start with Test 1 and work your way through! 🎉

