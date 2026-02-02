import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { OllieHoursLogo } from './OllieHoursLogo';

interface WebsiteLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, feature?: string) => void;
}

export const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate 
}) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navLinks = [
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      {/* Navigation - Transparent at top, floating glass on scroll */}
      <nav className={`fixed z-50 transition-all duration-300 ${
        isScrolled 
          ? 'top-3 left-4 right-4 md:left-8 md:right-8 bg-background/70 dark:bg-background/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg' 
          : 'top-0 left-0 right-0 bg-transparent'
      }`}>
        <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14' : 'h-20'
        }`}>
          {/* Logo */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <OllieHoursLogo height={32} />
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => (
              <button 
                key={link.id}
                onClick={() => onNavigate(link.id)} 
                className={`hover:text-[#2CA01C] transition-colors ${
                  currentPage === link.id ? 'text-[#2CA01C] font-semibold' : ''
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-all"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="h-6 w-px bg-border hidden sm:block"></div>

            <a 
              href="/app" 
              className="text-sm font-medium text-muted-foreground hover:text-[#2CA01C] hidden sm:block transition-colors"
            >
              Log in
            </a>
            <a 
              href="/app"
              className="bg-[#2CA01C] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#238a16] transition-all shadow-lg shadow-[#2CA01C]/20"
            >
              Start Free
            </a>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden px-6 py-3 flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground ${
          isScrolled ? '' : 'border-t border-border/30'
        }`}>
          {navLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => onNavigate(link.id)} 
              className={`hover:text-[#2CA01C] transition-colors ${
                currentPage === link.id ? 'text-[#2CA01C] font-semibold' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary pt-20 pb-10 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <OllieHoursLogo height={28} />
            </div>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              The future of employee time tracking. Automation, smart roadblocks, and seamless payroll for modern agencies.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-6 text-[#263926] dark:text-[#a8d5a2]">Product</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <button onClick={() => onNavigate('features', 'clock')} className="hover:text-[#2CA01C] transition-colors">
                  Clock In/Out
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features', 'smart-checks')} className="hover:text-[#2CA01C] transition-colors">
                  Smart Roadblocks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features', 'vacation')} className="hover:text-[#2CA01C] transition-colors">
                  Vacation & Sick
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#2CA01C] transition-colors">
                  Pricing
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-6 text-[#263926] dark:text-[#a8d5a2]">Company</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <button onClick={() => onNavigate('testimonials')} className="hover:text-[#2CA01C] transition-colors">
                  Customer Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-[#2CA01C] transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <a href="/app" className="hover:text-[#2CA01C] transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ollie Hours. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-[#2CA01C] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#2CA01C] cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
