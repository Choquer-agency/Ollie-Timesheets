import { TimeEntry, Break, DerivedStats, IssueType, DailySummary } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utilities ---

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Date Formatting ---

export const formatDateForDisplay = (dateStr: string): string => {
  // Parse as local date to avoid timezone issues
  // dateStr format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
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

/**
 * Checks if a date string (YYYY-MM-DD) is in the past
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if the date is in the past, false otherwise
 */
export const isDateInPast = (dateStr: string): boolean => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const todayParts = getTodayISO().split('-').map(Number);
  const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  return inputDate < today;
};

/**
 * Generates an array of date strings (YYYY-MM-DD) between start and end dates (inclusive)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date strings
 */
export const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  
  const currentDate = new Date(startYear, startMonth - 1, startDay);
  const lastDate = new Date(endYear, endMonth - 1, endDay);
  
  while (currentDate <= lastDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
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

  // Check for pending vacation request
  if (entry.pendingApproval && !entry.isVacationDay) {
    issues.push('VACATION_REQUEST_PENDING');
    return { totalWorkedMinutes: 0, totalBreakMinutes: 0, issues };
  }

  // Half sick day: flag it but DON'T return 0 worked minutes
  // The employee may have worked hours before marking as half sick
  if (entry.isHalfSickDay) {
    issues.push('HALF_SICK_DAY');
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
  // Parse both dates in local timezone for accurate comparison
  const entryDateParts = entry.date.split('-').map(Number);
  const entryDate = new Date(entryDateParts[0], entryDateParts[1] - 1, entryDateParts[2]);
  const todayParts = getTodayISO().split('-').map(Number);
  const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const isPastDate = entryDate < today;
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

// --- Half-Day Sick Leave Helpers ---

/**
 * Checks if the current time is before the specified cutoff time
 * @param cutoffTime - Time in "HH:MM" format (e.g., "12:00")
 * @returns true if current time is before cutoff, false otherwise
 */
export const isBeforeCutoffTime = (cutoffTime: string): boolean => {
  if (!cutoffTime) return false;
  
  try {
    const now = new Date();
    const [cutoffHours, cutoffMinutes] = cutoffTime.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const cutoffMinutesTotal = cutoffHours * 60 + cutoffMinutes;
    
    return currentMinutes < cutoffMinutesTotal;
  } catch (error) {
    console.error('Error parsing cutoff time:', error);
    return false;
  }
};

/**
 * Checks if an employee can mark a half-day sick leave based on cutoff time
 * @param cutoffTime - Time cutoff from settings (defaults to "12:00")
 * @returns true if employee can mark half-sick day, false otherwise
 */
export const canMarkHalfSickDay = (cutoffTime?: string): boolean => {
  return isBeforeCutoffTime(cutoffTime || '12:00');
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
    else if (entry?.isHalfSickDay) status = 'Half Sick';
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
