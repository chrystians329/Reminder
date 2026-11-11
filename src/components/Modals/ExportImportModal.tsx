import React, { useState } from 'react';
import { X, DownloadCloud, UploadCloud, Copy, Check, RotateCcw, ShieldCheck } from 'lucide-react';
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">
                Cadangan & Ekspor Data
              </h2>
              <p className="text-xs text-mono-500">
                Simpan data jadwal, tugas, dan kegiatan agar tidak pernah hilang.
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

        {message && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-mono-200 text-mono-900 dark:bg-mono-800 dark:text-mono-100'
              : 'bg-black text-white dark:bg-white dark:text-black'
          }`}>
            <ShieldCheck className="w-4 h-4" />
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
              className="py-2.5 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Unduh File .JSON</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
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
            className="w-full py-2.5 px-3 rounded-xl border border-black dark:border-white bg-mono-100 dark:bg-mono-800 text-black dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Pulihkan Data dari JSON</span>
          </button>
        </div>

        {/* Reset Section */}
        <div className="pt-3 border-t border-mono-100 dark:border-mono-800 flex items-center justify-between">
          <span className="text-xs text-mono-500">Mulai dari contoh awal?</span>
          <button
            onClick={handleResetDefaults}
            className="text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white flex items-center gap-1 underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Muat Data Contoh Bawaan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
