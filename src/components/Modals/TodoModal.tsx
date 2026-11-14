import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TodoItem, TodoRepeatType, AllDayOfWeek, ALL_DAYS_OF_WEEK } from '../../types';
import { formatDateKey } from '../../utils/dateUtils';
import { ModalWrapper } from './ModalWrapper';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'completedDates'>) => void;
  editingTodo?: TodoItem | null;
  defaultDate?: string;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  defaultDate
}) => {
  const [title, setTitle] = useState('');
  const [repeatType, setRepeatType] = useState<TodoRepeatType>('daily');
  const [repeatDays, setRepeatDays] = useState<AllDayOfWeek[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  const [targetDate, setTargetDate] = useState<string>(defaultDate || formatDateKey(new Date()));
  const [time, setTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setRepeatType(editingTodo.repeatType);
      setRepeatDays(editingTodo.repeatDays || ['Senin']);
      setTargetDate(editingTodo.targetDate || formatDateKey(new Date()));
      setTime(editingTodo.time || '');
      setNotes(editingTodo.notes || '');
    } else {
      setTitle('');
      setRepeatType('daily');
      setRepeatDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
      setTargetDate(defaultDate || formatDateKey(new Date()));
      setTime('');
      setNotes('');
    }
  }, [editingTodo, defaultDate, isOpen]);

  const toggleDay = (day: AllDayOfWeek) => {
    setRepeatDays(prev => 
      prev.includes(day)
        ? prev.length > 1 ? prev.filter(d => d !== day) : prev // keep at least 1 day
        : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      repeatType,
      repeatDays: repeatType === 'specific_days' ? repeatDays : undefined,
      targetDate: repeatType === 'once' ? targetDate : undefined,
      time: time || undefined,
      notes: notes.trim() || undefined
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
        <h2 className="font-extrabold text-lg tracking-tight">
          {editingTodo ? 'Edit To-Do List' : 'Tambah To-Do List'}
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
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Kegiatan / To-Do *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Olahraga Pagi, Baca Buku, Merapikan Meja"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Repeat Type Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-2">
            Perulangan Kegiatan
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRepeatType('daily')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                repeatType === 'daily'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              Setiap Hari
            </button>

            <button
              type="button"
              onClick={() => setRepeatType('specific_days')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                repeatType === 'specific_days'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              Hari Tertentu
            </button>

            <button
              type="button"
              onClick={() => setRepeatType('once')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                repeatType === 'once'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              Hanya Sekali
            </button>
          </div>
        </div>

        {/* Specific Days Picker (if repeatType === 'specific_days') */}
        {repeatType === 'specific_days' && (
          <div className="p-3 rounded-2xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 space-y-2">
            <span className="text-[11px] font-bold text-mono-600 dark:text-mono-400 block">
              Pilih hari kemunculan to-do (bisa lebih dari satu hari):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS_OF_WEEK.map((d) => {
                const isSelected = repeatDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                        : 'bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-mono-600 dark:text-mono-400'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Target Date Picker (if repeatType === 'once') */}
        {repeatType === 'once' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Tanggal Pelaksanaan *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
        )}

        {/* Time (optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Jam / Waktu (Opsional)
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Target durasi, perlengkapan, atau pengingat kecil..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
          />
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-mono-100 dark:border-mono-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {editingTodo ? 'Simpan Perubahan' : 'Tambah To-Do'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
