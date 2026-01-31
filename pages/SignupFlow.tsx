import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../components/Button';
import { supabase } from '../supabaseClient';
import { OllieHoursLogo } from '../website/components/OllieHoursLogo';

interface SignupFlowProps {
  onSwitchToLogin: () => void;
  onComplete: () => void;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({ onSwitchToLogin, onComplete }) => {
  const { signUp, signInWithGoogle, signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      console.log('Starting signup process...');

      // Sign up the user
      const { error: signUpError } = await signUp(
        email,
        password,
        {
          full_name: 'User',
          role: 'owner'
        }
      );

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      console.log('User signed up successfully');

      // Try to get session
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, try signing in
      if (!session) {
        console.log('No session, attempting sign in...');
        await signIn(email, password);
      }

      // Success!
      console.log('Signup complete');
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
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <OllieHoursLogo height={40} />
          </div>
          <h1 className="text-3xl font-bold text-[#263926] mb-2">Get started</h1>
          <p className="text-[#6B6B6B]">Create your account</p>
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Password</label>
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
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Confirm password</label>
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

            <Button 
              type="submit" 
              className="w-full py-3 text-base mt-6"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
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
};

