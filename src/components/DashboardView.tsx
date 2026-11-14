import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  Trash2,
  Edit2
} from 'lucide-react';
import { SchoolSchedule, TaskItem, OutOfSchoolEvent, DayOfWeek, PriorityTier, SubTaskItem, TodoItem, AllDayOfWeek } from '../types';
import { 
  formatDateKey, 
  getDayName, 
  formatFullIndonesianDate, 
  addDays, 
  isSchoolDay 
} from '../utils/dateUtils';
import { StorageService } from '../services/storage';
import { TaskTreeItem } from './TaskTreeItem';
import { TodoItemRow } from './TodoItemRow';

interface DashboardViewProps {
  schedules: SchoolSchedule[];
  tasks: TaskItem[];
  events: OutOfSchoolEvent[];
  todos?: TodoItem[];
  onToggleTask: (id: string) => void;
  onUpdateSubTasks: (taskId: string, subTasks: SubTaskItem[]) => void;
  onDeleteTask: (id: string) => void;
  onOpenEditTask?: (task: TaskItem) => void;
  onOpenEditSchedule?: (schedule: SchoolSchedule) => void;
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenEditEvent?: (event: OutOfSchoolEvent) => void;
  onOpenAddTodo: () => void;
  onOpenEditTodo: (todo: TodoItem) => void;
  onToggleTodo: (id: string, dateKey: string) => void;
  onDeleteTodo: (id: string) => void;
  onOpenAddTask: (subjectName?: string, defaultDate?: string) => void;
  onOpenAddSchedule: (defaultDay?: DayOfWeek) => void;
  onOpenAddEvent: (defaultDate?: string) => void;
  onOpenBulkAdd: (type: 'schedule' | 'task' | 'event') => void;
  onNavigateToTab: (tab: 'schedule' | 'tasks' | 'events' | 'calendar' | 'todos') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedules,
  tasks,
  events,
  todos = [],
  onToggleTask,
  onUpdateSubTasks,
  onDeleteTask,
  onOpenEditTask,
  onOpenEditSchedule,
  onToggleEvent,
  onDeleteEvent,
  onOpenEditEvent,
  onOpenAddTodo,
  onOpenEditTodo,
  onToggleTodo,
  onDeleteTodo,
  onOpenAddTask,
  onOpenAddSchedule,
  onOpenAddEvent,
  onOpenBulkAdd,
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

  const subjectsOnSelectedDay = todaySchedules.map(s => s.subject.trim().toLowerCase());
  const scheduleIdsOnSelectedDay = new Set(todaySchedules.map(s => s.id));

  // Filter tasks based on deadline or linked subject
  const dateTasks = tasks.filter((t) => {
    if (hideCompletedTasks && t.completed) return false;

    // 1. Task has a specific dueDate
    if (t.dueDate) {
      if (selectedDate === todayKey) {
        return t.dueDate <= todayKey;
      } else {
        return t.dueDate === selectedDate;
      }
    }

    // 2. Task has NO dueDate (optional deadline feature)
    // If linked to a subject, check if that subject exists in today's schedule
    if (t.subjectName || t.scheduleId) {
      const isMatch = (t.scheduleId && scheduleIdsOnSelectedDay.has(t.scheduleId)) ||
        (t.subjectName && subjectsOnSelectedDay.includes(t.subjectName.trim().toLowerCase()));
      if (isMatch) return true;
    } else {
      // General task with no subject and no deadline shows on today's view
      if (selectedDate === todayKey) return true;
    }

    return false;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
  });

  // Filter events for selected date
  const dateEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => {
      const tierRank: Record<PriorityTier, number> = { penting: 1, sedang: 2, tidak: 3 };
      if (tierRank[a.tier] !== tierRank[b.tier]) {
        return tierRank[a.tier] - tierRank[b.tier];
      }
      return (a.time || '23:59').localeCompare(b.time || '23:59');
    });

  // Filter To-Do items active for selectedDate
  const selectedDayNameFull = getDayName(selectedDate) as AllDayOfWeek;
  const isTodoActive = (todo: TodoItem): boolean => {
    if (todo.repeatType === 'daily') return true;
    if (todo.repeatType === 'specific_days' && todo.repeatDays) {
      return todo.repeatDays.includes(selectedDayNameFull);
    }
    if (todo.repeatType === 'once') {
      return todo.targetDate === selectedDate;
    }
    return false;
  };

  const todayTodos = todos.filter(isTodoActive);
  const completedTodosToday = todayTodos.filter(t => (t.completedDates || []).includes(selectedDate)).length;

  // Quick stats
  const pendingTasksToday = dateTasks.filter(t => !t.completed).length;
  const importantEventsToday = dateEvents.filter(e => e.tier === 'penting' && !e.completed).length;

  // Check current ongoing subject if selected date is today
  const now = new Date();
  const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Information banner combining adjacent texts with ~
  const bannerInfoParts = [
    isSchool ? `Jadwal: Hari ${selectedDayName}` : 'Hari Libur',
    importantEventsToday > 0 ? `${importantEventsToday} Agenda Penting` : '',
    pendingTasksToday > 0 ? `${pendingTasksToday} Tugas Belum Selesai` : ''
  ].filter(Boolean);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner & Date Picker Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-mono-500 dark:text-mono-400">
              DASHBOARD
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {formatFullIndonesianDate(selectedDate)}
            </h1>
            {bannerInfoParts.length > 0 && (
              <p className="text-xs sm:text-sm text-mono-600 dark:text-mono-400 mt-1">
                {bannerInfoParts.join(' ~ ')}
              </p>
            )}
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
            <button
              onClick={() => setSelectedDate(addDays(todayKey, 7))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedDate === addDays(todayKey, 7)
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700 hover:border-mono-950 dark:hover:border-mono-100'
              }`}
            >
              +7 Hari
            </button>

            {/* Custom Date Input */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-mono-100 dark:bg-mono-800 border border-mono-300 dark:border-mono-700 text-mono-900 dark:text-mono-100 cursor-pointer"
                title="Pilih tanggal kustom"
              />
            </div>
          </div>
        </div>

        {/* Quick summary metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-5 pt-5 border-t border-mono-200 dark:border-mono-800 text-center">
          <div 
            onClick={() => onNavigateToTab('schedule')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{todaySchedules.length}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">Jadwal Hari Ini</span>
          </div>
          <div 
            onClick={() => onNavigateToTab('todos')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{todayTodos.length}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">To-Do ({completedTodosToday} Selesai)</span>
          </div>
          <div 
            onClick={() => onNavigateToTab('tasks')}
            className="cursor-pointer p-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/50 transition-colors"
          >
            <span className="text-xl sm:text-2xl font-black block">{pendingTasksToday}</span>
            <span className="text-[11px] sm:text-xs text-mono-500 font-medium">Tugas Aktif</span>
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

      {/* Main Grid: Jadwal (Left) & Tasks + Events (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SECTION 1: JADWAL HARI INI (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold tracking-tight">
              Jadwal ({selectedDayName})
            </h2>
            {isSchool && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenBulkAdd('schedule')}
                  className="text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white"
                >
                  + Massal
                </button>
                <span className="text-mono-400 text-xs"> ~ </span>
                <button
                  onClick={() => onOpenAddSchedule(selectedDayName as DayOfWeek)}
                  className="text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white"
                >
                  + Tambah
                </button>
              </div>
            )}
          </div>

          {!isSchool ? (
            <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-mono-50 dark:bg-mono-900/40">
              <p className="text-xs sm:text-sm font-semibold text-mono-600 dark:text-mono-400">
                {selectedDayName} (Hari Libur)
              </p>
              <button
                onClick={() => onNavigateToTab('schedule')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-black dark:text-white underline"
              >
                <span>Lihat Jadwal Lengkap</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ) : todaySchedules.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
              <p className="text-xs font-medium text-mono-500">
                Belum ada jadwal untuk hari {selectedDayName}.
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => onOpenAddSchedule(selectedDayName as DayOfWeek)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black"
                >
                  + Tambah Jadwal {selectedDayName}
                </button>
                <button
                  onClick={() => onOpenBulkAdd('schedule')}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700"
                >
                  + Tambah Massal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedules.map((schedule) => {
                const isOngoing = selectedDate === todayKey && currentHM >= schedule.startTime && currentHM <= schedule.endTime;
                const scheduleMeta = [schedule.room, schedule.teacher].filter(Boolean).join(' ~ ');

                // Check tasks linked to this subject
                const subjectTasks = tasks.filter(t => 
                  !t.completed && (
                    t.scheduleId === schedule.id || 
                    (t.subjectName && t.subjectName.trim().toLowerCase() === schedule.subject.trim().toLowerCase())
                  )
                );

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
                        {scheduleMeta && (
                          <div className="text-[11px] text-mono-500 font-medium">
                            {scheduleMeta}
                          </div>
                        )}
                        {schedule.notes && (
                          <p className="text-xs font-mono text-mono-600 dark:text-mono-400 bg-mono-50 dark:bg-mono-950 p-2 rounded-lg border border-mono-200 dark:border-mono-800 mt-1">
                            {schedule.notes}
                          </p>
                        )}

                        {/* Display linked tasks tag */}
                        {subjectTasks.length > 0 && (
                          <div className="pt-1 flex flex-wrap gap-1">
                            {subjectTasks.map(st => (
                              <span 
                                key={st.id}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-mono-100 dark:bg-mono-800 text-mono-800 dark:text-mono-200 px-2 py-0.5 rounded"
                              >
                                <span>Tugas: {st.title}</span>
                                {st.subTasks && st.subTasks.length > 0 && (
                                  <span className="opacity-60">({st.subTasks.length} poin)</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons: Add task & Edit schedule */}
                      <div className="flex items-center gap-1 self-start">
                        <button
                          onClick={() => onOpenAddTask(schedule.subject, undefined)}
                          className="px-2 py-1 text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
                          title={`Tambah tugas untuk ${schedule.subject}`}
                        >
                          + Tugas
                        </button>
                        {onOpenEditSchedule && (
                          <button
                            onClick={() => onOpenEditSchedule(schedule)}
                            className="p-1.5 text-mono-400 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
                            title="Edit Jadwal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-right pt-1">
                <button
                  onClick={() => onNavigateToTab('schedule')}
                  className="text-xs font-bold text-mono-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
                >
                  <span>Kelola Semua Jadwal</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION: TO-DO LIST HARI INI */}
          <div className="space-y-3 pt-2 border-t border-mono-200 dark:border-mono-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  To-Do ({selectedDayName})
                </h2>
                {todayTodos.length > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200">
                    {completedTodosToday}/{todayTodos.length}
                  </span>
                )}
              </div>
              <button
                onClick={onOpenAddTodo}
                className="text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white"
              >
                + Tambah To-Do
              </button>
            </div>

            {todayTodos.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-mono-200 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
                <p className="text-xs text-mono-500">
                  Tidak ada kegiatan to-do untuk hari ini.
                </p>
                <button
                  onClick={onOpenAddTodo}
                  className="mt-2 text-xs font-bold text-black dark:text-white underline"
                >
                  + Tambah To-Do Baru
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTodos.map(todo => (
                  <TodoItemRow
                    key={todo.id}
                    todo={todo}
                    currentDateKey={selectedDate}
                    onToggle={onToggleTodo}
                    onEdit={onOpenEditTodo}
                    onDelete={onDeleteTodo}
                    showRepeatBadge={false}
                  />
                ))}
                <div className="text-right pt-1">
                  <button
                    onClick={() => onNavigateToTab('todos')}
                    className="text-xs font-bold text-mono-500 hover:text-black dark:hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Buka Tab To-Do Lengkap</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Daily Scratchpad / Memo */}
          <div className="p-4 rounded-2xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-mono-500">
                Catatan Hari Ini
              </div>
              {isNoteSaved && (
                <span className="text-[10px] text-mono-400 font-mono">
                  Tersimpan
                </span>
              )}
            </div>
            <textarea
              value={dailyNote}
              onChange={handleNoteChange}
              placeholder="Tulis catatan cepat atau hal yang harus dibawa..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 placeholder-mono-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>
        </div>

        {/* SECTION 2 & 3: TUGAS/PR & AGENDA LUAR (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 2: TUGAS / PR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Tugas & PR
                </h2>
                <span className="text-xs font-mono bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 px-2 py-0.5 rounded-full font-bold">
                  {dateTasks.filter(t => !t.completed).length} aktif
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter toggle: hide completed */}
                <button
                  onClick={() => setHideCompletedTasks(!hideCompletedTasks)}
                  className={`px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
                    hideCompletedTasks
                      ? 'border-mono-900 bg-black text-white dark:bg-white dark:text-black dark:border-white'
                      : 'border-mono-300 dark:border-mono-700 text-mono-600 dark:text-mono-400'
                  }`}
                >
                  <span className="text-[10px]">
                    {hideCompletedTasks ? "Sembunyikan Selesai" : "Tampilkan Selesai"}
                  </span>
                </button>

                <button
                  onClick={() => onOpenBulkAdd('task')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white"
                >
                  + Massal
                </button>

                <button
                  onClick={() => onOpenAddTask(undefined, selectedDate)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {dateTasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
                <p className="text-xs font-medium text-mono-500">
                  Tidak ada tugas untuk tanggal ini.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => onOpenAddTask(undefined, selectedDate)}
                    className="text-xs font-bold underline text-black dark:text-white"
                  >
                    + Tambah tugas baru
                  </button>
                  <span className="text-mono-400 text-xs"> ~ </span>
                  <button
                    onClick={() => onOpenBulkAdd('task')}
                    className="text-xs font-bold underline text-mono-600 dark:text-mono-300"
                  >
                    + Tambah Massal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dateTasks.map((task) => (
                  <TaskTreeItem
                    key={task.id}
                    task={task}
                    onToggleTask={onToggleTask}
                    onUpdateSubTasks={onUpdateSubTasks}
                    onEdit={onOpenEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: AGENDA LUAR */}
          <div className="space-y-3 pt-4 border-t border-mono-200 dark:border-mono-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Agenda Luar
                </h2>
                <span className="text-xs font-mono bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 px-2 py-0.5 rounded-full font-bold">
                  {dateEvents.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenBulkAdd('event')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white"
                >
                  + Massal
                </button>
                <button
                  onClick={() => onOpenAddEvent(selectedDate)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {dateEvents.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
                <p className="text-xs font-medium text-mono-500">
                  Tidak ada agenda untuk tanggal ini.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={() => onOpenAddEvent(selectedDate)}
                    className="text-xs font-bold underline text-black dark:text-white"
                  >
                    + Tambah agenda
                  </button>
                  <span className="text-mono-400 text-xs"> ~ </span>
                  <button
                    onClick={() => onOpenBulkAdd('event')}
                    className="text-xs font-bold underline text-mono-600 dark:text-mono-300"
                  >
                    + Tambah Massal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {dateEvents.map((evt) => {
                  const eventMeta = [
                    evt.time ? `Pukul ${evt.time}` : '',
                    evt.location
                  ].filter(Boolean).join(' ~ ');

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
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                                PENTING
                              </span>
                            )}
                            {evt.tier === 'sedang' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200">
                                SEDANG
                              </span>
                            )}
                            {evt.tier === 'tidak' && (
                              <span className="text-[10px] font-normal uppercase tracking-wider px-2 py-0.5 rounded border border-mono-300 dark:border-mono-700 text-mono-600 dark:text-mono-400">
                                BIASA
                              </span>
                            )}

                            {eventMeta && (
                              <span className="text-xs text-mono-500 font-medium">
                                {eventMeta}
                              </span>
                            )}
                          </div>

                          <h3 className={`text-sm font-bold mt-1 tracking-tight ${evt.completed ? 'line-through text-mono-400' : ''}`}>
                            {evt.title}
                          </h3>

                          {evt.description && (
                            <p className="text-xs text-mono-600 dark:text-mono-400 mt-1">
                              {evt.description}
                            </p>
                          )}
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center gap-1 self-start">
                          {onOpenEditEvent && (
                            <button
                              onClick={() => onOpenEditEvent(evt)}
                              className="p-1 text-mono-400 hover:text-black dark:hover:text-white transition-colors"
                              title="Edit agenda"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteEvent(evt.id)}
                            className="p-1 text-mono-400 hover:text-black dark:hover:text-white transition-colors"
                            title="Hapus agenda"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
