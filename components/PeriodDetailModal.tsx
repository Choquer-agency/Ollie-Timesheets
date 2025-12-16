import React from 'react';
import { TimeEntry, Employee } from '../types';
import { calculateStats, formatTime, formatDuration, formatDateForDisplay } from '../utils';

interface PeriodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  entries: TimeEntry[];
  periodStart: string;
  periodEnd: string;
  onEntryClick: (entry: TimeEntry, date: string) => void;
}

export const PeriodDetailModal: React.FC<PeriodDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  entries,
  periodStart,
  periodEnd,
  onEntryClick
}) => {
  if (!isOpen) return null;

  const formatPeriod = () => {
    const start = new Date(periodStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(periodEnd + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end md:items-center justify-end bg-[#484848]/40 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div 
        className="h-[95vh] md:h-full w-full md:max-w-5xl bg-[#FAF9F5] shadow-2xl rounded-t-2xl md:rounded-none p-6 md:p-8 overflow-y-auto flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#263926]">{employee.name}</h2>
            <p className="text-[#6B6B6B] font-medium text-sm">{formatPeriod()}</p>
          </div>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#484848] p-2 -mr-2">
            <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Entries Table */}
        <div className="flex-1 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#F6F5F1] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F6F5F1] bg-[#F0EEE6]">
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Clock In</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Clock Out</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Break</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider text-right">Worked</th>
                <th className="py-4 px-6 text-xs font-bold text-[#6B6B6B] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6F5F1]">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-[#9CA3AF] italic">
                    No time entries for this period
                  </td>
                </tr>
              ) : (
                entries.map(entry => {
                  const stats = calculateStats(entry);
                  return (
                    <tr 
                      key={entry.id} 
                      onClick={() => onEntryClick(entry, entry.date)}
                      className="hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-[#263926]">
                        {formatDateForDisplay(entry.date)}
                      </td>
                      <td className="py-4 px-6 text-[#484848] font-mono text-sm">
                        {formatTime(entry.clockIn)}
                      </td>
                      <td className="py-4 px-6 text-[#484848] font-mono text-sm">
                        {formatTime(entry.clockOut)}
                      </td>
                      <td className="py-4 px-6 text-right text-[#6B6B6B] text-sm">
                        {formatDuration(stats.totalBreakMinutes)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-[#263926]">
                        {formatDuration(stats.totalWorkedMinutes)}
                      </td>
                      <td className="py-4 px-6">
                        {entry.isSickDay ? (
                          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">SICK</span>
                        ) : entry.isVacationDay ? (
                          <span className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded-full">VACATION</span>
                        ) : entry.changeRequest ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">PENDING</span>
                        ) : stats.issues.length > 0 ? (
                          <span className="text-xs text-amber-600 font-medium">{stats.issues[0]}</span>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

