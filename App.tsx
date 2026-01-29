import React, { useState, useEffect } from 'react';

import { useSupabaseStore } from './SupabaseStore';
import { supabase } from './supabaseClient';
import { Button } from './components/Button';
import { TimeCardModal } from './components/TimeCardModal';
import { VacationRequestModal } from './components/VacationRequestModal';
import { DatePicker } from './components/DatePicker';
import { PeriodDetailModal } from './components/PeriodDetailModal';
import { Employee, TimeEntry, DailySummary } from './types';
import { 
  getTodayISO, 
  formatTime, 
  calculateStats, 
  formatDuration, 
  formatDateForDisplay,
  canMarkHalfSickDay
} from './utils';
import { 
  sendBookkeeperReport, 
  sendTeamInvitation 
} from './apiClient';

// --- Components ---

const LiveBreakTimer = ({ breakStartTime }: { breakStartTime: string }) => {
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    const interval = window.setInterval(() => {
      const start = new Date(breakStartTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimer(
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [breakStartTime]);

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-100 font-mono">
      Break - {timer}
    </span>
  );
};

const MobileBreakTimer = ({ breakStartTime }: { breakStartTime: string }) => {
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    const interval = window.setInterval(() => {
      const start = new Date(breakStartTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimer(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [breakStartTime]);

  return (
    <span className="text-[10px] font-bold px-2 py-1 rounded-full tracking-wider bg-amber-50 text-amber-700 font-mono">
      Break - {timer}
    </span>
  );
};

const AddEmployeeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { addEmployee, settings } = useSupabaseStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [rate, setRate] = useState('');
  const [vacationDays, setVacationDays] = useState('10');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBookkeeper, setIsBookkeeper] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;
    
    setError('');
    setSendingInvite(true);
    
    try {
      // Add employee to database
      console.log('Adding employee:', { name, email, role, rate, vacationDays, isAdmin, isBookkeeper });
      
      const { invitationToken } = await addEmployee({
        name,
        email,
        role,
        hourlyRate: rate ? parseFloat(rate) : undefined,
        vacationDaysTotal: parseInt(vacationDays) || 0,
        isAdmin,
        isBookkeeper
      });
      
      console.log('Employee added successfully, invitation token:', invitationToken);
      
      // Send invitation email if email is provided
      if (email && invitationToken) {
        try {
          console.log('Sending invitation with settings:', {
            companyName: settings.companyName,
            companyLogoUrl: settings.companyLogoUrl,
            invitationToken
          });
          
          await sendTeamInvitation({
            employeeEmail: email,
            employeeName: name,
            companyName: settings.companyName,
            role,
            appUrl: window.location.origin,
            companyLogoUrl: settings.companyLogoUrl,
            invitationToken
          });
          console.log('Invitation email sent successfully');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          // Don't fail the whole operation - employee is still added
          setError('Employee added but invitation email failed. You can invite them manually.');
          setTimeout(() => setError(''), 5000);
        }
      }
      
      // Reset form
      setName('');
      setEmail('');
      setRole('');
      setRate('');
      setVacationDays('10');
      setIsAdmin(false);
      setIsBookkeeper(false);
      
      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        setError('');
      }, email ? 2000 : 0);
      
    } catch (error: any) {
      console.error('Failed to add employee:', error);
      setError(error.message || 'Failed to add employee. Please check your permissions.');
      setSendingInvite(false);
    } finally {
      if (!error) {
        setSendingInvite(false);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#484848]/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        // Only close if clicking directly on the overlay (not on children)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-slide-in-right"
      >
        <h2 className="text-xl font-bold text-[#263926] mb-6">Add team member</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Full Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Email</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
              placeholder="jane@agency.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Role</label>
                <input 
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                placeholder="e.g. Designer"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Rate ($/hr)</label>
                <input 
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                placeholder="0.00"
                />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Vacation Days (Yearly)</label>
            <input 
              type="number"
              value={vacationDays}
              onChange={e => setVacationDays(e.target.value)}
              className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
              placeholder="10"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF9F5] rounded-2xl border border-[#F6F5F1] mt-2">
             <input 
               type="checkbox"
               id="isAdmin"
               checked={isAdmin}
               onChange={e => {
                 setIsAdmin(e.target.checked);
                 if (e.target.checked) setIsBookkeeper(false);
               }}
               className="w-5 h-5 rounded border-[#E5E3DA] text-[#2CA01C] focus:ring-[#2CA01C]"
             />
             <div>
                 <label htmlFor="isAdmin" className="block text-sm font-bold text-[#263926]">Admin Access</label>
                 <p className="text-xs text-[#6B6B6B]">Can manage team, view all timesheets, and settings.</p>
             </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#FAF9F5] rounded-2xl border border-[#F6F5F1] mt-2">
             <input 
               type="checkbox"
               id="isBookkeeper"
               checked={isBookkeeper}
               onChange={e => {
                 setIsBookkeeper(e.target.checked);
                 if (e.target.checked) setIsAdmin(false);
               }}
               className="w-5 h-5 rounded border-[#E5E3DA] text-[#2CA01C] focus:ring-[#2CA01C]"
             />
             <div>
                 <label htmlFor="isBookkeeper" className="block text-sm font-bold text-[#263926]">Bookkeeper Access</label>
                 <p className="text-xs text-[#6B6B6B]">Can only view timesheets and pay periods. No editing allowed.</p>
             </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={sendingInvite}>
              {sendingInvite ? 'Sending invite...' : 'Add member'}
            </Button>
          </div>
          
          {showSuccess && (
            <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-2xl border border-emerald-100 text-center">
              ✓ Invitation email sent successfully!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { settings, updateSettings, employees, updateEmployee, currentUser } = useSupabaseStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'team' | 'config'>('profile');
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showPastEmployees, setShowPastEmployees] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editVacationDays, setEditVacationDays] = useState('10');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editIsBookkeeper, setEditIsBookkeeper] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  
  // Local state for form fields
  const [localSettings, setLocalSettings] = useState(settings);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Detect if current user is an admin employee (not the business owner)
  const isAdminEmployee = currentUser !== 'ADMIN' && currentUser.isAdmin;
  const currentEmployee = isAdminEmployee ? currentUser : null;

  // Filter employees based on active/past toggle and sort alphabetically
  const filteredEmployees = employees
    .filter(emp => showPastEmployees ? !emp.isActive : emp.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditName(emp.name);
    setEditEmail(emp.email || '');
    setEditRole(emp.role);
    setEditRate(emp.hourlyRate?.toString() || '');
    setEditVacationDays(emp.vacationDaysTotal?.toString() || '10');
    setEditIsAdmin(emp.isAdmin);
    setEditIsBookkeeper(emp.isBookkeeper);
    setEditIsActive(emp.isActive);
  };

  const handleSaveEmployee = async () => {
    if (!editingEmployee || !editName.trim() || !editRole.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateEmployee(editingEmployee.id, {
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        role: editRole.trim(),
        hourlyRate: editRate ? parseFloat(editRate) : undefined,
        vacationDaysTotal: parseInt(editVacationDays) || 10,
        isAdmin: editIsAdmin,
        isBookkeeper: editIsBookkeeper,
        isActive: editIsActive
      });
      
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to update employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleArchiveEmployee = async () => {
    if (!editingEmployee) return;
    
    const action = editingEmployee.isActive ? 'archive' : 'restore';
    const confirmMsg = editingEmployee.isActive 
      ? `Archive ${editingEmployee.name}? They will be moved to Past Employees and their time entries will be preserved.`
      : `Restore ${editingEmployee.name}? They will be moved back to Active Employees.`;
    
    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await updateEmployee(editingEmployee.id, {
        isActive: !editingEmployee.isActive
      });
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to archive/restore employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  useEffect(() => {
    if (isOpen) setLocalSettings(settings);
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    try {
      console.log('Saving settings:', localSettings);
      await updateSettings(localSettings);
      console.log('Settings saved successfully');
      alert("Settings saved!");
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error}`);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      console.log('Uploading to bucket: Timesheets, path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('Timesheets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Timesheets')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Update local settings
      setLocalSettings({ ...localSettings, companyLogoUrl: publicUrl });

      alert('Logo uploaded successfully! Click "Save Profile" to save changes.');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      const errorMessage = error?.message || 'Unknown error';
      alert(`Failed to upload logo: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    if (confirm('Are you sure you want to remove your company logo?')) {
      setLocalSettings({ ...localSettings, companyLogoUrl: undefined });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#484848]/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex overflow-hidden animate-slide-in-right"
        style={{ transform: 'scale(0.75)' }}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Sidebar */}
        <div className="w-1/4 bg-[#FAF9F5] border-r border-[#F6F5F1] p-6 flex flex-col gap-2">
            <h2 className="text-xl font-bold text-[#263926] mb-4">Settings</h2>
            <button 
                onClick={() => setActiveSection('profile')}
                className={`text-left px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeSection === 'profile' ? 'bg-white text-[#263926] shadow-sm' : 'text-[#6B6B6B] hover:bg-white'}`}
            >
                My Profile
            </button>
            <button 
                onClick={() => setActiveSection('team')}
                className={`text-left px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeSection === 'team' ? 'bg-white text-[#263926] shadow-sm' : 'text-[#6B6B6B] hover:bg-white'}`}
            >
                Team Management
            </button>
            <button 
                onClick={() => setActiveSection('config')}
                className={`text-left px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${activeSection === 'config' ? 'bg-white text-[#263926] shadow-sm' : 'text-[#6B6B6B] hover:bg-white'}`}
            >
                App Configuration
            </button>
            
            <div className="mt-auto">
                <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
            
            {/* Profile Section */}
            {activeSection === 'profile' && (
                <div className="space-y-6 max-w-lg">
                    <h3 className="text-2xl font-bold text-[#263926]">My Profile</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Your Name</label>
                            {isAdminEmployee ? (
                                <>
                                    <input 
                                        value={currentEmployee?.name || ''}
                                        disabled
                                        className="w-full p-3 border border-[#F6F5F1] rounded-2xl bg-[#FAF9F5] text-[#6B6B6B] cursor-not-allowed" 
                                    />
                                    <p className="text-xs text-[#9CA3AF] mt-2">To update your name, ask the business owner to edit it in Team Management.</p>
                                </>
                            ) : (
                                <input 
                                    value={localSettings.ownerName}
                                    onChange={e => setLocalSettings({...localSettings, ownerName: e.target.value})}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Company Name</label>
                            <input 
                                value={localSettings.companyName}
                                onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})}
                                className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Your Email</label>
                            {isAdminEmployee ? (
                                <>
                                    <input 
                                        type="email"
                                        value={currentEmployee?.email || ''}
                                        disabled
                                        className="w-full p-3 border border-[#F6F5F1] rounded-2xl bg-[#FAF9F5] text-[#6B6B6B] cursor-not-allowed" 
                                    />
                                    <p className="text-xs text-[#9CA3AF] mt-2">To update your email, ask the business owner to edit it in Team Management.</p>
                                </>
                            ) : (
                                <input 
                                    type="email"
                                    value={localSettings.ownerEmail}
                                    onChange={e => setLocalSettings({...localSettings, ownerEmail: e.target.value})}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Company Logo</label>
                            <div className="space-y-3">
                                {localSettings.companyLogoUrl ? (
                                    <div className="flex items-center gap-4 p-4 bg-[#FAF9F5] border border-[#F6F5F1] rounded-2xl">
                                        <img 
                                            src={localSettings.companyLogoUrl} 
                                            alt="Company Logo" 
                                            className="h-16 w-auto object-contain"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm text-[#263926] font-medium">Current Logo</p>
                                            <p className="text-xs text-[#9CA3AF] mt-1">This logo will appear in team invitation emails</p>
                                        </div>
                                        <button 
                                            onClick={handleRemoveLogo}
                                            className="px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-[#FAF9F5] border border-[#F6F5F1] rounded-2xl text-center">
                                        <p className="text-sm text-[#6B6B6B]">No logo uploaded</p>
                                    </div>
                                )}
                                
                                <label className="block">
                                    <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={uploadingLogo}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <label 
                                        htmlFor="logo-upload"
                                        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-2xl transition-colors cursor-pointer ${
                                            uploadingLogo 
                                                ? 'bg-[#E5E3DA] text-[#9CA3AF] cursor-not-allowed' 
                                                : 'bg-white border border-[#F6F5F1] text-[#263926] hover:bg-[#FAF9F5]'
                                        }`}
                                    >
                                        {uploadingLogo ? 'Uploading...' : localSettings.companyLogoUrl ? 'Upload New Logo' : 'Upload Logo'}
                                    </label>
                                </label>
                                
                                <p className="text-xs text-[#9CA3AF]">
                                    Upload your company logo to personalize team invitation emails. Max size: 2MB. Supported formats: JPG, PNG, SVG.
                                </p>
                            </div>
                        </div>
                        
                        <Button onClick={handleSaveSettings}>Save Profile</Button>
                    </div>
                </div>
            )}

            {/* Team Management Section */}
            {activeSection === 'team' && !editingEmployee && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-[#263926]">Team Management</h3>
                        <Button onClick={() => setIsAddEmployeeOpen(true)}>+ Add Member</Button>
                    </div>

                    {/* Filter Toggle */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setShowPastEmployees(false)}
                            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                                !showPastEmployees 
                                    ? 'bg-[#2CA01C] text-white' 
                                    : 'bg-[#F0EEE6] text-[#6B6B6B] hover:bg-[#E5E3DA]'
                            }`}
                        >
                            Active Employees ({employees.filter(e => e.isActive).length})
                        </button>
                        <button
                            onClick={() => setShowPastEmployees(true)}
                            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                                showPastEmployees 
                                    ? 'bg-[#2CA01C] text-white' 
                                    : 'bg-[#F0EEE6] text-[#6B6B6B] hover:bg-[#E5E3DA]'
                            }`}
                        >
                            Past Employees ({employees.filter(e => !e.isActive).length})
                        </button>
                    </div>

                    <div className="border border-[#F6F5F1] rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#FAF9F5] text-[#6B6B6B] font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Rate</th>
                                    <th className="px-6 py-4 text-right">Vacation Days</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F6F5F1]">
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[#9CA3AF]">
                                            {showPastEmployees ? 'No past employees' : 'No active employees'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <tr 
                                            key={emp.id} 
                                            onClick={() => handleEditEmployee(emp)}
                                            className="hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-[#263926]">
                                                {emp.name}
                                                <div className="text-xs text-[#9CA3AF] font-normal">{emp.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-[#484848]">{emp.role}</td>
                                            <td className="px-6 py-4 text-right text-[#484848] font-mono">${emp.hourlyRate || '—'}</td>
                                            <td className="px-6 py-4 text-right text-[#484848]">{emp.vacationDaysTotal}</td>
                                            <td className="px-6 py-4 text-right">
                                                {emp.isAdmin ? (
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Admin</span>
                                                ) : emp.isBookkeeper ? (
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Bookkeeper</span>
                                                ) : emp.isActive ? (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Active</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-[#E5E3DA] text-[#6B6B6B] rounded-full text-xs font-bold">Past</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <AddEmployeeModal isOpen={isAddEmployeeOpen} onClose={() => setIsAddEmployeeOpen(false)} />
                </div>
            )}

            {/* Edit Employee Form (replaces table) */}
            {activeSection === 'team' && editingEmployee && (
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => setEditingEmployee(null)}
                            className="p-2 hover:bg-[#FAF9F5] rounded-2xl transition-colors"
                        >
                            <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-2xl font-bold text-[#263926]">Edit Team Member</h3>
                    </div>

                    <div className="max-w-3xl">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Name *</label>
                                <input 
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Email</label>
                                <input 
                                    type="email"
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Position *</label>
                                <input 
                                    type="text"
                                    value={editRole}
                                    onChange={e => setEditRole(e.target.value)}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Hourly Rate ($)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={editRate}
                                    onChange={e => setEditRate(e.target.value)}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Vacation Days</label>
                                <input 
                                    type="number"
                                    value={editVacationDays}
                                    onChange={e => setEditVacationDays(e.target.value)}
                                    className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                                />
                            </div>

                            <div className="flex flex-col gap-3 justify-end pb-3">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        id="inline-edit-admin"
                                        checked={editIsAdmin}
                                        onChange={e => {
                                          setEditIsAdmin(e.target.checked);
                                          if (e.target.checked) setEditIsBookkeeper(false);
                                        }}
                                        className="w-4 h-4 text-[#2CA01C] rounded focus:ring-[#2CA01C]" 
                                    />
                                    <label htmlFor="inline-edit-admin" className="text-sm text-[#484848] cursor-pointer">Make Admin</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        id="inline-edit-bookkeeper"
                                        checked={editIsBookkeeper}
                                        onChange={e => {
                                          setEditIsBookkeeper(e.target.checked);
                                          if (e.target.checked) setEditIsAdmin(false);
                                        }}
                                        className="w-4 h-4 text-[#2CA01C] rounded focus:ring-[#2CA01C]" 
                                    />
                                    <label htmlFor="inline-edit-bookkeeper" className="text-sm text-[#484848] cursor-pointer">Make Bookkeeper (View Only)</label>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        id="inline-edit-active"
                                        checked={editIsActive}
                                        onChange={e => setEditIsActive(e.target.checked)}
                                        className="w-4 h-4 text-[#2CA01C] rounded focus:ring-[#2CA01C]" 
                                    />
                                    <label htmlFor="inline-edit-active" className="text-sm text-[#484848] cursor-pointer">Active Employee</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8 pt-6 border-t border-[#F6F5F1]">
                            <button
                                onClick={handleArchiveEmployee}
                                className={`px-4 py-2 text-sm font-medium rounded-2xl transition-colors ${
                                    editingEmployee?.isActive
                                        ? 'text-amber-600 hover:bg-amber-50'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                {editingEmployee?.isActive ? '📦 Archive Employee' : '↩️ Restore Employee'}
                            </button>
                            <div className="flex-1"></div>
                            <Button onClick={() => setEditingEmployee(null)} variant="outline">Cancel</Button>
                            <Button onClick={handleSaveEmployee}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Config Section */}
            {activeSection === 'config' && (
                <div className="space-y-6 max-w-lg">
                    <h3 className="text-2xl font-bold text-[#263926]">App Configuration</h3>
                    <div>
                        <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Bookkeeper Email</label>
                        <input 
                            type="email"
                            value={localSettings.bookkeeperEmail}
                            onChange={e => setLocalSettings({...localSettings, bookkeeperEmail: e.target.value})}
                            className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                            placeholder="accountant@example.com"
                        />
                        <p className="text-xs text-[#9CA3AF] mt-2">
                            This email will be pre-filled when you choose "Send to Bookkeeper" in the payroll view.
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">Half-Day Sick Leave Cutoff Time</label>
                        <input 
                            type="time"
                            value={localSettings.halfDaySickCutoffTime || '12:00'}
                            onChange={e => setLocalSettings({...localSettings, halfDaySickCutoffTime: e.target.value})}
                            className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none" 
                        />
                        <p className="text-xs text-[#9CA3AF] mt-2">
                            Employees can only mark half-day sick leave before this time. Default is 12:00 PM (noon).
                        </p>
                    </div>
                    <Button onClick={handleSaveSettings}>Save Configuration</Button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

// --- Sub-View: Employee Dashboard ---

const EmployeeDashboard = () => {
  const { currentUser, entries, clockIn, clockOut, startBreak, endBreak, submitChangeRequest, updateEntry, deleteEntry, requestVacation, settings } = useSupabaseStore();
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [issueEntry, setIssueEntry] = useState<TimeEntry | null>(null);
  const [view, setView] = useState<'clock' | 'history'>('clock');
  const [isTogglesVisible, setIsTogglesVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  
  // History View State - Moved to top level to avoid hook violation
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<TimeEntry | null>(null);
  const [historyEntryDate, setHistoryEntryDate] = useState<string>('');
  
  // Check for unresolved past issues on mount
  useEffect(() => {
    if (currentUser === 'ADMIN') return;

    const today = getTodayISO();
    
    // Find the most recent day in the past that has a missing clock out or an issue
    const issue = entries.find(e => {
        if (e.employeeId !== currentUser.id) return false;
        if (e.date >= today) return false; // Ignore today or future
        if (e.isSickDay || e.isVacationDay || e.isHalfSickDay) return false;
        // If they already submitted a change request, they are unblocked for now
        if (e.changeRequest) return false; 
        
        // Critical Issue: Missing Clock Out
        if (!e.clockOut) return true;
        
        return false;
    });
    
    if (issue) {
        setIssueEntry(issue);
    } else {
        setIssueEntry(null);
    }
  }, [entries, currentUser]);

  if (currentUser === 'ADMIN') return null;

  const today = getTodayISO();
  const todayEntry = entries.find(e => e.employeeId === currentUser.id && e.date === today);
  
  // Vacation Logic
  const vacationUsed = entries.filter(e => e.employeeId === currentUser.id && e.isVacationDay).length;
  const vacationTotal = currentUser.vacationDaysTotal || 0;
  const vacationRemaining = Math.max(0, vacationTotal - vacationUsed);

  // Status Logic
  let status: 'idle' | 'working' | 'break' | 'done' | 'vacation' | 'sick' | 'halfSick' = 'idle';
  if (todayEntry) {
    if (todayEntry.isVacationDay) status = 'vacation';
    else if (todayEntry.isSickDay) status = 'sick';
    else if (todayEntry.isHalfSickDay) status = 'halfSick';
    else if (todayEntry.clockOut) status = 'done';
    else if (todayEntry.breaks.some(b => !b.endTime)) status = 'break';
    else if (todayEntry.clockIn) status = 'working'; // Only 'working' if actually clocked in
    else status = 'idle'; // Entry exists but no flags and no clock in = idle state
  }

  // Timer logic for break mode
  const [breakTimer, setBreakTimer] = useState("00:00:00");
  
  useEffect(() => {
    let interval: number;
    if (status === 'break' && todayEntry) {
        const currentBreak = todayEntry.breaks.find(b => !b.endTime);
        if (currentBreak) {
            interval = window.setInterval(() => {
                const start = new Date(currentBreak.startTime).getTime();
                const now = new Date().getTime();
                // Ensure non-negative
                const diff = Math.max(0, now - start);
                
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                
                setBreakTimer(
                    `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                );
            }, 1000);
        }
    }
    return () => clearInterval(interval);
  }, [status, todayEntry]);

  // Fade out animation when employee clocks in normally
  useEffect(() => {
    if (status === 'working' && isTogglesVisible) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsTogglesVisible(false);
        setIsFadingOut(false);
      }, 600); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [status, isTogglesVisible]);

  // Auto-save handlers for sick/vacation
  const handleMarkSick = async () => {
    try {
      if (todayEntry?.isSickDay) {
        // Toggle off - clear the flag instead of deleting (employees can't delete)
        console.log('Toggling OFF sick day, clearing flag');
        const entry: TimeEntry = {
          ...todayEntry,
          isSickDay: false,
          isVacationDay: false
        };
        await updateEntry(entry);
      } else {
        // Toggle on - create or update entry
        console.log('Toggling ON sick day');
        const entry: TimeEntry = todayEntry ? {
          ...todayEntry,
          isSickDay: true,
          isVacationDay: false,
          clockIn: null,
          clockOut: null,
          breaks: []
        } : {
          id: crypto.randomUUID(),
          employeeId: currentUser.id,
          date: today,
          clockIn: null,
          clockOut: null,
          breaks: [],
          adminNotes: '',
          isSickDay: true,
          isVacationDay: false
        };
        await updateEntry(entry);
      }
    } catch (error) {
      console.error('Error toggling sick day:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const handleMarkVacation = async () => {
    try {
      if (todayEntry?.isVacationDay) {
        // Toggle off - clear the flag instead of deleting (employees can't delete)
        console.log('Toggling OFF vacation day, clearing flag');
        const entry: TimeEntry = {
          ...todayEntry,
          isSickDay: false,
          isVacationDay: false
        };
        await updateEntry(entry);
      } else {
        // Toggle on - create or update entry
        console.log('Toggling ON vacation day');
        const entry: TimeEntry = todayEntry ? {
          ...todayEntry,
          isSickDay: false,
          isVacationDay: true,
          clockIn: null,
          clockOut: null,
          breaks: []
        } : {
          id: crypto.randomUUID(),
          employeeId: currentUser.id,
          date: today,
          clockIn: null,
          clockOut: null,
          breaks: [],
          adminNotes: '',
          isSickDay: false,
          isVacationDay: true
        };
        await updateEntry(entry);
      }
    } catch (error) {
      console.error('Error toggling vacation day:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const handleMarkHalfSick = async () => {
    try {
      // Check cutoff time
      if (!canMarkHalfSickDay(settings.halfDaySickCutoffTime)) {
        alert(`Half-day sick leave is only available before ${settings.halfDaySickCutoffTime || '12:00'}`);
        return;
      }

      if (todayEntry?.isHalfSickDay) {
        // Toggle off - clear the flag
        console.log('Toggling OFF half sick day, clearing flag');
        const entry: TimeEntry = {
          ...todayEntry,
          isHalfSickDay: false,
          isSickDay: false,
          isVacationDay: false
        };
        await updateEntry(entry);
      } else {
        // Toggle on - preserve any worked hours
        console.log('Toggling ON half sick day, preserving worked hours');
        const entry: TimeEntry = todayEntry ? {
          ...todayEntry,
          isHalfSickDay: true,
          isSickDay: false,
          isVacationDay: false
          // Preserve clockIn, clockOut, and breaks
        } : {
          id: crypto.randomUUID(),
          employeeId: currentUser.id,
          date: today,
          clockIn: null,
          clockOut: null,
          breaks: [],
          adminNotes: '',
          isHalfSickDay: true,
          isSickDay: false,
          isVacationDay: false
        };
        await updateEntry(entry);
      }
    } catch (error) {
      console.error('Error toggling half sick day:', error);
      alert('Failed to update. Please try again.');
    }
  };

  // Full Screen Break Overlay
  if (status === 'break') {
      return (
        <div className="fixed inset-0 z-50 bg-rose-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="mb-12">
                 <h1 className="text-4xl md:text-6xl font-bold text-rose-900 mb-4 tracking-tight">You are on break</h1>
                 <p className="text-rose-700 font-mono text-xl md:text-3xl opacity-80">{breakTimer}</p>
             </div>
             
             <button 
                onClick={() => endBreak(currentUser.id)}
                className="bg-rose-600 text-white text-2xl font-bold py-8 px-16 rounded-full shadow-2xl shadow-rose-600/30 hover:bg-rose-700 hover:scale-105 transition-all transform active:scale-95"
             >
                 End Break
             </button>
        </div>
      );
  }

  // Action Required Modal (Blocking)
  if (issueEntry) {
     return (
        <div className="fixed inset-0 z-50 bg-[#484848]/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center animate-slide-in-right">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-[#263926] mb-2">Action Required</h2>
                <p className="text-[#6B6B6B] mb-6 text-sm">
                    You didn't clock out on <span className="font-bold text-[#263926]">{formatDateForDisplay(issueEntry.date)}</span>. 
                    Please update your time card.
                </p>
                <Button 
                    className="w-full"
                    onClick={() => setIsAdjustmentModalOpen(true)}
                >
                    Review & Fix Now
                </Button>

                {/* Modal that opens when they click fix */}
                <TimeCardModal 
                    isOpen={isAdjustmentModalOpen}
                    onClose={() => setIsAdjustmentModalOpen(false)}
                    employee={currentUser}
                    entry={issueEntry}
                    date={issueEntry.date}
                    isEmployeeView={true}
                    onSave={(proposedEntry) => {
                        submitChangeRequest(proposedEntry);
                        setIssueEntry(null); 
                    }}
                    onDelete={() => {}} 
                />
            </div>
        </div>
     );
  }

  // --- Schedule / History View ---
  if (view === 'history') {
      const myEntries = entries.filter(e => e.employeeId === currentUser.id).sort((a,b) => b.date.localeCompare(a.date));
      const totalWorkedMins = myEntries.reduce((acc, e) => acc + calculateStats(e).totalWorkedMinutes, 0);
      const totalBreakMins = myEntries.reduce((acc, e) => acc + calculateStats(e).totalBreakMinutes, 0);
      
      return (
        <div className="max-w-4xl mx-auto mt-8 px-6 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => setView('clock')} className="pl-0 hover:bg-transparent hover:text-[#263926]">
                    ← Back to Clock In
                </Button>
                <h1 className="text-2xl font-bold text-[#263926]">My Schedule & History</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100 text-sky-900">
                    <h3 className="text-xs font-bold uppercase opacity-70 mb-1">Vacation Remaining</h3>
                    <div className="text-3xl font-bold">{vacationRemaining} <span className="text-sm font-normal opacity-70">Days</span></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#F6F5F1] text-[#263926] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-xs font-bold uppercase text-[#6B6B6B] mb-1">Total Hours Worked</h3>
                    <div className="text-3xl font-bold">{formatDuration(totalWorkedMins)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-[#F6F5F1] text-[#263926] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <h3 className="text-xs font-bold uppercase text-[#6B6B6B] mb-1">Total Break Time</h3>
                    <div className="text-3xl font-bold">{formatDuration(totalBreakMins)}</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[#F6F5F1] bg-[#FAF9F5]">
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Clock In</th>
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Clock Out</th>
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Break</th>
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Worked</th>
                            <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F6F5F1]">
                        {myEntries.map(entry => {
                            const stats = calculateStats(entry);
                            return (
                                <tr 
                                    key={entry.id} 
                                    onClick={() => {
                                        setHistoryEntryDate(entry.date);
                                        setSelectedHistoryEntry(entry);
                                    }}
                                    className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                                >
                                    <td className="py-4 px-6 font-medium text-[#263926]">{formatDateForDisplay(entry.date)}</td>
                                    <td className="py-4 px-6 text-[#484848] font-mono text-sm">{formatTime(entry.clockIn)}</td>
                                    <td className="py-4 px-6 text-[#484848] font-mono text-sm">{formatTime(entry.clockOut)}</td>
                                    <td className="py-4 px-6 text-right text-[#6B6B6B] text-sm">{formatDuration(stats.totalBreakMinutes)}</td>
                                    <td className="py-4 px-6 text-right font-medium text-[#263926]">{formatDuration(stats.totalWorkedMinutes)}</td>
                                    <td className="py-4 px-6 text-right">
                                        {entry.changeRequest ? (
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Reviewing</span>
                                        ) : entry.isSickDay ? (
                                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">Sick</span>
                                        ) : entry.isHalfSickDay ? (
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Half Sick</span>
                                        ) : entry.isVacationDay ? (
                                            <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">Vacation</span>
                                        ) : (
                                            <span className="text-xs text-[#9CA3AF]">OK</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {myEntries.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-[#9CA3AF]">No history available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for Employee to Edit Past Entries */}
            {selectedHistoryEntry && (
                <TimeCardModal 
                    isOpen={true}
                    onClose={() => setSelectedHistoryEntry(null)}
                    employee={currentUser}
                    entry={selectedHistoryEntry}
                    date={historyEntryDate}
                    isEmployeeView={true}
                    onSave={(proposed) => submitChangeRequest(proposed)}
                    onDelete={() => {}}
                />
            )}
        </div>
      );
  }

  // --- Main Clock View ---
  return (
    <div className="max-w-md mx-auto mt-12 px-6 pb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#263926] mb-2">Good morning, {currentUser.name.split(' ')[0]}</h2>
        <p className="text-[#6B6B6B] font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Sick/Vacation Toggle Section - Show only when idle, sick, vacation, or halfSick */}
      {isTogglesVisible && (status === 'idle' || status === 'sick' || status === 'vacation' || status === 'halfSick') && (
        <div 
          className={`mb-6 transition-all duration-600 ${isFadingOut ? 'opacity-0 max-h-0' : 'opacity-100 max-h-40'} overflow-hidden`}
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Sick Day Toggle */}
            <button
              onClick={handleMarkSick}
              disabled={status === 'vacation' || status === 'halfSick'}
              className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                status === 'sick' 
                  ? 'bg-rose-50 border-rose-200 shadow-md cursor-pointer hover:bg-rose-100' 
                  : status === 'vacation' || status === 'halfSick'
                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-[#E5E3DA] hover:border-rose-200 hover:bg-rose-50 cursor-pointer'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xl mb-1">🤒</div>
                <h3 className={`text-xs font-bold ${status === 'sick' ? 'text-rose-900' : 'text-[#263926]'}`}>
                  Sick Day
                </h3>
                {status === 'sick' && (
                  <p className="text-[10px] text-rose-600 mt-1">Click to undo</p>
                )}
              </div>
              
              <div className={`w-10 h-6 rounded-full transition-colors relative ${
                status === 'sick' ? 'bg-rose-500' : 'bg-[#E5E3DA]'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                  status === 'sick' ? 'translate-x-4' : ''
                }`}></div>
              </div>
            </button>

            {/* Half-Day Sick Toggle */}
            <button
              onClick={handleMarkHalfSick}
              disabled={status === 'sick' || status === 'vacation' || !canMarkHalfSickDay(settings.halfDaySickCutoffTime)}
              className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                status === 'halfSick' 
                  ? 'bg-amber-50 border-amber-200 shadow-md cursor-pointer hover:bg-amber-100' 
                  : status === 'sick' || status === 'vacation' || !canMarkHalfSickDay(settings.halfDaySickCutoffTime)
                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-[#E5E3DA] hover:border-amber-200 hover:bg-amber-50 cursor-pointer'
              }`}
              title={!canMarkHalfSickDay(settings.halfDaySickCutoffTime) ? `Available until ${settings.halfDaySickCutoffTime || '12:00'}` : ''}
            >
              <div className="text-center mb-2">
                <div className="text-xl mb-1">🤧</div>
                <h3 className={`text-xs font-bold ${status === 'halfSick' ? 'text-amber-900' : 'text-[#263926]'}`}>
                  Half Sick
                </h3>
                {status === 'halfSick' && (
                  <p className="text-[10px] text-amber-600 mt-1">Click to undo</p>
                )}
                {status !== 'halfSick' && !canMarkHalfSickDay(settings.halfDaySickCutoffTime) && (
                  <p className="text-[9px] text-gray-500 mt-1">Past cutoff</p>
                )}
              </div>
              
              <div className={`w-10 h-6 rounded-full transition-colors relative ${
                status === 'halfSick' ? 'bg-amber-500' : 'bg-[#E5E3DA]'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                  status === 'halfSick' ? 'translate-x-4' : ''
                }`}></div>
              </div>
            </button>

            {/* Vacation Day Toggle */}
            <button
              onClick={handleMarkVacation}
              disabled={status === 'sick' || status === 'halfSick'}
              className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                status === 'vacation' 
                  ? 'bg-sky-50 border-sky-200 shadow-md cursor-pointer hover:bg-sky-100' 
                  : status === 'sick' || status === 'halfSick'
                  ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-[#E5E3DA] hover:border-sky-200 hover:bg-sky-50 cursor-pointer'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xl mb-1">✈️</div>
                <h3 className={`text-xs font-bold ${status === 'vacation' ? 'text-sky-900' : 'text-[#263926]'}`}>
                  Vacation
                </h3>
                {status === 'vacation' && (
                  <p className="text-[10px] text-sky-600 mt-1">Click to undo</p>
                )}
              </div>
              
              <div className={`w-10 h-6 rounded-full transition-colors relative ${
                status === 'vacation' ? 'bg-sky-500' : 'bg-[#E5E3DA]'
              }`}>
                <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
                  status === 'vacation' ? 'translate-x-4' : ''
                }`}></div>
              </div>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-8 border border-[#F6F5F1] text-center relative overflow-hidden">
        
        <div className="mb-8 mt-4">
          <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase ${
            status === 'working' ? 'bg-emerald-100 text-emerald-700' :
            status === 'done' ? 'bg-[#F0EEE6] text-[#6B6B6B]' :
            status === 'sick' ? 'bg-rose-100 text-rose-700' :
            status === 'halfSick' ? 'bg-amber-100 text-amber-700' :
            status === 'vacation' ? 'bg-sky-100 text-sky-700' :
            'bg-[#F0EEE6] text-[#6B6B6B]'
          }`}>
             {status === 'sick' ? 'Sick Day' : 
              status === 'halfSick' ? 'Half Sick Day' :
              status === 'vacation' ? 'Vacation' :
              status === 'idle' ? 'Ready to Start' : 
              status === 'done' ? 'Shift Complete' : 
              'Clocked In'}
          </span>
          <div className="mt-4 text-5xl font-mono text-[#263926] tracking-tight">
             {(status === 'sick' || status === 'vacation') ? 'OFF' : 
              status === 'halfSick' ? new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase() :
              new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
          </div>
        </div>

        <div className="space-y-4">
          {status === 'idle' && (
            <Button onClick={() => clockIn(currentUser.id)} variant="primary" size="xl" className="w-full text-xl">
              Clock In
            </Button>
          )}

          {status === 'working' && (
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => startBreak(currentUser.id)} variant="secondary" size="lg" className="h-20">
                Start Break
              </Button>
              <Button onClick={() => clockOut(currentUser.id)} variant="primary" size="lg" className="h-20 bg-rose-900 hover:bg-rose-800 focus:ring-rose-900">
                Clock Out
              </Button>
            </div>
          )}

          {status === 'done' && (
             <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-sm border border-emerald-100">
               You clocked out at {formatTime(todayEntry!.clockOut)}. <br/> See you tomorrow! Have a great evening.
             </div>
          )}
          
          {status === 'sick' && (
              <div className="p-4 bg-rose-50 rounded-2xl text-rose-700 text-sm border border-rose-100">
                You are marked as sick today. Get well soon!
              </div>
          )}

          {status === 'vacation' && (
              <div className="p-4 bg-sky-50 rounded-2xl text-sky-700 text-sm border border-sky-100">
                You are on vacation today. Enjoy!
              </div>
          )}
        </div>
      </div>

      {/* Footer Navigation Area */}
      <div className="mt-8 flex flex-col gap-4">
          <Button 
            variant="primary"
            className="w-full py-4 text-white bg-sky-600 hover:bg-sky-700"
            onClick={() => setIsVacationModalOpen(true)}
          >
            ✈️ Request Vacation Day
          </Button>
          <Button 
            variant="secondary" 
            className="w-full py-4 text-[#484848] bg-[#F0EEE6] hover:bg-[#E5E3DA] border border-[#F6F5F1]"
            onClick={() => setView('history')}
          >
            📅 View Schedule & Vacation
          </Button>
      </div>

      {/* Mini History */}
      <div className="mt-8 border-t border-[#F6F5F1] pt-6">
        <h3 className="text-base font-bold text-[#263926] mb-4">Today's Activity</h3>
        <div className="space-y-3">
          {todayEntry && !todayEntry.isSickDay && !todayEntry.isVacationDay && (
             <>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B]">Clock In</span>
                  <span className="font-mono text-[#263926]">{formatTime(todayEntry.clockIn)}</span>
                </div>
                {todayEntry.breaks.map((b, i) => (
                   <div key={b.id} className="flex justify-between text-sm pl-4 border-l-2 border-amber-100">
                    <span className="text-[#6B6B6B]">Break {i+1}</span>
                    <span className="font-mono text-[#263926]">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </span>
                   </div>
                ))}
                {todayEntry.clockOut && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Clock Out</span>
                    <span className="font-mono text-[#263926]">{formatTime(todayEntry.clockOut)}</span>
                  </div>
                )}
             </>
          )}
          {todayEntry?.changeRequest && (
              <div className="text-center text-xs text-amber-600 bg-amber-50 p-2 rounded-2xl mt-2">
                  Change request pending review.
              </div>
          )}
          {(!todayEntry || todayEntry.isSickDay || todayEntry.isVacationDay) && <p className="text-sm text-[#9CA3AF] italic text-center">No hours recorded.</p>}
        </div>
      </div>

      {/* Employee Modal for Proposals */}
      <TimeCardModal 
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
          employee={currentUser}
          entry={todayEntry}
          date={today}
          isEmployeeView={true}
          onSave={(proposedEntry) => {
              submitChangeRequest(proposedEntry);
          }}
          onDelete={() => {}} // Employees cannot delete
        />

      {/* Vacation Request Modal */}
      {currentUser !== 'ADMIN' && (
        <VacationRequestModal
          isOpen={isVacationModalOpen}
          onClose={() => setIsVacationModalOpen(false)}
          employee={currentUser}
          onSubmit={async (startDate, endDate) => {
            await requestVacation(currentUser.id, startDate, endDate);
            setIsVacationModalOpen(false);
          }}
          existingDates={entries
            .filter(e => e.employeeId === currentUser.id)
            .map(e => e.date)
          }
        />
      )}
    </div>
  );
};

// --- Sub-View: Bookkeeper Dashboard (Read-Only View) ---

const BookkeeperDashboard = () => {
  const { employees, entries, settings, currentUser } = useSupabaseStore();
  const [viewDate, setViewDate] = useState(getTodayISO());
  const [activeTab, setActiveTab] = useState<'daily' | 'period'>('daily');
  const [selectedEmployeeEntry, setSelectedEmployeeEntry] = useState<{employee: Employee, entry?: TimeEntry} | null>(null);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [periodDetailEmployee, setPeriodDetailEmployee] = useState<Employee | null>(null);

  // Get bookkeeper's email for sending reports to themselves
  const bookkeeperEmail = currentUser !== 'ADMIN' ? currentUser.email : '';

  // -- Daily Logic --
  const relevantEmployees = employees.filter(e => {
    // Filter out admin and bookkeeper employees - they don't clock in/out
    if (e.isAdmin || e.isBookkeeper) return false;
    return e.isActive || entries.some(entry => entry.employeeId === e.id && entry.date === viewDate);
  }).sort((a, b) => a.name.localeCompare(b.name));

  const dailySummaries: DailySummary[] = relevantEmployees.map(emp => {
    const entry = entries.find(e => e.employeeId === emp.id && e.date === viewDate);
    const stats = calculateStats(entry);
    return { employee: emp, entry, stats };
  });

  const handleDateChange = (days: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().split('T')[0]);
  };

  // -- Period Logic --
  const [periodEnd, setPeriodEnd] = useState(getTodayISO());
  const [periodStart, setPeriodStart] = useState(() => {
     const d = new Date();
     d.setDate(d.getDate() - 13);
     return d.toISOString().split('T')[0];
  });

  const periodSummaries = employees
    .filter(emp => !emp.isAdmin && !emp.isBookkeeper)
    .map(emp => {
      const empEntries = entries.filter(e => 
          e.employeeId === emp.id && 
          e.date >= periodStart && 
          e.date <= periodEnd
      );
      
      let totalMinutes = 0;
      let daysWorked = 0;
      let sickDays = 0;
      let vacationDays = 0;
      let hasIssues = false;

      empEntries.forEach(entry => {
          const stats = calculateStats(entry);
          if (entry.isSickDay) {
             sickDays++;
          } else if (entry.isHalfSickDay) {
             sickDays += 0.5;
             totalMinutes += stats.totalWorkedMinutes;
             if (stats.totalWorkedMinutes > 0) daysWorked++;
          } else if (entry.isVacationDay) {
             vacationDays++;
          } else {
              totalMinutes += stats.totalWorkedMinutes;
              if (stats.totalWorkedMinutes > 0) daysWorked++;
          }
          if (stats.issues.length > 0) hasIssues = true;
      });
      
      const hours = totalMinutes / 60;
      const pay = hours * (emp.hourlyRate || 0);

      return {
          employee: emp,
          totalMinutes,
          totalPay: pay,
          hasIssues,
          daysWorked,
          sickDays,
          vacationDays
      };
  }).filter(s => s.employee.isActive || s.totalMinutes > 0 || s.sickDays > 0 || s.vacationDays > 0)
    .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

  const totalPayroll = periodSummaries.reduce((acc, s) => acc + s.totalPay, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const handleSendReport = async () => {
    if (!bookkeeperEmail) {
      alert('No email address found for your account.');
      return;
    }
    
    setSendingReport(true);
    
    try {
      const employeeData = periodSummaries.map(s => ({
        name: s.employee.name,
        role: s.employee.role,
        hours: formatDuration(s.totalMinutes),
        daysWorked: s.daysWorked,
        sickDays: s.sickDays,
        vacationDays: s.vacationDays
      }));

      await sendBookkeeperReport({
        bookkeeperEmail: bookkeeperEmail,
        ownerEmail: bookkeeperEmail, // Send to self
        companyName: settings.companyName,
        periodStart: formatDateForDisplay(periodStart),
        periodEnd: formatDateForDisplay(periodEnd),
        employees: employeeData
      });

      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setIsSendConfirmOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send report:', error);
      alert('Failed to send report. Please try again.');
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 md:px-6 pb-20">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#263926]">{settings.companyName || 'Timesheets'}</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">View-only access to timesheets and pay periods.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Tab Buttons */}
          <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-full border border-[#F6F5F1] shadow-sm overflow-x-auto">
            <button 
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${activeTab === 'daily' ? 'bg-[#2CA01C] text-white shadow-md' : 'text-[#6B6B6B] hover:text-[#263926]'}`}
            >
                Daily Review
            </button>
            <button 
                onClick={() => setActiveTab('period')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${activeTab === 'period' ? 'bg-[#2CA01C] text-white shadow-md' : 'text-[#6B6B6B] hover:text-[#263926]'}`}
            >
                Pay Period
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'daily' && (
        <>
          {/* Date Navigator */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <button onClick={() => handleDateChange(-1)} className="p-2 text-[#9CA3AF] hover:text-[#263926] hover:bg-[#F0EEE6] rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center w-48">
              <span className="block text-lg font-semibold text-[#263926]">{formatDateForDisplay(viewDate)}</span>
              {viewDate === getTodayISO() && <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Today</span>}
            </div>
            <button onClick={() => handleDateChange(1)} className="p-2 text-[#9CA3AF] hover:text-[#263926] hover:bg-[#F0EEE6] rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F6F5F1] bg-[#F0EEE6]">
                  <th className="py-4 px-5 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Time Range</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Worked</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Break</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-3 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F5F1]">
                {dailySummaries.map(({ employee, entry, stats }) => (
                  <tr 
                    key={employee.id} 
                    onClick={() => setSelectedEmployeeEntry({ employee, entry })}
                    className="hover:bg-[#F0EEE6] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#263926]">{employee.name}</div>
                      <div className="text-xs text-[#6B6B6B]">{employee.role} {!employee.isActive && '(Archived)'}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-[#484848]">
                      {entry?.clockIn && !entry.isSickDay && !entry.isVacationDay && !entry.isHalfSickDay ? (
                        <>
                          {formatTime(entry.clockIn)} <span className="text-[#E5E3DA] mx-1">–</span> {formatTime(entry.clockOut)}
                        </>
                      ) : entry?.isSickDay ? <span className="text-rose-400">Sick Day</span> 
                      : entry?.isHalfSickDay ? (
                        entry.clockIn ? (
                          <>
                            {formatTime(entry.clockIn)} <span className="text-[#E5E3DA] mx-1">–</span> {formatTime(entry.clockOut)}
                          </>
                        ) : (
                          <span className="text-amber-400">Half Sick</span>
                        )
                      ) : entry?.isVacationDay ? <span className="text-sky-400">Vacation</span> : <span className="text-[#E5E3DA]">--:--</span>}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-[#263926]">
                      {!entry?.isSickDay && !entry?.isVacationDay && entry?.clockIn ? formatDuration(stats.totalWorkedMinutes) : '—'}
                    </td>
                    <td className="py-4 px-4 text-right text-[#6B6B6B] text-sm">
                      {stats.totalBreakMinutes > 0 ? formatDuration(stats.totalBreakMinutes) : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {stats.issues.filter(i => i !== 'CHANGE_REQUESTED' && i !== 'VACATION_REQUEST_PENDING').map(issue => (
                          <span key={issue} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                              issue === 'SICK_DAY' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                              issue === 'HALF_SICK_DAY' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              issue === 'VACATION_DAY' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                              'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                              {issue === 'MISSING_CLOCK_OUT' && 'Missing Out'}
                              {issue === 'LONG_SHIFT_NO_BREAK' && 'No Break'}
                              {issue === 'OPEN_BREAK' && 'On Break'}
                              {issue === 'SICK_DAY' && 'Sick'}
                              {issue === 'HALF_SICK_DAY' && 'Half Sick'}
                              {issue === 'VACATION_DAY' && 'Vacation'}
                          </span>
                        ))}
                        {stats.issues.length === 0 && entry?.clockIn && !entry.clockOut && (
                           <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Active</span>
                        )}
                        {stats.issues.length === 0 && entry?.clockOut && (
                           <span className="text-xs text-[#9CA3AF]">OK</span>
                        )}
                         {stats.issues.length === 0 && !entry && (
                           <span className="text-xs text-[#E5E3DA]">No Entry</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center">
                       <span className="text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a9 9 0 11-18 0 9 9 0 0118 0z M12 16v-4 M12 8h.01" /></svg>
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
             {dailySummaries.map(({ employee, entry, stats }) => (
                 <div 
                    key={employee.id}
                    onClick={() => setSelectedEmployeeEntry({ employee, entry })}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-[#F6F5F1] active:scale-[0.98] transition-transform"
                 >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-[#263926]">{employee.name}</div>
                            <div className="text-xs text-[#6B6B6B]">{employee.role}</div>
                        </div>
                        {entry?.clockIn && !entry.isSickDay && !entry.isVacationDay ? (
                            <div className="text-right">
                                <div className="text-lg font-bold text-[#263926]">{formatDuration(stats.totalWorkedMinutes)}</div>
                                <div className="text-xs text-[#9CA3AF] font-mono">
                                    {formatTime(entry.clockIn)} - {formatTime(entry.clockOut)}
                                </div>
                            </div>
                        ) : entry?.isSickDay ? (
                            <div className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">SICK DAY</div>
                        ) : entry?.isVacationDay ? (
                            <div className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">VACATION</div>
                        ) : (
                            <div className="text-xs text-[#E5E3DA] italic">No Time</div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-[#F6F5F1] pt-3">
                        <div className="flex gap-2 flex-wrap">
                            {stats.issues.length > 0 ? stats.issues.filter(i => i !== 'CHANGE_REQUESTED' && i !== 'VACATION_REQUEST_PENDING').map(issue => (
                              <span key={issue} className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                  issue === 'SICK_DAY' ? 'bg-rose-50 text-rose-700' : 
                                  issue === 'VACATION_DAY' ? 'bg-sky-50 text-sky-700' :
                                  'bg-amber-50 text-amber-700'
                              }`}>
                                  {issue.replace(/_/g, ' ')}
                              </span>
                            )) : (
                                entry?.clockIn && !entry.clockOut ? 
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700">Active</span> :
                                <span className="text-[10px] text-[#9CA3AF]">No Issues</span>
                            )}
                        </div>
                        <span className="text-xs text-[#9CA3AF]">Tap to view</span>
                    </div>
                 </div>
             ))}
          </div>
        </>
      )}

      {activeTab === 'period' && (
        <>
          {/* Period Controls */}
          <div className="mb-8 bg-white rounded-2xl p-6 border border-[#F6F5F1] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <DatePicker 
                  label="Start date"
                  value={periodStart}
                  onChange={setPeriodStart}
                />
                <DatePicker 
                  label="End date"
                  value={periodEnd}
                  onChange={setPeriodEnd}
                />
              </div>
              <div>
                <Button onClick={() => setIsSendConfirmOpen(true)}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Report to Me
                </Button>
              </div>
            </div>
          </div>

          {/* Period Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1]">
              <div className="text-sm text-[#6B6B6B] mb-1">Total Hours</div>
              <div className="text-2xl font-bold text-[#263926]">
                {formatDuration(periodSummaries.reduce((acc, s) => acc + s.totalMinutes, 0))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1]">
              <div className="text-sm text-[#6B6B6B] mb-1">Team Members</div>
              <div className="text-2xl font-bold text-[#263926]">{periodSummaries.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1]">
              <div className="text-sm text-[#6B6B6B] mb-1">Estimated Payroll</div>
              <div className="text-2xl font-bold text-[#263926]">{formatCurrency(totalPayroll)}</div>
            </div>
          </div>

          {/* Period Table */}
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F6F5F1] bg-[#F0EEE6]">
                  <th className="py-4 px-5 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Hours</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Days</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Sick</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Vacation</th>
                  <th className="py-4 px-3 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F5F1]">
                {periodSummaries.map(s => (
                  <tr 
                    key={s.employee.id} 
                    onClick={() => setPeriodDetailEmployee(s.employee)}
                    className="hover:bg-[#F0EEE6] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#263926]">{s.employee.name}</div>
                      <div className="text-xs text-[#6B6B6B]">{s.employee.role}</div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-medium text-[#263926]">
                      {formatDuration(s.totalMinutes)}
                    </td>
                    <td className="py-4 px-4 text-right text-[#6B6B6B]">{s.daysWorked}</td>
                    <td className="py-4 px-4 text-right text-[#6B6B6B]">{s.sickDays || '—'}</td>
                    <td className="py-4 px-4 text-right text-[#6B6B6B]">{s.vacationDays || '—'}</td>
                    <td className="py-4 px-3 text-center">
                       <span className="text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Read-Only TimeCard Modal */}
      {selectedEmployeeEntry && (
        <TimeCardModal 
          isOpen={true}
          onClose={() => setSelectedEmployeeEntry(null)}
          entry={selectedEmployeeEntry.entry}
          employee={selectedEmployeeEntry.employee}
          date={selectedEmployeeEntry.entry?.date || viewDate}
          isEmployeeView={false}
          readOnly={true}
          onSave={() => {}}
          onDelete={() => {}}
        />
      )}

      {/* Period Detail Modal */}
      {periodDetailEmployee && (
        <PeriodDetailModal
          isOpen={true}
          onClose={() => setPeriodDetailEmployee(null)}
          employee={periodDetailEmployee}
          entries={entries.filter(e => 
            e.employeeId === periodDetailEmployee.id && 
            e.date >= periodStart && 
            e.date <= periodEnd
          )}
          periodStart={periodStart}
          periodEnd={periodEnd}
        />
      )}

      {/* Send Report Confirmation Modal */}
      {isSendConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#484848]/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#263926] mb-4">Send Pay Period Report</h2>
            <p className="text-[#6B6B6B] mb-6">
              This will send the pay period report ({formatDateForDisplay(periodStart)} - {formatDateForDisplay(periodEnd)}) to your email address: <strong>{bookkeeperEmail}</strong>
            </p>
            
            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-center font-medium">
                Report sent successfully!
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsSendConfirmOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSendReport} disabled={sendingReport} className="flex-1">
                  {sendingReport ? 'Sending...' : 'Send Report'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-View: Admin Dashboard ---

const AdminDashboard = () => {
  const { employees, entries, updateEntry, deleteEntry, settings, currentUser, approveChangeRequest, denyChangeRequest, approveVacationRequest, denyVacationRequest } = useSupabaseStore();
  const [viewDate, setViewDate] = useState(getTodayISO());
  const [activeTab, setActiveTab] = useState<'daily' | 'period'>('daily');
  const [selectedEmployeeEntry, setSelectedEmployeeEntry] = useState<{employee: Employee, entry?: TimeEntry} | null>(null);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = useState(false);
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [periodDetailEmployee, setPeriodDetailEmployee] = useState<Employee | null>(null);

  // Count pending change requests
  const pendingReviewCount = entries.filter(e => e.changeRequest || e.pendingApproval).length;
  
  // Check if current user is admin (owner or admin employee)
  const isAdmin = currentUser === 'ADMIN';

  // -- Daily Logic --

  let dailySummaries: DailySummary[];

  if (showReviewOnly) {
    // Show ALL entries with change requests OR pending vacation requests across ALL dates
    const entriesWithReviews = entries.filter(e => e.changeRequest || e.pendingApproval);
    dailySummaries = entriesWithReviews.map(entry => {
      const employee = employees.find(emp => emp.id === entry.employeeId)!;
      const stats = calculateStats(entry);
      return { employee, entry, stats };
    });
  } else {
    // Normal daily view for specific date
    console.log('📊 Daily view - filtering employees:', {
      totalEmployees: employees.length,
      employeeDetails: employees.map(e => ({ name: e.name, isActive: e.isActive, id: e.id })),
      viewDate,
      isAdmin
    });
    
    // FIXED: Admins see ALL active employees, not just those with entries for the day
    const relevantEmployees = employees.filter(e => {
      // Filter out admin and bookkeeper employees - they don't clock in/out
      if (e.isAdmin || e.isBookkeeper) return false;
      
      if (isAdmin) {
        // Admins see all active employees OR any employee with an entry on this date
        return e.isActive || entries.some(entry => entry.employeeId === e.id && entry.date === viewDate);
      } else {
        // Non-admins (shouldn't happen, but keep the old logic)
        return e.isActive || entries.some(entry => entry.employeeId === e.id && entry.date === viewDate);
      }
    }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
    
    console.log('📊 After filtering:', {
      relevantCount: relevantEmployees.length,
      filtered: relevantEmployees.map(e => ({ name: e.name, isActive: e.isActive }))
    });

    dailySummaries = relevantEmployees.map(emp => {
      const entry = entries.find(e => e.employeeId === emp.id && e.date === viewDate);
      const stats = calculateStats(entry);
      return { employee: emp, entry, stats };
    });
  }

  const handleDateChange = (days: number) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().split('T')[0]);
  };


  // -- Period Logic --

  // Initialize with a standard 2 week period
  const [periodEnd, setPeriodEnd] = useState(getTodayISO());
  const [periodStart, setPeriodStart] = useState(() => {
     const d = new Date();
     d.setDate(d.getDate() - 13);
     return d.toISOString().split('T')[0];
  });

  // Removed handlePeriodChange (14-day cycle buttons) in favor of direct date inputs

  const periodSummaries = employees
    .filter(emp => !emp.isAdmin && !emp.isBookkeeper) // Exclude admin and bookkeeper employees - they don't clock in/out
    .map(emp => {
      // Find entries in range
      const empEntries = entries.filter(e => 
          e.employeeId === emp.id && 
          e.date >= periodStart && 
          e.date <= periodEnd
      );
      
      let totalMinutes = 0;
      let daysWorked = 0;
      let sickDays = 0;
      let vacationDays = 0;
      let hasIssues = false;

      empEntries.forEach(entry => {
          const stats = calculateStats(entry);
          if (entry.isSickDay) {
             sickDays++;
          } else if (entry.isHalfSickDay) {
             sickDays += 0.5; // Half sick day counts as 0.5
             // Also count any worked hours
             totalMinutes += stats.totalWorkedMinutes;
             if (stats.totalWorkedMinutes > 0) daysWorked++;
          } else if (entry.isVacationDay) {
             vacationDays++;
          } else {
              totalMinutes += stats.totalWorkedMinutes;
              if (stats.totalWorkedMinutes > 0) daysWorked++;
          }
          if (stats.issues.length > 0) hasIssues = true;
      });
      
      const hours = totalMinutes / 60;
      const pay = hours * (emp.hourlyRate || 0);

      return {
          employee: emp,
          totalMinutes,
          totalPay: pay,
          hasIssues,
          daysWorked,
          sickDays,
          vacationDays
      };
  }).filter(s => s.employee.isActive || s.totalMinutes > 0 || s.sickDays > 0 || s.vacationDays > 0)
    .sort((a, b) => a.employee.name.localeCompare(b.employee.name)); // Sort alphabetically by employee name 

  const totalPayroll = periodSummaries.reduce((acc, s) => acc + s.totalPay, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const [sendingReport, setSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const handleSendToBookkeeper = async () => {
    setSendingReport(true);
    
    try {
      const employees = periodSummaries.map(s => ({
        name: s.employee.name,
        role: s.employee.role,
        hours: formatDuration(s.totalMinutes),
        daysWorked: s.daysWorked,
        sickDays: s.sickDays,
        vacationDays: s.vacationDays
      }));

      await sendBookkeeperReport({
        bookkeeperEmail: settings.bookkeeperEmail || '',
        ownerEmail: settings.ownerEmail,
        companyName: settings.companyName,
        periodStart: formatDateForDisplay(periodStart),
        periodEnd: formatDateForDisplay(periodEnd),
        employees
      });

      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setIsSendConfirmOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to send bookkeeper report:', error);
      alert('Failed to send report. Please try again or check your email settings.');
    } finally {
      setSendingReport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 md:px-6 pb-20">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#263926]">{settings.companyName || 'Timesheets'}</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">Review and approve hours for payroll.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Review Filter Button */}
          {activeTab === 'daily' && pendingReviewCount > 0 && (
            <button
              onClick={() => setShowReviewOnly(!showReviewOnly)}
              className={`relative p-3 rounded-full transition-all ${showReviewOnly ? 'bg-red-600 text-white shadow-md' : 'bg-white text-[#6B6B6B] hover:text-[#263926] border border-[#F6F5F1] shadow-sm'}`}
              title="Filter to show only pending reviews"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {!showReviewOnly && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          )}
          
          {/* Tab Buttons */}
          <div className="flex items-center gap-2 md:gap-4 bg-white p-1 rounded-full border border-[#F6F5F1] shadow-sm overflow-x-auto">
            <button 
                onClick={() => {
                  setActiveTab('daily');
                  setShowReviewOnly(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${activeTab === 'daily' ? 'bg-[#2CA01C] text-white shadow-md' : 'text-[#6B6B6B] hover:text-[#263926]'}`}
            >
                Daily Review
            </button>
            <button 
                onClick={() => {
                  setActiveTab('period');
                  setShowReviewOnly(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${activeTab === 'period' ? 'bg-[#2CA01C] text-white shadow-md' : 'text-[#6B6B6B] hover:text-[#263926]'}`}
            >
                Pay Period
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'daily' && (
        <>
          {/* Date Navigator - Hide when in review mode */}
          {!showReviewOnly && (
            <div className="flex items-center justify-center gap-6 mb-8">
              <button onClick={() => handleDateChange(-1)} className="p-2 text-[#9CA3AF] hover:text-[#263926] hover:bg-[#F0EEE6] rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="text-center w-48">
                <span className="block text-lg font-semibold text-[#263926]">{formatDateForDisplay(viewDate)}</span>
                {viewDate === getTodayISO() && <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Today</span>}
              </div>
              <button onClick={() => handleDateChange(1)} className="p-2 text-[#9CA3AF] hover:text-[#263926] hover:bg-[#F0EEE6] rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}

          {/* Review Mode Header */}
          {showReviewOnly && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#263926] mb-2">Pending Reviews</h2>
              <p className="text-[#6B6B6B] text-sm">Showing all time card change requests across all dates</p>
            </div>
          )}

          {/* Desktop Table View (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F6F5F1] bg-[#F0EEE6]">
                  <th className="py-4 px-5 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Employee</th>
                  {showReviewOnly && <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Date</th>}
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Time Range</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Worked</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Break</th>
                  <th className="py-4 px-4 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-3 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F5F1]">
                {dailySummaries.map(({ employee, entry, stats }) => (
                  <tr 
                    key={employee.id} 
                    onClick={() => setSelectedEmployeeEntry({ employee, entry })}
                    className="hover:bg-[#F0EEE6] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-medium text-[#263926]">{employee.name}</div>
                      <div className="text-xs text-[#6B6B6B]">{employee.role} {!employee.isActive && '(Archived)'}</div>
                    </td>
                    {showReviewOnly && entry && (
                      <td className="py-4 px-4 text-sm text-[#263926] font-medium">
                        {formatDateForDisplay(entry.date)}
                      </td>
                    )}
                    <td className="py-4 px-4 font-mono text-sm text-[#484848]">
                      {entry?.clockIn && !entry.isSickDay && !entry.isVacationDay && !entry.isHalfSickDay ? (
                        <>
                          {formatTime(entry.clockIn)} <span className="text-[#E5E3DA] mx-1">–</span> {formatTime(entry.clockOut)}
                        </>
                      ) : entry?.isSickDay ? <span className="text-rose-400">Sick Day</span> 
                      : entry?.isHalfSickDay ? (
                        <>
                          {entry.clockIn ? (
                            <>
                              {formatTime(entry.clockIn)} <span className="text-[#E5E3DA] mx-1">–</span> {formatTime(entry.clockOut)}
                            </>
                          ) : (
                            <span className="text-amber-400">Half Sick</span>
                          )}
                        </>
                      ) : entry?.isVacationDay ? <span className="text-sky-400">Vacation</span> : <span className="text-[#E5E3DA]">--:--</span>}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-[#263926]">
                      {!entry?.isSickDay && !entry?.isVacationDay && entry?.clockIn ? formatDuration(stats.totalWorkedMinutes) : '—'}
                    </td>
                    <td className="py-4 px-4 text-right text-[#6B6B6B] text-sm">
                      {stats.totalBreakMinutes > 0 ? formatDuration(stats.totalBreakMinutes) : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {stats.issues.map(issue => {
                          // Show live break timer if on break and viewing today
                          if (issue === 'OPEN_BREAK' && viewDate === getTodayISO() && entry) {
                            const currentBreak = entry.breaks.find(b => !b.endTime);
                            if (currentBreak) {
                              return <LiveBreakTimer key={issue} breakStartTime={currentBreak.startTime} />;
                            }
                          }
                          
                          return (
                            <span key={issue} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                issue === 'SICK_DAY' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                issue === 'HALF_SICK_DAY' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                issue === 'VACATION_DAY' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                                issue === 'CHANGE_REQUESTED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                issue === 'VACATION_REQUEST_PENDING' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                                {issue === 'MISSING_CLOCK_OUT' && 'Missing Out'}
                                {issue === 'LONG_SHIFT_NO_BREAK' && 'No Break'}
                                {issue === 'OPEN_BREAK' && 'On Break'}
                                {issue === 'SICK_DAY' && 'Sick'}
                                {issue === 'HALF_SICK_DAY' && 'Half Sick'}
                                {issue === 'VACATION_DAY' && 'Vacation'}
                                {issue === 'CHANGE_REQUESTED' && 'Review'}
                                {issue === 'VACATION_REQUEST_PENDING' && 'Vacation Request'}
                            </span>
                          );
                        })}
                        {stats.issues.length === 0 && entry?.clockIn && !entry.clockOut && (
                           <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Active</span>
                        )}
                        {stats.issues.length === 0 && entry?.clockOut && (
                           <span className="text-xs text-[#9CA3AF]">OK</span>
                        )}
                         {stats.issues.length === 0 && !entry && (
                           <span className="text-xs text-[#E5E3DA]">No Entry</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center">
                       <span className="text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity inline-block">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
             {dailySummaries.map(({ employee, entry, stats }) => (
                 <div 
                    key={employee.id}
                    onClick={() => setSelectedEmployeeEntry({ employee, entry })}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-[#F6F5F1] active:scale-[0.98] transition-transform"
                 >
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="font-bold text-[#263926]">{employee.name}</div>
                            <div className="text-xs text-[#6B6B6B]">{employee.role} {!employee.isActive && '(Archived)'}</div>
                        </div>
                        {entry?.clockIn && !entry.isSickDay && !entry.isVacationDay ? (
                            <div className="text-right">
                                <div className="text-lg font-bold text-[#263926]">{formatDuration(stats.totalWorkedMinutes)}</div>
                                <div className="text-xs text-[#9CA3AF] font-mono">
                                    {formatTime(entry.clockIn)} - {formatTime(entry.clockOut)}
                                </div>
                            </div>
                        ) : entry?.isSickDay ? (
                            <div className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">SICK DAY</div>
                        ) : entry?.isVacationDay ? (
                            <div className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">VACATION</div>
                        ) : (
                            <div className="text-xs text-[#E5E3DA] italic">No Time</div>
                        )}
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-[#F6F5F1] pt-3">
                        <div className="flex gap-2 flex-wrap">
                            {stats.issues.length > 0 ? stats.issues.map(issue => {
                                // Show live break timer if on break and viewing today
                                if (issue === 'OPEN_BREAK' && viewDate === getTodayISO() && entry) {
                                  const currentBreak = entry.breaks.find(b => !b.endTime);
                                  if (currentBreak) {
                                    return <MobileBreakTimer key={issue} breakStartTime={currentBreak.startTime} />;
                                  }
                                }
                                
                                return (
                                  <span key={issue} className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                      issue === 'CHANGE_REQUESTED' ? 'bg-indigo-100 text-indigo-700' :
                                      issue === 'VACATION_REQUEST_PENDING' ? 'bg-purple-100 text-purple-700' :
                                      issue === 'SICK_DAY' ? 'bg-rose-50 text-rose-700' : 
                                      issue === 'VACATION_DAY' ? 'bg-sky-50 text-sky-700' :
                                      'bg-amber-50 text-amber-700'
                                  }`}>
                                      {issue.replace(/_/g, ' ')}
                                  </span>
                                );
                            }) : (
                                entry?.clockIn && !entry.clockOut ? 
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700">Active</span> :
                                <span className="text-[10px] text-[#9CA3AF]">No Issues</span>
                            )}
                        </div>
                        <span className="text-xs text-[#9CA3AF]">Tap to edit</span>
                    </div>
                 </div>
             ))}
          </div>
        </>
      )}

      {activeTab === 'period' && (
        <>
          {/* Period Controls */}
          <div className="mb-8 bg-white rounded-2xl p-6 border border-[#F6F5F1] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <DatePicker 
                  label="Start date"
                  value={periodStart}
                  onChange={setPeriodStart}
                />
                <DatePicker 
                  label="End date"
                  value={periodEnd}
                  onChange={setPeriodEnd}
                />
              </div>
              <div>
                <Button onClick={() => setIsSendConfirmOpen(true)}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send to Bookkeeper
                </Button>
              </div>
            </div>
          </div>

          {/* Period Summary Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h4 className="text-sm font-bold text-[#6B6B6B] mb-2">Total hours</h4>
              <div className="text-3xl font-bold text-[#263926]">
                {formatDuration(periodSummaries.reduce((acc, s) => acc + s.totalMinutes, 0))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h4 className="text-sm font-bold text-[#6B6B6B] mb-2">Total payroll</h4>
              <div className="text-3xl font-bold text-[#2CA01C]">{formatCurrency(totalPayroll)}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#F6F5F1] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <h4 className="text-sm font-bold text-[#6B6B6B] mb-2">Team members</h4>
              <div className="text-3xl font-bold text-[#263926]">{periodSummaries.length}</div>
            </div>
          </div>

          {/* Period Table */}
          <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F6F5F1] bg-[#F0EEE6]">
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Employee</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Total Hours</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Days Worked</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Sick</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Vacation</th>
                  <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Total Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F5F1]">
                {periodSummaries.map(s => (
                  <tr 
                    key={s.employee.id} 
                    onClick={() => setPeriodDetailEmployee(s.employee)}
                    className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#263926]">{s.employee.name}</div>
                      <div className="text-xs text-[#6B6B6B]">{s.employee.role}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-[#263926]">{formatDuration(s.totalMinutes)}</td>
                    <td className="py-4 px-6 text-right text-[#484848]">{s.daysWorked}</td>
                    <td className="py-4 px-6 text-right text-[#484848]">{s.sickDays}</td>
                    <td className="py-4 px-6 text-right text-[#484848]">{s.vacationDays}</td>
                    <td className="py-4 px-6 text-right font-bold text-[#2CA01C]">{formatCurrency(s.totalPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Slide-over Modal */}
      {selectedEmployeeEntry && (
        <TimeCardModal 
          isOpen={true}
          onClose={() => setSelectedEmployeeEntry(null)}
          employee={selectedEmployeeEntry.employee}
          entry={selectedEmployeeEntry.entry}
          date={viewDate}
          isEmployeeView={false}
          onSave={(updatedEntry) => {
              if (selectedEmployeeEntry.entry) {
                  updateEntry(updatedEntry);
              } else {
                  updateEntry(updatedEntry); 
              }
          }}
          onDelete={deleteEntry}
          onApprove={(entry) => {
            // Check if this is a vacation request or change request
            if (entry.pendingApproval && !entry.isVacationDay) {
              approveVacationRequest(entry.id);
            } else if (entry.changeRequest) {
              approveChangeRequest(entry);
            }
          }}
          onDeny={(entryId) => {
            const entry = entries.find(e => e.id === entryId);
            if (entry?.pendingApproval && !entry.isVacationDay) {
              denyVacationRequest(entryId);
            } else if (entry?.changeRequest) {
              denyChangeRequest(entryId);
            }
          }}
        />
      )}

      {/* Period Detail Modal */}
      {periodDetailEmployee && (
        <PeriodDetailModal
          isOpen={true}
          onClose={() => setPeriodDetailEmployee(null)}
          employee={periodDetailEmployee}
          entries={entries
            .filter(e => 
              e.employeeId === periodDetailEmployee.id &&
              e.date >= periodStart &&
              e.date <= periodEnd
            )
            .sort((a, b) => b.date.localeCompare(a.date))
          }
          periodStart={periodStart}
          periodEnd={periodEnd}
          onEntryClick={(entry, date) => {
            setPeriodDetailEmployee(null);
            setSelectedEmployeeEntry({ employee: periodDetailEmployee, entry });
            setViewDate(date);
          }}
        />
      )}

      {/* Confirm Send Modal */}
      {isSendConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#484848]/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-in-right">
                <h3 className="text-lg font-bold text-[#263926] mb-2">Send report?</h3>
                <p className="text-sm text-[#6B6B6B] mb-6">
                    This will send a professionally formatted email report to <span className="font-semibold text-[#263926]">{settings.bookkeeperEmail || 'your bookkeeper'}</span>.
                </p>
                
                {!settings.bookkeeperEmail && (
                    <div className="mb-6 p-3 bg-amber-50 text-amber-700 text-xs rounded-2xl border border-amber-100">
                        Warning: No bookkeeper email set in settings.
                    </div>
                )}

                {reportSent && (
                    <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-2xl border border-emerald-100 text-center">
                        ✓ Report sent successfully!
                    </div>
                )}

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsSendConfirmOpen(false)} className="flex-1" disabled={sendingReport}>Cancel</Button>
                    <Button onClick={handleSendToBookkeeper} className="flex-1" disabled={sendingReport || reportSent}>
                        {sendingReport ? 'Sending...' : reportSent ? 'Sent!' : 'Send report'}
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Main Layout with Routing ---

const AppRouter = () => {
  const { currentUser, loading } = useSupabaseStore();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Handle role-based redirects
  useEffect(() => {
    if (loading || currentUser === null) return;

    const isAdmin = currentUser === 'ADMIN';
    const isBookkeeper = currentUser !== 'ADMIN' && currentUser.isBookkeeper;
    const path = window.location.pathname;

    console.log('Route check:', { path, isAdmin, isBookkeeper, currentUser });

    // Redirect based on role and current path
    if (isAdmin || isBookkeeper) {
      // Admin and Bookkeeper users should be on /admin
      if (path === '/' || path === '/employee') {
        console.log('Redirecting', isBookkeeper ? 'bookkeeper' : 'admin', 'to /admin');
        window.history.pushState({}, '', '/admin');
        setCurrentPath('/admin');
      }
    } else {
      // Regular employee users should be on /employee
      if (path === '/' || path === '/admin') {
        console.log('Redirecting employee to /employee');
        window.history.pushState({}, '', '/employee');
        setCurrentPath('/employee');
      }
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading your data...</p>
        </div>
      </div>
    );
  }

  return <MainLayout />;
};

// --- Main Layout ---

const MainLayout = () => {
  const { currentUser, setCurrentUser, employees, settings, loading } = useSupabaseStore();
  const { signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Determine user role type
  const isAdmin = currentUser === 'ADMIN';
  const isBookkeeper = currentUser !== 'ADMIN' && currentUser.isBookkeeper;

  return (
    <div className="min-h-screen bg-[#FAF9F5] font-sans text-[#484848]">
      {/* Clean Top Bar */}
      <div className="bg-white border-b border-[#F6F5F1] py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-40">
        <img 
          src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Timesheets.svg" 
          alt="Ollie Timesheets"
          className="h-6"
        />
        <div className="flex items-center gap-3">
          {isAdmin ? (
            // Admin view - show settings and sign out
            <>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-[#6B6B6B] hover:text-[#263926] hover:bg-[#F6F5F1] rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button
                onClick={() => signOut()}
                className="p-2 text-[#6B6B6B] hover:text-[#263926] hover:bg-[#F6F5F1] rounded-lg transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          ) : isBookkeeper ? (
            // Bookkeeper view - show name with badge and sign out (no settings)
            <>
              <div className="flex items-center gap-2 text-sm text-[#263926]">
                <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">{currentUser.name}</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">View Only</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-[#6B6B6B] hover:text-[#263926] hover:bg-[#F6F5F1] rounded-lg transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          ) : (
            // Employee view - show name and sign out
            <>
              <div className="flex items-center gap-2 text-sm text-[#263926]">
                <svg className="w-4 h-4 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{currentUser.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-[#6B6B6B] hover:text-[#263926] hover:bg-[#F6F5F1] rounded-lg transition-colors"
                title="Sign out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </>
          )}
        </div>
      </div>

      {isAdmin ? <AdminDashboard /> : isBookkeeper ? <BookkeeperDashboard /> : <EmployeeDashboard />}
      
      {/* Settings Modal */}
      {isAdmin && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

// Import auth components and Supabase store
import { useAuth } from './AuthContext';
import { Auth } from './pages/Auth';
import { AcceptInvitation } from './pages/AcceptInvitation';
import { SupabaseStoreProvider } from './SupabaseStore';

const App = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if this is an invitation acceptance route
  const path = window.location.pathname;
  const isInvitationRoute = path === '/accept-invitation';
  
  // If on invitation route and not authenticated, show invitation page
  if (isInvitationRoute && !user) {
    return <AcceptInvitation />;
  }

  // If not authenticated, show auth pages
  if (!user) {
    return <Auth />;
  }

  // User is authenticated, show the main app with Supabase store
  return (
    <SupabaseStoreProvider>
      <AppRouter />
    </SupabaseStoreProvider>
  );
};

export default App;

