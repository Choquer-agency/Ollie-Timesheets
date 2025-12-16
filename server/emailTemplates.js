// Professional HTML email templates for Ollie Timesheets

export const bookkeeperReportTemplate = (data) => {
  const { companyName, periodStart, periodEnd, employees, totalPayroll } = data;
  
  const employeeRows = employees.map(emp => `
    <tr style="border-bottom: 1px solid #F6F5F1;">
      <td style="padding: 12px 16px; font-weight: 500; color: #263926;">${emp.name}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.role}</td>
      <td style="padding: 12px 16px; text-align: right; font-family: 'Courier New', monospace; color: #263926;">${emp.hours}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.daysWorked}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.sickDays}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.vacationDays}</td>
      <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #2CA01C;">$${emp.totalPay.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Timesheet Report - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Timesheets.svg" alt="Ollie Timesheets" style="height: 32px; margin-bottom: 16px;">
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Timesheet Report</h1>
      <p style="margin: 8px 0 0; color: #6B6B6B; font-size: 16px;">${companyName}</p>
    </div>

    <!-- Period Info -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0; color: #6B6B6B; font-size: 14px; font-weight: 600; text-transform: uppercase;">Pay period</p>
      <p style="margin: 8px 0 0; color: #263926; font-size: 20px; font-weight: 600;">${periodStart} to ${periodEnd}</p>
    </div>

    <!-- Employee Table -->
    <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #F6F5F1; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #F0EEE6; border-bottom: 1px solid #F6F5F1;">
            <th style="padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Employee</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Role</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Hours</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Days</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Sick</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Vacation</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Total pay</th>
          </tr>
        </thead>
        <tbody>
          ${employeeRows}
        </tbody>
      </table>
    </div>

    <!-- Total Payroll -->
    <div style="background: #2CA01C; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
      <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total payroll</p>
      <p style="margin: 8px 0 0; color: white; font-size: 36px; font-weight: 700;">$${totalPayroll.toFixed(2)}</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Timesheets</p>
      <p style="margin: 8px 0 0;">This is an automated report. Please do not reply to this email.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const teamInvitationTemplate = (data) => {
  const { employeeName, companyName, role, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Timesheets.svg" alt="Ollie Timesheets" style="height: 32px; margin-bottom: 16px;">
      <h1 style="margin: 0; font-size: 32px; color: #263926; font-weight: 700;">Welcome to the team! 🎉</h1>
    </div>

    <!-- Welcome Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${employeeName},</p>
      <p style="margin: 0 0 16px; color: #484848; line-height: 1.6;">
        Welcome to ${companyName}! We're excited to have you as our new ${role}.
      </p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        You've been added to our timesheet system. Here's everything you need to know to get started:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Open Ollie Timesheets</a>
      </div>
    </div>

    <!-- Getting Started -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <h2 style="margin: 0 0 20px; font-size: 20px; color: #263926; font-weight: 700;">Getting started</h2>
      
      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #263926; font-weight: 600;">⏰ Clocking in & out</h3>
        <p style="margin: 0; color: #6B6B6B; line-height: 1.6; font-size: 14px;">
          When you arrive for work, click "Clock In" on the main screen. When you're done for the day, click "Clock Out". It's that simple!
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #263926; font-weight: 600;">☕ Taking breaks</h3>
        <p style="margin: 0; color: #6B6B6B; line-height: 1.6; font-size: 14px;">
          Need a break? Click "Start Break" when you step away. Don't forget to click "End Break" when you return. The system will track your break time automatically.
        </p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #263926; font-weight: 600;">🏖️ Time off & adjustments</h3>
        <p style="margin: 0; color: #6B6B6B; line-height: 1.6; font-size: 14px;">
          Taking a sick day or vacation? You can mark days as sick or vacation in the app. If you forgot to clock in or out, click "Adjust Today's Time" to request a correction.
        </p>
      </div>

      <div style="margin-bottom: 0;">
        <h3 style="margin: 0 0 8px; font-size: 16px; color: #263926; font-weight: 600;">📅 View your schedule</h3>
        <p style="margin: 0; color: #6B6B6B; line-height: 1.6; font-size: 14px;">
          Click "View Schedule & Vacation" to see your work history, total hours, and remaining vacation days.
        </p>
      </div>
    </div>

    <!-- Important Note -->
    <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 16px; padding: 20px; margin-bottom: 32px;">
      <p style="margin: 0; color: #C2410C; font-size: 14px; line-height: 1.6;">
        <strong>⚠️ Important:</strong> If you forget to clock out at the end of the day, the system will remind you the next morning to fix your timecard.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Questions? Reach out to your manager.</p>
      <p style="margin: 8px 0 0;">Sent from Ollie Timesheets</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const missingClockoutTemplate = (data) => {
  const { employeeName, date, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Action Required - Missing Clock Out</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: #FEF3C7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">⚠️</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Action required</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${employeeName},</p>
      <p style="margin: 0 0 16px; color: #484848; line-height: 1.6;">
        It looks like you didn't clock out on <strong>${date}</strong>. 
      </p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        Please update your timecard so we can process your hours correctly.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Fix my timecard</a>
      </div>

      <div style="background: #F0EEE6; border-radius: 12px; padding: 16px; margin-top: 24px;">
        <p style="margin: 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
          <strong>How to fix it:</strong> Open the app, click "Adjust Today's Time" and enter your correct clock out time. Your manager will review and approve it.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Timesheets</p>
      <p style="margin: 8px 0 0;">This is an automated reminder.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const changeRequestNotificationTemplate = (data) => {
  const { adminName, employeeName, date, requestSummary, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Timecard Change Request - ${employeeName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: #EEF2FF; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">📋</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Timecard change request</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${adminName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        <strong>${employeeName}</strong> has submitted a change request for their timecard on <strong>${date}</strong>.
      </p>
      
      <!-- Request Details -->
      <div style="background: #F0EEE6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #6B6B6B; font-size: 12px; font-weight: 600; text-transform: uppercase;">Requested changes</p>
        <p style="margin: 0; color: #263926; font-size: 14px; line-height: 1.6;">${requestSummary}</p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">Review request</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Timesheets</p>
      <p style="margin: 8px 0 0;">This is an automated notification.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const changeApprovalTemplate = (data) => {
  const { employeeName, date, status, adminNotes } = data;

  const isApproved = status === 'approved';
  const emoji = isApproved ? '✅' : '❌';
  const bgColor = isApproved ? '#ECFDF5' : '#FEF2F2';
  const statusText = isApproved ? 'approved' : 'rejected';
  const statusColor = isApproved ? '#065F46' : '#991B1B';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Timecard ${isApproved ? 'Approved' : 'Update'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: ${bgColor}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">${emoji}</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Timecard ${statusText}</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${employeeName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        Your timecard change request for <strong>${date}</strong> has been <strong style="color: ${statusColor};">${statusText}</strong>.
      </p>
      
      ${adminNotes ? `
      <div style="background: #F0EEE6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #6B6B6B; font-size: 12px; font-weight: 600; text-transform: uppercase;">Manager notes</p>
        <p style="margin: 0; color: #263926; font-size: 14px; line-height: 1.6;">${adminNotes}</p>
      </div>
      ` : ''}

      <p style="margin: 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
        ${isApproved 
          ? 'Your timecard has been updated with the approved changes.' 
          : 'If you have questions about this decision, please speak with your manager.'}
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Timesheets</p>
      <p style="margin: 8px 0 0;">This is an automated notification.</p>
    </div>

  </div>
</body>
</html>
  `;
};

