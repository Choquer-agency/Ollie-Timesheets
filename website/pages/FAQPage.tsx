import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What happens if I go over the employee limit?",
      a: "The Starter plan is strictly for up to 3 employees. If you add a 4th, you will be prompted to upgrade to the Agency Pro plan ($9.99/mo). We'll give you a grace period to decide, and your data is always safe."
    },
    {
      q: "Can I use this for hourly and salaried employees?",
      a: "Ollie is designed primarily for hourly tracking, but you can certainly use it for salaried employees to track vacation and sick days. Many agencies use it as a hybrid solution for both types of workers."
    },
    {
      q: "How does the 'Roadblock' feature work?",
      a: "If an employee has a 'Critical Issue' from a previous day (like a missing clock out), the system locks their dashboard. They must resolve the previous day's error (by submitting a change request) before the 'Clock In' button unlocks for today. This keeps your payroll data clean."
    },
    {
      q: "Is the bookkeeper access safe?",
      a: "Yes. Bookkeeper accounts are 'View Only'. They can see reports and times, but they cannot edit entries, change wages, or approve requests. Their access is read-only and limited to payroll-relevant data."
    },
    {
      q: "Can I export data?",
      a: "Absolutely. You can email reports directly to your bookkeeper or copy CSV data to your clipboard to paste into Excel or Google Sheets. The Agency Pro plan also includes automated email reports on your schedule."
    },
    {
      q: "How do vacation and sick day requests work?",
      a: "Employees can submit vacation or sick day requests directly from their dashboard. Admins receive a notification and can approve or deny with one click. The system automatically tracks balances and prevents over-booking."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We use Supabase for our backend, which provides enterprise-grade security including row-level security (RLS), encryption at rest and in transit, and SOC 2 compliant infrastructure. Your employee data is protected."
    },
    {
      q: "Can I try before I buy?",
      a: "Yes! Our Starter plan is completely free forever for teams of up to 3 employees. If you need more features or employees, the Agency Pro plan comes with a 14-day free trial so you can test everything before committing."
    },
    {
      q: "How do I invite my team?",
      a: "After signing up, you can invite team members via email directly from the admin dashboard. They'll receive an invitation link to create their account and start clocking in right away."
    },
    {
      q: "What if I need help?",
      a: "Agency Pro customers get priority email support with responses within 24 hours. We also have comprehensive documentation and video tutorials to help you get started."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="pt-20 px-6 max-w-3xl mx-auto mb-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-heading font-medium mb-6 text-[#263926] dark:text-[#a8d5a2]">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to know about Ollie Hours
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <div 
            key={i} 
            className={`bg-card border rounded-2xl overflow-hidden transition-all ${
              openIndex === i ? 'border-[#2CA01C]/50 shadow-lg' : 'border-border'
            }`}
          >
            <button
              onClick={() => toggleFaq(i)}
              className="w-full p-6 text-left flex items-center justify-between gap-4"
            >
              <h3 className="text-lg font-bold text-[#263926] dark:text-[#a8d5a2]">{item.q}</h3>
              <ChevronDown 
                className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                  openIndex === i ? 'rotate-180' : ''
                }`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6">
                <p className="text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-16 bg-secondary rounded-3xl p-8 text-center">
        <h3 className="text-xl font-heading font-medium mb-3 text-[#263926] dark:text-[#a8d5a2]">
          Still have questions?
        </h3>
        <p className="text-muted-foreground mb-6">
          We're here to help. Reach out and we'll get back to you within 24 hours.
        </p>
        <a 
          href="mailto:support@olliehours.com" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2CA01C] text-white font-bold rounded-full hover:bg-[#238a16] transition-all shadow-lg shadow-[#2CA01C]/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact Support
        </a>
      </div>
    </div>
  );
};
