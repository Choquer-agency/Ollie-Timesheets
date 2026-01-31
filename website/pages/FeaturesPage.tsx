import React, { useEffect } from 'react';
import { Clock, AlertTriangle, Users, Calendar, Mail, Shield } from 'lucide-react';

interface FeaturesPageProps {
  activeFeature: string | null;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ activeFeature }) => {
  useEffect(() => {
    if (activeFeature) {
      const el = document.getElementById(activeFeature);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeFeature]);

  return (
    <div className="pt-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h1 className="text-5xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
          Powerful features. Zero clutter.
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
          We stripped away the complexity of enterprise HR software and built a tool designed for speed, accuracy, and automation.
        </p>
      </div>

      {/* Feature: Clock In / Out */}
      <section id="clock" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div>
          <div className="w-12 h-12 bg-[#A1EB97]/30 rounded-xl flex items-center justify-center text-[#2CA01C] mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Clock In, Clock Out, Done.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            A frictionless experience for employees. With a single tap, they can start their day, log breaks, and clock out. We handle the time math, overtime calculations, and timestamping instantly.
          </p>
          <ul className="space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Simple 1-click interface
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Live timer display
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Mobile-optimized
            </li>
          </ul>
        </div>
        <div className="bg-secondary border border-border rounded-3xl p-8 aspect-video flex items-center justify-center shadow-lg">
          {/* Visual Placeholder */}
          <div className="bg-card p-6 rounded-2xl border border-border w-64 text-center shadow-md">
            <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Current Status</div>
            <div className="text-3xl font-mono font-bold text-[#263926] dark:text-[#a8d5a2] mb-6">09:41:00</div>
            <div className="h-10 bg-[#2CA01C] rounded-lg w-full flex items-center justify-center text-white font-bold text-sm">
              Clock Out
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Smart Roadblocks */}
      <section id="smart-checks" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div className="order-2 md:order-1 bg-secondary border border-border rounded-3xl p-8 aspect-video flex items-center justify-center relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-red-500/5"></div>
          <div className="bg-card p-6 rounded-xl shadow-2xl max-w-sm text-center border border-border">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-1 text-[#263926] dark:text-[#a8d5a2]">Action Required</h3>
            <p className="text-muted-foreground text-sm mb-4">You missed a clock out yesterday.</p>
            <div className="h-8 bg-[#263926] dark:bg-white text-white dark:text-[#263926] text-sm rounded flex items-center justify-center font-bold">
              Fix Now
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Intelligent "Roadblocks"
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            If an employee forgets to clock out, Ollie catches it. The next time they try to clock in, the system pauses them and asks them to resolve yesterday's error immediately. This keeps your data clean and eliminates end-of-month cleanup.
          </p>
          <ul className="space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="text-red-500">✓</span> Prevents compounding errors
            </li>
            <li className="flex gap-3">
              <span className="text-red-500">✓</span> Forces resolution before new work begins
            </li>
          </ul>
        </div>
      </section>

      {/* Feature: Vacation & Sick Days */}
      <section id="vacation" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Vacation & Sick Day Tracking
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Employees can request time off directly in the app. Admins approve with one click, and the calendar updates automatically. Track remaining days, half-days, and even sick leave patterns.
          </p>
          <ul className="space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span> One-click approval workflow
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span> Automatic balance tracking
            </li>
            <li className="flex gap-3">
              <span className="text-blue-500">✓</span> Half-day support
            </li>
          </ul>
        </div>
        <div className="bg-secondary border border-border rounded-3xl p-8 aspect-video flex items-center justify-center shadow-lg">
          <div className="bg-card p-6 rounded-2xl border border-border w-72 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-[#263926] dark:text-[#a8d5a2]">Vacation Request</span>
              <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded font-bold">PENDING</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex justify-between">
                <span>Start:</span>
                <span className="font-medium text-foreground">Dec 23, 2024</span>
              </div>
              <div className="flex justify-between">
                <span>End:</span>
                <span className="font-medium text-foreground">Dec 27, 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Days:</span>
                <span className="font-medium text-foreground">5</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 h-8 bg-[#2CA01C] text-white text-sm rounded font-bold">Approve</button>
              <button className="flex-1 h-8 bg-secondary text-foreground text-sm rounded font-bold border border-border">Deny</button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Roles & Bookkeeper */}
      <section id="bookkeeper" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div className="order-2 md:order-1 bg-secondary border border-border rounded-3xl p-8 aspect-video flex flex-col items-center justify-center shadow-lg">
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted-foreground">USER</span>
              <span className="text-xs font-bold bg-[#A1EB97]/30 text-[#2CA01C] px-2 py-0.5 rounded">ADMIN</span>
            </div>
            <div className="h-2 bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-secondary rounded w-1/2"></div>
          </div>
          <div className="w-full max-w-xs bg-card border border-border rounded-lg p-4 opacity-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted-foreground">USER</span>
              <span className="text-xs font-bold bg-secondary text-muted-foreground px-2 py-0.5 rounded">VIEW ONLY</span>
            </div>
            <div className="h-2 bg-secondary rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-secondary rounded w-1/2"></div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="w-12 h-12 bg-[#A1EB97]/30 rounded-xl flex items-center justify-center text-[#2CA01C] mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Roles for Everyone
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Secure your account with granular permissions.
          </p>
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-[#263926] dark:text-[#a8d5a2] mb-1">Owner Admin</h4>
              <p className="text-sm text-muted-foreground">Full control. Edit time, manage team, change settings.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#263926] dark:text-[#a8d5a2] mb-1">Bookkeeper View</h4>
              <p className="text-sm text-muted-foreground">View-only access to verify hours and run payroll reports. No editing rights.</p>
            </div>
            <div>
              <h4 className="font-bold text-[#263926] dark:text-[#a8d5a2] mb-1">Delegate Admin</h4>
              <p className="text-sm text-muted-foreground">Can manage the team without changing company-wide billing settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Direct Email */}
      <section id="email" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div>
          <div className="w-12 h-12 bg-[#A1EB97]/30 rounded-xl flex items-center justify-center text-[#2CA01C] mb-6">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Direct-to-Bookkeeper Email
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            No more downloading CSVs and forwarding emails. With one click, send polished payroll reports directly to your accountant. They get everything they need to run payroll without any back-and-forth.
          </p>
          <ul className="space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> One-click report delivery
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Professional email formatting
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Attached CSV for easy import
            </li>
          </ul>
        </div>
        <div className="bg-secondary border border-border rounded-3xl p-8 aspect-video flex items-center justify-center shadow-lg">
          <div className="bg-card p-6 rounded-2xl border border-border w-80 shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-[#2CA01C] rounded-full flex items-center justify-center text-white font-bold text-sm">O</div>
              <div>
                <div className="text-sm font-bold text-[#263926] dark:text-[#a8d5a2]">Ollie Hours</div>
                <div className="text-xs text-muted-foreground">to: bookkeeper@agency.com</div>
              </div>
            </div>
            <div className="text-sm font-medium text-[#263926] dark:text-[#a8d5a2] mb-2">Payroll Report: Oct 1-14</div>
            <div className="text-xs text-muted-foreground mb-4">Your bi-weekly payroll report is attached.</div>
            <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
              <div className="w-8 h-8 bg-[#A1EB97]/30 rounded flex items-center justify-center text-[#2CA01C] text-xs">📎</div>
              <span className="text-xs text-foreground">payroll_oct1-14.csv</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Security */}
      <section id="security" className="grid md:grid-cols-2 gap-12 items-center mb-32">
        <div className="order-2 md:order-1 bg-[#263926] border border-[#2CA01C]/30 rounded-3xl p-8 aspect-video flex items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(44,160,28,0.2),transparent_70%)]"></div>
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-[#2CA01C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-[#2CA01C]" />
            </div>
            <div className="text-white font-bold text-xl mb-2">Enterprise-Grade Security</div>
            <div className="text-white/60 text-sm">Powered by Supabase</div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="w-12 h-12 bg-[#A1EB97]/30 rounded-xl flex items-center justify-center text-[#2CA01C] mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            Security First
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Your data is protected with industry-leading security. Row-level security ensures employees only see their own data, while admins get the full picture.
          </p>
          <ul className="space-y-3 text-foreground">
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Row-level security (RLS)
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> Encrypted at rest and in transit
            </li>
            <li className="flex gap-3">
              <span className="text-[#2CA01C]">✓</span> SOC 2 compliant infrastructure
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
