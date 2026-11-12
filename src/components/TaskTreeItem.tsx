import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Check,
  Edit2
} from 'lucide-react';
import { TaskItem, SubTaskItem } from '../types';
import { formatRelativeDate, isTaskOverdue } from '../utils/dateUtils';

export function getSubTaskStats(items?: SubTaskItem[]): { total: number; completed: number } {
  if (!items || items.length === 0) return { total: 0, completed: 0 };
  let total = 0;
  let completed = 0;
  for (const item of items) {
    total += 1;
    if (item.completed) completed += 1;
    if (item.subTasks && item.subTasks.length > 0) {
      const childStats = getSubTaskStats(item.subTasks);
      total += childStats.total;
      completed += childStats.completed;
    }
  }
  return { total, completed };
}

export function toggleSubTaskRecursive(items: SubTaskItem[], targetId: string): SubTaskItem[] {
  return items.map(item => {
    if (item.id === targetId) {
      return { ...item, completed: !item.completed };
    }
    if (item.subTasks && item.subTasks.length > 0) {
      return { ...item, subTasks: toggleSubTaskRecursive(item.subTasks, targetId) };
    }
    return item;
  });
}

export function addSubTaskRecursive(items: SubTaskItem[], parentId: string, newItem: SubTaskItem): SubTaskItem[] {
  return items.map(item => {
    if (item.id === parentId) {
      return {
        ...item,
        subTasks: [...(item.subTasks || []), newItem]
      };
    }
    if (item.subTasks && item.subTasks.length > 0) {
      return {
        ...item,
        subTasks: addSubTaskRecursive(item.subTasks, parentId, newItem)
      };
    }
    return item;
  });
}

export function deleteSubTaskRecursive(items: SubTaskItem[], targetId: string): SubTaskItem[] {
  return items
    .filter(item => item.id !== targetId)
    .map(item => ({
      ...item,
      subTasks: item.subTasks ? deleteSubTaskRecursive(item.subTasks, targetId) : undefined
    }));
}

interface SubTaskNodeProps {
  subTask: SubTaskItem;
  level: number;
  onToggle: (id: string) => void;
  onAddChild: (parentId: string, title: string) => void;
  onDelete: (id: string) => void;
}

const SubTaskNode: React.FC<SubTaskNodeProps> = ({
  subTask,
  level,
  onToggle,
  onAddChild,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');

  const hasChildren = subTask.subTasks && subTask.subTasks.length > 0;
  const childStats = getSubTaskStats(subTask.subTasks);

  const handleCreateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildTitle.trim()) return;
    onAddChild(subTask.id, newChildTitle.trim());
    setNewChildTitle('');
    setIsAddingChild(false);
    setIsExpanded(true);
  };

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex items-center gap-1.5 group/sub py-0.5">
        {/* Expand / Collapse Button or Spacer */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 -ml-1 text-mono-400 hover:text-black dark:hover:text-white rounded transition-colors"
            title={isExpanded ? "Tutup Poin" : "Buka Poin"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 h-3.5 flex items-center justify-center text-mono-400 text-[10px]">
            •
          </span>
        )}

        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(subTask.id)}
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
            subTask.completed
              ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
              : 'border-mono-400 dark:border-mono-600 hover:border-black dark:hover:border-white bg-transparent'
          }`}
        >
          {subTask.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Title */}
        <span
          onClick={() => onToggle(subTask.id)}
          className={`cursor-pointer select-none flex-1 font-medium transition-all ${
            subTask.completed
              ? 'line-through text-mono-400 dark:text-mono-600'
              : 'text-mono-800 dark:text-mono-200 hover:text-black dark:hover:text-white'
          }`}
        >
          {subTask.title}
        </span>

        {/* Collapsed Badge if any */}
        {!isExpanded && hasChildren && (
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400 font-bold">
            {childStats.completed}/{childStats.total}
          </span>
        )}

        {/* Actions: Add Sub-Point & Delete */}
        <div className="opacity-0 group-hover/sub:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            type="button"
            onClick={() => setIsAddingChild(true)}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-mono-500 hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
            title="Tambah Sub-Poin"
          >
            + Poin
          </button>
          <button
            type="button"
            onClick={() => onDelete(subTask.id)}
            className="p-1 rounded text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-200 dark:hover:bg-mono-800 transition-colors"
            title="Hapus Poin"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Input to add sub-point */}
      {isAddingChild && (
        <form onSubmit={handleCreateChild} className="flex items-center gap-1.5 pl-5 pt-1">
          <input
            type="text"
            autoFocus
            placeholder="Ketik sub-poin..."
            value={newChildTitle}
            onChange={(e) => setNewChildTitle(e.target.value)}
            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-mono-50 dark:bg-mono-950 border border-mono-300 dark:border-mono-700 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
          <button
            type="submit"
            className="px-2 py-1 text-xs font-bold rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingChild(false);
              setNewChildTitle('');
            }}
            className="px-2 py-1 text-xs font-semibold rounded-lg text-mono-500 hover:text-black dark:hover:text-white"
          >
            Batal
          </button>
        </form>
      )}

      {/* Children list */}
      {hasChildren && isExpanded && (
        <div className="pl-4 sm:pl-5 border-l border-mono-200 dark:border-mono-800 ml-1.5 space-y-1.5 pt-1">
          {subTask.subTasks!.map(child => (
            <SubTaskNode
              key={child.id}
              subTask={child}
              level={level + 1}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskTreeItemProps {
  task: TaskItem;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onToggleTask: (id: string) => void;
  onUpdateSubTasks: (taskId: string, subTasks: SubTaskItem[]) => void;
  onEdit?: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}

export const TaskTreeItem: React.FC<TaskTreeItemProps> = ({
  task,
  isSelected,
  onToggleSelect,
  onToggleTask,
  onUpdateSubTasks,
  onEdit,
  onDelete
}) => {
  const [isTreeExpanded, setIsTreeExpanded] = useState(true);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [newPointTitle, setNewPointTitle] = useState('');

  const overdue = task.dueDate ? isTaskOverdue(task.dueDate, task.dueTime, task.completed) : false;
  const stats = getSubTaskStats(task.subTasks);
  const hasSubTasks = task.subTasks && task.subTasks.length > 0;

  // Metadata parts: subject, deadline info
  const metaParts: string[] = [];
  if (task.subjectName) metaParts.push(task.subjectName);
  if (task.dueDate) {
    const rel = formatRelativeDate(task.dueDate);
    metaParts.push(task.dueTime ? `${rel} (${task.dueTime})` : rel);
  } else {
    metaParts.push('Tanpa deadline');
  }

  const handleToggleSubTask = (subTaskId: string) => {
    if (!task.subTasks) return;
    const nextSubTasks = toggleSubTaskRecursive(task.subTasks, subTaskId);
    onUpdateSubTasks(task.id, nextSubTasks);
  };

  const handleAddChildSubTask = (parentId: string, title: string) => {
    if (!task.subTasks) return;
    const newItem: SubTaskItem = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      completed: false
    };
    const nextSubTasks = addSubTaskRecursive(task.subTasks, parentId, newItem);
    onUpdateSubTasks(task.id, nextSubTasks);
  };

  const handleDeleteSubTask = (subTaskId: string) => {
    if (!task.subTasks) return;
    const nextSubTasks = deleteSubTaskRecursive(task.subTasks, subTaskId);
    onUpdateSubTasks(task.id, nextSubTasks);
  };

  const handleCreateTopLevelPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointTitle.trim()) return;
    const newItem: SubTaskItem = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: newPointTitle.trim(),
      completed: false
    };
    const current = task.subTasks || [];
    onUpdateSubTasks(task.id, [...current, newItem]);
    setNewPointTitle('');
    setIsAddingPoint(false);
    setIsTreeExpanded(true);
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        task.completed
          ? 'bg-mono-50/70 dark:bg-mono-900/30 border-mono-200 dark:border-mono-800/80 opacity-75'
          : overdue
          ? 'bg-white dark:bg-mono-900 border-mono-900 dark:border-mono-100 shadow-sm'
          : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400 dark:hover:border-mono-600 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Bulk selection checkbox (if provided) */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="mt-1 w-4 h-4 rounded border-mono-300 dark:border-mono-700 text-black focus:ring-0 cursor-pointer"
          />
        )}

        {/* Task completion checkbox */}
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
              : 'border-mono-400 dark:border-mono-600 hover:border-black dark:hover:border-white bg-transparent'
          }`}
          title={task.completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Main Title & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h3
              onClick={() => onToggleTask(task.id)}
              className={`font-bold text-sm sm:text-base tracking-tight cursor-pointer ${
                task.completed ? 'line-through text-mono-400 dark:text-mono-600' : ''
              }`}
            >
              {task.title}
            </h3>

            {/* Overdue Badge */}
            {overdue && !task.completed && (
              <span className="self-start text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black shrink-0">
                Terlambat
              </span>
            )}
          </div>

          {/* Subtitle / Meta with ~ separator */}
          <div className="text-xs text-mono-500 font-medium">
            {metaParts.join(' ~ ')}
          </div>

          {/* Description (if present) */}
          {task.description && (
            <p className="text-xs text-mono-600 dark:text-mono-400 bg-mono-50 dark:bg-mono-950/70 p-2.5 rounded-xl border border-mono-100 dark:border-mono-800">
              {task.description}
            </p>
          )}

          {/* Sub-Tasks / Points Section */}
          <div className="pt-1.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-mono-500">
              <div className="flex items-center gap-1.5">
                {hasSubTasks && (
                  <button
                    type="button"
                    onClick={() => setIsTreeExpanded(!isTreeExpanded)}
                    className="p-1 -ml-1 text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white rounded transition-colors inline-flex items-center gap-1"
                    title={isTreeExpanded ? "Tutup Poin" : "Buka Poin"}
                  >
                    {isTreeExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[11px] font-bold">
                      {isTreeExpanded ? 'Tutup Poin' : 'Buka Poin'}
                    </span>
                  </button>
                )}

                {hasSubTasks && (
                  <span className="text-[11px] font-semibold text-mono-400">
                    ({stats.completed}/{stats.total} selesai)
                  </span>
                )}
              </div>

              {/* Add Top-Level Sub-Point Button */}
              <button
                type="button"
                onClick={() => setIsAddingPoint(true)}
                className="text-[11px] font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Poin</span>
              </button>
            </div>

            {/* Input to add top-level sub-point */}
            {isAddingPoint && (
              <form onSubmit={handleCreateTopLevelPoint} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik poin tugas..."
                  value={newPointTitle}
                  onChange={(e) => setNewPointTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-300 dark:border-mono-700 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPoint(false);
                    setNewPointTitle('');
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl text-mono-500 hover:text-black dark:hover:text-white"
                >
                  Batal
                </button>
              </form>
            )}

            {/* Render subtasks tree */}
            {hasSubTasks && isTreeExpanded && (
              <div className="space-y-1.5 pt-1 pl-1">
                {task.subTasks!.map(sub => (
                  <SubTaskNode
                    key={sub.id}
                    subTask={sub}
                    level={0}
                    onToggle={handleToggleSubTask}
                    onAddChild={handleAddChildSubTask}
                    onDelete={handleDeleteSubTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center gap-1 self-start shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
              title="Edit Tugas"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
            title="Hapus Tugas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
