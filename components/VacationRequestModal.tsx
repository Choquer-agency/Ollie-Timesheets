import React, { useState } from 'react';
import { Employee } from '../types';
import { generateDateRange, isDateInPast, formatDateForDisplay } from '../utils';
import { Button } from './Button';

interface VacationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSubmit: (startDate: string, endDate: string) => Promise<void>;
  existingDates: string[]; // Dates that already have entries
}

export const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSubmit,
  existingDates
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (isDateInPast(startDate)) {
      setError('Cannot request vacation for past dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    // Check for conflicts
    const requestedDates = generateDateRange(startDate, endDate);
    const conflicts = requestedDates.filter(date => existingDates.includes(date));
    
    if (conflicts.length > 0) {
      const conflictStr = conflicts.map(d => formatDateForDisplay(d)).join(', ');
      setError(`You already have entries for: ${conflictStr}`);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(startDate, endDate);
      // Reset form
      setStartDate('');
      setEndDate('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit vacation request');
    } finally {
      setSubmitting(false);
    }
  };

  const dayCount = startDate && endDate ? generateDateRange(startDate, endDate).length : 0;
  const vacationUsed = existingDates.length;
  const vacationTotal = employee.vacationDaysTotal || 0;
  const vacationRemaining = Math.max(0, vacationTotal - vacationUsed);

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-end bg-[#484848]/40 backdrop-blur-sm transition-all"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="h-full md:h-auto w-full md:max-w-md bg-white md:rounded-2xl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 md:pb-0 bg-white border-b border-[#F6F5F1] md:border-b-0">
          <h2 className="text-xl font-bold text-[#263926]">Request Vacation</h2>
          <button 
            onClick={onClose} 
            className="text-[#9CA3AF] hover:text-[#484848] p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pt-4">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          {/* Vacation Balance */}
          <div className="mb-4 p-4 bg-sky-50 rounded-2xl border border-sky-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-sky-900">Vacation Remaining</span>
              <span className="text-2xl font-bold text-sky-900">{vacationRemaining}</span>
            </div>
            <div className="text-xs text-sky-700 mt-1">
              {vacationUsed} of {vacationTotal} days used
            </div>
          </div>

          <form id="vacation-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-[#FCFBF8] rounded-2xl border border-[#F6F5F1]">
              <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                  setError('');
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-white border border-[#F6F5F1] rounded-xl focus:ring-2 focus:ring-[#2CA01C] outline-none text-base"
                required
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] rounded-2xl border border-[#F6F5F1]">
              <label className="block text-xs font-bold text-[#6B6B6B] uppercase mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setError('');
                }}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-white border border-[#F6F5F1] rounded-xl focus:ring-2 focus:ring-[#2CA01C] outline-none text-base"
                required
              />
            </div>

            {dayCount > 0 && (
              <div className="p-4 bg-[#F0EEE6] rounded-2xl">
                <p className="text-sm text-[#263926]">
                  <span className="font-bold">{dayCount}</span> day{dayCount === 1 ? '' : 's'} requested
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div 
          className="flex-shrink-0 flex gap-3 p-4 md:p-6 bg-white border-t border-[#F6F5F1]"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        >
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 min-h-[48px] justify-center" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" form="vacation-form" className="flex-1 min-h-[48px] justify-center" disabled={submitting || dayCount === 0}>
            {submitting ? 'Requesting...' : 'Request Vacation'}
          </Button>
        </div>
      </div>
    </div>
  );
};
