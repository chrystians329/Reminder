import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus
} from 'lucide-react';
import { TodoItem, AllDayOfWeek } from '../types';
import { formatDateKey, getDayName, formatFullIndonesianDate, addDays } from '../utils/dateUtils';
import { TodoItemRow } from './TodoItemRow';

interface TodosViewProps {
  todos: TodoItem[];
  onOpenAddTodo: () => void;
  onOpenEditTodo: (todo: TodoItem) => void;
  onToggleTodo: (id: string, dateKey: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodosView: React.FC<TodosViewProps> = ({
  todos,
  onOpenAddTodo,
  onOpenEditTodo,
  onToggleTodo,
  onDeleteTodo
}) => {
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [activeFilter, setActiveFilter] = useState<'selected_day' | 'all'>('selected_day');

  const selectedDayName = getDayName(selectedDate) as AllDayOfWeek;

  // Filter todos active for selected date
  const isTodoActiveOnDate = (todo: TodoItem, dateKey: string, dayName: AllDayOfWeek): boolean => {
    if (todo.repeatType === 'daily') return true;
    if (todo.repeatType === 'specific_days' && todo.repeatDays) {
      return todo.repeatDays.includes(dayName);
    }
    if (todo.repeatType === 'once') {
      return todo.targetDate === dateKey;
    }
    return false;
  };

  const activeTodosOnSelectedDate = todos.filter(t => 
    isTodoActiveOnDate(t, selectedDate, selectedDayName)
  );

  const completedCount = activeTodosOnSelectedDate.filter(t => 
    (t.completedDates || []).includes(selectedDate)
  ).length;

  const totalCount = activeTodosOnSelectedDate.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              KEBIASAAN & RUTINITAS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              To-Do List Berulang
            </h1>
            <p className="text-xs text-mono-600 dark:text-mono-400 mt-1">
              Daftar kegiatan harian, mingguan, atau sekali yang ter-reset otomatis setiap hari baru.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenAddTodo}
              className="px-4 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah To-Do</span>
            </button>
          </div>
        </div>

        {/* Progress Bar (for selected date) */}
        {activeFilter === 'selected_day' && totalCount > 0 && (
          <div className="mt-5 pt-4 border-t border-mono-100 dark:border-mono-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Pencapaian: {completedCount} dari {totalCount} selesai</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-mono-100 dark:bg-mono-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black dark:bg-white rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Date Navigation & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Toggle: Tanggal Ini vs Semua */}
        <div className="inline-flex p-1 rounded-2xl bg-mono-100 dark:bg-mono-900 border border-mono-200 dark:border-mono-800">
          <button
            onClick={() => setActiveFilter('selected_day')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'selected_day'
                ? 'bg-white dark:bg-mono-800 text-black dark:text-white shadow-sm'
                : 'text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Tampilan Harian
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-mono-800 text-black dark:text-white shadow-sm'
                : 'text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Semua To-Do ({todos.length})
          </button>
        </div>

        {/* Date Selector (when in daily view) */}
        {activeFilter === 'selected_day' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              className="px-2.5 py-1.5 rounded-xl border border-mono-200 dark:border-mono-800 text-xs font-bold bg-white dark:bg-mono-900 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
            >
              ← Kemarin
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-mono-200 dark:border-mono-800 text-xs font-bold bg-white dark:bg-mono-900 focus:outline-none"
            />
            {selectedDate !== todayKey ? (
              <button
                onClick={() => setSelectedDate(todayKey)}
                className="px-2.5 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold"
              >
                Hari Ini
              </button>
            ) : (
              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="px-2.5 py-1.5 rounded-xl border border-mono-200 dark:border-mono-800 text-xs font-bold bg-white dark:bg-mono-900 hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
              >
                Besok →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content List */}
      {activeFilter === 'selected_day' ? (
        activeTodosOnSelectedDate.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-3xl bg-white dark:bg-mono-900 space-y-3">
            <CheckSquare className="w-8 h-8 mx-auto text-mono-400" />
            <h3 className="font-extrabold text-base">Tidak ada to-do di hari {selectedDayName}</h3>
            <p className="text-xs text-mono-500 max-w-sm mx-auto">
              Tidak ada to-do list berulang atau to-do sekali yang dijadwalkan pada {formatFullIndonesianDate(selectedDate)}.
            </p>
            <button
              onClick={onOpenAddTodo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah To-Do untuk {selectedDayName}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeTodosOnSelectedDate.map(todo => (
              <TodoItemRow
                key={todo.id}
                todo={todo}
                currentDateKey={selectedDate}
                onToggle={onToggleTodo}
                onEdit={onOpenEditTodo}
                onDelete={onDeleteTodo}
              />
            ))}
          </div>
        )
      ) : (
        /* All Todos View */
        todos.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-3xl bg-white dark:bg-mono-900 space-y-3">
            <CheckSquare className="w-8 h-8 mx-auto text-mono-400" />
            <h3 className="font-extrabold text-base">Belum Ada To-Do List</h3>
            <p className="text-xs text-mono-500 max-w-sm mx-auto">
              Buat kegiatan rutin seperti olahraga, ibadah, membaca buku, atau kebiasaan produktif lainnya.
            </p>
            <button
              onClick={onOpenAddTodo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat To-Do Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todos.map(todo => (
              <TodoItemRow
                key={todo.id}
                todo={todo}
                currentDateKey={todayKey}
                onToggle={onToggleTodo}
                onEdit={onOpenEditTodo}
                onDelete={onDeleteTodo}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
};
