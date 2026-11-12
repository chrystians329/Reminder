import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataChanged
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const json = StorageService.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reminder-pelajar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'File cadangan berhasil diunduh!' });
  };

  const handleCopy = () => {
    const json = StorageService.exportBackupJSON();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMessage({ type: 'success', text: 'Data JSON berhasil disalin ke papan klip!' });
  };

  const handleImportText = () => {
    if (!importJsonText.trim()) {
      setMessage({ type: 'error', text: 'Harap tempelkan teks JSON cadangan terlebih dahulu.' });
      return;
    }

    const success = StorageService.importBackupJSON(importJsonText);
    if (success) {
      setMessage({ type: 'success', text: 'Data berhasil dipulihkan!' });
      onDataChanged();
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: 'Format data JSON tidak valid!' });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Apakah kamu yakin ingin mengembalikan data ke contoh bawaan awal? Semua jadwal dan tugas saat ini akan di-reset.')) {
      StorageService.resetDefaults();
      setMessage({ type: 'success', text: 'Data berhasil di-reset ke sample bawaan!' });
      onDataChanged();
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
          <div>
            <h2 className="font-extrabold text-lg tracking-tight">
              Cadangan & Ekspor Data
            </h2>
            <p className="text-xs text-mono-500">
              Simpan data jadwal, tugas, dan kegiatan agar tidak pernah hilang.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold ${
            message.type === 'success'
              ? 'bg-mono-200 text-mono-900 dark:bg-mono-800 dark:text-mono-100'
              : 'bg-black text-white dark:bg-white dark:text-black'
          }`}>
            <span>{message.text}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300">
            Ekspor Data Saya
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold text-center hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              Unduh File .JSON
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold text-center transition-colors"
            >
              {copied ? 'Tersalin!' : 'Salin JSON'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-2 pt-3 border-t border-mono-100 dark:border-mono-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300">
            Impor / Pulihkan Data
          </label>
          <textarea
            rows={3}
            placeholder="Tempelkan kode JSON cadangan kamu di sini untuk memulihkan..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
          />
          <button
            onClick={handleImportText}
            className="w-full py-2.5 px-3 rounded-xl border border-black dark:border-white bg-mono-100 dark:bg-mono-800 text-black dark:text-white text-xs font-bold text-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            Pulihkan Data dari JSON
          </button>
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-mono-100 dark:border-mono-800 flex items-center justify-between">
          <span className="text-xs text-mono-500">Mulai dari contoh awal?</span>
          <button
            onClick={handleResetDefaults}
            className="text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white underline"
          >
            Muat Data Contoh Bawaan
          </button>
        </div>

      </div>
    </div>
  );
};
