import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory FIRST
dotenv.config({ path: join(__dirname, '..', '.env') });

// Now import everything else
import express from 'express';
import cors from 'cors';
import {
  sendBookkeeperReport,
  sendTeamInvitation,
  sendMissingClockoutAlert,
  sendChangeRequestNotification,
  sendChangeApprovalNotification,
  sendVacationRequestNotification,
  sendVacationApprovalNotification,
  sendVacationDenialNotification
} from './emailService.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Rate limiting helper (simple in-memory implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const record = requestCounts.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }
  
  record.count++;
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ollie-timesheets-email',
    timestamp: new Date().toISOString()
  });
});

// Email API routes
app.post('/api/email/bookkeeper', rateLimiter, async (req, res) => {
  try {
    const { bookkeeperEmail, ownerEmail, companyName, periodStart, periodEnd, employees } = req.body;

    if (!bookkeeperEmail || !companyName || !periodStart || !periodEnd || !employees) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendBookkeeperReport({
      bookkeeperEmail,
      ownerEmail,
      companyName,
      periodStart,
      periodEnd,
      employees
    });

    res.json(result);
  } catch (error) {
    console.error('Bookkeeper email error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/invite-team-member', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, companyName, role, appUrl, companyLogoUrl, invitationToken } = req.body;

    if (!employeeEmail || !employeeName || !companyName || !role || !invitationToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendTeamInvitation({
      employeeEmail,
      employeeName,
      companyName,
      role,
      appUrl,
      companyLogoUrl,
      invitationToken
    });

    res.json(result);
  } catch (error) {
    console.error('Team invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/missing-clockout', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, appUrl } = req.body;

    if (!employeeEmail || !employeeName || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendMissingClockoutAlert({
      employeeEmail,
      employeeName,
      date,
      appUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Missing clockout alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/change-request-notification', rateLimiter, async (req, res) => {
  try {
    const { adminEmail, adminName, employeeName, date, requestSummary, appUrl } = req.body;

    if (!adminEmail || !adminName || !employeeName || !date || !requestSummary) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendChangeRequestNotification({
      adminEmail,
      adminName,
      employeeName,
      date,
      requestSummary,
      appUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Change request notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/change-approval', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, status, adminNotes } = req.body;

    if (!employeeEmail || !employeeName || !date || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendChangeApprovalNotification({
      employeeEmail,
      employeeName,
      date,
      status,
      adminNotes
    });

    res.json(result);
  } catch (error) {
    console.error('Change approval notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/vacation-request', rateLimiter, async (req, res) => {
  try {
    const { adminEmail, adminName, employeeName, startDate, endDate, daysCount, appUrl } = req.body;

    if (!adminEmail || !adminName || !employeeName || !startDate || !endDate || !daysCount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendVacationRequestNotification({
      adminEmail,
      adminName,
      employeeName,
      startDate,
      endDate,
      daysCount,
      appUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Vacation request notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/vacation-approval', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, appUrl } = req.body;

    if (!employeeEmail || !employeeName || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendVacationApprovalNotification({
      employeeEmail,
      employeeName,
      date,
      appUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Vacation approval notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email/vacation-denial', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, appUrl } = req.body;

    if (!employeeEmail || !employeeName || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendVacationDenialNotification({
      employeeEmail,
      employeeName,
      date,
      appUrl
    });

    res.json(result);
  } catch (error) {
    console.error('Vacation denial notification error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email server running on port ${PORT}`);
  console.log(`📧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Set' : 'NOT SET'}`);
  console.log(`📬 FROM_EMAIL: ${process.env.FROM_EMAIL || 'onboarding@resend.dev'}`);
});
