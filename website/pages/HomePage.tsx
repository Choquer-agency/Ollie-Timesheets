import React, { useState, useEffect, useRef } from 'react';

// Declare UnicornStudio on window for TypeScript
declare global {
  interface Window {
    UnicornStudio?: {
      isInitialized?: boolean;
      init: () => void;
    };
  }
}

interface HomePageProps {
  onNavigate: (page: string, feature?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Ref for Unicorn Studio background container
  const unicornRef = useRef<HTMLDivElement>(null);

  // Interactive State: ROI Calculator
  const [employeeCount, setEmployeeCount] = useState(15);
  const annualSavings = (employeeCount * 0.25 * 5 * 52 * 30).toLocaleString();

  // Interactive State: Anomaly Fixer
  const [isFixed, setIsFixed] = useState(false);

  // Interactive State: Role Deck
  const [activeRole, setActiveRole] = useState<'admin' | 'bookkeeper' | 'employee'>('admin');

  // Interactive State: Leave Heatmap
  const [conflictResolved, setConflictResolved] = useState(false);

  // Interactive State: Payroll
  const [payrollSent, setPayrollSent] = useState(false);

  // Interactive State: Employee Timer (starts at ~45 minutes)
  const [elapsedSeconds, setElapsedSeconds] = useState(2732);

  // Interactive State: Bookkeeper week selector (0 = current week, 1 = last week, 2 = two weeks ago)
  const [bookkeeperWeekIndex, setBookkeeperWeekIndex] = useState(0);

  // Live timer effect - counts up every second when employee view is active
  useEffect(() => {
    if (activeRole === 'employee') {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeRole]);

  // Format elapsed time as HH:MM:SS
  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate the last 3 weeks from today for bookkeeper view
  const getWeekData = (weekOffset: number) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - (weekOffset * 7));
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 13); // 2-week period
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    const formatYear = (date: Date) => date.getFullYear();
    
    // Mock data that varies by week
    const weekData = [
      { hours: '120h 45m', payroll: '$14,280', label: 'Current Period' },
      { hours: '118h 30m', payroll: '$13,950', label: 'Previous Period' },
      { hours: '122h 15m', payroll: '$14,520', label: '2 Weeks Ago' }
    ];
    
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      year: formatYear(endDate),
      ...weekData[weekOffset]
    };
  };

  const currentWeekData = getWeekData(bookkeeperWeekIndex);

  // Get next month for vacation calendar
  const getNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthName = nextMonth.toLocaleDateString('en-US', { month: 'long' });
    const year = nextMonth.getFullYear();
    const daysInMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();
    return { monthName, year, daysInMonth };
  };

  const nextMonthData = getNextMonth();

  // Load Unicorn Studio script dynamically
  useEffect(() => {
    const loadUnicornStudio = () => {
      const u = window.UnicornStudio;
      if (u && u.init) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => u.init());
        } else {
          u.init();
        }
      } else {
        window.UnicornStudio = { isInitialized: false, init: () => {} };
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.4/dist/unicornStudio.umd.js';
        script.onload = () => {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              if (window.UnicornStudio) window.UnicornStudio.init();
            });
          } else {
            if (window.UnicornStudio) window.UnicornStudio.init();
          }
        };
        (document.head || document.body).appendChild(script);
      }
    };

    loadUnicornStudio();
  }, []);

  // Scroll-based fade effect for Unicorn Studio background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeEnd = 600; // Fade out completely after 600px scroll
      const baseOpacity = 0.5;
      const newOpacity = Math.max(0, baseOpacity * (1 - scrollY / fadeEnd));
      if (unicornRef.current) {
        unicornRef.current.style.opacity = String(newOpacity);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Run once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 md:py-24 overflow-hidden">
        {/* Unicorn Studio Background */}
        <div
          ref={unicornRef}
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{ opacity: 0.5 }}
        >
          <div
            data-us-project="WRA8w42XxUcyYmMFwz2R"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border text-xs font-semibold text-[#2CA01C] mb-8 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2CA01C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2CA01C]"></span>
            </span>
            Ollie Hours v1.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-medium tracking-tight mb-8 leading-[1.1] text-[#263926] dark:text-[#a8d5a2]">
            Time tracking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2CA01C] via-[#00D639] to-[#A1EB97]">
              reimagined for the future.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Hands-off payroll, smart compliance checks, and a seamless experience for modern agencies. Stop chasing hours. Start automating them.
          </p>
          <a 
            href="/app" 
            className="inline-block px-8 py-4 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all shadow-xl shadow-[#2CA01C]/20 hover:scale-105 transform"
          >
            Get Started for Free
          </a>
        </div>
      </section>

      {/* Core Features Section - Pain Points & Solutions */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(44,160,28,0.06),transparent_50%)]"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Pain-focused heading */}
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
              Tired of chasing timesheets, fixing errors, and manually calculating payroll?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're not alone. Most agencies lose hours every week on admin that should take minutes. Here's how Ollie fixes that.
            </p>
          </div>

          {/* Solution Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Real-Time Tracking */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Real-Time Tracking</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Employees clock in with one tap. You see who's working, who's on break, and who's done—live, no refreshing needed.
              </p>
            </div>

            {/* Card 2: Break Management */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Break Management</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Breaks are tracked automatically. No more guessing if lunch was 30 minutes or 90—it's all logged and deducted.
              </p>
            </div>

            {/* Card 3: Payroll Automation */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-xl bg-[#A1EB97]/40 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-[#2CA01C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Payroll Automation</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hours are calculated, formatted, and sent to your bookkeeper with one slide. No spreadsheets, no headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Deck Section - Views for Every Role */}
      <section className="py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(44,160,28,0.08),transparent_50%)]"></div>
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 items-center relative z-10">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-4xl font-heading font-medium mb-4 text-[#263926]">Views for every role.</h2>
            <p className="text-[#484848] mb-8">Click to see how Ollie adapts to your team.</p>
            
            <div className="space-y-3">
              {/* Owner / Admin */}
              <button
                onClick={() => setActiveRole('admin')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeRole === 'admin' 
                    ? 'bg-white border-[#2CA01C] text-[#263926] shadow-lg' 
                    : 'bg-white/50 border-[#263926]/10 text-[#484848] hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 font-bold mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className={activeRole === 'admin' ? 'text-[#2CA01C]' : 'text-[#6B6B6B]'}>
                    <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5Zm0 3.9a3 3 0 1 1-3 3a3 3 0 0 1 3-3Zm0 7.9c2 0 6 1.09 6 3.08a7.2 7.2 0 0 1-12 0c0-1.99 4-3.08 6-3.08Z"></path>
                  </svg>
                  Owner / Admin
                </div>
                <div className="text-xs opacity-70 pl-8">Full control. Payroll & Team Management.</div>
              </button>

              {/* Bookkeeper */}
              <button
                onClick={() => setActiveRole('bookkeeper')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeRole === 'bookkeeper' 
                    ? 'bg-white border-[#2CA01C] text-[#263926] shadow-lg' 
                    : 'bg-white/50 border-[#263926]/10 text-[#484848] hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 font-bold mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 344 432" className={activeRole === 'bookkeeper' ? 'text-[#2CA01C]' : 'text-[#6B6B6B]'}>
                    <path fill="currentColor" d="M299 3q17 0 29.5 12.5T341 45v342q0 17-12.5 29.5T299 429H43q-18 0-30.5-12.5T0 387V45q0-17 12.5-29.5T43 3h256zM43 45v171l53-32l53 32V45H43z"></path>
                  </svg>
                  Bookkeeper
                </div>
                <div className="text-xs opacity-70 pl-8">View-only access to reports.</div>
              </button>

              {/* Employee */}
              <button
                onClick={() => setActiveRole('employee')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeRole === 'employee' 
                    ? 'bg-white border-[#2CA01C] text-[#263926] shadow-lg' 
                    : 'bg-white/50 border-[#263926]/10 text-[#484848] hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 font-bold mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" className={activeRole === 'employee' ? 'text-[#2CA01C]' : 'text-[#6B6B6B]'}>
                    <path fill="currentColor" d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v208c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v272c0 1.5 0 3.1.1 4.6L67.6 283c-16-15.2-41.3-14.6-56.6 1.4s-14.6 41.3 1.4 56.6l112.4 107c43.1 41.1 100.4 64 160 64H304c97.2 0 176-78.8 176-176V128c0-17.7-14.3-32-32-32s-32 14.3-32 32v112c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v176c0 8.8-7.2 16-16 16s-16-7.2-16-16z"></path>
                  </svg>
                  Employee
                </div>
                <div className="text-xs opacity-70 pl-8">Simple clock-in & history.</div>
              </button>
            </div>
          </div>

          {/* Interface Display */}
          <div className="md:col-span-2 relative h-[520px]">
            {/* Admin View - Matching actual AdminDashboard */}
            <div className={`w-full h-full bg-[#FAF9F5] rounded-2xl border border-[#F6F5F1] shadow-2xl p-6 transition-all duration-500 ${
              activeRole === 'admin' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}>
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#F6F5F1]">
                  <div>
                    <div className="text-xl font-bold text-[#263926]">Today's Team</div>
                    <div className="text-xs text-[#6B6B6B]">Thursday, January 30</div>
                  </div>
                  <div className="bg-[#2CA01C] px-3 py-1.5 rounded-lg text-xs font-bold text-white">OWNER</div>
                </div>
                
                {/* Employee Status Cards */}
                <div className="space-y-3 mb-5">
                  {/* Employee 1 - Working */}
                  <div className="bg-white p-4 rounded-2xl border border-[#F6F5F1] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">SC</div>
                      <div>
                        <div className="font-bold text-[#263926] text-sm">Sarah Chen</div>
                        <div className="text-xs text-[#6B6B6B]">Designer</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Working</span>
                      <div className="text-xs text-[#6B6B6B] mt-1 font-mono">8:42 AM</div>
                    </div>
                  </div>
                  
                  {/* Employee 2 - On Break */}
                  <div className="bg-white p-4 rounded-2xl border border-[#F6F5F1] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">MJ</div>
                      <div>
                        <div className="font-bold text-[#263926] text-sm">Mike Johnson</div>
                        <div className="text-xs text-[#6B6B6B]">Developer</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">On Break</span>
                      <div className="text-xs text-[#6B6B6B] mt-1 font-mono">10:15 AM</div>
                    </div>
                  </div>
                  
                  {/* Employee 3 - Clocked Out */}
                  <div className="bg-white p-4 rounded-2xl border border-[#F6F5F1] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F0EEE6] flex items-center justify-center text-[#6B6B6B] font-bold text-sm">AR</div>
                      <div>
                        <div className="font-bold text-[#263926] text-sm">Alex Rivera</div>
                        <div className="text-xs text-[#6B6B6B]">Marketing</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0EEE6] text-[#6B6B6B]">Done</span>
                      <div className="text-xs text-[#6B6B6B] mt-1 font-mono">5:12 PM</div>
                    </div>
                  </div>
                </div>
                
                {/* Payroll Summary */}
                <div className="mt-auto bg-white rounded-2xl border border-[#F6F5F1] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Current Period Payroll</div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
                      <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                      Pending
                    </button>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-[#263926]">$12,450</div>
                      <div className="text-xs text-[#6B6B6B]">Jan 16 - Jan 30</div>
                    </div>
                    <button className="px-4 py-2 bg-[#2CA01C] text-white rounded-xl text-sm font-bold hover:bg-[#238a16] transition-colors">
                      Send to Bookkeeper
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookkeeper View - Matching actual BookkeeperDashboard */}
            <div className={`w-full h-full bg-[#FAF9F5] rounded-2xl border border-[#F6F5F1] shadow-2xl p-6 transition-all duration-500 ${
              activeRole === 'bookkeeper' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}>
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#F6F5F1]">
                  <div>
                    <div className="text-xl font-bold text-[#263926]">Payroll Reports</div>
                  </div>
                  <div className="bg-[#6B6B6B] px-3 py-1.5 rounded-lg text-xs font-bold text-white">VIEW ONLY</div>
                </div>
                
                {/* Period Selector */}
                <div className="bg-white rounded-2xl border border-[#F6F5F1] p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setBookkeeperWeekIndex(prev => Math.min(prev + 1, 2))}
                      className={`w-8 h-8 rounded-lg bg-[#F6F5F1] flex items-center justify-center text-[#6B6B6B] hover:bg-[#E5E3DA] transition-colors ${bookkeeperWeekIndex === 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={bookkeeperWeekIndex === 2}
                    >←</button>
                    <div className="text-center">
                      <div className="font-bold text-[#263926]">{currentWeekData.startDate} - {currentWeekData.endDate}, {currentWeekData.year}</div>
                      <div className="text-xs text-[#6B6B6B]">{currentWeekData.label}</div>
                    </div>
                    <button 
                      onClick={() => setBookkeeperWeekIndex(prev => Math.max(prev - 1, 0))}
                      className={`w-8 h-8 rounded-lg bg-[#F6F5F1] flex items-center justify-center text-[#6B6B6B] hover:bg-[#E5E3DA] transition-colors ${bookkeeperWeekIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                      disabled={bookkeeperWeekIndex === 0}
                    >→</button>
                  </div>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-2xl border border-[#F6F5F1] p-4">
                    <div className="text-xs font-bold text-[#6B6B6B] uppercase mb-1">Total Hours</div>
                    <div className="text-2xl font-bold text-[#263926]">{currentWeekData.hours}</div>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F6F5F1] p-4">
                    <div className="text-xs font-bold text-[#6B6B6B] uppercase mb-1">Total Payroll</div>
                    <div className="text-2xl font-bold text-[#2CA01C]">{currentWeekData.payroll}</div>
                  </div>
                </div>
                
                {/* Report Rows */}
                <div className="flex-1 bg-white rounded-2xl border border-[#F6F5F1] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F6F5F1] bg-[#FAF9F5]">
                        <th className="text-left py-2.5 px-4 text-xs font-bold text-[#6B6B6B] uppercase">Employee</th>
                        <th className="text-right py-2.5 px-4 text-xs font-bold text-[#6B6B6B] uppercase">Hours</th>
                        <th className="text-right py-2.5 px-4 text-xs font-bold text-[#6B6B6B] uppercase">Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F6F5F1]">
                      <tr className="hover:bg-[#FAF9F5]">
                        <td className="py-2.5 px-4 font-medium text-[#263926] text-sm">Sarah Chen</td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#484848] text-sm">42h 30m</td>
                        <td className="py-2.5 px-4 text-right font-medium text-[#2CA01C] text-sm">$5,100</td>
                      </tr>
                      <tr className="hover:bg-[#FAF9F5]">
                        <td className="py-2.5 px-4 font-medium text-[#263926] text-sm">Mike Johnson</td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#484848] text-sm">38h 15m</td>
                        <td className="py-2.5 px-4 text-right font-medium text-[#2CA01C] text-sm">$4,590</td>
                      </tr>
                      <tr className="hover:bg-[#FAF9F5]">
                        <td className="py-2.5 px-4 font-medium text-[#263926] text-sm">Alex Rivera</td>
                        <td className="py-2.5 px-4 text-right font-mono text-[#484848] text-sm">40h 00m</td>
                        <td className="py-2.5 px-4 text-right font-medium text-[#2CA01C] text-sm">$4,590</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Email Button */}
                <button className="mt-4 w-full py-3 bg-[#2CA01C] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#238a16] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Payroll
                </button>
              </div>
            </div>

            {/* Employee View - Matching actual EmployeeDashboard with Live Timer */}
            <div className={`w-full h-full bg-[#FAF9F5] rounded-2xl border border-[#F6F5F1] shadow-2xl p-5 transition-all duration-500 overflow-hidden ${
              activeRole === 'employee' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}>
              <div className="h-full flex flex-col">
                {/* Greeting */}
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-[#263926]">Good morning, Michelle</div>
                  <div className="text-xs text-[#6B6B6B]">Thursday, January 30</div>
                </div>
                
                {/* Sick/Vacation Toggle Cards */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white p-2 rounded-xl border border-[#F6F5F1] text-center">
                    <div className="text-base mb-0.5">🤒</div>
                    <div className="text-[9px] font-bold text-[#263926]">Sick Day</div>
                    <div className="mt-1 w-7 h-3.5 bg-[#E5E3DA] rounded-full mx-auto relative">
                      <div className="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#F6F5F1] text-center">
                    <div className="text-base mb-0.5">🤧</div>
                    <div className="text-[9px] font-bold text-[#263926]">Half Sick</div>
                    <div className="mt-1 w-7 h-3.5 bg-[#E5E3DA] rounded-full mx-auto relative">
                      <div className="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#F6F5F1] text-center">
                    <div className="text-base mb-0.5">✈️</div>
                    <div className="text-[9px] font-bold text-[#263926]">Vacation</div>
                    <div className="mt-1 w-7 h-3.5 bg-[#E5E3DA] rounded-full mx-auto relative">
                      <div className="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                
                {/* Timer Circle */}
                <div className="bg-white rounded-2xl border border-[#F6F5F1] p-5 text-center mb-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 mb-2">
                    Clocked In
                  </span>
                  <div className="text-4xl font-mono text-[#263926] tracking-tight font-bold">
                    {formatElapsed(elapsedSeconds)}
                  </div>
                  <div className="text-xs text-[#6B6B6B] mt-1.5">Time worked today</div>
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <button className="py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors">
                      Start Break
                    </button>
                    <button className="py-2.5 bg-[#263926] text-white rounded-xl font-bold text-sm hover:bg-[#1a2619] transition-colors">
                      Clock Out
                    </button>
                  </div>
                </div>
                
                {/* Today's Activity Log */}
                <div className="bg-white rounded-2xl border border-[#F6F5F1] p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold text-[#6B6B6B] uppercase">Today's Activity</div>
                    <div className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-lg">8 days left</div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B6B6B]">Clock In</span>
                      <span className="font-mono text-[#263926]">8:42 AM</span>
                    </div>
                    <div className="flex justify-between pl-2 border-l-2 border-amber-100">
                      <span className="text-[#6B6B6B]">Break 1</span>
                      <span className="font-mono text-[#263926]">10:15 – 10:30</span>
                    </div>
                    <div className="flex justify-between pl-2 border-l-2 border-amber-100">
                      <span className="text-[#6B6B6B]">Break 2</span>
                      <span className="font-mono text-[#263926]">12:00 – 12:45</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Self-Healing Timesheets Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            {/* Interactive Card */}
            <div className="relative group">
              <div className={`bg-card border-2 rounded-3xl p-8 shadow-lg transition-all duration-500 ${
                isFixed ? 'border-[#2CA01C]/50 shadow-[#2CA01C]/10' : 'border-red-500/50 shadow-red-500/10'
              }`}>
                {/* Status Prompt Banner */}
                {!isFixed && (
                  <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">!</div>
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Before you clock in, please resolve yesterday's issue</p>
                  </div>
                )}
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-xl">👤</div>
                    <div>
                      <div className="font-bold text-[#263926] dark:text-[#a8d5a2]">Alex Morgan</div>
                      <div className="text-xs text-muted-foreground">UX Designer</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isFixed 
                      ? 'bg-[#A1EB97]/30 text-[#2CA01C]' 
                      : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                  }`}>
                    {isFixed ? 'RESOLVED' : 'ANOMALY DETECTED'}
                  </div>
                </div>

                {/* Timeline Visual */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">09:00 AM</span>
                    <span className="text-foreground font-mono">Clock In</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden relative">
                    <div className="absolute left-0 w-full h-full bg-muted"></div>
                    <div className={`absolute right-0 top-0 bottom-0 w-4 bg-red-500 animate-pulse ${isFixed ? 'opacity-0' : 'opacity-100'}`}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">05:00 PM</span>
                    <span className={`${isFixed ? 'text-foreground' : 'text-red-500'} font-mono transition-colors`}>
                      {isFixed ? 'Clock Out (Auto-Resolved)' : 'Missing Clock Out'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {!isFixed ? (
                  <button 
                    onClick={() => setIsFixed(true)}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Resolve Issue
                  </button>
                ) : (
                  <div className="w-full py-3 bg-[#A1EB97]/20 border border-[#2CA01C]/30 text-[#2CA01C] rounded-xl font-bold flex items-center justify-center gap-2 animate-fade-in">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Issue resolved — You can now clock in
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 12h7c-.53 4.11-3.28 7.78-7 8.92zH5V6.3l7-3.11M12 1L3 5v6c0 5.55 3.84 10.73 9 12c5.16-1.27 9-6.45 9-12V5z"/>
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
              Self-Healing Timesheets.
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ollie catches timesheet errors before they cause payroll problems. When an issue is detected, employees must resolve it before clocking in the next day—keeping your data clean without any admin intervention.
            </p>
            <ul className="space-y-4">
              {['Detects missing clock-outs instantly', 'Blocks clock-in until issue is resolved', 'Zero admin effort to maintain clean data'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-[#2CA01C]/10 flex items-center justify-center text-[#2CA01C] text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Predictive Leave Heatmap Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
                Vacation Request Management.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Employees can request time off for future dates with just a few clicks. Employers receive instant notifications, approve or deny with one tap, and see exactly who's away and when—all logged and organized in one place.
              </p>
              
              {!conflictResolved && (
                <div className="space-y-4">
                  <div className="p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">JD</div>
                        <div>
                          <div className="font-bold text-[#263926] dark:text-[#a8d5a2] text-sm">Jordan Davis</div>
                          <div className="text-xs text-muted-foreground">Feb 15-19 · 5 days vacation</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold rounded">PENDING</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setConflictResolved(true)}
                        className="flex-1 py-2.5 bg-[#2CA01C] hover:bg-[#238a16] text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                      <button className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Deny
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">Click approve or deny to see how easy it is</p>
                </div>
              )}
              
              {conflictResolved && (
                <div className="p-4 bg-[#A1EB97]/20 border border-[#2CA01C]/30 rounded-xl flex items-center gap-4 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-[#2CA01C] flex items-center justify-center text-white font-bold">✓</div>
                  <div className="text-[#2CA01C] text-sm font-bold">
                    Vacation approved for Jordan Davis <br/>
                    <span className="font-normal opacity-80">Notification sent · Calendar updated</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="bg-card rounded-3xl p-6 shadow-lg border border-border">
                <div className="mb-6 flex justify-between items-center">
                  <div className="font-bold text-[#263926] dark:text-[#a8d5a2]">{nextMonthData.monthName} {nextMonthData.year} Schedule</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    conflictResolved 
                      ? 'text-[#2CA01C] bg-[#A1EB97]/30' 
                      : 'text-amber-600 bg-amber-100 dark:bg-amber-500/20'
                  }`}>
                    {conflictResolved ? 'APPROVED' : 'VACATION REQUESTED'}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-muted-foreground">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: nextMonthData.daysInMonth }).map((_, i) => {
                    const isRequested = i >= 14 && i <= 18;
                    let bgClass = 'bg-secondary';
                    
                    if (isRequested) {
                      if (conflictResolved) {
                        bgClass = 'bg-[#2CA01C]';
                      } else {
                        bgClass = 'bg-amber-400 animate-pulse';
                      }
                    }
                    
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-lg ${bgClass} flex items-center justify-center text-xs ${
                          isRequested ? 'text-white' : 'text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-5xl font-heading font-medium text-center mb-16 text-[#263926] dark:text-[#a8d5a2]">
          Everything you need.<br/>Nothing you don't.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Smart Roadblocks */}
          <div 
            onClick={() => onNavigate('features', 'smart-checks')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Smart Roadblocks</h3>
            <p className="text-muted-foreground text-sm">
              Prevent clock-in errors before they happen with intelligent blockers.
            </p>
          </div>
          
          {/* Card 2: Direct-to-Bookkeeper */}
          <div 
            onClick={() => onNavigate('features', 'bookkeeper')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-[#A1EB97]/30 flex items-center justify-center mb-4 text-[#2CA01C]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Direct-to-Bookkeeper</h3>
            <p className="text-muted-foreground text-sm">
              Send payroll reports directly to your accountant's inbox.
            </p>
          </div>

          {/* Card 3: Self-Healing Timesheets */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Self-Healing Timesheets</h3>
            <p className="text-muted-foreground text-sm">
              AI-powered anomaly detection with one-click fixes.
            </p>
          </div>

          {/* Card 4: Vacation Management */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center mb-4 text-sky-600 dark:text-sky-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Vacation Management</h3>
            <p className="text-muted-foreground text-sm">
              Request and approve time off with a single tap.
            </p>
          </div>

          {/* Card 5: Real-Time Tracking */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Real-Time Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Live clock-in/out with a running timer employees love.
            </p>
          </div>

          {/* Card 6: Break Management */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Break Management</h3>
            <p className="text-muted-foreground text-sm">
              Track and manage employee breaks automatically.
            </p>
          </div>

          {/* Card 7: Multi-Role Views */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Multi-Role Views</h3>
            <p className="text-muted-foreground text-sm">
              Tailored dashboards for Admin, Bookkeeper, and Employee.
            </p>
          </div>

          {/* Card 8: Team Overview */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Team Overview</h3>
            <p className="text-muted-foreground text-sm">
              See who's working, on break, or done for the day.
            </p>
          </div>

          {/* Card 9: Sick Day Tracking */}
          <div 
            onClick={() => onNavigate('features')}
            className="bg-card border border-border p-6 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center mb-4 text-rose-600 dark:text-rose-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-medium mb-2 text-[#263926] dark:text-[#a8d5a2]">Sick Day Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Full and half sick day logging with one toggle.
            </p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-heading font-medium mb-3 text-[#263926] dark:text-[#a8d5a2]">See how much you'll save.</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Every clock-out you don't chase, every timesheet you don't fix, every payroll you don't manually calculate—it adds up.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Context - Where the time savings come from */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#2CA01C] mb-4">Where does 15 min/day come from?</h3>
              
              <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#263926] dark:text-[#a8d5a2]">No more chasing missing clock-outs</div>
                  <div className="text-xs text-muted-foreground">~5 min saved per incident</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#263926] dark:text-[#a8d5a2]">No manual timesheet corrections</div>
                  <div className="text-xs text-muted-foreground">~5 min saved per fix</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                <div className="w-8 h-8 rounded-lg bg-[#A1EB97]/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#2CA01C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm text-[#263926] dark:text-[#a8d5a2]">One-click payroll, no spreadsheets</div>
                  <div className="text-xs text-muted-foreground">~5 min saved per cycle</div>
                </div>
              </div>
            </div>

            {/* Right: Calculator */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl md:text-5xl font-bold mb-1 font-mono tracking-tight text-[#263926] dark:text-[#a8d5a2]">
                  ${annualSavings}
                </div>
                <div className="text-[#2CA01C] uppercase tracking-wider text-xs font-bold">Estimated Annual Savings</div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-3 text-sm font-bold text-[#263926] dark:text-[#a8d5a2]">
                  <span>Team Size</span>
                  <span className="text-[#2CA01C]">{employeeCount} Employees</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={employeeCount} 
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer accent-[#2CA01C]"
                />
              </div>
              
              {/* Fun math breakdown */}
              <div className="pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>15 min × {employeeCount} employees × 5 days</span>
                  <span className="font-mono">{(employeeCount * 15 * 5 / 60).toFixed(1)}h/week</span>
                </div>
                <div className="flex justify-between">
                  <span>× 52 weeks × $30/hr admin cost</span>
                  <span className="font-mono text-[#2CA01C]">${annualSavings}/yr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Click Payroll Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left side: Interactive Payroll UI */}
          <div className="order-2 md:order-1">
            <div className="relative group">
              <div className={`bg-card border-2 rounded-3xl p-8 shadow-lg transition-all duration-500 ${
                payrollSent ? 'border-[#2CA01C]/50 shadow-[#2CA01C]/10' : 'border-border'
              }`}>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-xl font-bold text-[#263926] dark:text-[#a8d5a2]">Payroll Summary</div>
                    <div className="text-xs text-muted-foreground">Jan 16 - Jan 30, 2026</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    payrollSent 
                      ? 'bg-[#A1EB97]/30 text-[#2CA01C]' 
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    {payrollSent ? 'SENT' : 'READY TO SEND'}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Hours</div>
                    <div className="text-2xl font-bold text-[#263926] dark:text-[#a8d5a2]">120h 45m</div>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Payroll</div>
                    <div className="text-2xl font-bold text-[#2CA01C]">$14,280</div>
                  </div>
                </div>

                {/* Employee Preview */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground">Sarah Chen</span>
                    <span className="font-mono text-foreground">42h 30m</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground">Mike Johnson</span>
                    <span className="font-mono text-foreground">38h 15m</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-border">
                    <span className="text-muted-foreground">Alex Rivera</span>
                    <span className="font-mono text-foreground">40h 00m</span>
                  </div>
                </div>

                {/* Action Button */}
                {!payrollSent ? (
                  <button 
                    onClick={() => setPayrollSent(true)}
                    className="w-full py-3 bg-[#2CA01C] hover:bg-[#238a16] text-white rounded-xl font-bold shadow-lg shadow-[#2CA01C]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send to Bookkeeper
                  </button>
                ) : (
                  <div className="w-full py-3 bg-[#A1EB97]/20 border border-[#2CA01C]/30 text-[#2CA01C] rounded-xl font-bold flex items-center justify-center gap-2 animate-fade-in">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sent to accountant@agency.com
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side: Text content */}
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 bg-[#A1EB97]/30 rounded-2xl flex items-center justify-center text-[#2CA01C] mb-6">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
              Payroll in Two Clicks.
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ollie automatically calculates hours, formats reports, and sends everything directly to your bookkeeper. No spreadsheets. No manual exports. Just review and send.
            </p>
            <ul className="space-y-4">
              {['Review calculated hours at a glance', 'Send directly to your bookkeeper\'s inbox', 'No spreadsheets, no manual exports'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <span className="w-6 h-6 rounded-full bg-[#2CA01C]/10 flex items-center justify-center text-[#2CA01C] text-xs font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center px-6 bg-background">
        <h2 className="text-4xl md:text-6xl font-heading font-medium mb-8 text-[#263926] dark:text-[#a8d5a2]">
          Payroll in 2 clicks. Seriously.
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
          Review hours. Send to bookkeeper. That's it. No learning curve, no setup headaches—just start.
        </p>
        <a 
          href="/app" 
          className="inline-block px-10 py-5 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all transform hover:scale-105 shadow-2xl shadow-[#2CA01C]/20"
        >
          Start Free Today
        </a>
      </section>
    </div>
  );
};
