import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { SchoolSchedule, TaskItem, OutOfSchoolEvent, DayOfWeek } from '../types';
import { 
  formatDateKey, 
  getDayName, 
  formatFullIndonesianDate, 
  INDONESIAN_MONTHS, 
  INDONESIAN_DAYS,
  isSchoolDay,
  addDays,
  parseDateKey
} from '../utils/dateUtils';

interface CalendarViewProps {
  schedules: SchoolSchedule[];
  tasks: TaskItem[];
  events: OutOfSchoolEvent[];
  onOpenAddTask: (subjectName?: string, defaultDate?: string) => void;
  onOpenAddSchedule: (defaultDay?: DayOfWeek) => void;
  onOpenAddEvent: (defaultDate?: string) => void;
  onToggleTask: (id: string) => void;
  onToggleEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedules,
  tasks,
  events,
  onOpenAddTask,
  onOpenAddSchedule,
  onOpenAddEvent,
  onToggleTask,
  onToggleEvent
}) => {
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  
  // Current visible month/year
  const [viewDate, setViewDate] = useState<Date>(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(formatDateKey(now));
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const dateObj = new Date(year, month - 1, d);
    calendarCells.push({
      dateStr: formatDateKey(dateObj),
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      dateStr: formatDateKey(dateObj),
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month leading days
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      dateStr: formatDateKey(dateObj),
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Data for the selected date
  const selectedDayName = getDayName(selectedDate);
  const isSchool = isSchoolDay(selectedDayName);

  const selectedDaySchedules = isSchool 
    ? schedules
        .filter((s) => s.day === selectedDayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  const selectedDayTasks = tasks
    .filter((t) => t.dueDate === selectedDate)
    .sort((a, b) => (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59'));

  const selectedDayEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              KALENDER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Kalender
            </h1>
          </div>

          {/* Quick jump buttons */}
          <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto">
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white transition-colors"
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                const target = addDays(todayKey, 1);
                setSelectedDate(target);
                setViewDate(parseDateKey(target));
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white transition-colors"
            >
              Besok
            </button>
            <button
              onClick={() => {
                const target = addDays(todayKey, 7);
                setSelectedDate(target);
                setViewDate(parseDateKey(target));
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white transition-colors"
            >
              +1 Minggu
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const target = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                const targetStr = formatDateKey(target);
                setSelectedDate(targetStr);
                setViewDate(target);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white transition-colors"
            >
              +1 Bulan
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Month (Left) and Day Detail Agenda (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CALENDAR MONTH GRID (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          
          {/* Month & Navigation Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              {INDONESIAN_MONTHS[month]} {year}
            </h2>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-mono-200 dark:border-mono-800 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-mono-200 dark:border-mono-800 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center border-b border-mono-200 dark:border-mono-800 pb-2">
            {INDONESIAN_DAYS.map((d, idx) => (
              <span 
                key={d} 
                className={`text-[11px] font-mono font-bold uppercase ${
                  idx === 0 ? 'text-mono-400' : 'text-mono-700 dark:text-mono-300'
                }`}
              >
                {d.slice(0, 3)}
              </span>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarCells.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const isToday = cell.dateStr === todayKey;

              const cellDayName = getDayName(cell.dateStr);
              const cellIsSchool = isSchoolDay(cellDayName);
              const cellTasks = tasks.filter(t => t.dueDate === cell.dateStr);
              const cellEvents = events.filter(e => e.date === cell.dateStr);
              const hasImportantEvent = cellEvents.some(e => e.tier === 'penting');

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[58px] sm:min-h-[68px] p-1.5 rounded-xl text-left flex flex-col justify-between transition-all border ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md ring-2 ring-mono-400/40'
                      : isToday
                      ? 'border-2 border-black dark:border-white bg-mono-100 dark:bg-mono-800'
                      : cell.isCurrentMonth
                      ? 'border-mono-200 dark:border-mono-800/80 bg-white dark:bg-mono-900 hover:border-mono-400'
                      : 'border-transparent text-mono-400 dark:text-mono-600 bg-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${
                      isSelected 
                        ? 'text-white dark:text-black font-black' 
                        : isToday 
                        ? 'text-black dark:text-white font-extrabold' 
                        : ''
                    }`}>
                      {cell.dayNum}
                    </span>
                    {cellIsSchool && (
                      <span className={`text-[8px] font-mono px-1 rounded ${
                        isSelected 
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' 
                          : 'bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400'
                      }`}>
                        SCH
                      </span>
                    )}
                  </div>

                  {/* Indicators / Badges */}
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {cellTasks.length > 0 && (
                      <span className={`text-[9px] font-mono font-bold px-1 rounded-sm ${
                        isSelected
                          ? 'bg-white text-black dark:bg-black dark:text-white'
                          : 'bg-mono-200 text-mono-900 dark:bg-mono-800 dark:text-mono-100'
                      }`}>
                        {cellTasks.length}T
                      </span>
                    )}
                    {cellEvents.length > 0 && (
                      <span className={`text-[9px] font-mono font-bold px-1 rounded-sm ${
                        hasImportantEvent
                          ? isSelected
                            ? 'bg-white text-black underline font-black dark:bg-black dark:text-white'
                            : 'bg-black text-white dark:bg-white dark:text-black'
                          : isSelected
                          ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                          : 'border border-mono-300 dark:border-mono-700 text-mono-700 dark:text-mono-300'
                      }`}>
                        {cellEvents.length}A
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend with ~ */}
          <div className="pt-3 border-t border-mono-200 dark:border-mono-800 text-[11px] text-mono-500 font-mono">
            <span>SCH: Sekolah</span>
            <span className="mx-2"> ~ </span>
            <span>T: Tugas</span>
            <span className="mx-2"> ~ </span>
            <span>A: Agenda</span>
          </div>
        </div>

        {/* SELECTED DAY AGENDA DETAILS (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Header of Selected Date */}
            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-mono-500">
                AGENDA TANGGAL TERPILIH
              </div>
              <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
                {formatFullIndonesianDate(selectedDate)}
              </h2>
            </div>

            {/* Quick action buttons for this selected date */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onOpenAddTask(undefined, selectedDate)}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold transition-all text-center"
              >
                + Tugas Tanggal Ini
              </button>
              <button
                onClick={() => onOpenAddEvent(selectedDate)}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold transition-all text-center"
              >
                + Agenda Tanggal Ini
              </button>
            </div>

            {/* 1. School Schedule */}
            <div className="space-y-2 pt-2 border-t border-mono-200 dark:border-mono-800">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Jadwal ({selectedDayName})</span>
                {isSchool && (
                  <button
                    onClick={() => onOpenAddSchedule(selectedDayName as DayOfWeek)}
                    className="text-[10px] font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white underline"
                  >
                    + Tambah Jadwal
                  </button>
                )}
              </div>

              {!isSchool ? (
                <p className="text-xs text-mono-500 italic">Libur sekolah.</p>
              ) : selectedDaySchedules.length === 0 ? (
                <p className="text-xs text-mono-500">Belum ada jadwal untuk hari {selectedDayName}.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedDaySchedules.map((sch) => {
                    const schMeta = [sch.startTime + ' - ' + sch.endTime, sch.room, sch.teacher].filter(Boolean).join(' ~ ');
                    return (
                      <div key={sch.id} className="p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span>{sch.subject}</span>
                          <span className="font-mono text-[11px] text-mono-500">{sch.startTime} - {sch.endTime}</span>
                        </div>
                        {sch.room && <p className="text-[11px] text-mono-500 mt-0.5 font-medium">{schMeta}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Tasks Due on Selected Date */}
            <div className="space-y-2 pt-2 border-t border-mono-200 dark:border-mono-800">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Tugas & PR Jatuh Tempo</span>
                <span className="text-[10px] font-mono text-mono-500">{selectedDayTasks.length}</span>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-mono-500 italic">Tidak ada tugas jatuh tempo pada hari ini.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedDayTasks.map((tsk) => {
                    const tskMeta = [tsk.title, tsk.subjectName].filter(Boolean).join(' ~ ');
                    return (
                      <div key={tsk.id} className="p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate ${tsk.completed ? 'line-through text-mono-400' : ''}`}>
                            {tskMeta}
                          </p>
                        </div>
                        <button
                          onClick={() => onToggleTask(tsk.id)}
                          className="text-xs px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-bold"
                        >
                          {tsk.completed ? 'Batal' : 'Selesai'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Outside Events on Selected Date */}
            <div className="space-y-2 pt-2 border-t border-mono-200 dark:border-mono-800">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span>Agenda Luar Sekolah</span>
                <span className="text-[10px] font-mono text-mono-500">{selectedDayEvents.length}</span>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-mono-500 italic">Tidak ada agenda kegiatan luar pada hari ini.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedDayEvents.map((evt) => {
                    const evtMeta = [
                      evt.title,
                      evt.time ? `Pukul ${evt.time}` : '',
                      evt.location
                    ].filter(Boolean).join(' ~ ');

                    return (
                      <div key={evt.id} className="p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {evt.tier === 'penting' && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-black text-white dark:bg-white dark:text-black rounded">
                                PENTING
                              </span>
                            )}
                            <p className={`font-bold truncate ${evt.completed ? 'line-through text-mono-400' : ''}`}>
                              {evtMeta}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleEvent(evt.id)}
                          className="text-xs px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-bold"
                        >
                          {evt.completed ? 'Batal' : 'Selesai'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
