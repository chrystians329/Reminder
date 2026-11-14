import React from 'react';
import { Check, Edit2, Trash2, RotateCw, Clock } from 'lucide-react';
import { TodoItem } from '../types';

interface TodoItemRowProps {
  todo: TodoItem;
  currentDateKey: string;
  onToggle: (id: string, dateKey: string) => void;
  onEdit: (todo: TodoItem) => void;
  onDelete: (id: string) => void;
  showRepeatBadge?: boolean;
}

export const TodoItemRow: React.FC<TodoItemRowProps> = ({
  todo,
  currentDateKey,
  onToggle,
  onEdit,
  onDelete,
  showRepeatBadge = true
}) => {
  const isCompleted = (todo.completedDates || []).includes(currentDateKey);

  // Repeat Badge Text
  const getRepeatLabel = () => {
    if (todo.repeatType === 'daily') return 'Setiap Hari';
    if (todo.repeatType === 'specific_days' && todo.repeatDays) {
      return `Tiap ${todo.repeatDays.join(', ')}`;
    }
    if (todo.repeatType === 'once') {
      return todo.targetDate ? `Sekali (${todo.targetDate})` : 'Sekali';
    }
    return '';
  };

  return (
    <div 
      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
        isCompleted
          ? 'bg-mono-100/70 dark:bg-mono-900/40 border-mono-200 dark:border-mono-800'
          : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400 dark:hover:border-mono-600 shadow-sm'
      }`}
    >
      {/* Animated Checkbox Button */}
      <button
        type="button"
        onClick={() => onToggle(todo.id, currentDateKey)}
        className={`relative mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all duration-200 ${
          isCompleted
            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white scale-100'
            : 'border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white bg-transparent active:scale-90'
        }`}
        title={isCompleted ? 'Batalkan selesai' : 'Tandai selesai hari ini'}
      >
        <span 
          className={`transition-all duration-200 transform ${
            isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      </button>

      {/* Todo Content & Strikethrough with animation */}
      <div className="flex-1 min-w-0 select-none">
        <div className="flex items-center flex-wrap gap-1.5 mb-1">
          {showRepeatBadge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-mono-100 dark:bg-mono-800 text-mono-700 dark:text-mono-300 border border-mono-200 dark:border-mono-700">
              <RotateCw className="w-2.5 h-2.5" />
              <span>{getRepeatLabel()}</span>
            </span>
          )}

          {todo.time && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-mono-50 dark:bg-mono-950 text-mono-600 dark:text-mono-400 border border-mono-200 dark:border-mono-800">
              <Clock className="w-2.5 h-2.5" />
              <span>{todo.time}</span>
            </span>
          )}
        </div>

        {/* Text with animated strikethrough */}
        <div className="relative inline-block max-w-full">
          <p 
            className={`text-sm font-bold tracking-tight transition-all duration-300 break-words ${
              isCompleted 
                ? 'line-through text-mono-400 dark:text-mono-500 italic' 
                : 'text-mono-950 dark:text-mono-50'
            }`}
          >
            {todo.title}
          </p>
        </div>

        {todo.notes && (
          <p className={`text-xs mt-1 transition-colors duration-200 ${
            isCompleted ? 'text-mono-400 dark:text-mono-600 line-through' : 'text-mono-600 dark:text-mono-400'
          }`}>
            {todo.notes}
          </p>
        )}
      </div>

      {/* Action Buttons: Edit & Delete */}
      <div className="flex items-center gap-1 shrink-0 self-start opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(todo)}
          className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
          title="Edit To-Do"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Hapus to-do "${todo.title}"?`)) {
              onDelete(todo.id);
            }
          }}
          className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
          title="Hapus To-Do"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
