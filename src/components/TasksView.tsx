import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Clock, 
  Search,
  Sparkles
} from 'lucide-react';
import { TaskItem, SchoolSchedule } from '../types';
import { isTaskOverdue, formatRelativeDate, formatDateKey } from '../utils/dateUtils';

interface TasksViewProps {
  tasks: TaskItem[];
  schedules: SchoolSchedule[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onOpenAddTask: (subjectName?: string) => void;
  onOpenEditTask: (task: TaskItem) => void;
  onPurgeCompletedOrExpired: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  schedules,
  onToggleTask,
  onDeleteTask,
  onOpenAddTask,
  onOpenEditTask,
  onPurgeCompletedOrExpired
}) => {
  const [filterTab, setFilterTab] = useState<'aktif' | 'selesai' | 'terlewat' | 'semua'>('aktif');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('semua');

  // Collect unique subjects from schedules and tasks
  const subjectOptions = Array.from(
    new Set([
      ...schedules.map((s) => s.subject),
      ...tasks.map((t) => t.subjectName).filter(Boolean) as string[]
    ])
  );

  // Filter tasks logic
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);

    // Tab filter
    if (filterTab === 'aktif' && (task.completed || isOverdue)) return false;
    if (filterTab === 'selesai' && !task.completed) return false;
    if (filterTab === 'terlewat' && (!isOverdue || task.completed)) return false;

    // Subject filter
    if (selectedSubject !== 'semua' && task.subjectName !== selectedSubject) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchSub = task.subjectName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc && !matchSub) return false;
    }

    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;
  const activeCount = tasks.filter((t) => !t.completed && !isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>MANAJEMEN TUGAS & PR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Daftar Tugas & PR
            </h1>
            <p className="text-xs sm:text-sm text-mono-600 dark:text-mono-400 mt-1 max-w-xl">
              Hubungkan tugas dengan jadwal pelajaran, pantau deadline, dan tandai saat tugas selesai.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Purge button for completed / passed tasks */}
            {(completedCount > 0 || overdueCount > 0) && (
              <button
                onClick={() => {
                  if (confirm('Bersihkan semua tugas yang sudah selesai dan terlewat?')) {
                    onPurgeCompletedOrExpired();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold transition-all flex items-center gap-1.5"
                title="Hapus tugas yang selesai atau sudah terlewat"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bersihkan Selesai/Lewat</span>
              </button>
            )}

            <button
              onClick={() => onOpenAddTask()}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <button
            onClick={() => setFilterTab('aktif')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterTab === 'aktif'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span>Aktif & Hari Ini</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-mono">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('terlewat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterTab === 'terlewat'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span>Terlewat</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-mono">
              {overdueCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('selesai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterTab === 'selesai'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span>Selesai</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-mono">
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              filterTab === 'semua'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span>Semua</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-mono">
              {tasks.length}
            </span>
          </button>
        </div>

        {/* Search & Subject filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-mono-100 dark:border-mono-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, halaman buku, kata kunci..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
              <option value="semua">Semua Mata Pelajaran</option>
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
          <CheckSquare className="w-8 h-8 mx-auto text-mono-400 mb-2" />
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Tidak ada tugas pada filter ini.
          </p>
          <p className="text-xs text-mono-500 mt-1">
            Tekan tombol di bawah untuk menambahkan tugas baru.
          </p>
          <button
            onClick={() => onOpenAddTask()}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
          >
            + Buat Tugas Baru
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const overdue = isTaskOverdue(task.dueDate, task.dueTime, task.completed);
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-mono-50 dark:bg-mono-950 border-mono-200 dark:border-mono-800 opacity-60'
                    : overdue
                    ? 'bg-white dark:bg-mono-900 border-2 border-black dark:border-white shadow-sm'
                    : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                }`}
              >
                <div className="flex items-start gap-3.5">
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

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      {task.subjectName && (
                        <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-900 dark:text-mono-100">
                          {task.subjectName}
                        </span>
                      )}
                      
                      <span className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                        overdue ? 'text-black dark:text-white font-bold' : 'text-mono-600 dark:text-mono-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {formatRelativeDate(task.dueDate, formatDateKey(new Date()))} ({task.dueDate})</span>
                        {task.dueTime && <span>jam {task.dueTime}</span>}
                      </span>

                      {overdue && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          TERLEWAT
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold mt-1.5 tracking-tight ${task.completed ? 'line-through text-mono-400' : ''}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-mono-600 dark:text-mono-400 mt-1 whitespace-pre-line bg-mono-50 dark:bg-mono-950 p-2.5 rounded-xl border border-mono-100 dark:border-mono-800/80">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditTask(task)}
                      className="p-1.5 text-mono-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                      title="Edit Tugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tugas "${task.title}"?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-1.5 text-mono-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                      title="Hapus Tugas"
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
  );
};
