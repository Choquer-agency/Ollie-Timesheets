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
  needsSetup: boolean;
  setCurrentUser: (user: Employee | 'ADMIN') => void;
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  startBreak: (employeeId: string) => void;
  endBreak: (employeeId: string) => void;
  updateEntry: (entry: TimeEntry) => void;
  approveChangeRequest: (entry: TimeEntry) => void;
  denyChangeRequest: (entryId: string) => void;
  submitChangeRequest: (entry: TimeEntry) => void;
  deleteEntry: (entryId: string) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'isActive'>) => Promise<{ invitationToken?: string }>;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  toggleEmployeeStatus: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
  resendInvitation: (employeeId: string) => Promise<void>;
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
  const [currentUserState, setCurrentUserState] = useState<Employee | 'ADMIN'>('ADMIN');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  // Protected setCurrentUser - DISABLED for security
  // Users cannot switch views - admins stay in admin view, employees stay in employee view
  const setCurrentUser = (user: Employee | 'ADMIN') => {
    console.warn('setCurrentUser is disabled - users cannot switch views');
    // Do nothing - view switching is not allowed
  };

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Check if this is an employee coming from invitation acceptance
        const isEmployeeFlag = localStorage.getItem('is_employee');
        const employeeId = localStorage.getItem('employee_id');
        const employeeOwnerId = localStorage.getItem('employee_owner_id');
        
        if (isEmployeeFlag === 'true' && employeeId && employeeOwnerId) {
          console.log('Employee flag detected - redirecting to employee dashboard');
          // This user just accepted an invitation, redirect to employee dashboard
          // to bypass the role detection that causes RLS issues
          window.location.href = '/employee/dashboard';
          return;
        }

        // First, check if user is owner or employee to determine which owner_id to use for settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        // Determine if user is the owner (has settings record)
        const userIsOwner = settingsData && !settingsError;
        setIsOwner(userIsOwner);
        
        console.log('User role check:', { userId: user.id, userIsOwner });

        // Load employees
        // For owners: load all employees they own
        // For employees: we need to find their employee record first, then load all employees from that owner
        let employeesData;
        let employeesError;
        let resolvedOwnerId = user.id; // Default to user.id for owners
        
        if (userIsOwner) {
          // Owner: load their employees
          const result = await supabase
            .from('employees')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true });
          employeesData = result.data;
          employeesError = result.error;
        } else {
          // Potential employee: first try to find their employee record
          console.log('Looking for employee record for user:', user.id);
          
          // Check if this user just accepted an invitation
          const justAcceptedInvitation = localStorage.getItem('just_accepted_invitation') === 'true';
          if (justAcceptedInvitation) {
            console.log('User just accepted invitation - will retry employee lookup with delay');
            // Wait a moment for database replication
            await new Promise(resolve => setTimeout(resolve, 500));
            // Clear the flag
            localStorage.removeItem('just_accepted_invitation');
          }
          
          let myEmployeeRecord = null;
          let empLookupError = null;

          try {
            const { data, error } = await supabase
              .from('employees')
              .select('owner_id, id, email, user_id')
              .eq('user_id', user.id)
              .single();
            
            myEmployeeRecord = data;
            empLookupError = error;
          } catch (err) {
            console.warn('Initial employee lookup failed:', err);
            empLookupError = err;
          }
          
          console.log('Employee lookup result:', { myEmployeeRecord, empLookupError });
          
          // If RLS is blocking access (406 error), try the SECURITY DEFINER function
          if (!myEmployeeRecord && empLookupError) {
            console.log('RLS may be blocking access, trying SECURITY DEFINER function...');
            try {
              const { data: teamData, error: teamError } = await supabase.rpc('get_team_employees', {
                p_user_id: user.id
              });
              
              if (teamData && teamData.length > 0) {
                myEmployeeRecord = teamData.find((emp: any) => emp.user_id === user.id);
                console.log('Found employee via SECURITY DEFINER function:', myEmployeeRecord);
              } else if (teamError) {
                console.warn('SECURITY DEFINER function failed:', teamError);
              }
            } catch (err) {
              console.warn('Failed to call get_team_employees function:', err);
            }
          }
          
          // If not found and just accepted invitation, try one more time
          if (!myEmployeeRecord && justAcceptedInvitation) {
            console.log('Employee not found on first try after invitation, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              const { data: retryRecord } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', user.id)
                .single();
              
              if (retryRecord) {
                console.log('Employee found on retry:', retryRecord);
                myEmployeeRecord = retryRecord;
              }
            } catch (err) {
              console.warn('Retry failed:', err);
            }
          }
          
          if (myEmployeeRecord?.owner_id) {
            // Found their employee record - employee only needs their own record
            resolvedOwnerId = myEmployeeRecord.owner_id;
            console.log('Found employee record for:', myEmployeeRecord.id);
            // Employee only loads their OWN record, not all company employees
            const { data: fullRecord } = await supabase
              .from('employees')
              .select('*')
              .eq('user_id', user.id)
              .single();
            employeesData = fullRecord ? [fullRecord] : [];
            employeesError = null;
            console.log('Loaded employee own record:', fullRecord?.name);
          } else {
            // Not found as employee either - they might need to complete setup
            console.log('No employee record found - user may need setup');
            employeesData = [];
            employeesError = null;
          }
        }

        // Store the owner ID for use in all operations
        setOwnerId(resolvedOwnerId);

        // Now load settings using the correct owner ID
        // For owners: already loaded above
        // For employees: need to load owner's settings
        if (!userIsOwner && resolvedOwnerId !== user.id) {
          const { data: ownerSettingsData, error: ownerSettingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('owner_id', resolvedOwnerId)
            .single();

          if (ownerSettingsData && !ownerSettingsError) {
            setSettings({
              bookkeeperEmail: ownerSettingsData.bookkeeper_email || '',
              companyName: ownerSettingsData.company_name,
              ownerName: ownerSettingsData.owner_name,
              ownerEmail: ownerSettingsData.owner_email,
              companyLogoUrl: ownerSettingsData.company_logo_url || undefined
            });
          }
        } else if (settingsData && !settingsError) {
          // Owner's settings (already loaded)
          setSettings({
            bookkeeperEmail: settingsData.bookkeeper_email || '',
            companyName: settingsData.company_name,
            ownerName: settingsData.owner_name,
            ownerEmail: settingsData.owner_email,
            companyLogoUrl: settingsData.company_logo_url || undefined
          });
        }

        let mappedEmployees: Employee[] = [];
        const employeeMapById = new Map<string, Employee>();
        if (employeesData && !employeesError) {
          mappedEmployees = employeesData.map(emp => {
            const mapped: Employee = {
              id: emp.id,
              name: emp.name,
              email: emp.email || undefined,
              role: emp.role,
              // SECURITY: Only expose hourly rates to owners/admins
              // For employees, set hourlyRate to undefined to prevent exposure
              hourlyRate: userIsOwner ? (emp.hourly_rate || undefined) : undefined,
              vacationDaysTotal: emp.vacation_days_total,
              isAdmin: emp.is_admin,
              isActive: emp.is_active,
              userId: emp.user_id,
              invitationToken: emp.invitation_token
            };
            employeeMapById.set(emp.id, mapped);
            return mapped;
          });
          setEmployees(mappedEmployees);
        }

        // Match the logged-in user to an employee record
        const normalizedUserEmail = user.email?.trim().toLowerCase();
        const employeeMatchById = employeesData?.find(emp => emp.user_id === user.id && emp.is_active);
        const employeeMatchByEmail = normalizedUserEmail
          ? employeesData?.find(emp => emp.email && emp.email.toLowerCase() === normalizedUserEmail && emp.is_active)
          : undefined;
        const resolvedEmployeeRecord = employeeMatchById ?? employeeMatchByEmail;
        const mappedUserEmployee = resolvedEmployeeRecord
          ? employeeMapById.get(resolvedEmployeeRecord.id)
          : undefined;

        console.log('User authentication check:', {
          userId: user.id,
          userEmail: user.email,
          userIsOwner,
          employeesDataCount: employeesData?.length,
          hasEmployeeMatch: !!mappedUserEmployee,
          employeeMatchById: !!employeeMatchById,
          employeeMatchByEmail: !!employeeMatchByEmail,
          resolvedEmployeeRecord: resolvedEmployeeRecord ? { id: resolvedEmployeeRecord.id, user_id: resolvedEmployeeRecord.user_id, email: resolvedEmployeeRecord.email } : null
        });

        // Automatically set currentUser based on role
        if (userIsOwner) {
          // Owner can access admin view
          setCurrentUserState('ADMIN');
        } else if (mappedUserEmployee) {
          // Employee can only access their own account
          setCurrentUserState(mappedUserEmployee);
        } else {
          // User has no settings record and no employee record
          // This happens with OAuth users who haven't completed setup
          console.log('User needs to complete account setup');
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Load time entries (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // Determine the correct owner_id to use for queries
        // For owners: use their own user.id
        // For employees: use the owner_id from their employee record
        let queryOwnerId = resolvedOwnerId;

        // SECURITY: For employees, ONLY load their own entries
        // For owners/admins, load all entries for their organization
        let entriesQuery = supabase
          .from('time_entries')
          .select('*, breaks(*)')
          .eq('owner_id', queryOwnerId)
          .gte('date', thirtyDaysAgoStr);
        
        // CRITICAL: If user is an employee, filter to ONLY their entries
        if (mappedUserEmployee && !userIsOwner) {
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

    // Save to Supabase with owner_id
    const { error } = await supabase
      .from('time_entries')
      .insert({
        id: newEntry.id,
        owner_id: ownerId!,
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

    // Save to Supabase with owner_id
    const { error } = await supabase
      .from('breaks')
      .insert({
        id: newBreak.id,
        owner_id: ownerId!,
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
    console.log('Updating entry - had changeRequest:', !!exists?.changeRequest, 'clearing it now');

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
      
      // Insert new breaks with owner_id
      if (entryData.breaks.length > 0) {
        await supabase.from('breaks').insert(
          entryData.breaks.map(b => ({
            id: b.id,
            owner_id: ownerId!,
            time_entry_id: entryData.id,
            start_time: b.startTime,
            end_time: b.endTime,
            break_type: b.type
          }))
        );
      }

      setEntries(prev => {
        if (exists) {
          const updated = prev.map(e => e.id === entryData.id ? entryData : e);
          console.log('Entry updated in local state - changeRequest cleared:', !updated.find(e => e.id === entryData.id)?.changeRequest);
          return updated;
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

  const approveChangeRequest = async (approvedEntry: TimeEntry) => {
    // Security check: Only admins can approve change requests
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can approve change requests');
    }

    const exists = entries.find(e => e.id === approvedEntry.id);
    if (!exists?.changeRequest) {
      console.warn('No change request found to approve');
      return;
    }

    // Apply the approved changes (from the change request)
    const { changeRequest, ...cleanData } = approvedEntry;
    
    console.log('Approving change request for entry:', approvedEntry.id);

    // Update in Supabase
    const { error } = await supabase
      .from('time_entries')
      .upsert({
        id: cleanData.id,
        employee_id: cleanData.employeeId,
        date: cleanData.date,
        clock_in: cleanData.clockIn,
        clock_out: cleanData.clockOut,
        admin_notes: cleanData.adminNotes,
        is_sick_day: cleanData.isSickDay || false,
        is_vacation_day: cleanData.isVacationDay || false,
        change_request: null // Clear change request
      });

    if (!error) {
      // Update breaks
      await supabase.from('breaks').delete().eq('time_entry_id', cleanData.id);
      
      if (cleanData.breaks && cleanData.breaks.length > 0) {
        await supabase.from('breaks').insert(
          cleanData.breaks.map(b => ({
            id: b.id,
            owner_id: ownerId!,
            time_entry_id: cleanData.id,
            start_time: b.startTime,
            end_time: b.endTime,
            break_type: b.type
          }))
        );
      }

      // Update local state
      setEntries(prev => prev.map(e => e.id === cleanData.id ? cleanData : e));

      // Send approval notification
      const employee = employees.find(emp => emp.id === exists.employeeId);
      if (employee?.email) {
        sendChangeApprovalNotification({
          employeeEmail: employee.email,
          employeeName: employee.name,
          date: formatDateForDisplay(exists.date),
          status: 'approved',
          adminNotes: cleanData.adminNotes
        }).catch(err => console.error('Failed to send approval notification:', err));
      }

      console.log('Change request approved and cleared');
    }
  };

  const denyChangeRequest = async (entryId: string) => {
    // Security check: Only admins can deny change requests
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can deny change requests');
    }

    const exists = entries.find(e => e.id === entryId);
    if (!exists?.changeRequest) {
      console.warn('No change request found to deny');
      return;
    }

    console.log('Denying change request for entry:', entryId);

    // Simply clear the change request, keep original entry data
    const { error } = await supabase
      .from('time_entries')
      .update({ change_request: null })
      .eq('id', entryId);

    if (!error) {
      // Remove change request from local state
      setEntries(prev => prev.map(e => {
        if (e.id === entryId) {
          const { changeRequest, ...rest } = e;
          return rest;
        }
        return e;
      }));

      // Send denial notification
      const employee = employees.find(emp => emp.id === exists.employeeId);
      if (employee?.email) {
        sendChangeApprovalNotification({
          employeeEmail: employee.email,
          employeeName: employee.name,
          date: formatDateForDisplay(exists.date),
          status: 'denied',
          adminNotes: 'Your change request has been denied.'
        }).catch(err => console.error('Failed to send denial notification:', err));
      }

      console.log('Change request denied and cleared');
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

    // Set invitation expiration to 7 days from now
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7);

    const { error, data: createdEmployee } = await supabase
      .from('employees')
      .insert({
        id: newEmp.id,
        owner_id: ownerId!,
        user_id: null,
        name: newEmp.name,
        email: newEmp.email || null,
        role: newEmp.role,
        hourly_rate: newEmp.hourlyRate || null,
        vacation_days_total: newEmp.vacationDaysTotal || 10,
        is_admin: newEmp.isAdmin,
        is_active: true,
        invitation_expires_at: invitationExpiry.toISOString()
      })
      .select('*, invitation_token')
      .single();
    
    console.log('Created employee data:', createdEmployee);

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to add employee: ${error.message}`);
    }

    console.log('Employee added to database, updating local state');
    setEmployees(prev => [...prev, newEmp]);
    
    // Return the invitation token so it can be sent via email
    const token = createdEmployee?.invitation_token;
    console.log('Returning invitation token:', token);
    return { invitationToken: token };
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

  const resendInvitation = async (employeeId: string) => {
    // Security check: Only admins can resend invitations
    if (currentUserState !== 'ADMIN') {
      throw new Error('Only administrators can resend invitations');
    }

    const employee = employees.find(e => e.id === employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    if (!employee.email) {
      throw new Error('Employee has no email address');
    }

    if (employee.userId) {
      throw new Error('Employee has already accepted the invitation');
    }

    // Refresh invitation token and expiry
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7);

    const { data: updatedEmployee, error } = await supabase
      .from('employees')
      .update({
        invitation_expires_at: invitationExpiry.toISOString()
      })
      .eq('id', employeeId)
      .select('invitation_token')
      .single();

    if (error) {
      console.error('Failed to update invitation expiry:', error);
      throw new Error(`Failed to resend invitation: ${error.message}`);
    }

    const invitationToken = updatedEmployee?.invitation_token;
    if (!invitationToken) {
      throw new Error('No invitation token found');
    }

    // Send the invitation email
    const { sendTeamInvitation } = await import('./apiClient');
    await sendTeamInvitation({
      employeeEmail: employee.email,
      employeeName: employee.name,
      companyName: settings.companyName,
      role: employee.role,
      appUrl: window.location.origin,
      companyLogoUrl: settings.companyLogoUrl,
      invitationToken
    });
  };

  return (
    <AppContext.Provider value={{ 
      employees, 
      entries, 
      settings,
      currentUser: currentUserState, 
      loading,
      needsSetup,
      setCurrentUser,
      clockIn, 
      clockOut, 
      startBreak, 
      endBreak, 
      updateEntry,
      approveChangeRequest,
      denyChangeRequest,
      submitChangeRequest,
      deleteEntry,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      toggleEmployeeStatus,
      updateSettings,
      resendInvitation
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

