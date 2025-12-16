import React, { createContext, useContext, useEffect, useState } from 'react';

import { Employee, TimeEntry, Break, AppSettings } from './types';
import { getTodayISO, formatDateForDisplay } from './utils';
import { 
  sendMissingClockoutAlert, 
  sendChangeRequestNotification, 
  sendChangeApprovalNotification 
} from './apiClient';

// Demo employees removed - using Supabase data instead
const MOCK_EMPLOYEES: Employee[] = [];

// Demo data removed - using Supabase data instead
const INITIAL_ENTRIES: TimeEntry[] = [];

const DEFAULT_SETTINGS: AppSettings = {
    bookkeeperEmail: '',
    companyName: 'My Company',
    ownerName: '',
    ownerEmail: ''
};

interface AppState {
  employees: Employee[];
  entries: TimeEntry[];
  settings: AppSettings;
  currentUser: Employee | 'ADMIN';
  setCurrentUser: (user: Employee | 'ADMIN') => void;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  updateEntry: (entry: TimeEntry) => void;
  submitChangeRequest: (entry: TimeEntry) => void;
  deleteEntry: (entryId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'isActive'>) => void;
  toggleEmployeeStatus: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('agency_time_employees_v1');
    return saved ? JSON.parse(saved) : MOCK_EMPLOYEES;
  });
  
  const [entries, setEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('agency_time_entries_v1');
    return saved ? JSON.parse(saved) : INITIAL_ENTRIES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('agency_time_settings_v1');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<Employee | 'ADMIN'>('ADMIN');
  
  // Track which missing clockout alerts have been sent today (to avoid spam)
  const [alertsSentToday, setAlertsSentToday] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('alerts_sent_today_v1');
    const savedDate = localStorage.getItem('alerts_date_v1');
    const today = getTodayISO();
    
    // Reset if it's a new day
    if (savedDate !== today) {
      localStorage.setItem('alerts_date_v1', today);
      return new Set();
    }
    
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('agency_time_entries_v1', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('agency_time_employees_v1', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('agency_time_settings_v1', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem('alerts_sent_today_v1', JSON.stringify([...alertsSentToday]));
  }, [alertsSentToday]);
  
  // Check for missing clockouts on mount and send alerts
  useEffect(() => {
    const today = getTodayISO();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    
    // Only check yesterday's entries for missing clockouts
    entries.forEach(entry => {
      if (entry.date === yesterdayISO && !entry.clockOut && !entry.isSickDay && !entry.isVacationDay && !entry.changeRequest) {
        const employee = employees.find(emp => emp.id === entry.employeeId);
        const alertKey = `${entry.employeeId}-${entry.date}`;
        
        // Only send alert if we haven't already sent one today for this entry
        if (employee?.email && !alertsSentToday.has(alertKey)) {
          sendMissingClockoutAlert({
            employeeEmail: employee.email,
            employeeName: employee.name,
            date: formatDateForDisplay(entry.date),
            appUrl: window.location.origin
          }).then(() => {
            setAlertsSentToday(prev => new Set(prev).add(alertKey));
          }).catch(err => console.error('Failed to send missing clockout alert:', err));
        }
      }
    });
  }, []); // Only run on mount

  const getTodayEntry = (employeeId: string) => {
    const today = getTodayISO();
    return entries.find(e => e.employeeId === employeeId && e.date === today);
  };

  const clockIn = (employeeId: string) => {
    const existing = getTodayEntry(employeeId);
    if (existing) return;

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employeeId,
      date: getTodayISO(),
      clockIn: new Date().toISOString(),
      clockOut: null,
      breaks: [],
      isSickDay: false,
      isVacationDay: false
    };
    setEntries(prev => [...prev, newEntry]);
  };

  const clockOut = (employeeId: string) => {
    const today = getTodayISO();
    const now = new Date().toISOString();

    setEntries(prev => prev.map(e => {
      if (e.employeeId === employeeId && e.date === today) {
        // Rule: Auto-end any open breaks when clocking out
        const updatedBreaks = e.breaks.map(b => {
          if (!b.endTime) return { ...b, endTime: now };
          return b;
        });
        return { 
          ...e, 
          clockOut: now,
          breaks: updatedBreaks 
        };
      }
      return e;
    }));
  };

  const startBreak = (employeeId: string) => {
    const today = getTodayISO();

    setEntries(prev => prev.map(e => {
      if (e.employeeId === employeeId && e.date === today) {
        // Rule: Cannot start break if not clocked in yet
        if (!e.clockIn) return e;
        
        // Rule: Cannot start break if already clocked out
        if (e.clockOut) return e;

        // Rule: Cannot start multiple breaks simultaneously (check for open break)
        const hasOpenBreak = e.breaks.some(b => !b.endTime);
        if (hasOpenBreak) return e;

        const newBreak: Break = {
          id: crypto.randomUUID(),
          startTime: new Date().toISOString(),
          endTime: null,
          type: 'unpaid'
        };
        return { ...e, breaks: [...e.breaks, newBreak] };
      }
      return e;
    }));
  };

  const endBreak = (employeeId: string) => {
    const today = getTodayISO();

    setEntries(prev => prev.map(e => {
      if (e.employeeId === employeeId && e.date === today) {
        const updatedBreaks = e.breaks.map(b => {
          if (!b.endTime) return { ...b, endTime: new Date().toISOString() };
          return b;
        });
        return { ...e, breaks: updatedBreaks };
      }
      return e;
    }));
  };

  // Used by Admin to forcefully update or approve changes
  const updateEntry = (updatedEntry: TimeEntry) => {
    setEntries(prev => {
      const exists = prev.find(e => e.id === updatedEntry.id);
      if (exists) {
        // Check if there was a change request being approved/rejected
        const hadChangeRequest = exists.changeRequest;
        
        // When admin updates, we clear any pending change request as resolved
        const { changeRequest, ...entryData } = updatedEntry;
        
        // Send notification to employee if their change request was processed
        if (hadChangeRequest) {
          const employee = employees.find(emp => emp.id === exists.employeeId);
          if (employee?.email) {
            const status = 'approved'; // Admin applying changes = approval
            sendChangeApprovalNotification({
              employeeEmail: employee.email,
              employeeName: employee.name,
              date: formatDateForDisplay(exists.date),
              status,
              adminNotes: entryData.adminNotes
            }).catch(err => console.error('Failed to send approval notification:', err));
          }
        }
        
        return prev.map(e => e.id === updatedEntry.id ? entryData : e);
      } else {
        return [...prev, updatedEntry];
      }
    });
  };

  // Used by Employee to propose changes
  const submitChangeRequest = (proposedEntry: TimeEntry) => {
    const employee = employees.find(emp => emp.id === proposedEntry.employeeId);
    
    setEntries(prev => prev.map(e => {
      if (e.id === proposedEntry.id) {
         return {
             ...e,
             changeRequest: proposedEntry
         }
      }
      return e;
    }));
    
    // Handle case where entry doesn't exist yet
    if (!entries.find(e => e.id === proposedEntry.id)) {
        setEntries(prev => [...prev, { ...proposedEntry, changeRequest: proposedEntry }]);
    }
    
    // Send notification to admin about change request
    if (employee && settings.ownerEmail) {
      const requestSummary = proposedEntry.isSickDay 
        ? 'Marked as sick day' 
        : proposedEntry.isVacationDay 
        ? 'Marked as vacation day' 
        : `Clock in: ${proposedEntry.clockIn ? new Date(proposedEntry.clockIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A'}, Clock out: ${proposedEntry.clockOut ? new Date(proposedEntry.clockOut).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A'}`;
      
      sendChangeRequestNotification({
        adminEmail: settings.ownerEmail,
        adminName: settings.ownerName || 'Admin',
        employeeName: employee.name,
        date: formatDateForDisplay(proposedEntry.date),
        requestSummary,
        appUrl: window.location.origin
      }).catch(err => console.error('Failed to send change request notification:', err));
    }
  };

  const deleteEntry = (entryId: string) => {
     setEntries(prev => prev.filter(e => e.id !== entryId));
  }

  const addEmployee = (data: Omit<Employee, 'id' | 'isActive'>) => {
    const newEmp: Employee = {
      id: crypto.randomUUID(),
      isActive: true,
      ...data
    };
    setEmployees(prev => [...prev, newEmp]);
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) return { ...e, isActive: !e.isActive };
      return e;
    }));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{ 
      employees, 
      entries, 
      settings,
      currentUser, 
      setCurrentUser,
      clockIn, 
      clockOut, 
      startBreak, 
      endBreak,
      updateEntry,
      submitChangeRequest,
      deleteEntry,
      addEmployee,
      toggleEmployeeStatus,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useStore must be used within AppProvider');
  return context;
};

