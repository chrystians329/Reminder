import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { OutOfSchoolEvent, PriorityTier } from '../../types';
import { formatDateKey } from '../../utils/dateUtils';
import { ModalWrapper } from './ModalWrapper';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>) => void;
  editingEvent?: OutOfSchoolEvent | null;
  defaultDate?: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  defaultDate
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [tier, setTier] = useState<PriorityTier>('sedang');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(editingEvent.date);
      setTime(editingEvent.time || '');
      setTier(editingEvent.tier);
      setLocation(editingEvent.location || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || formatDateKey(new Date()));
      setTime('16:00');
      setTier('sedang');
      setLocation('');
    }
  }, [editingEvent, defaultDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      tier,
      location: location.trim() || undefined
    });
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      {/* Modal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
        <h2 className="font-extrabold text-lg tracking-tight">
          {editingEvent ? 'Edit Agenda' : 'Tambah Agenda'}
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
        
        {/* Judul Kegiatan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Nama Kegiatan / Acara *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Nonton bioskop XXI bareng teman, Les Bimbel, Futsal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Tier Prioritas: Penting / Sedang / Tidak */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1.5">
            Tingkat Kepentingan (Tier Prioritas) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTier('penting')}
              className={`p-2.5 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center gap-1 ${
                tier === 'penting'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>PENTING</span>
              <span className="text-[10px] font-normal opacity-75">Prioritas Tinggi</span>
            </button>

            <button
              type="button"
              onClick={() => setTier('sedang')}
              className={`p-2.5 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center gap-1 ${
                tier === 'sedang'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>SEDANG</span>
              <span className="text-[10px] font-normal opacity-75">Reguler</span>
            </button>

            <button
              type="button"
              onClick={() => setTier('tidak')}
              className={`p-2.5 rounded-xl text-xs font-extrabold transition-all border flex flex-col items-center gap-1 ${
                tier === 'tidak'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                  : 'bg-mono-50 dark:bg-mono-950 text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>SANTAI / TIDAK</span>
              <span className="text-[10px] font-normal opacity-75">Fleksibel</span>
            </button>
          </div>
        </div>

        {/* Tanggal & Waktu Acara */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Tanggal Acara *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
              Jam Acara
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>
        </div>

        {/* Lokasi */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Lokasi / Tempat
          </label>
          <input
            type="text"
            placeholder="Contoh: Mall Grand Indonesia XXI, Rumah Teman, GOR Futsal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
          />
        </div>

        {/* Catatan Tambahan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300 mb-1">
            Catatan / Informasi Tambahan
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Bawa baju ganti, kumpul jam 15.30 di lobi..."
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
            Simpan Agenda
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
