import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Button } from '../components/Button';

export const AcceptInvitation: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    // If already logged in, check if this user matches the employee
    if (user) {
      checkExistingUser();
    } else {
      loadInvitation();
    }
  }, [token, user]);

  const loadInvitation = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('invitation_token', token)
        .single();

      if (fetchError || !data) {
        setError('Invalid or expired invitation link');
        setLoading(false);
        return;
      }

      // Check if invitation has expired
      if (data.invitation_expires_at) {
        const expiresAt = new Date(data.invitation_expires_at);
        if (expiresAt < new Date()) {
          setError('This invitation has expired. Please contact your employer for a new invitation.');
          setLoading(false);
          return;
        }
      }

      // Check if already accepted
      if (data.invitation_accepted_at) {
        setError('This invitation has already been used.');
        setLoading(false);
        return;
      }

      setEmployee(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading invitation:', err);
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const checkExistingUser = async () => {
    // If already logged in, just link the employee record to this user
    try {
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('invitation_token', token)
        .single();

      if (fetchError || !data) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      // Link employee to current user
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          user_id: user!.id,
          invitation_accepted_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        setError('Failed to accept invitation');
        setLoading(false);
        return;
      }

      // Redirect to app
      window.location.href = '/';
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Sign up the user with their email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: employee.email,
        password,
        options: {
          data: {
            full_name: employee.name,
            role: 'employee'
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // Link the employee record to the new user
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          user_id: authData.user.id,
          invitation_accepted_at: new Date().toISOString()
        })
        .eq('id', employee.id);

      if (updateError) {
        throw updateError;
      }

      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success! Redirect to home - the app will detect they're an employee
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      setError(err.message || 'Failed to create account');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
          <p className="text-[#6B6B6B]">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1] text-center">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#263926] mb-2">Invalid Invitation</h1>
            <p className="text-[#6B6B6B] mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

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
          <h1 className="text-3xl font-bold text-[#263926] mb-2">Welcome, {employee.name}!</h1>
          <p className="text-[#6B6B6B]">
            Set your password to join the team
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1]">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-[#FAF9F5] rounded-2xl">
            <p className="text-sm text-[#6B6B6B] mb-1">Your Email</p>
            <p className="font-medium text-[#263926]">{employee.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Create Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Confirm Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#9CA3AF] mt-2">Must be at least 6 characters</p>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full py-3 text-base"
                disabled={submitting}
              >
                {submitting ? 'Creating Account...' : 'Join Team'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

