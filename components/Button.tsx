import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-full";
  
  const variants = {
    primary: "bg-[#2CA01C] text-white hover:brightness-110 shadow-sm focus:ring-[#2CA01C]",
    secondary: "bg-[#F0EEE6] text-[#484848] hover:bg-[#E5E3DA] focus:ring-[#2CA01C]",
    outline: "border border-[#484848] bg-transparent text-[#484848] hover:bg-[#FAF9F5] focus:ring-[#2CA01C]",
    danger: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus:ring-rose-500",
    ghost: "bg-transparent text-[#484848] hover:text-[#263926] hover:bg-[#F0EEE6]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-6 py-2.5",
    lg: "text-base px-8 py-3",
    xl: "text-lg px-8 py-4 h-24", // Custom massive size for clocking
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

