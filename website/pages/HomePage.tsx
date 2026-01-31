import React, { useState } from 'react';

interface HomePageProps {
  onNavigate: (page: string, feature?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  // Interactive State: NLP Demo
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const runNlpDemo = (text: string) => {
    if (isTyping) return;
    setChatInput('');
    setChatResponse(null);
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setChatInput(text.substring(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => {
          setChatResponse("Processing complete. I've logged the sick day for Sarah and rescheduled her shifts.");
        }, 800);
      }
    }, 40);
  };

  // Interactive State: ROI Calculator
  const [employeeCount, setEmployeeCount] = useState(15);
  const annualSavings = (employeeCount * 0.25 * 5 * 52 * 50).toLocaleString();

  // Interactive State: Anomaly Fixer
  const [isFixed, setIsFixed] = useState(false);

  // Interactive State: Overtime Shield
  const [shieldActive, setShieldActive] = useState(false);

  // Interactive State: Role Deck
  const [activeRole, setActiveRole] = useState<'admin' | 'bookkeeper' | 'employee'>('admin');

  // Interactive State: Leave Heatmap
  const [conflictResolved, setConflictResolved] = useState(false);

  // Interactive State: Payroll Pulse
  const [sliderValue, setSliderValue] = useState(0);
  const [payrollSent, setPayrollSent] = useState(false);

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
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#2CA01C]/10 rounded-full blur-[120px] -z-10 opacity-60"></div>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/app" 
              className="w-full sm:w-auto px-8 py-4 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all shadow-xl shadow-[#2CA01C]/20 hover:scale-105 transform"
            >
              Get Started for Free
            </a>
            <button 
              onClick={() => onNavigate('features')} 
              className="w-full sm:w-auto px-8 py-4 bg-card text-foreground font-medium rounded-full hover:bg-secondary border border-border transition-all backdrop-blur-sm"
            >
              Explore Features
            </button>
          </div>
        </div>
      </section>

      {/* Natural Language Command Section */}
      <section className="py-24 bg-secondary border-y border-border">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
              Just ask Ollie.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Managing a team shouldn't require clicking through endless menus. Ollie's natural language engine lets you manage time, leave, and payroll with simple commands.
            </p>
            
            <div className="space-y-4">
              <div className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Try a command:</div>
              <button 
                onClick={() => runNlpDemo('Mark Sarah as sick today')}
                className="block w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-[#2CA01C] transition-all text-foreground"
              >
                "Mark Sarah as sick today"
              </button>
              <button 
                onClick={() => runNlpDemo('Approve all timesheets for this week')}
                className="block w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:border-[#2CA01C] transition-all text-foreground"
              >
                "Approve all timesheets for this week"
              </button>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-card rounded-3xl shadow-2xl border border-border p-6 h-[400px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#2CA01C]/5 to-transparent pointer-events-none"></div>
            
            {/* Messages Area */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4">
              {/* System Welcome */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2CA01C] flex items-center justify-center text-white font-bold text-xs shrink-0">O</div>
                <div className="bg-secondary p-3 rounded-2xl rounded-tl-none text-sm text-foreground max-w-[80%]">
                  How can I help you manage your team today?
                </div>
              </div>

              {/* User Input Reflection */}
              {(chatInput || chatResponse) && (
                <div className="flex gap-3 justify-end">
                  <div className="bg-[#2CA01C] p-3 rounded-2xl rounded-tr-none text-sm text-white max-w-[80%]">
                    {chatInput || 'Mark Sarah as sick today'}
                  </div>
                </div>
              )}

              {/* System Response */}
              {chatResponse && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-[#2CA01C] flex items-center justify-center text-white font-bold text-xs shrink-0">O</div>
                  <div className="bg-[#A1EB97]/30 border border-[#2CA01C]/30 p-3 rounded-2xl rounded-tl-none text-sm text-[#263926] dark:text-[#a8d5a2] max-w-[80%]">
                    {chatResponse}
                  </div>
                </div>
              )}
            </div>

            {/* Input Mockup */}
            <div className="relative mt-auto">
              <div className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center justify-between">
                <span>{isTyping ? chatInput + '|' : 'Type a command...'}</span>
                <div className="w-6 h-6 rounded bg-[#2CA01C] flex items-center justify-center text-white text-xs">↑</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overtime Shield Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-medium mb-4 text-[#263926] dark:text-[#a8d5a2]">
            The Overtime Shield.
          </h2>
          <p className="text-lg text-muted-foreground">Visually manage team burnout risks before they impact your budget.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Weekly Hours Projection</div>
              <div className="text-3xl font-heading font-medium text-[#263926] dark:text-[#a8d5a2]">Design Team A</div>
            </div>
            <button 
              onClick={() => setShieldActive(!shieldActive)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-bold transition-all ${
                shieldActive 
                  ? 'bg-[#2CA01C] text-white shadow-lg shadow-[#2CA01C]/30' 
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 ${shieldActive ? 'bg-white border-transparent' : 'border-current'}`}></div>
              AI Guardrails: {shieldActive ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex items-end justify-between h-64 gap-2 md:gap-4 px-4">
            {[8, 9, 11, 8, 12, 6, 0].map((hours, i) => {
              const isOver = hours > 8;
              const displayHours = shieldActive && isOver ? 8 : hours;
              const heightPercent = (displayHours / 12) * 100;
              const day = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];
              
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                  <div className="relative w-full max-w-[60px] transition-all duration-500" style={{ height: `${heightPercent}%` }}>
                    <div className={`absolute bottom-0 left-0 right-0 top-0 rounded-t-lg transition-colors duration-500 ${
                      shieldActive ? 'bg-[#2CA01C]' : isOver ? 'bg-red-400' : 'bg-muted'
                    }`}></div>
                    
                    {shieldActive && isOver && (
                      <div className="absolute bottom-full mb-1 left-0 right-0 text-center">
                        <span className="text-xs font-bold text-[#2CA01C]">SAVED</span>
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 inset-x-0 text-center text-xs font-bold text-white/90">{displayHours}h</div>
                  </div>
                  <div className="mt-3 text-xs font-bold text-muted-foreground">{day}</div>
                </div>
              );
            })}
          </div>
          
          {shieldActive && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm border border-[#2CA01C]/30 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in">
              <div className="w-10 h-10 bg-[#A1EB97]/30 rounded-full flex items-center justify-center text-[#2CA01C] text-xl">🛡️</div>
              <div>
                <div className="font-bold text-[#263926] dark:text-[#a8d5a2]">Optimization Active</div>
                <div className="text-xs text-muted-foreground">Projected Savings: <span className="text-[#2CA01C] font-bold">$420/week</span></div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Role Deck Section */}
      <section className="py-24 bg-[#263926] text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(44,160,28,0.1),transparent_70%)]"></div>
        
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 items-center relative z-10">
          <div className="md:col-span-1 space-y-6">
            <h2 className="text-4xl font-heading font-medium mb-4">Views for every role.</h2>
            <p className="text-white/60 mb-8">Click to see how Ollie adapts to your team.</p>
            
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
                      ? 'bg-[#2CA01C]/20 border-[#2CA01C] text-white' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
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
          <div className="md:col-span-2 relative h-[500px]">
            {/* Admin View */}
            <div className={`w-full h-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl p-6 transition-all duration-500 ${
              activeRole === 'admin' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}>
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                  <div className="text-xl font-bold">Admin Dashboard</div>
                  <div className="bg-[#2CA01C] px-3 py-1 rounded text-xs font-bold">OWNER</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-2xl font-bold mb-1">$12,450</div>
                    <div className="text-xs text-white/50">Payroll Run</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-2xl font-bold mb-1">3</div>
                    <div className="text-xs text-white/50">Pending Requests</div>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-4">
                  <div className="h-4 w-1/3 bg-white/10 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-white/5 rounded w-full flex items-center px-3 text-xs text-white/50">Alice Chen - 40h</div>
                    <div className="h-8 bg-white/5 rounded w-full flex items-center px-3 text-xs text-white/50">Bob Smith - 38h</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookkeeper View */}
            <div className={`w-full h-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl p-6 transition-all duration-500 ${
              activeRole === 'bookkeeper' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}>
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                  <div className="text-xl font-bold">Payroll Reports</div>
                  <div className="bg-[#6B6B6B] px-3 py-1 rounded text-xs font-bold">VIEW ONLY</div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm">Oct 1 - Oct 14</div>
                        <div className="text-xs text-white/50">CSV Generated</div>
                      </div>
                      <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">⬇</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee View */}
            <div className={`w-full h-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl p-6 transition-all duration-500 ${
              activeRole === 'employee' ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}>
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-48 h-48 rounded-full border-4 border-[#2CA01C] flex items-center justify-center mb-8 relative">
                  <div className="text-4xl font-mono font-bold">09:41</div>
                  <div className="absolute -bottom-4 bg-[#2CA01C] px-4 py-1 rounded-full text-xs font-bold">CLOCKED IN</div>
                </div>
                <button className="w-full max-w-xs bg-white/10 hover:bg-white/20 py-4 rounded-xl font-bold border border-white/10">
                  Start Break
                </button>
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
