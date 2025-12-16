-- Supabase Database Schema for Ollie Timesheets
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (linked to auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'employee', 'accountant')),
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins and owners can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE employees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL,
  hourly_rate DECIMAL(10, 2),
  vacation_days_total INTEGER DEFAULT 10,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees
CREATE POLICY "Employees can view their own record"
  ON employees FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all employees"
  ON employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'accountant')
    )
  );

CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update employees"
  ON employees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- TIME ENTRIES TABLE
-- ============================================
CREATE TABLE time_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  is_sick_day BOOLEAN DEFAULT FALSE,
  is_vacation_day BOOLEAN DEFAULT FALSE,
  change_request JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policies for time_entries
CREATE POLICY "Employees can view their own entries"
  ON time_entries FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and accountants can view all entries"
  ON time_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'accountant')
    )
  );

CREATE POLICY "Employees can insert their own entries"
  ON time_entries FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their own entries"
  ON time_entries FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all entries"
  ON time_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- BREAKS TABLE
-- ============================================
CREATE TABLE breaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  time_entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  break_type TEXT DEFAULT 'unpaid' CHECK (break_type IN ('unpaid', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE breaks ENABLE ROW LEVEL SECURITY;

-- Policies for breaks (inherit from time_entries)
CREATE POLICY "Users can view breaks for accessible entries"
  ON breaks FOR SELECT
  USING (
    time_entry_id IN (
      SELECT id FROM time_entries
      WHERE employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin', 'accountant')
    )
  );

CREATE POLICY "Users can manage breaks for their entries"
  ON breaks FOR ALL
  USING (
    time_entry_id IN (
      SELECT id FROM time_entries
      WHERE employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  bookkeeper_email TEXT,
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for settings
CREATE POLICY "Anyone authenticated can view settings"
  ON settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owners can manage settings"
  ON settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_breaks_time_entry_id ON breaks(time_entry_id);

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================
-- You can add initial data here after setting up your first user

