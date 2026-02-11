// Professional HTML email templates for Ollie Hours

export const bookkeeperReportTemplate = (data) => {
  const { companyName, periodStart, periodEnd, employees } = data;
  
  const employeeRows = employees.map(emp => `
    <tr style="border-bottom: 1px solid #F6F5F1;">
      <td style="padding: 12px 16px; font-weight: 500; color: #263926;">${emp.name}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.sickDays}</td>
      <td style="padding: 12px 16px; text-align: right; color: #484848;">${emp.vacationDays}</td>
      <td style="padding: 12px 16px; text-align: right; font-family: 'Courier New', monospace; color: #263926;">${emp.hours}</td>
      <td style="padding: 12px 16px; text-align: right; font-family: 'Courier New', monospace; color: #263926;">${emp.decimalHours}</td>
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
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 16px;">
        <tr>
          <td>
            <img src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Hours.svg" alt="Ollie Hours" height="32" style="display: block; height: 32px; width: auto; max-width: 200px; max-height: 32px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; margin: 0 auto;">
          </td>
        </tr>
      </table>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Timesheet Report</h1>
      <p style="margin: 8px 0 0; color: #6B6B6B; font-size: 16px;">${companyName}</p>
    </div>

    <!-- Period Info -->
    <div style="background: white; border-radius: 16px; padding: 24px; margin-bottom: 10px; border: 1px solid #F6F5F1;">
      <p style="margin: 0; color: #6B6B6B; font-size: 14px; font-weight: 600; text-transform: uppercase;">Pay period</p>
      <p style="margin: 8px 0 0; color: #263926; font-size: 20px; font-weight: 600;">${periodStart} to ${periodEnd}</p>
    </div>

    <!-- Employee Table -->
    <div style="background: white; border-radius: 16px; overflow: hidden; border: 1px solid #F6F5F1; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #F0EEE6; border-bottom: 1px solid #F6F5F1;">
            <th style="padding: 16px; text-align: left; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Employee</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Sick</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Vacation</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">Hours</th>
            <th style="padding: 16px; text-align: right; font-size: 11px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.5px;">QBO Hours</th>
          </tr>
        </thead>
        <tbody>
          ${employeeRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Hours</p>
      <p style="margin: 8px 0 0;">This is an automated report. Please do not reply to this email.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const teamInvitationTemplate = (data) => {
  const { employeeName, companyName, role, appUrl, companyLogoUrl, invitationToken } = data;
  
  // Use custom logo if provided, otherwise fall back to default Ollie Hours logo
  const logoUrl = companyLogoUrl || 'https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Hours.svg';
  
  // Create the invitation URL with token
  const invitationUrl = `${appUrl}/accept-invitation?token=${invitationToken}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Logo -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <img src="${logoUrl}" alt="${companyName}" height="32" style="display: block; height: 32px; width: auto; max-width: 200px; max-height: 32px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;">
        </td>
      </tr>
    </table>

    <!-- Greeting -->
    <h1 style="margin: 0 0 8px; font-size: 20px; color: #263926; font-weight: 700;">Hey ${employeeName}! Welcome to the team. 👋</h1>
    <p style="margin: 0 0 24px; font-size: 14px; color: #6B6B6B; line-height: 1.6;">
      You're joining <strong>${companyName}</strong> as <strong>${role}</strong>
    </p>

    <!-- Quick Start Guide Card -->
    <div style="background-color: #FAF9F5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 16px; color: #263926; font-weight: 700;">Quick Start Guide</h2>
      
      <p style="margin: 0 0 12px; font-size: 14px; color: #263926; line-height: 1.6;">
        <strong>⏰ Clock In & Out</strong><br>
        <span style="color: #6B6B6B;">Tap "Clock In" when you start work, and "Clock Out" when you finish.</span>
      </p>

      <p style="margin: 0 0 12px; font-size: 14px; color: #263926; line-height: 1.6;">
        <strong>☕ Take Breaks</strong><br>
        <span style="color: #6B6B6B;">Start and end breaks with one tap. We'll track it automatically.</span>
      </p>

      <p style="margin: 0 0 12px; font-size: 14px; color: #263926; line-height: 1.6;">
        <strong>🏖️ Time Off</strong><br>
        <span style="color: #6B6B6B;">Mark sick days or vacation directly in the app.</span>
      </p>

      <p style="margin: 0; font-size: 14px; color: #263926; line-height: 1.6;">
        <strong>📅 View History</strong><br>
        <span style="color: #6B6B6B;">Check your hours, schedule, and remaining vacation days anytime.</span>
      </p>
    </div>

    <!-- CTA Button -->
    <div style="margin: 0 0 32px;">
      <a href="${invitationUrl}" style="display: inline-block; background-color: #2CA01C; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        Join ${companyName}
      </a>
    </div>

    <!-- Footer -->
    <p style="margin: 0; color: #9CA3AF; font-size: 13px; line-height: 1.6;">
      Sent from Ollie Hours
    </p>

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
      <p style="margin: 0;">Sent from Ollie Hours</p>
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
  <title>Time Adjustment Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 16px;">
        <tr>
          <td>
            <img src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Hours.svg" alt="Ollie Hours" height="32" style="display: block; height: 32px; width: auto; max-width: 200px; max-height: 32px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; margin: 0 auto;">
          </td>
        </tr>
      </table>
      <h1 style="margin: 0; font-size: 24px; color: #263926; font-weight: 700;">Time Adjustment Request</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 16px;">Hi ${adminName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6; font-size: 15px;">
        <strong>${employeeName}</strong> requested a time adjustment for <strong>${date}</strong>:
      </p>
      
      <!-- Request Details -->
      <div style="background: #F0EEE6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; color: #263926; font-size: 15px; line-height: 1.6;">${requestSummary}</p>
      </div>
      
      <div style="text-align: center; margin: 24px 0 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">Review Request</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Hours</p>
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
      <p style="margin: 0;">Sent from Ollie Hours</p>
      <p style="margin: 8px 0 0;">This is an automated notification.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const vacationRequestNotificationTemplate = (data) => {
  const { adminName, employeeName, startDate, endDate, daysCount, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vacation Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: #E0F2FE; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">✈️</span>
      </div>
      <h1 style="margin: 0; font-size: 24px; color: #263926; font-weight: 700;">Vacation Request</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 16px;">Hi ${adminName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6; font-size: 15px;">
        <strong>${employeeName}</strong> requested vacation time:
      </p>
      
      <!-- Request Details -->
      <div style="background: #E0F2FE; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; color: #0369A1; font-size: 14px;"><strong>Start Date:</strong> ${startDate}</p>
        <p style="margin: 0 0 12px; color: #0369A1; font-size: 14px;"><strong>End Date:</strong> ${endDate}</p>
        <p style="margin: 0; color: #0369A1; font-size: 14px;"><strong>Total Days:</strong> ${daysCount} day${daysCount === 1 ? '' : 's'}</p>
      </div>
      
      <div style="text-align: center; margin: 24px 0 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">Review Request</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Hours</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const vacationApprovalTemplate = (data) => {
  const { employeeName, date, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vacation Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: #ECFDF5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">✅</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Vacation Approved!</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${employeeName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        Great news! Your vacation request for <strong>${date}</strong> has been <strong style="color: #065F46;">approved</strong>.
      </p>
      
      <div style="background: #ECFDF5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; color: #065F46; font-size: 14px; line-height: 1.6;">
          Your vacation day is now confirmed in the system. You won't be expected to clock in on this date. Enjoy your time off!
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">View Schedule</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Hours</p>
      <p style="margin: 8px 0 0;">This is an automated notification.</p>
    </div>

  </div>
</body>
</html>
  `;
};

export const vacationDenialTemplate = (data) => {
  const { employeeName, date, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vacation Request Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #FAF9F5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="width: 64px; height: 64px; background: #FEF2F2; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
        <span style="font-size: 32px;">📋</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; color: #263926; font-weight: 700;">Vacation Request Update</h1>
    </div>

    <!-- Message Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #F6F5F1;">
      <p style="margin: 0 0 16px; color: #263926; font-size: 18px;">Hi ${employeeName},</p>
      <p style="margin: 0 0 24px; color: #484848; line-height: 1.6;">
        We wanted to let you know that your vacation request for <strong>${date}</strong> was <strong style="color: #991B1B;">not approved</strong> at this time.
      </p>
      
      <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
          Please speak with your manager if you have questions or would like to discuss alternative dates.
        </p>
      </div>

      <div style="text-align: center; margin: 24px 0 0;">
        <a href="${appUrl}" style="display: inline-block; background: #2CA01C; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px;">View Schedule</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
      <p style="margin: 0;">Sent from Ollie Hours</p>
      <p style="margin: 8px 0 0;">This is an automated notification.</p>
    </div>

  </div>
</body>
</html>
  `;
};


