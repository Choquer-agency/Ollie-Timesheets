# Vacation Request Feature - Quick Start Guide

## 🎯 What's New?

Employees can now request future vacation days directly through the app! No more Slack messages - everything is tracked in the system.

## 📝 Before You Start

**IMPORTANT**: Run this SQL migration in your Supabase dashboard first:

```sql
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS pending_approval BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_time_entries_pending_approval 
ON time_entries(pending_approval) 
WHERE pending_approval = TRUE;
```

**Steps**:
1. Go to your Supabase project
2. Click "SQL Editor" in the left menu
3. Paste the SQL above
4. Click "Run"

## 👨‍💼 For Employees

### How to Request Vacation:

1. Open the app and login
2. Click the **"✈️ Request Vacation Day"** button (big blue button)
3. Select your start date and end date
4. Review the number of days and your remaining balance
5. Click **"Request Vacation"**
6. Done! You'll see a "Pending" status until your admin approves it

### What You'll See:
- Your vacation balance (remaining days)
- Validation if dates conflict with existing entries
- Warning if you exceed your available vacation days
- "Pending" badge in your history for unappro ved requests

## 👨‍💼 For Admins

### How to Review Requests:

1. You'll receive an email notification
2. Login and look for the review filter notification badge (it will show increased count)
3. Click the **Review Filter** toggle
4. Look for purple **"Vacation Request"** badges
5. Click on any vacation request to open details
6. Review the request and click:
   - **"Approve Vacation"** ✅ to approve
   - **"Deny Vacation"** ❌ to deny

### What Happens:
- **Approved**: Entry becomes a confirmed vacation day
- **Denied**: Entry is deleted, employee is notified
- Employee receives email notification either way

## 🎨 Visual Guide

### Employee View:
- **Button**: Sky blue "Request Vacation Day" button with airplane emoji
- **Modal**: Clean calendar picker with date selectors
- **Balance Display**: Shows used/remaining/total vacation days

### Admin View:
- **Badge**: Purple "Vacation Request" badge (different from orange "Review" badge for time changes)
- **Banner**: Purple notification banner in TimeCardModal
- **Buttons**: Green "Approve Vacation" and red "Deny Vacation"

## ✉️ Email Notifications

### Emails Sent:
1. **To Admin**: When employee submits request
2. **To Employee**: When admin approves
3. **To Employee**: When admin denies

All emails use professional templates matching your brand.

## ❓ FAQs

**Q: Can employees request past dates?**
A: No, the system prevents requesting vacation for past dates.

**Q: Can employees request multiple days at once?**
A: Yes! Select a start and end date to request a range of days.

**Q: What if an employee requests more days than they have?**
A: The system shows a warning but still allows the request (admin can see and decide).

**Q: Can employees cancel their own requests?**
A: Not yet - they need to contact admin. This can be added in a future update.

**Q: What happens to existing vacation days?**
A: Nothing changes! This feature is only for NEW vacation requests. Existing vacation entries work exactly the same.

**Q: Where do vacation requests appear for admins?**
A: In the Daily Review section, alongside change requests. Use the review filter to see all pending items.

## 🐛 Troubleshooting

**Problem**: Button doesn't appear for employee
- **Solution**: Make sure they're logged in as an employee (not admin view)

**Problem**: Dates are greyed out in calendar
- **Solution**: Those dates already have entries (clock in/out, sick day, or vacation)

**Problem**: Emails not sending
- **Solution**: Check your `.env` file has valid `RESEND_API_KEY` and `FROM_EMAIL`

**Problem**: "Vacation Request" badge not showing for admin
- **Solution**: Make sure you ran the database migration (see "Before You Start")

## 🎉 Success Checklist

- [ ] Database migration completed
- [ ] Employee can see "Request Vacation Day" button
- [ ] Employee can select dates and submit request
- [ ] Admin receives email notification
- [ ] Admin sees purple "Vacation Request" badge in review filter
- [ ] Admin can approve/deny requests
- [ ] Employee receives approval/denial email
- [ ] Approved requests show as "Vacation" in calendar

## 📚 Technical Details

For developers and advanced users, see:
- `VACATION_REQUEST_IMPLEMENTATION.md` - Complete technical documentation
- `/.cursor/plans/vacation_request_feature_*.plan.md` - Original implementation plan

---

**Need Help?** Check the implementation docs or contact support.
