import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { Employee, TimeEntry, Break, AppSettings } from './types';
import { getTodayISO, formatDateForDisplay } from './utils';
import { 
  sendMissingClockoutAlert, 
  sendChangeRequestNotification, 
  sendChangeApprovalNotification 
} from './apiClient';

interface AppState {
  employees: Employee[];
  entries: TimeEntry[];
  settings: AppSettings;
  currentUser: Employee | 'ADMIN';
  loading: boolean;
  setCurrentUser: (user: Employee | 'ADMIN') => void;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  updateEntry: (entry: TimeEntry) => void;
  submitChangeRequest: (entry: TimeEntry) => void;
  deleteEntry: (entryId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'isActive'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  toggleEmployeeStatus: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const SupabaseStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    bookkeeperEmail: '',
    companyName: 'My Company',
    ownerName: '',
    ownerEmail: '',
    companyLogoUrl: undefined
  });
  const [currentUser, setCurrentUserState] = useState<Employee | 'ADMIN'>('ADMIN');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Protected setCurrentUser - employees cannot change their view
  const setCurrentUser = (user: Employee | 'ADMIN') => {
    // Only allow changes if user is owner/admin
    if (isOwner) {
      setCurrentUserState(user);
    } else {
      // Employees cannot change their view - silently ignore
      console.warn('Employees cannot switch views');
    }
  };

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Load settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (settingsData && !settingsError) {
          setSettings({
            bookkeeperEmail: settingsData.bookkeeper_email || '',
            companyName: settingsData.company_name,
            ownerName: settingsData.owner_name,
            ownerEmail: settingsData.owner_email,
            companyLogoUrl: settingsData.company_logo_url || undefined
          });
        }

        // Load employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*')
          .order('created_at', { ascending: true });

        let mappedEmployees: Employee[] = [];
        if (employeesData && !employeesError) {
          mappedEmployees = employeesData.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email || undefined,
            role: emp.role,
            hourlyRate: emp.hourly_rate || undefined,
            vacationDaysTotal: emp.vacation_days_total,
            isAdmin: emp.is_admin,
            isActive: emp.is_active
          }));
          setEmployees(mappedEmployees);
        }

        // Determine if user is owner/admin or employee
        // Check if user is the owner (has settings record)
        const userIsOwner = settingsData && !settingsError;
        setIsOwner(userIsOwner);
        
        // Check if user is an employee (has user_id matching in employees table)
        const userEmployee = employeesData?.find(emp => emp.user_id === user.id);
        const mappedUserEmployee = userEmployee ? mappedEmployees.find(emp => emp.id === userEmployee.id) : undefined;

        // Automatically set currentUser based on role
        if (userIsOwner) {
          // Owner can access admin view
          setCurrentUserState('ADMIN');
        } else if (mappedUserEmployee) {
          // Employee can only access their own account
          setCurrentUserState(mappedUserEmployee);
        } else {
          // Default to admin if no match (shouldn't happen normally)
          setCurrentUserState('ADMIN');
        }

        // Load time entries (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // For employees, only load their own entries
        let entriesQuery = supabase
          .from('time_entries')
          .select('*, breaks(*)')
          .gte('date', thirtyDaysAgoStr);
        
        // If user is an employee, filter to only their entries
        if (mappedUserEmployee && !isOwner) {
          entriesQuery = entriesQuery.eq('employee_id', mappedUserEmployee.id);
        }
        
        const { data: entriesData, error: entriesError } = await entriesQuery
          .order('date', { ascending: false });

        if (entriesData && !entriesError) {
          const mappedEntries: TimeEntry[] = entriesData.map(entry => ({
            id: entry.id,
            employeeId: entry.employee_id,
            date: entry.date,
            clockIn: entry.clock_in,
            clockOut: entry.clock_out,
            breaks: (entry.breaks || []).map((b: any) => ({
              id: b.id,
              startTime: b.start_time,
              endTime: b.end_time,
              type: b.break_type
            })),
            adminNotes: entry.admin_notes || undefined,
            isSickDay: entry.is_sick_day,
            isVacationDay: entry.is_vacation_day,
            changeRequest: entry.change_request || undefined
          }));
          setEntries(mappedEntries);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const clockIn = async (employeeId: string) => {
    // Security check: Employees can only clock in for themselves
    if (currentUserState !== 'ADMIN' && currentUserState.id !== employeeId) {
      throw new Error('You can only clock in for yourself');
    }
    
    const today = getTodayISO();
    const existing = entries.find(e => e.employeeId === employeeId && e.date === today);
    if (existing) return;

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employeeId,
      date: today,
      clockIn: new Date().toISOString(),
      clockOut: null,
      breaks: [],
      isSickDay: false,
      isVacationDay: false
    };

    // Save to Supabase
    const { error } = await supabase
      .from('time_entries')
      .insert({
        id: newEntry.id,
        employee_id: newEntry.employeeId,
        date: newEntry.date,
        clock_in: newEntry.clockIn,
        clock_out: null,
        is_sick_day: false,
        is_vacation_day: false
      });

    if (!error) {
      setEntries(prev => [...prev, newEntry]);
    }
  };

  const clockOut = async (employeeId: string) => {
    // Security check: Employees can only clock out for themselves
    if (currentUserState !== 'ADMIN' && currentUserState.id !== employeeId) {
      throw new Error('You can only clock out for yourself');
    }
    
    const today = getTodayISO();
    const now = new Date().toISOString();
    const entry = entries.find(e => e.employeeId === employeeId && e.date === today);
    
    if (!entry) return;

    // Close any open breaks
    for (const breakItem of entry.breaks) {
      if (!breakItem.endTime) {
        await supabase
          .from('breaks')
          .update({ end_time: now })
          .eq('id', breakItem.id);
      }
    }

    // Update clock out
    const { error } = await supabase
      .from('time_entries')
      .update({ clock_out: now })
      .eq('id', entry.id);

    if (!error) {
      setEntries(prev => prev.map(e => {
        if (e.id === entry.id) {
          return {
            ...e,
            clockOut: now,
            breaks: e.breaks.map(b => !b.endTime ? { ...b, endTime: now } : b)
          };
        }
        return e;
      }));
    }
  };

  const startBreak = async (employeeId: string) => {
    // Security check: Employees can only start breaks for themselves
    if (currentUserState !== 'ADMIN' && currentUserState.id !== employeeId) {
      throw new Error('You can only start breaks for yourself');
    }
    
    const today = getTodayISO();
    const entry = entries.find(e => e.employeeId === employeeId && e.date === today);
    
    if (!entry || !entry.clockIn || entry.clockOut) return;
    
    const hasOpenBreak = entry.breaks.some(b => !b.endTime);
    if (hasOpenBreak) return;

    const newBreak: Break = {
      id: crypto.randomUUID(),
      startTime: new Date().toISOString(),
      endTime: null,
      type: 'unpaid'
    };

    // Save to Supabase
    const { error } = await supabase
      .from('breaks')
      .insert({
        id: newBreak.id,
        time_entry_id: entry.id,
        start_time: newBreak.startTime,
        end_time: null,
        break_type: 'unpaid'
      });

    if (!error) {
      setEntries(prev => prev.map(e => 
        e.id === entry.id ? { ...e, breaks: [...e.breaks, newBreak] } : e
      ));
    }
  };

  const endBreak = async (employeeId: string) => {
    // Security check: Employees can only end breaks for themselves
    if (currentUserState !== 'ADMIN' && currentUserState.id !== employeeId) {
      throw new Error('You can only end breaks for yourself');
    }
    
    const today = getTodayISO();
    const entry = entries.find(e => e.employeeId === employeeId && e.date === today);
    
    if (!entry) return;

    const openBreak = entry.breaks.find(b => !b.endTime);
    if (!openBreak) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('breaks')
      .update({ end_time: now })
      .eq('id', openBreak.id);

    if (!error) {
      setEntries(prev => prev.map(e => {
        if (e.id === entry.id) {
          return {
            ...e,
            breaks: e.breaks.map(b => b.id === openBreak.id ? { ...b, endTime: now } : b)
          };
        }
        return e;
      }));
    }
  };

  const updateEntry = async (updatedEntry: TimeEntry) => {
    const exists = entries.find(e => e.id === updatedEntry.id);
    
    // Security check: Employees can only update their own entries
    if (currentUserState !== 'ADMIN' && currentUserState.id !== updatedEntry.employeeId) {
      throw new Error('You can only edit your own time entries');
    }
    
    // Clear change request when admin updates
    const { changeRequest, ...entryData } = updatedEntry;

    // Update in Supabase
    const { error } = await supabase
      .from('time_entries')
      .upsert({
        id: entryData.id,
        employee_id: entryData.employeeId,
        date: entryData.date,
        clock_in: entryData.clockIn,
        clock_out: entryData.clockOut,
        admin_notes: entryData.adminNotes,
        is_sick_day: entryData.isSickDay || false,
        is_vacation_day: entryData.isVacationDay || false,
        change_request: null // Clear change request
      });

    if (!error) {
      // Update breaks
      if (exists) {
        // Delete old breaks
        await supabase.from('breaks').delete().eq('time_entry_id', entryData.id);
      }
      
      // Insert new breaks
      if (entryData.breaks.length > 0) {
        await supabase.from('breaks').insert(
          entryData.breaks.map(b => ({
            id: b.id,
            time_entry_id: entryData.id,
            start_time: b.startTime,
            end_time: b.endTime,
            break_type: b.type
          }))
        );
      }

      setEntries(prev => {
        if (exists) {
          return prev.map(e => e.id === entryData.id ? entryData : e);
        } else {
          return [...prev, entryData];
        }
      });

      // Send notification if change request was approved
      if (exists?.changeRequest) {
        const employee = employees.find(emp => emp.id === exists.employeeId);
        if (employee?.email) {
          sendChangeApprovalNotification({
            employeeEmail: employee.email,
            employeeName: employee.name,
            date: formatDateForDisplay(exists.date),
            status: 'approved',
            adminNotes: entryData.adminNotes
          }).catch(err => console.error('Failed to send approval notification:', err));
        }
      }
    }
  };

  const submitChangeRequest = async (proposedEntry: TimeEntry) => {
    // Security check: Employees can only submit change requests for their own entries
    if (currentUserState !== 'ADMIN' && currentUserState.id !== proposedEntry.employeeId) {
      throw new Error('You can only submit change requests for your own time entries');
    }
    
    const { error } = await supabase
      .from('time_entries')
      .update({
        change_request: proposedEntry
      })
      .eq('id', proposedEntry.id);

    if (!error) {
      setEntries(prev => prev.map(e => 
        e.id === proposedEntry.id ? { ...e, changeRequest: proposedEntry } : e
      ));

      // Send notification
      const employee = employees.find(emp => emp.id === proposedEntry.employeeId);
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
    }
  };

  const deleteEntry = async (entryId: string) => {
    // Security check: Only admins can delete entries
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can delete time entries');
    }
    
    // Delete breaks first
    await supabase.from('breaks').delete().eq('time_entry_id', entryId);
    
    // Delete entry
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId);

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== entryId));
    }
  };

  const addEmployee = async (data: Omit<Employee, 'id' | 'isActive'>) => {
    // Security check: Only admins can add employees
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can add employees');
    }
    
    const newEmp: Employee = {
      id: crypto.randomUUID(),
      isActive: true,
      ...data
    };

    console.log('Adding employee to Supabase:', newEmp);

    const { error } = await supabase
      .from('employees')
      .insert({
        id: newEmp.id,
        user_id: null,
        name: newEmp.name,
        email: newEmp.email || null,
        role: newEmp.role,
        hourly_rate: newEmp.hourlyRate || null,
        vacation_days_total: newEmp.vacationDaysTotal || 10,
        is_admin: newEmp.isAdmin,
        is_active: true
      });

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to add employee: ${error.message}`);
    }

    console.log('Employee added to database, updating local state');
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    // Security check: Only admins can update employees
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can update employees');
    }
    
    console.log('Updating employee:', id, updates);

    const { error } = await supabase
      .from('employees')
      .update({
        name: updates.name,
        email: updates.email || null,
        role: updates.role,
        hourly_rate: updates.hourlyRate || null,
        vacation_days_total: updates.vacationDaysTotal,
        is_active: updates.isActive,
        is_admin: updates.isAdmin
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }

    console.log('Employee updated, refreshing local state');
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ));
  };

  const deleteEmployee = async (id: string) => {
    // Security check: Only admins can delete employees
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can delete employees');
    }
    
    console.log('Deleting employee:', id);

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete employee: ${error.message}`);
    }

    console.log('Employee deleted, updating local state');
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const toggleEmployeeStatus = async (id: string) => {
    // Security check: Only admins can toggle employee status
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can change employee status');
    }
    
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    const newStatus = !employee.isActive;

    const { error } = await supabase
      .from('employees')
      .update({ is_active: newStatus })
      .eq('id', id);

    if (!error) {
      setEmployees(prev => prev.map(e => 
        e.id === id ? { ...e, isActive: newStatus } : e
      ));
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    // Security check: Only admins can update settings
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can update settings');
    }
    
    if (!user) {
      console.error('Cannot update settings: No user logged in');
      throw new Error('No user logged in');
    }

    console.log('Updating settings in database:', {
      bookkeeper_email: newSettings.bookkeeperEmail,
      company_name: newSettings.companyName,
      owner_name: newSettings.ownerName,
      owner_email: newSettings.ownerEmail,
      company_logo_url: newSettings.companyLogoUrl || null
    });

    const { error } = await supabase
      .from('settings')
      .update({
        bookkeeper_email: newSettings.bookkeeperEmail,
        company_name: newSettings.companyName,
        owner_name: newSettings.ownerName,
        owner_email: newSettings.ownerEmail,
        company_logo_url: newSettings.companyLogoUrl || null
      })
      .eq('owner_id', user.id);

    if (error) {
      console.error('Supabase update settings error:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    console.log('Settings updated successfully in database');
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{ 
      employees, 
      entries, 
      settings,
      currentUser: currentUserState, 
      loading,
      setCurrentUser,
      clockIn, 
      clockOut, 
      startBreak, 
      endBreak, 
      updateEntry,
      submitChangeRequest,
      deleteEntry,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      toggleEmployeeStatus,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useSupabaseStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useSupabaseStore must be used within SupabaseStoreProvider');
  return context;
};

