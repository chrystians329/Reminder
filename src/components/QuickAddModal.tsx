import React from 'react';
import { X } from 'lucide-react';
import { BulkType } from './Modals/BulkAddModal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (type: 'task' | 'schedule' | 'event') => void;
  onSelectBulkOption: (type: BulkType) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectOption,
  onSelectBulkOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-mono-100 dark:border-mono-800">
          <h2 className="font-extrabold text-base tracking-tight">
            Tambah Data
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-mono-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          
          {/* Section 1: Tugas & PR */}
          <div className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-950 space-y-2">
            <p className="font-extrabold text-sm">Tugas & PR</p>
            <div className="flex items-center gap-2 pt-1 border-t border-mono-200 dark:border-mono-800">
              <button
                onClick={() => {
                  onClose();
                  onSelectOption('task');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs text-center"
              >
                + Satuan
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectBulkOption('task');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl border border-mono-300 dark:border-mono-700 font-bold text-xs text-center hover:border-black dark:hover:border-white"
              >
                + Massal
              </button>
            </div>
          </div>

          {/* Section 2: Jadwal */}
          <div className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-950 space-y-2">
            <p className="font-extrabold text-sm">Jadwal (Senin - Sabtu)</p>
            <div className="flex items-center gap-2 pt-1 border-t border-mono-200 dark:border-mono-800">
              <button
                onClick={() => {
                  onClose();
                  onSelectOption('schedule');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs text-center"
              >
                + Satuan
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectBulkOption('schedule');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl border border-mono-300 dark:border-mono-700 font-bold text-xs text-center hover:border-black dark:hover:border-white"
              >
                + Massal
              </button>
            </div>
          </div>

          {/* Section 3: Agenda Luar */}
          <div className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50 dark:bg-mono-950 space-y-2">
            <p className="font-extrabold text-sm">Agenda Luar</p>
            <div className="flex items-center gap-2 pt-1 border-t border-mono-200 dark:border-mono-800">
              <button
                onClick={() => {
                  onClose();
                  onSelectOption('event');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs text-center"
              >
                + Satuan
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectBulkOption('event');
                }}
                className="flex-1 py-1.5 px-3 rounded-xl border border-mono-300 dark:border-mono-700 font-bold text-xs text-center hover:border-black dark:hover:border-white"
              >
                + Massal
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
