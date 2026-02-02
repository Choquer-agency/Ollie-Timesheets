// API client for email endpoints

const API_BASE_URL = '/api';

interface BookkeeperReportData {
  bookkeeperEmail: string;
  ownerEmail?: string;
  companyName: string;
  periodStart: string;
  periodEnd: string;
  employees: Array<{
    name: string;
    role: string;
    hours: string;
    daysWorked: number;
    sickDays: number;
    vacationDays: number;
  }>;
}

interface TeamInvitationData {
  employeeEmail: string;
  employeeName: string;
  companyName: string;
  role: string;
  appUrl?: string;
  companyLogoUrl?: string;
  invitationToken: string;
}

interface MissingClockoutData {
  employeeEmail: string;
  employeeName: string;
  date: string;
  appUrl?: string;
}

interface ChangeRequestNotificationData {
  adminEmail: string;
  adminName: string;
  employeeName: string;
  date: string;
  requestSummary: string;
  appUrl?: string;
}

interface ChangeApprovalData {
  employeeEmail: string;
  employeeName: string;
  date: string;
  status: 'approved' | 'rejected';
  adminNotes?: string;
}

interface VacationRequestNotificationData {
  adminEmail: string;
  adminName: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  appUrl?: string;
}

interface VacationApprovalData {
  employeeEmail: string;
  employeeName: string;
  date: string;
  appUrl?: string;
}

interface VacationDenialData {
  employeeEmail: string;
  employeeName: string;
  date: string;
  appUrl?: string;
}

interface ApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const makeRequest = async (endpoint: string, data: any): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }

    return result;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const sendBookkeeperReport = async (data: BookkeeperReportData): Promise<ApiResponse> => {
  return makeRequest('/email/bookkeeper', data);
};

export const sendTeamInvitation = async (data: TeamInvitationData): Promise<ApiResponse> => {
  return makeRequest('/email/invite-team-member', data);
};

export const sendMissingClockoutAlert = async (data: MissingClockoutData): Promise<ApiResponse> => {
  return makeRequest('/email/missing-clockout', data);
};

export const sendChangeRequestNotification = async (data: ChangeRequestNotificationData): Promise<ApiResponse> => {
  return makeRequest('/email/change-request-notification', data);
};

export const sendChangeApprovalNotification = async (data: ChangeApprovalData): Promise<ApiResponse> => {
  return makeRequest('/email/change-approval', data);
};

export const sendVacationRequestNotification = async (data: VacationRequestNotificationData): Promise<ApiResponse> => {
  return makeRequest('/email/vacation-request', data);
};

export const sendVacationApprovalNotification = async (data: VacationApprovalData): Promise<ApiResponse> => {
  return makeRequest('/email/vacation-approval', data);
};

export const sendVacationDenialNotification = async (data: VacationDenialData): Promise<ApiResponse> => {
  return makeRequest('/email/vacation-denial', data);
};


// Stripe Checkout
interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const createCheckoutSession = async (email?: string): Promise<CheckoutSessionResponse> => {
  return makeRequest('/stripe/create-checkout-session', { email }) as Promise<CheckoutSessionResponse>;
};
