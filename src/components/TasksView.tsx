import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { TaskItem, SchoolSchedule, SubTaskItem } from '../types';
import { isTaskOverdue } from '../utils/dateUtils';
import { TaskTreeItem } from './TaskTreeItem';

interface TasksViewProps {
  tasks: TaskItem[];
  schedules: SchoolSchedule[];
  onToggleTask: (id: string) => void;
  onUpdateSubTasks: (taskId: string, subTasks: SubTaskItem[]) => void;
  onDeleteTask: (id: string) => void;
  onDeleteBulkTasks: (ids: string[]) => void;
  onToggleBulkTasks: (ids: string[], completed: boolean) => void;
  onOpenAddTask: (subjectName?: string) => void;
  onOpenBulkAddTask: () => void;
  onOpenEditTask: (task: TaskItem) => void;
  onPurgeCompletedOrExpired: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  schedules,
  onToggleTask,
  onUpdateSubTasks,
  onDeleteTask,
  onDeleteBulkTasks,
  onToggleBulkTasks,
  onOpenAddTask,
  onOpenBulkAddTask,
  onOpenEditTask,
  onPurgeCompletedOrExpired
}) => {
  const [filterTab, setFilterTab] = useState<'aktif' | 'selesai' | 'terlewat' | 'semua'>('aktif');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Collect unique subjects from schedules and tasks
  const subjectOptions = Array.from(
    new Set([
      ...schedules.map((s) => s.subject),
      ...tasks.map((t) => t.subjectName).filter(Boolean) as string[]
    ])
  );

  // Filter tasks logic
  const filteredTasks = tasks.filter((task) => {
    const isOverdue = task.dueDate ? isTaskOverdue(task.dueDate, task.dueTime, task.completed) : false;

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
    return (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => t.dueDate && isTaskOverdue(t.dueDate, t.dueTime, t.completed)).length;
  const activeCount = tasks.filter((t) => !t.completed && (!t.dueDate || !isTaskOverdue(t.dueDate, t.dueTime, t.completed))).length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map(t => t.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} tugas yang dipilih?`)) {
      onDeleteBulkTasks(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleMarkSelectedDone = () => {
    if (selectedIds.length === 0) return;
    onToggleBulkTasks(selectedIds, true);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              TUGAS & PR
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Daftar Tugas & PR
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            {/* Bulk actions */}
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={handleMarkSelectedDone}
                  className="px-3 py-2 rounded-xl bg-mono-200 text-mono-900 dark:bg-mono-800 dark:text-mono-100 font-bold text-xs transition-all"
                >
                  Tandai Selesai ({selectedIds.length})
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-3 py-2 rounded-xl border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold text-xs transition-all"
                >
                  Hapus ({selectedIds.length})
                </button>
              </>
            )}

            {/* Purge button for completed / passed tasks */}
            {(completedCount > 0 || overdueCount > 0) && (
              <button
                onClick={() => {
                  if (confirm('Bersihkan semua tugas yang sudah selesai dan terlewat?')) {
                    onPurgeCompletedOrExpired();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold transition-all"
              >
                Bersihkan Selesai / Lewat
              </button>
            )}

            <button
              onClick={onOpenBulkAddTask}
              className="px-3.5 py-2.5 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white font-bold text-xs transition-all shadow-sm"
            >
              + Massal
            </button>

            <button
              onClick={() => onOpenAddTask()}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              + Tambah Tugas
            </button>
          </div>
        </div>

        {/* Tab Filters & Select All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setFilterTab('aktif');
                setSelectedIds([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                filterTab === 'aktif'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>Aktif</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-mono-200 dark:bg-mono-800 text-mono-800 dark:text-mono-200 font-mono">
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => {
                setFilterTab('terlewat');
                setSelectedIds([]);
              }}
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
              onClick={() => {
                setFilterTab('selesai');
                setSelectedIds([]);
              }}
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
              onClick={() => {
                setFilterTab('semua');
                setSelectedIds([]);
              }}
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

          {filteredTasks.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white self-start sm:self-auto"
            >
              {selectedIds.length === filteredTasks.length ? 'Batal Pilih Semua' : 'Pilih Semua untuk Aksi Massal'}
            </button>
          )}
        </div>

        {/* Search & Subject filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-mono-100 dark:border-mono-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-mono-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas atau kata kunci..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            >
              <option value="semua">Semua Pelajaran</option>
              {subjectOptions.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List with TaskTreeItem */}
      {filteredTasks.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Tidak ada tugas pada filter ini.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => onOpenAddTask()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              + Buat Tugas
            </button>
            <span className="text-mono-400 text-xs"> ~ </span>
            <button
              onClick={onOpenBulkAddTask}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-mono-300 dark:border-mono-700"
            >
              + Tambah Massal
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskTreeItem
              key={task.id}
              task={task}
              isSelected={selectedIds.includes(task.id)}
              onToggleSelect={handleToggleSelect}
              onToggleTask={onToggleTask}
              onUpdateSubTasks={onUpdateSubTasks}
              onEdit={onOpenEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}

    </div>
  );
};
