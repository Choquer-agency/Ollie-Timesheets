import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import 'dotenv/config';
import {
  sendBookkeeperReport,
  sendTeamInvitation,
  sendMissingClockoutAlert,
  sendChangeRequestNotification,
  sendChangeApprovalNotification
} from './server/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 10;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
};

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Ollie Timesheets Server is running',
    timestamp: new Date().toISOString()
  });
});

// Email API routes
app.post('/api/email/bookkeeper', rateLimiter, async (req, res) => {
  try {
    const { bookkeeperEmail, companyName, periodStart, periodEnd, employees, totalPayroll } = req.body;

    if (!bookkeeperEmail || !companyName || !periodStart || !periodEnd || !employees || totalPayroll === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await sendBookkeeperReport({
      bookkeeperEmail,
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

app.post('/api/email/invite-team-member', rateLimiter, async (req, res) => {
  try {
    const { employeeEmail, employeeName, companyName, role, appUrl, companyLogoUrl } = req.body;

    if (!employeeEmail || !employeeName || !companyName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    console.log('Sending team invitation with logo:', companyLogoUrl);

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

// Serve static files from dist folder
app.use(express.static(join(__dirname, 'dist')));

// Catch-all route to serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ollie Timesheets Server running on port ${PORT}`);
  console.log(`📧 Resend API configured: ${process.env.RESEND_API_KEY ? 'Yes' : 'No'}`);
  console.log(`📧 From email: ${process.env.FROM_EMAIL || 'Not set'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'production'}`);
});

