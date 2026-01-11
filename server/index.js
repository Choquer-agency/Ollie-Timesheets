import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  sendBookkeeperReport,
  sendTeamInvitation,
  sendMissingClockoutAlert,
  sendChangeRequestNotification,
  sendChangeApprovalNotification
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

// Rate limiting map (simple in-memory rate limiting)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  
  // Filter out old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
};

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.'
    });
  }
  
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ollie Timesheets Email Server is running' });
});

// POST /api/email/bookkeeper - Send pay period report to bookkeeper
app.post('/api/email/bookkeeper', rateLimiter, async (req, res) => {
  try {
    const { bookkeeperEmail, ownerEmail, companyName, periodStart, periodEnd, employees, totalPayroll } = req.body;

    // Validate required fields
    if (!bookkeeperEmail || !companyName || !periodStart || !periodEnd || !employees || totalPayroll === undefined) {
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
      employees,
      totalPayroll
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

// POST /api/email/invite-team-member - Send invitation to new team member
app.post('/api/email/invite-team-member', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, companyName, role, appUrl, companyLogoUrl } = req.body;

    // Validate required fields
    if (!employeeEmail || !employeeName || !companyName || !role) {
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
      companyLogoUrl
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

// POST /api/email/missing-clockout - Alert employee about missing clockout
app.post('/api/email/missing-clockout', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, appUrl } = req.body;

    // Validate required fields
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

// POST /api/email/change-request-notification - Notify admin of change request
app.post('/api/email/change-request-notification', rateLimiter, async (req, res) => {
  try {
    const { adminEmail, adminName, employeeName, date, requestSummary, appUrl } = req.body;

    // Validate required fields
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

// POST /api/email/change-approval - Notify employee of approval/rejection
app.post('/api/email/change-approval', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, date, status, adminNotes } = req.body;

    // Validate required fields
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ollie Timesheets Email Server running on http://localhost:${PORT}`);
  console.log(`📧 Resend API configured: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
});

