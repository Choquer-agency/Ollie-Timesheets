import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Employee, TimeEntry, AppSettings } from '../types';
import { getTodayISO } from '../utils';

interface EmployeeAppState {
  employee: Employee | null;
  entries: TimeEntry[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
}

export const EmployeeApp: React.FC = () => {
  const { user, signOut } = useAuth();
  const [state, setState] = useState<EmployeeAppState>({
    employee: null,
    entries: [],
    settings: {
      bookkeeperEmail: '',
      companyName: 'My Company',
      ownerName: '',
      ownerEmail: '',
      companyLogoUrl: undefined
    },
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      // Not authenticated, redirect to login
      window.location.href = '/';
      return;
    }

    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      console.log('Loading employee data for user:', user?.id);

      // Get employee metadata from localStorage (set during invitation acceptance)
      const isEmployee = localStorage.getItem('is_employee');
      const employeeId = localStorage.getItem('employee_id');
      const ownerId = localStorage.getItem('employee_owner_id');

      if (!isEmployee || !employeeId || !ownerId) {
        throw new Error('Employee metadata not found. Please contact your employer.');
      }

      console.log('Loading employee with ID:', employeeId, 'Owner ID:', ownerId);

      // Try to load employee record with RLS
      let employeeData = null;
      let employeeError = null;

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user!.id)
          .single();
        
        employeeData = data;
        employeeError = error;
      } catch (err) {
        console.warn('RLS query failed, trying service function:', err);
      }

      // If RLS fails, try using the SECURITY DEFINER function
      if (!employeeData || employeeError) {
        console.log('Using SECURITY DEFINER function to bypass RLS...');
        const { data, error } = await supabase.rpc('get_team_employees', {
          p_user_id: user!.id
        });

        if (data && data.length > 0) {
          employeeData = data.find((emp: any) => emp.user_id === user!.id);
        }
        
        if (!employeeData) {
          throw new Error('Could not load employee record. Please contact your employer.');
        }
      }

      console.log('Employee data loaded:', employeeData);

      // Load owner's settings
      let settingsData = null;
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('owner_id', ownerId)
          .single();
        
        if (!error && data) {
          settingsData = data;
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }

      // Load today's entries for this employee
      const today = getTodayISO();
      const { data: entriesData } = await supabase
        .from('time_entries')
        .select('*, breaks(*)')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .order('clock_in', { ascending: false });

      // Map employee data
      const mappedEmployee: Employee = {
        id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email || undefined,
        role: employeeData.role,
        hourlyRate: undefined, // Don't expose rate to employees
        vacationDaysTotal: employeeData.vacation_days_total,
        isAdmin: employeeData.is_admin,
        isActive: employeeData.is_active,
        userId: employeeData.user_id,
        invitationToken: employeeData.invitation_token
      };

      // Map time entries
      const mappedEntries: TimeEntry[] = (entriesData || []).map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        date: entry.date,
        clockIn: entry.clock_in,
        clockOut: entry.clock_out || undefined,
        totalHours: entry.total_hours || undefined,
        breaks: (entry.breaks || []).map((brk: any) => ({
          id: brk.id,
          timeEntryId: brk.time_entry_id,
          startTime: brk.start_time,
          endTime: brk.end_time || undefined,
          durationMinutes: brk.duration_minutes || undefined
        })),
        notes: entry.notes || undefined,
        changeRequested: entry.change_requested || false,
        changesApproved: entry.changes_approved || false
      }));

      setState({
        employee: mappedEmployee,
        entries: mappedEntries,
        settings: settingsData ? {
          bookkeeperEmail: settingsData.bookkeeper_email || '',
          companyName: settingsData.company_name,
          ownerName: settingsData.owner_name,
          ownerEmail: settingsData.owner_email,
          companyLogoUrl: settingsData.company_logo_url || undefined
        } : state.settings,
        loading: false,
        error: null
      });

      // Clear the localStorage flags after successful load
      localStorage.removeItem('just_accepted_invitation');
      console.log('Employee app loaded successfully');

    } catch (err: any) {
      console.error('Error loading employee data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load employee data'
      }));
    }
  };

  const handleClockIn = async () => {
    if (!state.employee) return;

    const today = getTodayISO();
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: state.employee.id,
          owner_id: localStorage.getItem('employee_owner_id'),
          date: today,
          clock_in: now
        })
        .select('*, breaks(*)')
        .single();

      if (error) throw error;

      // Add new entry to state
      const newEntry: TimeEntry = {
        id: data.id,
        employeeId: data.employee_id,
        date: data.date,
        clockIn: data.clock_in,
        breaks: []
      };

      setState(prev => ({
        ...prev,
        entries: [newEntry, ...prev.entries]
      }));
    } catch (err: any) {
      console.error('Clock in error:', err);
      alert('Failed to clock in: ' + err.message);
    }
  };

  const handleClockOut = async () => {
    if (!state.employee) return;

    const todaysEntry = state.entries.find(e => !e.clockOut);
    if (!todaysEntry) return;

    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          clock_out: now
        })
        .eq('id', todaysEntry.id);

      if (error) throw error;

      // Update entry in state
      setState(prev => ({
        ...prev,
        entries: prev.entries.map(e =>
          e.id === todaysEntry.id
            ? { ...e, clockOut: now }
            : e
        )
      }));
    } catch (err: any) {
      console.error('Clock out error:', err);
      alert('Failed to clock out: ' + err.message);
    }
  };

  const handleStartBreak = async () => {
    if (!state.employee) return;

    const todaysEntry = state.entries.find(e => !e.clockOut);
    if (!todaysEntry) return;

    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from('breaks')
        .insert({
          time_entry_id: todaysEntry.id,
          owner_id: localStorage.getItem('employee_owner_id'),
          start_time: now
        })
        .select()
        .single();

      if (error) throw error;

      // Update entry in state
      setState(prev => ({
        ...prev,
        entries: prev.entries.map(e =>
          e.id === todaysEntry.id
            ? {
                ...e,
                breaks: [...(e.breaks || []), {
                  id: data.id,
                  timeEntryId: data.time_entry_id,
                  startTime: data.start_time
                }]
              }
            : e
        )
      }));
    } catch (err: any) {
      console.error('Start break error:', err);
      alert('Failed to start break: ' + err.message);
    }
  };

  const handleEndBreak = async () => {
    if (!state.employee) return;

    const todaysEntry = state.entries.find(e => !e.clockOut);
    if (!todaysEntry) return;

    const activeBreak = todaysEntry.breaks?.find(b => !b.endTime);
    if (!activeBreak) return;

    const now = new Date().toISOString();

    try {
      const { error } = await supabase
        .from('breaks')
        .update({
          end_time: now
        })
        .eq('id', activeBreak.id);

      if (error) throw error;

      // Update entry in state
      setState(prev => ({
        ...prev,
        entries: prev.entries.map(e =>
          e.id === todaysEntry.id
            ? {
                ...e,
                breaks: e.breaks?.map(b =>
                  b.id === activeBreak.id
                    ? { ...b, endTime: now }
                    : b
                )
              }
            : e
        )
      }));
    } catch (err: any) {
      console.error('End break error:', err);
      alert('Failed to end break: ' + err.message);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1] max-w-md">
          <h2 className="text-xl font-bold text-[#263926] mb-4">Error Loading Dashboard</h2>
          <p className="text-[#6B6B6B] mb-6">{state.error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-3 bg-[#2CA01C] text-white rounded-2xl hover:bg-[#238615] transition-colors font-medium"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const todaysEntry = state.entries.find(e => !e.clockOut);
  const isClockedIn = !!todaysEntry;
  const activeBreak = todaysEntry?.breaks?.find(b => !b.endTime);
  const onBreak = !!activeBreak;

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#F6F5F1] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {state.settings.companyLogoUrl ? (
              <img src={state.settings.companyLogoUrl} alt={state.settings.companyName} className="h-10 w-auto" />
            ) : (
              <h1 className="text-2xl font-bold text-[#263926]">{state.settings.companyName}</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#263926]">
              <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{state.employee?.name}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-[#6B6B6B] hover:text-[#263926] hover:bg-[#F6F5F1] rounded-lg transition-colors"
              title="Sign out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1]">
          <h2 className="text-3xl font-bold text-[#263926] mb-8">Time Clock</h2>

          {/* Clock In/Out Buttons */}
          <div className="space-y-4">
            {!isClockedIn ? (
              <button
                onClick={handleClockIn}
                className="w-full px-8 py-6 bg-[#2CA01C] text-white rounded-2xl hover:bg-[#238615] transition-colors font-bold text-xl"
              >
                🕐 Clock In
              </button>
            ) : (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-4">
                  <p className="text-emerald-800 font-medium">
                    Clocked in at {new Date(todaysEntry.clockIn).toLocaleTimeString()}
                  </p>
                </div>

                {!onBreak ? (
                  <>
                    <button
                      onClick={handleStartBreak}
                      className="w-full px-8 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-colors font-bold text-lg"
                    >
                      ☕ Start Break
                    </button>
                    <button
                      onClick={handleClockOut}
                      className="w-full px-8 py-6 bg-[#263926] text-white rounded-2xl hover:bg-[#1a2619] transition-colors font-bold text-xl"
                    >
                      🏁 Clock Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-4">
                      <p className="text-amber-800 font-medium">
                        On break since {new Date(activeBreak.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={handleEndBreak}
                      className="w-full px-8 py-4 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 transition-colors font-bold text-lg"
                    >
                      ✓ End Break
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Today's Summary */}
          {state.entries.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#F6F5F1]">
              <h3 className="text-lg font-bold text-[#263926] mb-4">Today's Activity</h3>
              <div className="space-y-2">
                {state.entries.map(entry => (
                  <div key={entry.id} className="text-sm text-[#6B6B6B]">
                    <p>
                      Clock in: {new Date(entry.clockIn).toLocaleTimeString()}
                      {entry.clockOut && ` → Clock out: ${new Date(entry.clockOut).toLocaleTimeString()}`}
                    </p>
                    {entry.breaks && entry.breaks.length > 0 && (
                      <p className="ml-4">
                        Breaks: {entry.breaks.length}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

