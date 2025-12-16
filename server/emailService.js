import { Resend } from 'resend';
import {
  bookkeeperReportTemplate,
  teamInvitationTemplate,
  missingClockoutTemplate,
  changeRequestNotificationTemplate,
  changeApprovalTemplate
} from './emailTemplates.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// Validate email address format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send bookkeeper report email
export const sendBookkeeperReport = async (data) => {
  const { bookkeeperEmail, companyName, periodStart, periodEnd, employees, totalPayroll } = data;

  if (!isValidEmail(bookkeeperEmail)) {
    throw new Error('Invalid bookkeeper email address');
  }

  const html = bookkeeperReportTemplate({
    companyName,
    periodStart,
    periodEnd,
    employees,
    totalPayroll
  });

  try {
    const result = await resend.emails.send({
      from: `${companyName} Timesheets <${FROM_EMAIL}>`,
      to: bookkeeperEmail,
      subject: `${companyName}: Timesheet Report (${periodStart} - ${periodEnd})`,
      html
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending bookkeeper report:', error);
    throw new Error(`Failed to send bookkeeper report: ${error.message}`);
  }
};

// Send team member invitation email
export const sendTeamInvitation = async (data) => {
  const { employeeEmail, employeeName, companyName, role, appUrl } = data;

  if (!isValidEmail(employeeEmail)) {
    throw new Error('Invalid employee email address');
  }

  const html = teamInvitationTemplate({
    employeeName,
    companyName,
    role,
    appUrl: appUrl || process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  try {
    const result = await resend.emails.send({
      from: `${companyName} <${FROM_EMAIL}>`,
      to: employeeEmail,
      subject: `Welcome to ${companyName} - Get Started with Ollie Timesheets`,
      html
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending team invitation:', error);
    throw new Error(`Failed to send team invitation: ${error.message}`);
  }
};

// Send missing clockout alert
export const sendMissingClockoutAlert = async (data) => {
  const { employeeEmail, employeeName, date, appUrl } = data;

  if (!isValidEmail(employeeEmail)) {
    throw new Error('Invalid employee email address');
  }

  const html = missingClockoutTemplate({
    employeeName,
    date,
    appUrl: appUrl || process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  try {
    const result = await resend.emails.send({
      from: `Ollie Timesheets <${FROM_EMAIL}>`,
      to: employeeEmail,
      subject: `Action Required: Missing Clock Out for ${date}`,
      html
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending missing clockout alert:', error);
    throw new Error(`Failed to send missing clockout alert: ${error.message}`);
  }
};

// Send change request notification to admin
export const sendChangeRequestNotification = async (data) => {
  const { adminEmail, adminName, employeeName, date, requestSummary, appUrl } = data;

  if (!isValidEmail(adminEmail)) {
    throw new Error('Invalid admin email address');
  }

  const html = changeRequestNotificationTemplate({
    adminName,
    employeeName,
    date,
    requestSummary,
    appUrl: appUrl || process.env.FRONTEND_URL || 'http://localhost:5173'
  });

  try {
    const result = await resend.emails.send({
      from: `Ollie Timesheets <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `Timecard Change Request from ${employeeName}`,
      html
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending change request notification:', error);
    throw new Error(`Failed to send change request notification: ${error.message}`);
  }
};

// Send change approval/rejection notification to employee
export const sendChangeApprovalNotification = async (data) => {
  const { employeeEmail, employeeName, date, status, adminNotes } = data;

  if (!isValidEmail(employeeEmail)) {
    throw new Error('Invalid employee email address');
  }

  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Status must be either "approved" or "rejected"');
  }

  const html = changeApprovalTemplate({
    employeeName,
    date,
    status,
    adminNotes
  });

  try {
    const result = await resend.emails.send({
      from: `Ollie Timesheets <${FROM_EMAIL}>`,
      to: employeeEmail,
      subject: `Timecard ${status === 'approved' ? 'Approved' : 'Update'} for ${date}`,
      html
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending change approval notification:', error);
    throw new Error(`Failed to send change approval notification: ${error.message}`);
  }
};

