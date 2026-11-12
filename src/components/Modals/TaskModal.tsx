import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TaskItem, SchoolSchedule } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => void;
  editingTask?: TaskItem | null;
  schedules: SchoolSchedule[];
  initialSubject?: string;
  initialDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  schedules,
  initialSubject,
  initialDate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');

  // Collect unique subjects
  const availableSubjects = Array.from(new Set(schedules.map(s => s.subject)));

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setSubjectName(editingTask.subjectName || '');
      setDueDate(editingTask.dueDate || '');
      setDueTime(editingTask.dueTime || '');
    } else {
      setTitle('');
      setDescription('');
      setSubjectName(initialSubject || (availableSubjects[0] || ''));
      setDueDate(initialDate || '');
      setDueTime('');
    }
  }, [editingTask, initialSubject, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      subjectName: subjectName.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: (dueDate && dueTime) ? dueTime : undefined,
      subTasks: editingTask?.subTasks
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
          <h2 className="font-extrabold text-lg tracking-tight">
            {editingTask ? 'Edit Tugas' : 'Tambah Tugas'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Judul Tugas / PR *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PR Matematika Halaman 45"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Hubungkan dengan Jadwal / Mapel */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Mata Pelajaran (Opsional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="">-- Pilih dari Jadwal --</option>
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Atau ketik mapel lain..."
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Tanggal & Waktu Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300">
                  Tanggal (Opsional)
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-[10px] font-semibold text-mono-400 hover:text-black dark:hover:text-white"
                  >
                    Kosongkan
                  </button>
                )}
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
                Jam (Opsional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={!dueDate}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Detail / Catatan PR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan catatan jika ada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-mono-100 dark:border-mono-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-mono-300 dark:border-mono-700 text-xs font-bold hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Simpan
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
