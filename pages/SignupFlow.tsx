import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../components/Button';
import { supabase } from '../supabaseClient';
import { Employee } from '../types';

interface SignupFlowProps {
  onSwitchToLogin: () => void;
  onComplete: () => void;
}

interface CompanyInfo {
  companyName: string;
  employeeCount: number;
  email: string;
  password: string;
}

interface EmployeeForm {
  id: string;
  name: string;
  email: string;
  position: string;
  salary: string;
  vacationDays: string;
  sickDays: string;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({ onSwitchToLogin, onComplete }) => {
  const { signUp, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Company Information
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    employeeCount: 1,
    email: '',
    password: ''
  });

  // Step 2: Employee Information
  const [employees, setEmployees] = useState<EmployeeForm[]>([]);

  // Initialize employee forms when moving to step 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!companyInfo.companyName || !companyInfo.email || !companyInfo.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (companyInfo.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Generate employee forms based on count
    const newEmployees: EmployeeForm[] = Array.from({ length: companyInfo.employeeCount }, (_, i) => ({
      id: crypto.randomUUID(),
      name: '',
      email: '',
      position: '',
      salary: '',
      vacationDays: '10',
      sickDays: '5'
    }));

    setEmployees(newEmployees);
    setError('');
    setStep(2);
  };

  const handleAddEmployee = () => {
    setEmployees([...employees, {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      position: '',
      salary: '',
      vacationDays: '10',
      sickDays: '5'
    }]);
  };

  const handleRemoveEmployee = (id: string) => {
    if (employees.length > 1) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const updateEmployee = (id: string, field: keyof EmployeeForm, value: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate all employees have at least name and position
      const invalidEmployees = employees.filter(emp => !emp.name || !emp.position);
      if (invalidEmployees.length > 0) {
        setError('Please fill in at least the name and position for all employees');
        setLoading(false);
        return;
      }

      // Step 1: Sign up the owner
      const { error: signUpError } = await signUp(
        companyInfo.email,
        companyInfo.password,
        {
          full_name: 'Owner',
          company_name: companyInfo.companyName,
          role: 'owner'
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Wait a moment for auth to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Authentication failed. Please try logging in.');
        setLoading(false);
        return;
      }

      // Step 2: Create settings record
      const { error: settingsError } = await supabase
        .from('settings')
        .insert({
          owner_id: user.id,
          company_name: companyInfo.companyName,
          owner_name: 'Owner',
          owner_email: companyInfo.email,
          bookkeeper_email: null
        });

      if (settingsError) {
        console.error('Settings creation error:', settingsError);
      }

      // Step 3: Create employee records
      const employeeInserts = employees.map(emp => ({
        user_id: null, // These are not yet users
        name: emp.name,
        email: emp.email || null,
        role: emp.position,
        hourly_rate: emp.salary ? parseFloat(emp.salary) : null,
        vacation_days_total: parseInt(emp.vacationDays) || 10,
        is_admin: false,
        is_active: true
      }));

      const { error: employeesError } = await supabase
        .from('employees')
        .insert(employeeInserts);

      if (employeesError) {
        console.error('Employee creation error:', employeesError);
        setError('Account created but there was an issue adding employees. You can add them later.');
        // Don't return - still allow them to proceed
      }

      // Success!
      setLoading(false);
      onComplete();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Note: After Google OAuth, we'll need to collect company info separately
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Timesheets.svg" 
              alt="Ollie Timesheets"
              className="h-10 mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold text-[#263926] mb-2">Get started</h1>
            <p className="text-[#6B6B6B]">Create your business account</p>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1]">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
                {error}
              </div>
            )}

            {/* Google Sign Up */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[#F6F5F1] rounded-2xl hover:bg-[#FAF9F5] transition-colors font-medium text-[#263926] mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F6F5F1]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#9CA3AF]">Or continue with email</span>
              </div>
            </div>

            {/* Company Info Form */}
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Company name</label>
                <input
                  type="text"
                  value={companyInfo.companyName}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#6B6B6B] mb-2">How many employees do you have?</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={companyInfo.employeeCount}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, employeeCount: parseInt(e.target.value) || 1 })}
                  required
                  className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                  placeholder="5"
                />
                <p className="text-xs text-[#9CA3AF] mt-2">We'll create forms for each employee on the next step</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Your email</label>
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Password</label>
                <input
                  type="password"
                  value={companyInfo.password}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                  placeholder="••••••••"
                />
                <p className="text-xs text-[#9CA3AF] mt-2">Must be at least 6 characters</p>
              </div>

              <Button 
                type="submit" 
                className="w-full py-3 text-base mt-6"
              >
                Continue to employee setup
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm text-[#6B6B6B]">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#2CA01C] font-semibold hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Employee Setup
  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://fdqnjninitbyeescipyh.supabase.co/storage/v1/object/public/Timesheets/Ollie%20Timesheets.svg" 
            alt="Ollie Timesheets"
            className="h-10 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#263926] mb-2">Add your team</h1>
          <p className="text-[#6B6B6B]">Let's set up your employees so you can start tracking time right away</p>
          
          <button
            onClick={() => setStep(1)}
            className="mt-4 text-sm text-[#2CA01C] hover:underline"
          >
            ← Back to company info
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {/* Employee Forms */}
          <div className="space-y-4">
            {employees.map((emp, index) => (
              <div key={emp.id} className="bg-white rounded-2xl shadow-sm p-6 border border-[#F6F5F1]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#263926]">Employee {index + 1}</h3>
                  {employees.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployee(emp.id)}
                      className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Full name *</label>
                    <input
                      type="text"
                      value={emp.name}
                      onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Email</label>
                    <input
                      type="email"
                      value={emp.email}
                      onChange={(e) => updateEmployee(emp.id, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Position *</label>
                    <input
                      type="text"
                      value={emp.position}
                      onChange={(e) => updateEmployee(emp.id, 'position', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="Designer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Hourly rate ($/hr)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={emp.salary}
                      onChange={(e) => updateEmployee(emp.id, 'salary', e.target.value)}
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="25.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Vacation days (yearly)</label>
                    <input
                      type="number"
                      min="0"
                      value={emp.vacationDays}
                      onChange={(e) => updateEmployee(emp.id, 'vacationDays', e.target.value)}
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Sick days (yearly)</label>
                    <input
                      type="number"
                      min="0"
                      value={emp.sickDays}
                      onChange={(e) => updateEmployee(emp.id, 'sickDays', e.target.value)}
                      className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Employee Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleAddEmployee}
              className="text-[#2CA01C] hover:text-[#238615] font-semibold text-sm flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add another employee
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 max-w-2xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Complete setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

