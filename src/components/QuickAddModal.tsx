import React from 'react';
import { X, CheckSquare, BookOpen, Sparkles } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: 'task' | 'schedule' | 'event') => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-mono-100 dark:border-mono-800">
          <h2 className="font-extrabold text-base tracking-tight">
            Tambah Apa Hari Ini?
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-mono-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Option 1: Tugas & PR */}
          <button
            onClick={() => {
              onClose();
              onSelectOption('task');
            }}
            className="w-full p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 hover:border-black dark:hover:border-white bg-mono-50 dark:bg-mono-950 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm group-hover:underline">
                Tugas / PR Sekolah
              </p>
              <p className="text-[11px] text-mono-500">
                PR mtk, tugas kelompok, presentasi, atau rangkuman.
              </p>
            </div>
          </button>

          {/* Option 2: Jadwal Pelajaran Tetap */}
          <button
            onClick={() => {
              onClose();
              onSelectOption('schedule');
            }}
            className="w-full p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 hover:border-black dark:hover:border-white bg-mono-50 dark:bg-mono-950 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm group-hover:underline">
                Jadwal Pelajaran (Senin-Sabtu)
              </p>
              <p className="text-[11px] text-mono-500">
                Mata pelajaran mingguan yang permanen & tidak hilang.
              </p>
            </div>
          </button>

          {/* Option 3: Agenda Luar Sekolah */}
          <button
            onClick={() => {
              onClose();
              onSelectOption('event');
            }}
            className="w-full p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 hover:border-black dark:hover:border-white bg-mono-50 dark:bg-mono-950 flex items-center gap-3.5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm group-hover:underline">
                Agenda di Luar Sekolah
              </p>
              <p className="text-[11px] text-mono-500">
                Nonton film, bimbel, futsal, acara teman (Tier Penting/Sedang/Santai).
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
