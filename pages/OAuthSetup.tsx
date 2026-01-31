import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { Button } from '../components/Button';
import { OllieHoursLogo } from '../website/components/OllieHoursLogo';

export const OAuthSetup: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.user_metadata?.full_name || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName.trim() || !ownerName.trim() || !ownerEmail.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create settings record for this user
      const { error: settingsError } = await supabase
        .from('settings')
        .insert({
          owner_id: user!.id,
          company_name: companyName.trim(),
          owner_name: ownerName.trim(),
          owner_email: ownerEmail.trim(),
          bookkeeper_email: ''
        });
      
      if (settingsError) {
        console.error('Settings creation error:', settingsError);
        throw new Error(`Failed to create account: ${settingsError.message}`);
      }
      
      // Success! The SupabaseStore will automatically reload and detect the new settings
      console.log('Account setup complete');
      // Force a page refresh to reload the app with the new settings
      window.location.reload();
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
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
          <h1 className="text-3xl font-bold text-[#263926] mb-2">Welcome!</h1>
          <p className="text-[#6B6B6B]">Let's set up your account</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#F6F5F1]">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleComplete} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="Your Company"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Your Name *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#6B6B6B] mb-2">Your Email *</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#F6F5F1] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] outline-none"
                placeholder="you@company.com"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full py-3 text-base"
                disabled={loading}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-[#6B6B6B]">
            <p>You can add team members and configure your account after setup.</p>
          </div>
        </div>
      </div>
    </div>
  );
};





