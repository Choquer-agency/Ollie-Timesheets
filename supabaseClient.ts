import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'owner' | 'admin' | 'employee' | 'accountant';
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'owner' | 'admin' | 'employee' | 'accountant';
          company_name?: string | null;
        };
        Update: {
          full_name?: string;
          role?: 'owner' | 'admin' | 'employee' | 'accountant';
          company_name?: string | null;
        };
      };
      employees: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string | null;
          role: string;
          hourly_rate: number | null;
          vacation_days_total: number;
          is_admin: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email?: string | null;
          role: string;
          hourly_rate?: number | null;
          vacation_days_total?: number;
          is_admin?: boolean;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          email?: string | null;
          role?: string;
          hourly_rate?: number | null;
          vacation_days_total?: number;
          is_admin?: boolean;
          is_active?: boolean;
        };
      };
      time_entries: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          clock_in: string | null;
          clock_out: string | null;
          admin_notes: string | null;
          is_sick_day: boolean;
          is_vacation_day: boolean;
          change_request: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          clock_in?: string | null;
          clock_out?: string | null;
          admin_notes?: string | null;
          is_sick_day?: boolean;
          is_vacation_day?: boolean;
          change_request?: any | null;
        };
        Update: {
          clock_in?: string | null;
          clock_out?: string | null;
          admin_notes?: string | null;
          is_sick_day?: boolean;
          is_vacation_day?: boolean;
          change_request?: any | null;
        };
      };
      breaks: {
        Row: {
          id: string;
          time_entry_id: string;
          start_time: string;
          end_time: string | null;
          break_type: 'unpaid' | 'paid';
          created_at: string;
        };
        Insert: {
          id?: string;
          time_entry_id: string;
          start_time: string;
          end_time?: string | null;
          break_type?: 'unpaid' | 'paid';
        };
        Update: {
          end_time?: string | null;
          break_type?: 'unpaid' | 'paid';
        };
      };
      settings: {
        Row: {
          id: string;
          owner_id: string;
          bookkeeper_email: string | null;
          company_name: string;
          owner_name: string;
          owner_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          bookkeeper_email?: string | null;
          company_name: string;
          owner_name: string;
          owner_email: string;
        };
        Update: {
          bookkeeper_email?: string | null;
          company_name?: string;
          owner_name?: string;
          owner_email?: string;
        };
      };
    };
  };
}




