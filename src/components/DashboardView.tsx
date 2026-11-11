import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  BookOpen, 
  Sparkles, 
  MapPin, 
  FileEdit, 
  ChevronRight,
  Trash2,
  Filter,
  Check,
  CheckSquare
} from 'lucide-react';
import { SchoolSchedule, TaskItem, OutOfSchoolEvent, DayOfWeek, PriorityTier } from '../types';
import { 
  formatDateKey, 
  getDayName, 
  formatFullIndonesianDate, 
  addDays, 
  isSchoolDay, 
  isTaskOverdue 
} from '../utils/dateUtils';
import { StorageService } from '../services/storage';

interface DashboardViewProps {
  schedules: SchoolSchedule[];
  tasks: TaskItem[];
  events: OutOfSchoolEvent[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenAddTask: (subjectName?: string, defaultDate?: string) => void;
  onOpenAddSchedule: (defaultDay?: DayOfWeek) => void;
  onOpenAddEvent: (defaultDate?: string) => void;
  onNavigateToTab: (tab: 'schedule' | 'tasks' | 'events' | 'calendar') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedules,
  tasks,
  events,
  onToggleTask,
  onDeleteTask,
  onToggleEvent,
  onDeleteEvent,
  onOpenAddTask,
  onOpenAddSchedule,
  onOpenAddEvent,
  onNavigateToTab
}) => {
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [hideCompletedTasks, setHideCompletedTasks] = useState<boolean>(true);
  const [dailyNote, setDailyNote] = useState<string>('');
  const [isNoteSaved, setIsNoteSaved] = useState<boolean>(false);

  // Load daily note when selectedDate changes
  useEffect(() => {
    setDailyNote(StorageService.getDailyNote(selectedDate));
    setIsNoteSaved(false);
  }, [selectedDate]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDailyNote(val);
    StorageService.saveDailyNote(selectedDate, val);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 1500);
  };

  const selectedDayName = getDayName(selectedDate);
  const isSchool = isSchoolDay(selectedDayName);

  // Filter schedules for the day of week of selectedDate (Senin - Sabtu)
  const todaySchedules = isSchool 
    ? schedules
        .filter((s) => s.day === selectedDayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    : [];

  // Filter tasks:
  // If selectedDate is today, show tasks due today OR pending overdue tasks
  // If selectedDate is other day, show tasks due on that date
  const dateTasks = tasks.filter((t) => {
    if (selectedDate === todayKey) {
      // Today: show tasks due today or still pending from previous dates
      const isDueTodayOrBefore = t.dueDate <= todayKey;
      if (!isDueTodayOrBefore && t.dueDate !== selectedDate) return false;
      if (hideCompletedTasks && t.completed) return false;
      return true;
    } else {
      if (t.dueDate !== selectedDate) return false;
      if (hideCompletedTasks && t.completed) return false;
      return true;
    }
  }).sort((a, b) => {
    // Incomplete first, then by due time
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
  });

  // Filter events for selected date
  const dateEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => {
      // Sort by priority tier: 'penting' (1), 'sedang' (2), 'tidak' (3)
      const tierRank: Record<PriorityTier, number> = { penting: 1, sedang: 2, tidak: 3 };
      if (tierRank[a.tier] !== tierRank[b.tier]) {
        return tierRank[a.tier] - tierRank[b.tier];
      }
      return (a.time || '23:59').localeCompare(b.time || '23:59');
    });

  // Quick stats
  const pendingTasksToday = tasks.filter(t => !t.completed && t.dueDate === selectedDate).length;
  const importantEventsToday = dateEvents.filter(e => e.tier === 'penting').length;

  // Check current ongoing subject if selected date is today
  const now = new Date();
  const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner & Date Picker Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-mono-500 dark:text-mono-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>DASHBOARD PELAJAR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {formatFullIndonesianDate(selectedDate)}
            </h1>
            <p className="text-xs sm:text-sm text-mono-600 dark:text-mono-400 mt-1">
              {isSchool ? `Jadwal Sekolah: Hari ${selectedDayName}` : 'Hari Libur / Akhir Pekan'}
              {importantEventsToday > 0 && ` • ${importantEventsToday} Agenda Penting`}
              {pendingTasksToday > 0 && ` • ${pendingTasksToday} Tugas Belum Selesai`}
            </p>
          </div>

          {/* Date Switcher Quick Chips */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedDate(todayKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate === todayKey
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700 hover:border-mono-950 dark:hover:border-mono-100'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setSelectedDate(addDays(todayKey, 1))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate === addDays(todayKey, 1)
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700 hover:border-mono-950 dark:hover:border-mono-100'
              }`}
            >
              Besok
            </button>
            <button
              onClick={() => setSelectedDate(addDays(todayKey, 2))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate === addDays(todayKey, 2)
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700 hover:border-mono-950 dark:hover:border-mono-100'
              }`}
            >
              Lusa
            </button>
            
            {/* Custom Date Input */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-mono-100 dark:bg-mono-800 border border-mono-300 dark:border-mono-700 text-mono-900 dark:text-mono-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                title="Pilih tanggal bebas"
              />
            </div>
          </div>
        </div>

        {/* Quick summary metric cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 pt-5 border-t border-mono-200 dark:border-mono-800 text-center">
          <div 
            onClick={() => onNavigateToTab('schedule')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{todaySchedules.length}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">Mapel Hari Ini</span>
          </div>
          <div 
            onClick={() => onNavigateToTab('tasks')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{dateTasks.filter(t => !t.completed).length}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">Tugas Belum Selesai</span>
          </div>
          <div 
            onClick={() => onNavigateToTab('events')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{dateEvents.length}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">Agenda Luar</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Jadwal Pelajaran (Left) & Tasks + Events (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECTION 1: JADWAL PELAJARAN HARI INI (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-mono-900 dark:text-mono-100" />
              <h2 className="text-base font-extrabold tracking-tight">
                Jadwal Pelajaran ({selectedDayName})
              </h2>
            </div>
            {isSchool && (
              <button
                onClick={() => onOpenAddSchedule(selectedDayName as DayOfWeek)}
                className="text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            )}
          </div>

          {!isSchool ? (
            <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-mono-50 dark:bg-mono-900/40">
              <p className="text-xs sm:text-sm font-semibold text-mono-600 dark:text-mono-400">
                Hari ini adalah {selectedDayName} (Libur Sekolah).
              </p>
              <p className="text-xs text-mono-500 mt-1">
                Gunakan hari ini untuk istirahat, belajar mandiri, atau kegiatan santai.
              </p>
              <button
                onClick={() => onNavigateToTab('schedule')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white underline"
              >
                <span>Lihat Roster Lengkap Senin - Sabtu</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : todaySchedules.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
              <p className="text-xs font-medium text-mono-500">
                Belum ada mata pelajaran untuk hari {selectedDayName}.
              </p>
              <button
                onClick={() => onOpenAddSchedule(selectedDayName as DayOfWeek)}
                className="mt-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black"
              >
                + Tambah Mapel {selectedDayName}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedules.map((schedule) => {
                const isOngoing = selectedDate === todayKey && currentHM >= schedule.startTime && currentHM <= schedule.endTime;
                return (
                  <div
                    key={schedule.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isOngoing
                        ? 'bg-mono-100 dark:bg-mono-800 border-black dark:border-white shadow-sm ring-1 ring-black dark:ring-white'
                        : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-mono-200 dark:bg-mono-800 text-mono-900 dark:text-mono-100 px-2 py-0.5 rounded">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          {isOngoing && (
                            <span className="text-[10px] font-black uppercase bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.2 rounded animate-pulse">
                              Sedang Berlangsung
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm tracking-tight">
                          {schedule.subject}
                        </h3>
                        {(schedule.room || schedule.teacher) && (
                          <div className="flex items-center gap-3 text-[11px] text-mono-500">
                            {schedule.room && <span>📍 {schedule.room}</span>}
                            {schedule.teacher && <span>👤 {schedule.teacher}</span>}
                          </div>
                        )}
                        {schedule.notes && (
                          <p className="text-xs font-mono text-mono-600 dark:text-mono-400 bg-mono-50 dark:bg-mono-950 p-2 rounded-lg border border-mono-200 dark:border-mono-800 mt-1">
                            ℹ️ {schedule.notes}
                          </p>
                        )}
                      </div>

                      {/* Quick Action: Add task linked to this subject */}
                      <button
                        onClick={() => onOpenAddTask(schedule.subject, selectedDate)}
                        className="p-1.5 text-mono-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
                        title={`Tambah tugas untuk ${schedule.subject}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-right pt-1">
                <button
                  onClick={() => onNavigateToTab('schedule')}
                  className="text-xs font-bold text-mono-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
                >
                  <span>Kelola Semua Jadwal (Senin-Sabtu)</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Daily Scratchpad / Memo */}
          <div className="p-4 rounded-2xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mono-500">
                <FileEdit className="w-3.5 h-3.5" />
                <span>Catatan & Memo Hari Ini</span>
              </div>
              {isNoteSaved && (
                <span className="text-[10px] text-mono-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" /> Tersimpan
                </span>
              )}
            </div>
            <textarea
              value={dailyNote}
              onChange={handleNoteChange}
              placeholder="Tulis catatan cepat, hal yang harus dibawa, atau rangkuman hari ini..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 placeholder-mono-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>
        </div>

        {/* SECTION 2 & 3: TUGAS/PR & KEGIATAN LUAR SEKOLAH (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 2: TUGAS / PR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-mono-900 dark:text-mono-100" />
                <h2 className="text-base font-extrabold tracking-tight">
                  Tugas & PR Pelajar
                </h2>
                <span className="text-xs font-mono bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 px-2 py-0.5 rounded-full font-bold">
                  {dateTasks.filter(t => !t.completed).length} aktif
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter toggle: hide completed */}
                <button
                  onClick={() => setHideCompletedTasks(!hideCompletedTasks)}
                  className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                    hideCompletedTasks
                      ? 'border-mono-900 bg-black text-white dark:bg-white dark:text-black dark:border-white'
                      : 'border-mono-300 dark:border-mono-700 text-mono-600 dark:text-mono-400'
                  }`}
                  title={hideCompletedTasks ? "Menyembunyikan tugas selesai" : "Menampilkan semua"}
                >
                  <Filter className="w-3 h-3" />
                  <span className="text-[10px] hidden sm:inline">
                    {hideCompletedTasks ? "Sembunyikan Selesai" : "Tampilkan Selesai"}
                  </span>
                </button>

                <button
                  onClick={() => onOpenAddTask(undefined, selectedDate)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center gap-1 hover:opacity-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tugas</span>
                </button>
              </div>
            </div>

            {dateTasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
                <p className="text-xs font-medium text-mono-500">
                  Tidak ada tugas atau PR untuk tanggal ini.
                </p>
                <button
                  onClick={() => onOpenAddTask(undefined, selectedDate)}
                  className="mt-2 text-xs font-bold underline text-black dark:text-white"
                >
                  + Tambah tugas baru
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dateTasks.map((task) => {
                  const overdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        task.completed
                          ? 'bg-mono-50 dark:bg-mono-950 border-mono-200 dark:border-mono-800 opacity-60'
                          : overdue
                          ? 'bg-white dark:bg-mono-900 border-black dark:border-mono-400 shadow-sm'
                          : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-mono-900 dark:text-mono-100 hover:scale-110 active:scale-95 transition-transform"
                          title={task.completed ? "Tandai belum selesai" : "Klik untuk selesaikan tugas"}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 fill-black dark:fill-white text-white dark:text-black" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        {/* Task Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            {task.subjectName && (
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-900 dark:text-mono-100">
                                {task.subjectName}
                              </span>
                            )}
                            {overdue && (
                              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Terlewat
                              </span>
                            )}
                            {task.dueTime && (
                              <span className="text-[11px] font-mono text-mono-500">
                                ⏰ {task.dueTime}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-sm font-bold mt-1 tracking-tight ${task.completed ? 'line-through text-mono-400' : ''}`}>
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-xs text-mono-600 dark:text-mono-400 mt-1 whitespace-pre-line">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-mono-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Hapus tugas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: KEGIATAN LUAR SEKOLAH (TIER PENTING / SEDANG / TIDAK) */}
          <div className="space-y-3 pt-4 border-t border-mono-200 dark:border-mono-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-mono-900 dark:text-mono-100" />
                <h2 className="text-base font-extrabold tracking-tight">
                  Agenda Luar Sekolah
                </h2>
                <span className="text-xs font-mono bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 px-2 py-0.5 rounded-full font-bold">
                  {dateEvents.length}
                </span>
              </div>

              <button
                onClick={() => onOpenAddEvent(selectedDate)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center gap-1 hover:opacity-90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Agenda</span>
              </button>
            </div>

            {dateEvents.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
                <p className="text-xs font-medium text-mono-500">
                  Tidak ada agenda luar sekolah untuk tanggal ini.
                </p>
                <button
                  onClick={() => onOpenAddEvent(selectedDate)}
                  className="mt-2 text-xs font-bold underline text-black dark:text-white"
                >
                  + Tambah kegiatan luar (nonton, les, ekskul, dll)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {dateEvents.map((evt) => {
                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        evt.completed
                          ? 'bg-mono-50 dark:bg-mono-950 border-mono-200 dark:border-mono-800 opacity-60'
                          : evt.tier === 'penting'
                          ? 'bg-white dark:bg-mono-900 border-2 border-black dark:border-white shadow-sm'
                          : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleEvent(evt.id)}
                          className="mt-0.5 text-mono-900 dark:text-mono-100 hover:scale-110 active:scale-95 transition-transform"
                          title={evt.completed ? "Tandai belum selesai" : "Tandai selesai"}
                        >
                          {evt.completed ? (
                            <CheckCircle2 className="w-5 h-5 fill-black dark:fill-white text-white dark:text-black" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            {/* Tier Badge */}
                            {evt.tier === 'penting' && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                                TIER: PENTING
                              </span>
                            )}
                            {evt.tier === 'sedang' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white text-mono-900 dark:text-mono-100">
                                TIER: SEDANG
                              </span>
                            )}
                            {evt.tier === 'tidak' && (
                              <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400">
                                TIER: SANTAI
                              </span>
                            )}

                            {evt.time && (
                              <span className="text-[11px] font-mono text-mono-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {evt.time}
                              </span>
                            )}
                            {evt.location && (
                              <span className="text-[11px] text-mono-500 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3" /> {evt.location}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-sm font-bold mt-1 tracking-tight ${evt.completed ? 'line-through text-mono-400' : ''}`}>
                            {evt.title}
                          </h3>

                          {evt.description && (
                            <p className="text-xs text-mono-600 dark:text-mono-400 mt-1 whitespace-pre-line">
                              {evt.description}
                            </p>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1 text-mono-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Hapus agenda"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
