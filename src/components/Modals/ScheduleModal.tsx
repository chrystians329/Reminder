import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, MapPin, User, FileText } from 'lucide-react';
import { SchoolSchedule, DayOfWeek, DAYS_OF_WEEK } from '../../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: Omit<SchoolSchedule, 'id' | 'createdAt'>) => void;
  editingSchedule?: SchoolSchedule | null;
  defaultDay?: DayOfWeek;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  defaultDay = 'Senin'
}) => {
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:30');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingSchedule) {
      setDay(editingSchedule.day);
      setSubject(editingSchedule.subject);
      setStartTime(editingSchedule.startTime);
      setEndTime(editingSchedule.endTime);
      setRoom(editingSchedule.room || '');
      setTeacher(editingSchedule.teacher || '');
      setNotes(editingSchedule.notes || '');
    } else {
      setDay(defaultDay);
      setSubject('');
      setStartTime('07:00');
      setEndTime('08:30');
      setRoom('');
      setTeacher('');
      setNotes('');
    }
  }, [editingSchedule, defaultDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !startTime || !endTime) return;

    onSave({
      day,
      subject: subject.trim(),
      startTime,
      endTime,
      room: room.trim() || undefined,
      teacher: teacher.trim() || undefined,
      notes: notes.trim() || undefined
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">
                {editingSchedule ? 'Edit Mata Pelajaran' : 'Tambah Jadwal Pelajaran'}
              </h2>
              <p className="text-xs text-mono-500">
                Jadwal ini permanen mingguan (Senin - Sabtu) dan tidak akan hilang kecuali dihapus.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Hari & Nama Mapel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
                Hari Pelajaran *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
                Nama Mata Pelajaran *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Matematika Wajib, Fisika, dll"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Jam Mulai & Jam Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Jam Mulai *</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Jam Selesai *</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Ruangan & Guru */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Ruang / Kelas</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: R. 12-IPA-1 / Lab Fisika"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Nama Guru / Pengajar</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pak Bambang, M.Pd"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Catatan / Catatan Tetap */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Catatan Khusus Mapel</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Wajib bawa jas lab & kacamata pengaman setiap praktikum..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              Simpan Jadwal
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
