export interface Employee {
  id: string;
  name: string;
  email?: string;
  role: string;
  hourlyRate?: number;
  vacationDaysTotal?: number;
  isAdmin: boolean;
  isBookkeeper: boolean;
  isActive: boolean;
  userId?: string | null; // null if invitation not accepted yet
  invitationToken?: string | null;
}

export type BreakType = 'unpaid';

export interface Break {
  id: string;
  startTime: string; // ISO String
  endTime: string | null; // ISO String
  type: BreakType;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // ISO String
  clockOut: string | null; // ISO String
  breaks: Break[];
  adminNotes?: string;
  isSickDay?: boolean;
  isVacationDay?: boolean;
  isHalfSickDay?: boolean;
  pendingApproval?: boolean; // For vacation requests awaiting admin approval
  changeRequest?: Partial<TimeEntry>; // Stores the proposed state
}

export interface DerivedStats {
  totalWorkedMinutes: number;
  totalBreakMinutes: number;
  issues: IssueType[];
}

export type IssueType = 'MISSING_CLOCK_OUT' | 'LONG_SHIFT_NO_BREAK' | 'OPEN_BREAK' | 'OVERTIME_WARNING' | 'SICK_DAY' | 'VACATION_DAY' | 'HALF_SICK_DAY' | 'CHANGE_REQUESTED' | 'VACATION_REQUEST_PENDING';

export interface DailySummary {
  employee: Employee;
  entry: TimeEntry | undefined;
  stats: DerivedStats;
}

export interface AppSettings {
  bookkeeperEmail: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  companyLogoUrl?: string;
  halfDaySickCutoffTime?: string;
}

