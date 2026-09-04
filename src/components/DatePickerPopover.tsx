import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';

interface DatePickerPopoverProps {
  id?: string;
  value: string; // 'YYYY-MM-DD'
  onChange: (newDate: string) => void;
  label?: string;
  className?: string;
}

export const DatePickerPopover: React.FC<DatePickerPopoverProps> = ({
  id = 'custom-date-picker',
  value,
  onChange,
  label = 'Ngày xem:',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  // Safe parse 'YYYY-MM-DD' without timezone issues
  const parseDate = (dStr: string) => {
    if (!dStr) {
      const now = new Date();
      return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
    }
    const parts = dStr.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { y: parts[0], m: parts[1], d: parts[2] };
    }
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  };

  const { y: currentYear, m: currentMonth, d: currentDay } = parseDate(value);

  // Month and Year view state in the calendar popover
  const [viewYear, setViewYear] = useState<number>(currentYear);
  const [viewMonth, setViewMonth] = useState<number>(currentMonth);

  // Calculate & update portal position so it is always on top and aligned
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320; // max width of the calendar popup
    const popoverHeight = 390; // estimated max height

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16);
    }
    if (left < 16) left = 16;

    let top = rect.bottom + 8;
    // If not enough room below, open above
    if (top + popoverHeight > window.innerHeight && rect.top > popoverHeight + 16) {
      top = rect.top - popoverHeight - 8;
    }

    setPopoverCoords({ top, left });
  };

  // Sync view when value changes from outside (e.g. today button or prev/next day)
  useEffect(() => {
    const parsed = parseDate(value);
    setViewYear(parsed.y);
    setViewMonth(parsed.m);
  }, [value]);

  // Handle position tracking when open
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Click outside and Escape key to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (dayNumber: number) => {
    const formatted = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(formatted);
    setViewYear(y);
    setViewMonth(m);
    setIsOpen(false);
  };

  const handleJumpToAugust2026 = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewYear(2026);
    setViewMonth(8);
    onChange('2026-08-31');
    setIsOpen(false);
  };

  // Toggle calendar popup
  const toggleOpen = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Display format DD/MM/YYYY
  const displayFormattedDate = `${String(currentDay).padStart(2, '0')}/${String(currentMonth).padStart(2, '0')}/${currentYear}`;

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfWeek + 6) % 7;
  const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

  // Generate calendar grid items
  const calendarDays: Array<{
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isSunday: boolean;
    isToday: boolean;
    isSelected: boolean;
  }> = [];

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = today.getMonth() + 1;
  const todayD = today.getDate();

  // Days from previous month
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = viewMonth === 1 ? 12 : viewMonth - 1;
    const y = viewMonth === 1 ? viewYear - 1 : viewYear;
    const isSunday = new Date(y, m - 1, d).getDay() === 0;
    calendarDays.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      isSunday,
      isToday: false,
      isSelected: false,
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isSunday = new Date(viewYear, viewMonth - 1, d).getDay() === 0;
    const isSelected = viewYear === currentYear && viewMonth === currentMonth && d === currentDay;
    const isToday = viewYear === todayY && viewMonth === todayM && d === todayD;
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      isSunday,
      isToday,
      isSelected,
    });
  }

  // Days of next month to complete the row
  const remainingDays = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remainingDays; d++) {
    const m = viewMonth === 12 ? 1 : viewMonth + 1;
    const y = viewMonth === 12 ? viewYear + 1 : viewYear;
    const isSunday = new Date(y, m - 1, d).getDay() === 0;
    calendarDays.push({
      day: d,
      month: m,
      year: y,
      isCurrentMonth: false,
      isSunday,
      isToday: false,
      isSelected: false,
    });
  }

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Clickable Pill Trigger */}
      <div
        id={`${id}-trigger`}
        ref={triggerRef}
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-950/90 border transition-all cursor-pointer select-none group shadow-inner ${
          isOpen
            ? 'border-cyan-400/90 shadow-cyan-500/20 ring-2 ring-cyan-500/30'
            : 'border-slate-700/80 hover:border-cyan-500/60 hover:bg-slate-900/90'
        }`}
        title="Bấm vào đây hoặc biểu tượng lịch để chọn ngày xem"
      >
        {/* Interactive Calendar Icon with glowing hover effect */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleOpen();
          }}
          className="p-1 -m-1 rounded-lg text-cyan-400 group-hover:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer focus:outline-none"
          title="Mở lịch chọn ngày"
        >
          <Calendar className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
        </button>

        {label && <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>}

        {/* Date Display (DD/MM/YYYY) */}
        <span className="text-sm font-extrabold text-white tracking-wide group-hover:text-cyan-200 transition-colors">
          {displayFormattedDate}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />

        {/* Native Hidden Date Input */}
        <input
          ref={nativeInputRef}
          id={id}
          type="date"
          value={value}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Popover Dropdown Calendar rendered in Portal to be 100% immune to stacking contexts / 3D cards */}
      {isOpen &&
        popoverCoords &&
        createPortal(
          <div
            id={`${id}-dropdown`}
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              zIndex: 999999,
            }}
            className="w-72 sm:w-80 p-4 rounded-3xl bg-slate-900/98 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl shadow-cyan-950/80 ring-1 ring-cyan-500/30 animate-fadeIn"
          >
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="text-sm font-bold text-white">
                  Tháng {viewMonth}, {viewYear}
                </div>
                <div className="text-[10px] text-slate-400">
                  {viewYear === 2026 && viewMonth === 8 ? (
                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3" /> Tháng Báo Cáo Ba Làng TH
                    </span>
                  ) : (
                    <span>8.0h/ngày • Nghỉ Chủ Nhật</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday Labels (T2 to CN) */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
              <div>T2</div>
              <div>T3</div>
              <div>T4</div>
              <div>T5</div>
              <div>T6</div>
              <div>T7</div>
              <div className="text-amber-400 font-extrabold" title="Chủ Nhật (Nghỉ)">
                CN
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return (
                    <div
                      key={`other-${idx}`}
                      className="h-8 flex items-center justify-center text-xs text-slate-600 cursor-not-allowed select-none"
                    >
                      {item.day}
                    </div>
                  );
                }

                const isAug2026 = viewYear === 2026 && viewMonth === 8;

                return (
                  <button
                    key={`day-${item.day}`}
                    type="button"
                    onClick={() => handleSelectDay(item.day)}
                    className={`relative h-8 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                      item.isSelected
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold shadow-md shadow-cyan-500/40 ring-2 ring-cyan-300'
                        : item.isSunday
                        ? 'text-amber-300/80 hover:bg-amber-950/30 hover:text-amber-200'
                        : 'text-slate-200 hover:bg-slate-800 hover:text-cyan-300'
                    } ${item.isToday && !item.isSelected ? 'ring-1 ring-cyan-500 text-cyan-300' : ''}`}
                    title={`${item.day}/${viewMonth}/${viewYear} ${item.isSunday ? '(Nghỉ Chủ Nhật)' : '(8.0h)'}`}
                  >
                    <span>{item.day}</span>
                    {/* Subtle dot indicator for August 2026 task days */}
                    {isAug2026 && !item.isSelected && (
                      <span
                        className={`w-1 h-1 rounded-full -mt-0.5 ${
                          item.isSunday ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Jump Buttons Footer */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleJumpToAugust2026}
                className="px-2.5 py-1 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Tháng 8/2026</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSetToday}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  Hôm Nay
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
