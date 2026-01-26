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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#484848]/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-slide-in-right">
        <h2 className="text-xl font-bold text-[#263926] mb-6">Request Vacation</h2>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
            {error}
          </div>
        )}

        {/* Vacation Balance */}
        <div className="mb-6 p-4 bg-sky-50 rounded-2xl border border-sky-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-sky-900">Vacation Remaining</span>
            <span className="text-2xl font-bold text-sky-900">{vacationRemaining}</span>
          </div>
          <div className="text-xs text-sky-700 mt-1">
            {vacationUsed} of {vacationTotal} days used
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
              className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none"
              required
            />
          </div>

          <div>
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
              className="w-full p-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] outline-none"
              required
            />
          </div>

          {dayCount > 0 && (
            <div className="p-4 bg-[#F0EEE6] rounded-2xl">
              <p className="text-sm text-[#263926]">
                <span className="font-bold">{dayCount}</span> day{dayCount === 1 ? '' : 's'} requested
              </p>
              {dayCount > vacationRemaining && (
                <p className="text-xs text-rose-600 mt-1">
                  ⚠️ This exceeds your remaining vacation days
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting || dayCount === 0}>
              {submitting ? 'Requesting...' : 'Request Vacation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
