import React, { useState, useEffect } from 'react';

import { TimeEntry, Break, Employee } from '../types';
import { Button } from './Button';
import { TimePicker } from './TimePicker';
import { formatDuration, calculateStats, getISOFromTimeInput, getTimeInputFromISO } from '../utils';

interface TimeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry | undefined;
  employee: Employee;
  date: string;
  isEmployeeView: boolean; // New prop to determine mode
  onSave: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}

export const TimeCardModal: React.FC<TimeCardModalProps> = ({
  isOpen, onClose, entry, employee, date, isEmployeeView, onSave, onDelete
}) => {
  const [formData, setFormData] = useState<Partial<TimeEntry>>({});
  const [clockInInput, setClockInInput] = useState('');
  const [clockOutInput, setClockOutInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize form state when modal opens or entry changes
  useEffect(() => {
    if (isOpen) {
      if (entry) {
        // For admin viewing a change request, automatically load the proposed changes
        const dataToShow = (!isEmployeeView && entry.changeRequest) ? entry.changeRequest : entry;
        setFormData(JSON.parse(JSON.stringify(dataToShow))); 
        setClockInInput(getTimeInputFromISO(dataToShow.clockIn));
        setClockOutInput(getTimeInputFromISO(dataToShow.clockOut));
      } else {
        // New empty entry
        setFormData({
          id: crypto.randomUUID(),
          employeeId: employee.id,
          date: date,
          clockIn: null,
          clockOut: null,
          breaks: [],
          adminNotes: '',
          isSickDay: false,
          isVacationDay: false
        });
        setClockInInput('');
        setClockOutInput('');
      }
      setError(null);
    }
  }, [isOpen, entry, employee, date, isEmployeeView]);

  // Helper to format time for display
  const formatTimeForDisplay = (isoString: string | null) => {
    if (!isoString) return 'Not set';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!isOpen) return null;

  const isOffDay = formData.isSickDay || formData.isVacationDay;

  // Live Calculations for UI feedback
  // We only calculate stats based on inputs if it's NOT a sick/vacation day
  const previewEntry = { 
    ...formData, 
    clockIn: (!isOffDay && clockInInput) ? getISOFromTimeInput(date, clockInInput) : null,
    clockOut: (!isOffDay && clockOutInput) ? getISOFromTimeInput(date, clockOutInput) : null,
  } as TimeEntry;
  
  const stats = calculateStats(previewEntry);

  const handleSave = () => {
    setError(null);
    
    const finalIsOffDay = formData.isSickDay || formData.isVacationDay;

    // Reconstruct ISO strings from time inputs
    // If Sick/Vacation Day is checked, we explicitly clear times on SAVE.
    const finalEntry: TimeEntry = {
      ...(formData as TimeEntry),
      clockIn: finalIsOffDay ? null : (clockInInput ? getISOFromTimeInput(date, clockInInput) : null),
      clockOut: finalIsOffDay ? null : (clockOutInput ? getISOFromTimeInput(date, clockOutInput) : null),
      breaks: finalIsOffDay ? [] : (formData.breaks || [])
    };

    // --- Validation Rules ---
    
    if (!finalIsOffDay) {
        // Rule 1: Cannot have breaks without clock in (Unless Off Day)
        if (!finalEntry.clockIn && finalEntry.breaks.length > 0) {
        setError("Cannot log breaks without a clock-in time.");
        return;
        }

        if (finalEntry.breaks.length > 0) {
        // Sort for overlap check
        const sortedBreaks = [...finalEntry.breaks].sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const clockInTime = finalEntry.clockIn ? new Date(finalEntry.clockIn).getTime() : 0;
        const clockOutTime = finalEntry.clockOut ? new Date(finalEntry.clockOut).getTime() : null;

        for (let i = 0; i < sortedBreaks.length; i++) {
            const b = sortedBreaks[i];
            const bStart = new Date(b.startTime).getTime();
            const bEnd = b.endTime ? new Date(b.endTime).getTime() : null;

            // Rule: Break before Clock In
            if (finalEntry.clockIn && bStart < clockInTime) {
            setError("A break cannot start before clock-in time.");
            return;
            }

            // Rule: Break after Clock Out
            if (clockOutTime) {
            if (bStart > clockOutTime) {
                setError("A break cannot start after clock-out.");
                return;
            }
            if (bEnd && bEnd > clockOutTime) {
                setError("A break must end before or at clock-out.");
                return;
            }
            }

            // Rule: Overlapping Breaks
            if (bEnd && i < sortedBreaks.length - 1) {
            const nextBreakStart = new Date(sortedBreaks[i+1].startTime).getTime();
            if (bEnd > nextBreakStart) {
                setError("Breaks cannot overlap.");
                return;
            }
            }
        }
        }
    }

    onSave(finalEntry);
    onClose();
  };

  const addBreak = () => {
    const newBreak: Break = {
      id: crypto.randomUUID(),
      startTime: getISOFromTimeInput(date, '12:00'),
      endTime: getISOFromTimeInput(date, '12:30'),
      type: 'unpaid'
    };
    setFormData(prev => ({ ...prev, breaks: [...(prev.breaks || []), newBreak] }));
  };

  const removeBreak = (breakId: string) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks?.filter(b => b.id !== breakId)
    }));
  };

  const updateBreak = (breakId: string, field: 'startTime' | 'endTime', timeValue: string) => {
    setFormData(prev => ({
      ...prev,
      breaks: prev.breaks?.map(b => {
        if (b.id === breakId) {
          return { ...b, [field]: timeValue ? getISOFromTimeInput(date, timeValue) : null };
        }
        return b;
      })
    }));
  };

  const handleToggleOffDay = (type: 'sick' | 'vacation') => {
      setFormData(prev => {
          if (type === 'sick') {
              return { ...prev, isSickDay: !prev.isSickDay, isVacationDay: false };
          } else {
              return { ...prev, isVacationDay: !prev.isVacationDay, isSickDay: false };
          }
      });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-end bg-[#484848]/40 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div 
        className="h-[95vh] md:h-full w-full md:max-w-2xl bg-[#FAF9F5] shadow-2xl rounded-t-2xl md:rounded-none p-6 md:p-8 overflow-y-auto flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#263926]">{employee.name}</h2>
            <p className="text-[#6B6B6B] font-medium text-sm">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#484848] p-2 -mr-2">
            <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Change Request Banner (Admin Only) */}
        {!isEmployeeView && entry?.changeRequest && (() => {
            // Calculate the time difference between original and requested
            const originalStats = calculateStats(entry);
            const requestedStats = calculateStats(entry.changeRequest);
            const timeDiffMinutes = requestedStats.totalWorkedMinutes - originalStats.totalWorkedMinutes;
            const isIncrease = timeDiffMinutes > 0;
            const absMinutes = Math.abs(timeDiffMinutes);
            const hours = Math.floor(absMinutes / 60);
            const minutes = absMinutes % 60;
            
            let adjustmentText = '';
            if (timeDiffMinutes === 0) {
                adjustmentText = 'No change';
            } else {
                const sign = isIncrease ? '+' : '-';
                if (hours > 0 && minutes > 0) {
                    adjustmentText = `${sign}${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
                } else if (hours > 0) {
                    adjustmentText = `${sign}${hours} ${hours === 1 ? 'hour' : 'hours'}`;
                } else {
                    adjustmentText = `${sign}${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
                }
            }
            
            return (
                <div className="mb-6 p-4 bg-[#FFF7ED] border border-[#FDBA74] rounded-2xl">
                    <div className="mb-3">
                        <h4 className="font-bold text-[#263926] text-base">Change Requested</h4>
                        <p className="text-sm text-[#263926]">Showing employee's requested changes. Original values below for reference.</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[#FDBA74]/30 space-y-2 text-xs text-[#6B6B6B]">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Original Clock In:</span>
                            <span className="font-mono">{formatTimeForDisplay(entry.clockIn)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Original Clock Out:</span>
                            <span className="font-mono">{formatTimeForDisplay(entry.clockOut)}</span>
                        </div>
                        <div className={`flex justify-between items-center pt-1 border-t border-[#FDBA74]/20 ${isIncrease ? 'text-emerald-600' : timeDiffMinutes < 0 ? 'text-rose-600' : 'text-[#6B6B6B]'}`}>
                            <span className="font-bold">Total Time Adjustment:</span>
                            <span className="font-mono font-bold">{adjustmentText}</span>
                        </div>
                        {entry.breaks && entry.breaks.length > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Original Breaks:</span>
                                <span className="font-mono">{entry.breaks.length} break(s)</span>
                            </div>
                        )}
                        {(entry.isSickDay || entry.isVacationDay) && (
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Original Status:</span>
                                <span className="font-semibold">
                                    {entry.isSickDay ? 'Sick Day' : entry.isVacationDay ? 'Vacation' : 'Regular Day'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        })()}

        {/* Change Request Info (Employee Only) */}
        {isEmployeeView && entry?.changeRequest && (
             <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700">
                <span className="font-bold">Pending Review:</span> You have already submitted a request for this day. Submitting again will update your request.
             </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-4 md:space-y-6">
          
          <div className="flex flex-col md:flex-row gap-4">
              {/* Sick Day Toggle */}
              <div 
                onClick={() => handleToggleOffDay('sick')}
                className={`flex-1 flex items-center justify-between p-4 rounded-2xl border cursor-pointer ${formData.isSickDay ? 'bg-rose-50 border-rose-200' : 'bg-[#FAF9F5] border-[#E5E3DA]'}`}
              >
                  <div>
                      <h3 className={`text-base font-bold ${formData.isSickDay ? 'text-rose-900' : 'text-[#263926]'}`}>Sick Day</h3>
                      <p className={`text-sm ${formData.isSickDay ? 'text-rose-700' : 'text-[#6B6B6B]'}`}>Mark as sick leave</p>
                  </div>
                  
                  <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.isSickDay ? 'bg-rose-500' : 'bg-[#E5E3DA]'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.isSickDay ? 'translate-x-5' : ''}`}></div>
                  </div>
              </div>

              {/* Vacation Day Toggle */}
              <div 
                onClick={() => handleToggleOffDay('vacation')}
                className={`flex-1 flex items-center justify-between p-4 rounded-2xl border cursor-pointer ${formData.isVacationDay ? 'bg-sky-50 border-sky-200' : 'bg-[#FAF9F5] border-[#E5E3DA]'}`}
              >
                  <div>
                      <h3 className={`text-base font-bold ${formData.isVacationDay ? 'text-sky-900' : 'text-[#263926]'}`}>Vacation</h3>
                      <p className={`text-sm ${formData.isVacationDay ? 'text-sky-700' : 'text-[#6B6B6B]'}`}>Mark as vacation</p>
                  </div>
                  
                  <div className={`w-12 h-7 rounded-full transition-colors relative ${formData.isVacationDay ? 'bg-sky-500' : 'bg-[#E5E3DA]'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${formData.isVacationDay ? 'translate-x-5' : ''}`}></div>
                  </div>
              </div>
          </div>

          {!isOffDay && (
          <>
            {/* Work Hours Section */}
            <section className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E3DA]">
                <div className="flex justify-between items-end mb-4">
                <h3 className="text-base font-bold text-[#263926]">Shift Hours</h3>
                <span className="text-2xl font-bold font-mono text-[#263926]">{formatDuration(stats.totalWorkedMinutes)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                   <div>
                     <TimePicker 
                        label="Clock In" 
                        value={clockInInput} 
                        onChange={setClockInInput} 
                     />
                     {!isEmployeeView && entry?.changeRequest && (
                       <div className="mt-1 text-xs text-[#9CA3AF] pl-1">
                         Original: <span className="font-mono">{formatTimeForDisplay(entry.clockIn)}</span>
                       </div>
                     )}
                   </div>
                   <div>
                     <TimePicker 
                        label="Clock Out" 
                        value={clockOutInput} 
                        onChange={setClockOutInput} 
                     />
                     {!isEmployeeView && entry?.changeRequest && (
                       <div className="mt-1 text-xs text-[#9CA3AF] pl-1">
                         Original: <span className="font-mono">{formatTimeForDisplay(entry.clockOut)}</span>
                       </div>
                     )}
                   </div>
                </div>
            </section>

            {/* Breaks Section */}
            <section className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E3DA]">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-baseline gap-4">
                    <h3 className="text-base font-bold text-[#263926]">Unpaid Breaks</h3>
                    <span className="text-xs font-medium text-[#6B6B6B] bg-[#F0EEE6] px-3 py-1 rounded-full">Total: {formatDuration(stats.totalBreakMinutes)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={addBreak} className="text-[#484848] border border-[#F6F5F1] hover:bg-[#F0EEE6]">+ Add</Button>
                </div>
                
                {!isEmployeeView && entry?.changeRequest && entry.breaks && entry.breaks.length > 0 && (
                  <div className="mb-3 text-xs text-[#9CA3AF] pl-1">
                    Original: {entry.breaks.length} break(s) totaling {formatDuration(calculateStats(entry).totalBreakMinutes)}
                  </div>
                )}
                
                <div className="space-y-3">
                {formData.breaks?.length === 0 && (
                    <p className="text-sm text-[#9CA3AF] italic">No breaks recorded.</p>
                )}
                {formData.breaks?.map((b, idx) => (
                    <div key={b.id} className="relative group flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl border border-[#F6F5F1] bg-[#FAF9F5]">
                        <div className="flex-1 w-full grid grid-cols-2 gap-3">
                            <TimePicker 
                                value={getTimeInputFromISO(b.startTime)}
                                onChange={(val) => updateBreak(b.id, 'startTime', val)}
                            />
                            <TimePicker 
                                value={getTimeInputFromISO(b.endTime)}
                                onChange={(val) => updateBreak(b.id, 'endTime', val)}
                            />
                        </div>
                        <button 
                            onClick={() => removeBreak(b.id)}
                            className="absolute -top-2 -right-2 md:static md:bg-transparent md:p-2 bg-white rounded-full shadow-sm border border-[#F6F5F1] md:border-none md:shadow-none text-[#9CA3AF] hover:text-rose-500 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
                </div>
            </section>
          </>
          )}

          {/* Notes Section */}
          <section className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#E5E3DA]">
            <h3 className="text-base font-bold text-[#263926] mb-3">
                {isEmployeeView ? "Reason for Adjustment" : "Admin Notes"}
            </h3>
            <textarea 
              rows={3}
              value={formData.adminNotes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              placeholder={isEmployeeView ? "I forgot to clock in because..." : "Add internal notes about this shift..."}
              className="w-full p-3 text-sm bg-white border border-[#E5E3DA] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C]"
            />
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 flex flex-col gap-4 bg-[#FAF9F5] pb-6 md:pb-0">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          <div className="flex flex-col-reverse md:flex-row justify-between items-center w-full gap-4">
            {!isEmployeeView && entry && (
               <button 
                onClick={() => {
                  if(confirm('Are you sure you want to completely delete this time card?')) {
                    onDelete(entry.id);
                    onClose();
                  }
                }} 
                className="text-sm text-rose-600 hover:text-rose-700 w-full md:w-auto text-center py-2"
              >
                Delete Entry
              </button>
            )}
            <div className="flex gap-3 ml-auto w-full md:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none justify-center">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 md:flex-none justify-center">
                  {isEmployeeView ? "Submit Request" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

