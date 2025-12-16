import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export const AuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          // Check if this is a new user who needs to complete setup
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (!profile || !profile.company_name) {
            // New user - redirect to complete profile setup
            // For now, we'll just redirect to the app and let them set up later
            window.location.href = '/';
          } else {
            // Existing user - redirect to app
            window.location.href = '/';
          }
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1] max-w-md">
          <h2 className="text-xl font-bold text-[#263926] mb-4">Authentication Error</h2>
          <p className="text-[#6B6B6B] mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-4 py-3 bg-[#2CA01C] text-white rounded-2xl hover:bg-[#238615] transition-colors font-medium"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2CA01C] mx-auto mb-4"></div>
        <p className="text-[#6B6B6B]">Completing authentication...</p>
      </div>
    </div>
  );
};

