import React, { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Check, Copy, Wifi, WifiOff } from 'lucide-react';
import { SyncService, SyncStatus } from '../../services/syncService';
import { ModalWrapper } from './ModalWrapper';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<SyncStatus>(SyncService.getStatus());
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = SyncService.subscribeStatus(setStatus);
    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateNew = () => {
    const code = SyncService.generateRandomCode();
    SyncService.setRoomCode(code);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    SyncService.setRoomCode(inputCode.trim());
    setInputCode('');
  };

  const handleDisconnect = () => {
    if (confirm('Putuskan koneksi sinkronisasi dengan perangkat lain?')) {
      SyncService.setRoomCode(null);
    }
  };

  const handleCopyCode = () => {
    if (!status.roomCode) return;
    navigator.clipboard.writeText(status.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mono-100 dark:bg-mono-800 flex items-center justify-center">
              {status.isOnline ? (
                <Wifi className="w-4 h-4 text-mono-900 dark:text-mono-100" />
              ) : (
                <WifiOff className="w-4 h-4 text-mono-400" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">
                Sinkronisasi HP & Laptop
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  status.isOnline ? 'bg-black dark:bg-white animate-pulse' : 'bg-mono-400'
                }`} />
                <span className="text-mono-500 font-medium">
                  {status.isOnline ? 'Online' : 'Offline (Tersimpan Lokal)'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pairing Visual Status */}
        <div className="p-4 rounded-2xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 space-y-3">
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl border border-mono-300 dark:border-mono-700 bg-white dark:bg-mono-900 flex items-center justify-center shadow-sm">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-mono-600 dark:text-mono-400">Desktop</span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status.isPaired 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400'
              }`}>
                {status.isPaired ? 'Real-time' : 'Belum Terhubung'}
              </div>
              <div className="w-16 border-t-2 border-dashed border-mono-300 dark:border-mono-700 my-2" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl border border-mono-300 dark:border-mono-700 bg-white dark:bg-mono-900 flex items-center justify-center shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-mono-600 dark:text-mono-400">Mobile</span>
            </div>
          </div>

          {status.isPaired && status.roomCode && (
            <div className="pt-2 border-t border-mono-200 dark:border-mono-800 text-center space-y-2">
              <span className="text-xs text-mono-500 font-medium block">
                Kode Sinkronisasi Perangkat Ini:
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="px-4 py-1.5 rounded-xl bg-white dark:bg-mono-900 border border-mono-300 dark:border-mono-700 font-mono font-black text-lg tracking-widest select-all">
                  {status.roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white text-xs font-bold transition-colors"
                  title="Salin Kode"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {status.lastSyncedAt && (
                <span className="text-[10px] text-mono-400 block font-mono">
                  Terakhir sinkron: {status.lastSyncedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pairing Actions */}
        {!status.isPaired ? (
          <div className="space-y-4">
            <div>
              <button
                onClick={handleGenerateNew}
                className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                + Buat Kode Sinkronisasi Baru
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 border-t border-mono-200 dark:border-mono-800" />
              <span className="text-[10px] uppercase font-bold text-mono-400">atau</span>
              <div className="flex-1 border-t border-mono-200 dark:border-mono-800" />
            </div>

            <form onSubmit={handleJoin} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-600 dark:text-mono-400">
                Masukkan Kode dari Perangkat Lain
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Contoh: RM-9482"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-300 dark:border-mono-700 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase"
                />
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="px-4 py-2 rounded-xl border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold text-xs disabled:opacity-40 transition-all"
                >
                  Hubungkan
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="pt-2">
            <button
              onClick={handleDisconnect}
              className="w-full py-2 px-4 rounded-xl border border-mono-300 dark:border-mono-700 text-xs font-bold text-mono-700 dark:text-mono-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            >
              Putuskan Sambungan
            </button>
          </div>
        )}

    </ModalWrapper>
  );
};

