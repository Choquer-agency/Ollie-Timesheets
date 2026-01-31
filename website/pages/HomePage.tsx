import React, { useState, useEffect } from 'react';

interface HomePageProps {
  onNavigate: (page: string, feature?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Interactive State: ROI Calculator
  const [employeeCount, setEmployeeCount] = useState(15);
  const annualSavings = (employeeCount * 0.25 * 5 * 52 * 50).toLocaleString();

  // Interactive State: Anomaly Fixer
  const [isFixed, setIsFixed] = useState(false);

  // Interactive State: Role Deck
  const [activeRole, setActiveRole] = useState<'admin' | 'bookkeeper' | 'employee'>('admin');

  // Interactive State: Leave Heatmap
  const [conflictResolved, setConflictResolved] = useState(false);

  // Interactive State: Payroll Pulse
  const [sliderValue, setSliderValue] = useState(0);
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val === 100) {
      setPayrollSent(true);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 md:py-24 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2CA01C]/10 rounded-full blur-[120px] -z-10 opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#A1EB97]/20 rounded-full blur-[100px] -z-10 opacity-40"></div>

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

      {/* Role Deck Section - Views for Every Role */}
      <section className="py-24 bg-[#D9F1D6] overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(44,160,28,0.08),transparent_50%)]"></div>
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 items-center relative z-10">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-4xl font-heading font-medium mb-4 text-[#263926]">Views for every role.</h2>
            <p className="text-[#484848] mb-8">Click to see how Ollie adapts to your team.</p>
            
            <div className="space-y-3">
              {[
                { id: 'admin', label: 'Owner / Admin', icon: '👑', desc: 'Full control. Payroll & Team Management.' },
                { id: 'bookkeeper', label: 'Bookkeeper', icon: '📊', desc: 'View-only access to reports.' },
                { id: 'employee', label: 'Employee', icon: '👋', desc: 'Simple clock-in & history.' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as 'admin' | 'bookkeeper' | 'employee')}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeRole === role.id 
                      ? 'bg-white border-[#2CA01C] text-[#263926] shadow-lg' 
                      : 'bg-white/50 border-[#263926]/10 text-[#484848] hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold mb-1">
                    <span>{role.icon}</span> {role.label}
                  </div>
                  <div className="text-xs opacity-70 pl-8">{role.desc}</div>
                </button>
              ))}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Fix with AI
                  </button>
                ) : (
                  <div className="w-full py-3 bg-[#A1EB97]/20 border border-[#2CA01C]/30 text-[#2CA01C] rounded-xl font-bold flex items-center justify-center gap-2 animate-fade-in">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fixed based on activity logs
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 text-3xl mb-6">
              🛡️
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
              Self-Healing Timesheets.
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Ollie doesn't just flag errors; it proposes solutions. Our anomaly detection engine spots missing entries, long shifts, or unusual patterns and offers one-click fixes based on employee history.
            </p>
            <ul className="space-y-4">
              {['Detects missing clock-outs instantly', 'Prevents future login until resolved', 'Keeps payroll data 100% clean'].map((item, i) => (
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
      <section className="py-24 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
                Predictive Leave Conflict.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Don't get caught understaffed during the holidays. Ollie's heatmap predicts high-volume leave requests and helps you resolve conflicts automatically using your seniority rules.
              </p>
              
              {!conflictResolved && (
                <button 
                  onClick={() => setConflictResolved(true)}
                  className="px-8 py-4 bg-[#2CA01C] hover:bg-[#238a16] text-white rounded-xl font-bold shadow-lg shadow-[#2CA01C]/30 transition-all flex items-center gap-3"
                >
                  <span>⚡</span> Auto-Resolve Conflicts
                </button>
              )}
              
              {conflictResolved && (
                <div className="p-4 bg-[#A1EB97]/20 border border-[#2CA01C]/30 rounded-xl flex items-center gap-4 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-[#2CA01C] flex items-center justify-center text-white font-bold">✓</div>
                  <div className="text-[#2CA01C] text-sm font-bold">
                    Approved: 2 Seniors <br/>
                    Waitlisted: 3 Juniors
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="bg-card rounded-3xl p-6 shadow-lg border border-border">
                <div className="mb-6 flex justify-between items-center">
                  <div className="font-bold text-[#263926] dark:text-[#a8d5a2]">December Schedule</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    conflictResolved 
                      ? 'text-[#2CA01C] bg-[#A1EB97]/30' 
                      : 'text-red-500 bg-red-100 dark:bg-red-500/20'
                  }`}>
                    {conflictResolved ? 'OPTIMIZED' : 'HIGH TRAFFIC'}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-xs font-bold text-muted-foreground">{d}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 31 }).map((_, i) => {
                    const isHot = i >= 20 && i <= 25;
                    let bgClass = 'bg-secondary';
                    
                    if (isHot) {
                      if (conflictResolved) {
                        bgClass = 'bg-[#2CA01C]';
                      } else {
                        bgClass = 'bg-red-400 animate-pulse';
                      }
                    }
                    
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-lg ${bgClass} flex items-center justify-center text-xs ${
                          isHot ? 'text-white' : 'text-muted-foreground'
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
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Smart Roadblocks */}
          <div 
            onClick={() => onNavigate('features', 'smart-checks')}
            className="md:col-span-2 bg-card border border-border p-8 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-medium mb-3 text-[#263926] dark:text-[#a8d5a2]">Smart Roadblocks</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Prevent clock-in errors before they happen. If an employee forgot to clock out yesterday, Ollie stops them today until it's resolved.
            </p>
          </div>
          
          {/* Card 2: Bookkeeper */}
          <div 
            onClick={() => onNavigate('features', 'bookkeeper')}
            className="bg-card border border-border p-8 rounded-3xl hover:border-[#2CA01C]/50 transition-all cursor-pointer shadow-sm hover:shadow-xl"
          >
            <div className="h-12 w-12 rounded-full bg-[#A1EB97]/30 flex items-center justify-center mb-6 text-[#2CA01C]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading font-medium mb-3 text-[#263926] dark:text-[#a8d5a2]">Direct-to-Bookkeeper</h3>
            <p className="text-muted-foreground text-sm">
              Skip the download/upload dance. Send payroll reports directly to your accountant's inbox.
            </p>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24 bg-gradient-to-br from-[#263926] to-[#1a1a1a] text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-medium mb-6">See how much you'll save.</h2>
          <p className="text-white/60 text-lg mb-16">Drag to adjust for your team size.</p>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
            <div className="mb-12">
              <div className="text-6xl md:text-8xl font-bold mb-2 font-mono tracking-tighter">
                ${annualSavings}
              </div>
              <div className="text-[#A1EB97] uppercase tracking-widest text-sm font-bold">Estimated Annual Savings</div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-4 text-sm font-bold">
                  <span>Team Size</span>
                  <span className="text-[#A1EB97]">{employeeCount} Employees</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={employeeCount} 
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                  className="w-full h-4 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer accent-[#2CA01C]"
                />
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10 text-xs text-white/40">
              * Calculation based on 15 mins saved per employee/day at $50/hr admin opportunity cost.
            </div>
          </div>
        </div>
      </section>

      {/* Payroll Pulse */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
          One-Touch Payroll.
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          Slide to send your finalized reports directly to your bookkeeper. It's that satisfying.
        </p>

        <div className="relative w-full max-w-lg mx-auto h-20 bg-secondary rounded-full p-2 overflow-hidden shadow-inner">
          {/* Progress Fill */}
          <div 
            className="absolute top-0 left-0 bottom-0 bg-[#2CA01C] transition-all duration-75"
            style={{ width: `${sliderValue}%` }}
          ></div>
          
          {/* Text Label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 font-bold text-muted-foreground uppercase tracking-widest text-sm">
            {payrollSent ? 'SENT SUCCESSFULLY' : 'SLIDE TO SEND PAYROLL'}
          </div>

          {/* The Knob */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue}
            onChange={handleSliderChange}
            disabled={payrollSent}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          
          {/* Visual Knob */}
          <div 
            className="absolute top-2 bottom-2 w-16 bg-card rounded-full shadow-lg flex items-center justify-center transition-all duration-75 pointer-events-none z-10"
            style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.64}px)` }}
          >
            {payrollSent ? (
              <span className="text-[#2CA01C] font-bold">✓</span>
            ) : (
              <span className="text-[#2CA01C]">➔</span>
            )}
          </div>
        </div>
        
        {payrollSent && (
          <div className="mt-6 text-[#2CA01C] font-bold animate-bounce">
            Report delivered to accountant@agency.com
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center px-6 bg-background">
        <h2 className="text-4xl md:text-6xl font-heading font-medium mb-8 text-[#263926] dark:text-[#a8d5a2]">
          Ready to automate your agency?
        </h2>
        <p className="text-muted-foreground text-lg mb-10">Join the waitlist or start with our free plan today.</p>
        <a 
          href="/app" 
          className="inline-block px-10 py-5 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all transform hover:scale-105 shadow-2xl shadow-[#2CA01C]/20"
        >
          Launch Ollie Hours App
        </a>
      </section>
    </div>
  );
};
