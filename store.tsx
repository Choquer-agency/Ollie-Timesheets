import React, { createContext, useContext, useEffect, useState } from 'react';

import { Employee, TimeEntry, Break, AppSettings } from './types';
import { getTodayISO, formatDateForDisplay } from './utils';
import { 
  sendMissingClockoutAlert, 
  sendChangeRequestNotification, 
  sendChangeApprovalNotification 
} from './apiClient';

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Alice Chen', email: 'alice@agency.com', role: 'Senior Designer', hourlyRate: 65, vacationDaysTotal: 15, isAdmin: false, isActive: true },
  { id: '2', name: 'Bob Smith', email: 'bob@agency.com', role: 'Copywriter & Admin', hourlyRate: 50, vacationDaysTotal: 10, isAdmin: true, isActive: true },
  { id: '3', name: 'Charlie Davis', email: 'charlie@agency.com', role: 'Junior Dev', hourlyRate: 45, vacationDaysTotal: 10, isAdmin: false, isActive: true },
];

// Helper to generate dynamic mock data relative to "today"
const generateMockData = (): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // Skip weekends for history, but keep today if it happens to be a weekend for demo purposes
    if (i > 0 && (dayOfWeek === 0 || dayOfWeek === 6)) continue;

    // --- TODAY'S ACTIVE STATES ---
    if (i === 0) {
       // Alice: Currently Working
       entries.push({
         id: `alice-${i}`, employeeId: '1', date: dateStr,
         clockIn: new Date(d.setHours(9, 0, 0)).toISOString(),
         clockOut: null,
         breaks: [], isSickDay: false, isVacationDay: false
       });
       
       // Bob: Sick Day
       entries.push({
         id: `bob-${i}`, employeeId: '2', date: dateStr,
         clockIn: null, clockOut: null, breaks: [], isSickDay: true, isVacationDay: false,
         adminNotes: 'Called in with flu'
       });

       // Charlie: On Break (Start break 45 mins ago relative to NOW to ensure positive timer)
       const fortyFiveMinsAgo = new Date(new Date().getTime() - 45 * 60000);
       entries.push({
         id: `charlie-${i}`, employeeId: '3', date: dateStr,
         clockIn: new Date(d.setHours(9, 0, 0)).toISOString(),
         clockOut: null,
         breaks: [{ 
            id: `br-charlie-${i}`, 
            startTime: fortyFiveMinsAgo.toISOString(), 
            endTime: null, 
            type: 'unpaid' 
         }], 
         isSickDay: false, isVacationDay: false
       });

       continue;
    }

    // --- HISTORICAL DATA ---
    // Alice: Consistent
    entries.push({
      id: `alice-${i}`, employeeId: '1', date: dateStr,
      clockIn: new Date(d.setHours(9, 0, 0)).toISOString(),
      clockOut: new Date(d.setHours(17, 30, 0)).toISOString(),
      breaks: [{ id: `b-a-${i}`, startTime: new Date(d.setHours(12, 30, 0)).toISOString(), endTime: new Date(d.setHours(13, 0, 0)).toISOString(), type: 'unpaid' }],
      isSickDay: false, isVacationDay: false
    });

    // Bob: A bit chaotic
    if (i === 3) {
      // Bob forgot to clock out 3 days ago
      entries.push({
        id: `bob-${i}`, employeeId: '2', date: dateStr,
        clockIn: new Date(d.setHours(9, 15, 0)).toISOString(),
        clockOut: null, // Issue!
        breaks: [], isSickDay: false, isVacationDay: false
      });
    } else {
      entries.push({
        id: `bob-${i}`, employeeId: '2', date: dateStr,
        clockIn: new Date(d.setHours(9, 30, 0)).toISOString(),
        clockOut: new Date(d.setHours(17, 0, 0)).toISOString(),
        breaks: [{ id: `b-b-${i}`, startTime: new Date(d.setHours(13, 0, 0)).toISOString(), endTime: new Date(d.setHours(14, 0, 0)).toISOString(), type: 'unpaid' }],
        isSickDay: false, isVacationDay: false
      });
    }

    // Charlie: Standard
    entries.push({
      id: `charlie-${i}`, employeeId: '3', date: dateStr,
      clockIn: new Date(d.setHours(10, 0, 0)).toISOString(),
      clockOut: new Date(d.setHours(18, 0, 0)).toISOString(),
      breaks: [{ id: `b-c-${i}`, startTime: new Date(d.setHours(14, 0, 0)).toISOString(), endTime: new Date(d.setHours(14, 30, 0)).toISOString(), type: 'unpaid' }],
      isSickDay: false, isVacationDay: false
    });
  }

  return entries;
};

const INITIAL_ENTRIES: TimeEntry[] = generateMockData();

const DEFAULT_SETTINGS: AppSettings = {
    bookkeeperEmail: '',
    companyName: 'My Agency',
    ownerName: 'Admin User',
    ownerEmail: 'admin@agency.com'
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

