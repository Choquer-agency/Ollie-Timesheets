import { TimeEntry, Break, DerivedStats, IssueType, DailySummary } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Date Formatting ---

export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
};

export const formatTime = (isoString: string | null): string => {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
};

export const getTodayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getISOFromTimeInput = (baseDateStr: string, timeInput: string): string => {
  // baseDateStr is YYYY-MM-DD, timeInput is HH:mm
  const [year, month, day] = baseDateStr.split('-').map(Number);
  const [hours, minutes] = timeInput.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  return date.toISOString();
};

export const getTimeInputFromISO = (isoString: string | null): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Calculations ---

export const calculateMinutes = (startIso: string, endIso: string | null): number => {
  if (!startIso) return 0;
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : new Date().getTime(); // If active, calc vs now
  return Math.floor((end - start) / 1000 / 60);
};

export const calculateStats = (entry?: TimeEntry): DerivedStats => {
  if (!entry) {
    return { totalWorkedMinutes: 0, totalBreakMinutes: 0, issues: [] };
  }

  const issues: IssueType[] = [];

  if (entry.isSickDay) {
    issues.push('SICK_DAY');
    return { totalWorkedMinutes: 0, totalBreakMinutes: 0, issues };
  }

  if (entry.isVacationDay) {
    issues.push('VACATION_DAY');
    return { totalWorkedMinutes: 0, totalBreakMinutes: 0, issues };
  }

  if (entry.changeRequest) {
    issues.push('CHANGE_REQUESTED');
  }

  if (!entry.clockIn) {
    return { totalWorkedMinutes: 0, totalBreakMinutes: 0, issues };
  }

  // 1. Calculate Gross Time
  const grossMinutes = calculateMinutes(entry.clockIn, entry.clockOut);

  // 2. Calculate Breaks
  let totalBreakMinutes = 0;
  let hasOpenBreak = false;

  entry.breaks.forEach(b => {
    if (!b.endTime) {
      hasOpenBreak = true;
    }
    totalBreakMinutes += calculateMinutes(b.startTime, b.endTime);
  });

  // 3. Net Worked
  const totalWorkedMinutes = Math.max(0, grossMinutes - totalBreakMinutes);

  // 4. Identify Issues
  
  // Issue: Open Break
  if (hasOpenBreak) issues.push('OPEN_BREAK');

  // Issue: Missing Clock Out (only if date is in past)
  const isPastDate = new Date(entry.date) < new Date(getTodayISO());
  if (isPastDate && !entry.clockOut) {
    issues.push('MISSING_CLOCK_OUT');
  }

  // Issue: Shift > 6 hours with no break
  // Only flag if shift is completed or currently long
  if (totalWorkedMinutes > 6 * 60 && entry.breaks.length === 0) {
    issues.push('LONG_SHIFT_NO_BREAK');
  }

  return { totalWorkedMinutes, totalBreakMinutes, issues };
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};

// --- Export ---

export const generateCSV = (summaries: DailySummary[]): string => {
  const headers = ['Date', 'Employee', 'Role', 'Clock In', 'Clock Out', 'Break Duration', 'Total Worked (Hrs)', 'Status', 'Issues'];
  const rows = summaries.map(s => {
    const entry = s.entry;
    const stats = s.stats;
    const issues = stats.issues.join(', ');
    
    let status = 'Working';
    if (entry?.isSickDay) status = 'Sick';
    else if (entry?.isVacationDay) status = 'Vacation';
    else if (!entry?.clockIn) status = 'Off';
    
    return [
      entry?.date || '',
      s.employee.name,
      s.employee.role,
      entry?.clockIn ? formatTime(entry.clockIn) : '',
      entry?.clockOut ? formatTime(entry.clockOut) : '',
      (stats.totalBreakMinutes / 60).toFixed(2),
      (stats.totalWorkedMinutes / 60).toFixed(2),
      status,
      issues
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};
