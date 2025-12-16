# Ollie Timesheets

A modern, beautiful timesheet management system built for creative agencies and small businesses. Track employee hours, manage time off, and generate payroll reports with ease.

## ✨ Features

- **Easy Clock In/Out** - Simple interface for employees to track their time
- **Break Tracking** - Automatic break time calculation
- **Time Off Management** - Handle sick days and vacation tracking
- **Change Requests** - Employees can request timecard adjustments
- **Admin Dashboard** - Review and approve all timesheets
- **Payroll Reports** - Generate and email reports to your bookkeeper
- **Team Management** - Invite and manage team members
- **Email Notifications** - Automated alerts for missing clockouts and change requests
- **Multi-User Access** - Role-based permissions (Owner, Admin, Employee, Accountant)
- **Beautiful UI** - Modern design with Raleway font

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works great!)
- Resend account for emails

### Installation

1. **Clone and install dependencies:**

```bash
cd "Ollie Timesheet"
npm install
cd server && npm install && cd ..
```

2. **Set up Supabase:**

Follow the detailed guide in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)

Quick version:
- Create a project at [supabase.com](https://supabase.com)
- Run the SQL schema from `supabase-schema.sql`
- Get your API keys from Settings → API

3. **Configure environment variables:**

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Create `server/.env`:

```env
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=onboarding@resend.dev
PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. **Start the app:**

```bash
# Terminal 1: Start the backend email server
npm run server:dev

# Terminal 2: Start the frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🎯 User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full access - manage everything |
| **Admin** | Manage team, approve timesheets, view all data |
| **Employee** | Clock in/out, view own timesheet, request changes |
| **Accountant** | View all timesheets (read-only), export reports |

## 📧 Email Features

The app sends professional HTML emails for:

✅ **Bookkeeper Reports** - Formatted pay period summaries  
✅ **Team Invitations** - Welcome emails with onboarding instructions  
✅ **Missing Clockout Alerts** - Remind employees to complete timecards  
✅ **Change Request Notifications** - Alert admins of pending requests  
✅ **Approval Notifications** - Notify employees of approved/rejected changes  

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Supabase (PostgreSQL + Auth + RLS)
    ↓
Backend (Express Email Server)
    ↓
Resend (Email Delivery)
```

### Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, Resend SDK
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Email**: Resend API
- **Fonts**: Raleway (Google Fonts)

## 📁 Project Structure

```
Ollie Timesheet/
├── App.tsx                 # Main app component
├── store.tsx               # State management & business logic
├── types.ts                # TypeScript interfaces
├── utils.ts                # Helper functions
├── apiClient.ts            # API client for email endpoints
├── supabaseClient.ts       # Supabase configuration
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── DatePicker.tsx
│   ├── TimeCardModal.tsx
│   └── PeriodDetailModal.tsx
├── ui/                     # shadcn/ui components
├── server/                 # Backend email server
│   ├── index.js           # Express server
│   ├── emailService.js    # Resend integration
│   ├── emailTemplates.js  # HTML email templates
│   └── .env               # Backend environment variables
├── supabase-schema.sql    # Database schema
└── SUPABASE_SETUP.md      # Detailed setup guide
```

## 🔐 Security

- **Row Level Security (RLS)** - Database-level access control
- **JWT Authentication** - Secure user sessions via Supabase
- **API Key Protection** - Backend server keeps Resend key secure
- **Rate Limiting** - Prevents email spam
- **Email Validation** - Verifies all email addresses before sending

## 🎨 Design System

- **Primary Color**: #2CA01C (Green)
- **Background**: #FAF9F5 (Warm cream)
- **Text**: #263926 (Dark green), #484848 (Gray)
- **Borders**: #F6F5F1 (Light cream)
- **Font**: Raleway (300-800 weights)

## 🧪 Testing

To test email functionality:

1. Start both frontend and backend servers
2. Use Resend's test email: `delivered@resend.dev`
3. Check [Resend Dashboard](https://resend.com/emails) to see sent emails
4. Test each flow:
   - Add employee → invitation email
   - Clock in/out → missing clockout alert (next day)
   - Request change → admin notification
   - Approve change → employee notification
   - Send to bookkeeper → payroll report

## 📝 Development Workflow

```bash
# Frontend development
npm run dev

# Backend development (with auto-restart)
npm run server:dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

1. Connect your Git repository
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Railway/Render/Fly.io)

1. Deploy the `server/` directory
2. Set environment variables:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`
   - `PORT`
   - `FRONTEND_URL`
3. Start command: `npm start`

### Database

Supabase handles hosting - no deployment needed!

## 🐛 Troubleshooting

### Emails not sending?

- Check Resend API key in `server/.env`
- Verify backend server is running on port 3001
- Check Resend dashboard for error logs
- Ensure email addresses are valid

### Can't log in?

- Verify Supabase credentials in `.env.local`
- Check user exists in Supabase Auth dashboard
- Confirm user role is set in profiles table

### Data not saving?

- Check browser console for errors
- Verify Supabase RLS policies
- Ensure user has correct permissions

### Development issues?

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
rm -rf server/node_modules server/package-lock.json
npm install
cd server && npm install
```

## 📚 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)

## 💬 Support

Questions? Check these resources:

- `SUPABASE_SETUP.md` - Detailed database setup
- `supabase-schema.sql` - Database structure with comments
- GitHub Issues - Report bugs or request features

## 📄 License

MIT License - feel free to use this for your business!

---

Built with ❤️ for creative agencies who need simple, beautiful timesheet management.
