import React, { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../../apiClient';

// App subdomain URL - use full URL in production, relative path in dev
const APP_URL = typeof window !== 'undefined' && window.location.hostname === 'olliehours.com' 
  ? 'https://app.olliehours.com' 
  : '/app';

export const PricingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await createCheckoutSession();
      if (response.success && response.url) {
        window.location.href = response.url;
      } else {
        console.error('Checkout error:', response.error);
        alert('Unable to start checkout. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-20 px-6">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-5xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-foreground text-xl">Start for free. Scale as you grow. No hidden fees.</p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-24">
        {/* Free Plan */}
        <div className="bg-card border border-border rounded-3xl p-10 flex flex-col relative overflow-hidden shadow-lg transition-all hover:scale-105">
          <h3 className="text-2xl font-heading font-medium text-[#263926] dark:text-[#a8d5a2] mb-2">Starter</h3>
          <div className="text-muted-foreground mb-6">For small teams just getting started.</div>
          <div className="text-5xl font-bold text-[#263926] dark:text-[#a8d5a2] mb-1">$0</div>
          <div className="text-muted-foreground text-sm mb-8">Free forever</div>

          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#2CA01C] shrink-0" />
              Up to 3 Employees
            </li>
            <li className="flex gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#2CA01C] shrink-0" />
              Basic Clock In/Out
            </li>
            <li className="flex gap-3 text-foreground">
              <Check className="w-5 h-5 text-[#2CA01C] shrink-0" />
              1 Admin Role
            </li>
          </ul>

          <a 
            href={`${APP_URL}?signup=true`}
            className="w-full block text-center bg-secondary hover:bg-accent text-foreground font-bold py-4 rounded-xl transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Paid Plan */}
        <div className="bg-[#263926] border border-[#2CA01C]/50 rounded-3xl p-10 flex flex-col relative overflow-hidden shadow-2xl shadow-[#2CA01C]/10 transition-all hover:scale-105">
          <div className="absolute top-0 right-0 bg-[#2CA01C] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">POPULAR</div>
          <h3 className="text-2xl font-heading font-medium text-white mb-2">Essentials Plan</h3>
          <div className="text-white/60 mb-6">For growing teams that need automation.</div>
          <div className="text-5xl font-bold text-white mb-1">
            $9.99<span className="text-lg font-normal text-white/50">/mo</span>
          </div>
          <div className="text-white/50 text-sm mb-8">Includes 10 employees. +$2/mo per extra user.</div>

          <ul className="space-y-4 mb-10 flex-1">
            <li className="flex gap-3 text-white/90">
              <Check className="w-5 h-5 text-[#A1EB97] shrink-0" />
              Up to 10 Employees
            </li>
            <li className="flex gap-3 text-white/90">
              <Check className="w-5 h-5 text-[#A1EB97] shrink-0" />
              Smart Roadblocks & Compliance
            </li>
            <li className="flex gap-3 text-white/90">
              <Check className="w-5 h-5 text-[#A1EB97] shrink-0" />
              Direct Bookkeeper Emailing
            </li>
            <li className="flex gap-3 text-white/90">
              <Check className="w-5 h-5 text-[#A1EB97] shrink-0" />
              Advanced Roles (Admin, Delegate, View-Only)
            </li>
          </ul>

          <button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-[#263926] font-bold py-4 rounded-xl hover:bg-[#A1EB97] transition-colors shadow-lg shadow-[#2CA01C]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-heading font-medium mb-8 text-center text-[#263926] dark:text-[#a8d5a2]">
          Feature Comparison
        </h2>
        <div className="overflow-x-auto bg-card rounded-2xl shadow-sm border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="py-4 px-6 text-muted-foreground font-medium">Feature</th>
                <th className="py-4 px-6 text-[#263926] dark:text-[#a8d5a2] font-bold text-center">Starter</th>
                <th className="py-4 px-6 text-[#2CA01C] font-bold text-center">Essentials</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Employee Limit</td>
                <td className="py-4 px-6 text-center text-muted-foreground">3</td>
                <td className="py-4 px-6 text-center text-foreground font-medium">Unlimited</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Clock In/Out</td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Vacation & Sick Requests</td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Smart Roadblocks</td>
                <td className="py-4 px-6 text-center">
                  <X className="w-5 h-5 text-muted-foreground mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Bookkeeper Access</td>
                <td className="py-4 px-6 text-center">
                  <X className="w-5 h-5 text-muted-foreground mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Change Request Workflow</td>
                <td className="py-4 px-6 text-center text-muted-foreground">Manual</td>
                <td className="py-4 px-6 text-center text-foreground font-medium">Automated</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-4 px-6 text-foreground">Direct Email Reports</td>
                <td className="py-4 px-6 text-center">
                  <X className="w-5 h-5 text-muted-foreground mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-foreground">Priority Support</td>
                <td className="py-4 px-6 text-center">
                  <X className="w-5 h-5 text-muted-foreground mx-auto" />
                </td>
                <td className="py-4 px-6 text-center">
                  <Check className="w-5 h-5 text-[#2CA01C] mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="text-center mt-16">
        <p className="text-muted-foreground mb-4">Have more questions?</p>
        <a href="#faq" className="text-[#2CA01C] font-bold hover:underline">
          Check out our FAQ →
        </a>
      </div>
    </div>
  );
};
