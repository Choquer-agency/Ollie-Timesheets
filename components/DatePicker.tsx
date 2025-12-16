import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date().toISOString().split('T')[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMonthData = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { year, month, daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (delta: number) => {
    const date = new Date(viewDate + 'T00:00:00');
    date.setMonth(date.getMonth() + delta);
    setViewDate(date.toISOString().split('T')[0]);
  };

  const selectDate = (day: number) => {
    const date = new Date(viewDate + 'T00:00:00');
    date.setDate(day);
    const newDateStr = date.toISOString().split('T')[0];
    onChange(newDateStr);
    setIsOpen(false);
  };

  const { year, month, daysInMonth, startingDayOfWeek } = getMonthData(viewDate);
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const selectedDay = selectedDate?.getDate();
  const selectedMonth = selectedDate?.getMonth();
  const selectedYear = selectedDate?.getFullYear();
  
  // Get today's date
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isSelected = selectedDay === day && selectedMonth === month && selectedYear === year;
    const isToday = todayDay === day && todayMonth === month && todayYear === year;
    
    days.push(
      <button
        key={day}
        onClick={() => selectDate(day)}
        className={`h-10 flex items-center justify-center rounded-xl text-base font-medium transition-all ${
          isSelected 
            ? 'bg-[#263926] text-white' 
            : isToday
            ? 'text-[#2CA01C] font-bold hover:bg-[#F0EEE6]'
            : 'text-[#484848] hover:bg-[#F0EEE6]'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="block text-xs font-bold text-[#6B6B6B] mb-2">{label}</label>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 border border-[#E5E3DA] bg-[#FAF9F5] rounded-2xl focus:ring-2 focus:ring-[#2CA01C] focus:border-[#2CA01C] text-sm font-medium text-[#263926] outline-none transition-all w-full text-left flex items-center justify-between gap-4"
      >
        <span>{value ? formatDisplayDate(value) : 'Select date'}</span>
        <svg className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-3xl shadow-2xl border border-[#F6F5F1] p-6 z-50 w-[350px]">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-[#F0EEE6] rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-[#263926]">{monthName}</h3>
            
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-[#F0EEE6] rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-[#6B6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-[#9CA3AF]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days}
          </div>
        </div>
      )}
    </div>
  );
};

