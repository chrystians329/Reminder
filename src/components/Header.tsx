import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  DownloadCloud, 
  Menu, 
  X, 
  Bell, 
  Wifi, 
  WifiOff, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Upload
} from 'lucide-react';
import { ActiveTab } from '../types';
import { AppSettings } from '../services/storage';
import { SoundService } from '../services/soundService';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuickAdd: () => void;
  onOpenExportImport: () => void;
  onOpenSync: () => void;
  pendingTasksCount: number;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  isOnline: boolean;
  isPaired: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  onToggleDarkMode,
  onOpenQuickAdd,
  onOpenExportImport,
  onOpenSync,
  pendingTasksCount,
  settings,
  onUpdateSettings,
  isOnline,
  isPaired
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosingMenu, setIsClosingMenu] = useState(false);
  const [notifExpanded, setNotifExpanded] = useState(false);

  const navItems: { id: ActiveTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Hari Ini' },
    { id: 'schedule', label: 'Jadwal' },
    { id: 'tasks', label: 'Tugas & PR', badge: pendingTasksCount },
    { id: 'events', label: 'Agenda Luar' },
    { id: 'calendar', label: 'Kalender' },
  ];

  const closeMenu = () => {
    setIsClosingMenu(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosingMenu(false);
    }, 150);
  };

  const handleToggleTaskNotif = async () => {
    const next = !settings.notifyTaskEnabled;
    onUpdateSettings({ notifyTaskEnabled: next });
  };

  const handleToggleEventNotif = async () => {
    const next = !settings.notifyEventEnabled;
    onUpdateSettings({ notifyEventEnabled: next });
  };

  const handleAddEventReminder = () => {
    const current = settings.notifyEventReminders || [{ hDays: 1 }];
    const usedDays = new Set(current.map(r => r.hDays));
    let newHDays = 1;
    while (usedDays.has(newHDays)) newHDays++;
    onUpdateSettings({ notifyEventReminders: [...current, { hDays: newHDays }] });
  };

  const handleRemoveEventReminder = (index: number) => {
    const current = settings.notifyEventReminders || [{ hDays: 1 }];
    if (current.length <= 1) return;
    const next = current.filter((_, i) => i !== index);
    onUpdateSettings({ notifyEventReminders: next });
  };

  const handleUpdateEventReminderHDays = (index: number, hDays: number) => {
    const current = [...(settings.notifyEventReminders || [{ hDays: 1 }])];
    current[index] = { ...current[index], hDays };
    onUpdateSettings({ notifyEventReminders: current });
  };

  const handleSoundTypeChange = (soundType: 'system' | 'chime' | 'bell' | 'ping' | 'custom') => {
    onUpdateSettings({ soundType });
    SoundService.playSelectedSound(soundType, settings.customSoundDataUri);
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file audio maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onUpdateSettings({
        soundType: 'custom',
        customSoundDataUri: result,
        customSoundName: file.name
      });
      SoundService.playCustomAudio(result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetSound = () => {
    onUpdateSettings({
      soundType: 'system',
      notificationSound: true,
      customSoundDataUri: undefined,
      customSoundName: undefined
    });
    SoundService.playSelectedSound('system');
  };

  const Toggle: React.FC<{ checked: boolean; onChange: () => void; small?: boolean }> = ({ checked, onChange, small }) => (
    <div
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        small ? 'h-5 w-9' : 'h-6 w-11'
      } ${checked ? 'bg-black dark:bg-white' : 'bg-mono-300 dark:bg-mono-700'}`}
    >
      <span
        className={`pointer-events-none inline-block transform rounded-full bg-white dark:bg-black shadow-md transition duration-200 ease-in-out ${
          small ? 'h-4 w-4' : 'h-5 w-5'
        } ${checked ? (small ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'}`}
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-mono-950/95 backdrop-blur-md border-b border-mono-200 dark:border-mono-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-black tracking-tighter text-base shadow-sm border border-mono-900 dark:border-mono-100">
            R
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight">
              REMINDER
            </span>
            <span 
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-black dark:bg-white' : 'bg-mono-400'}`} 
              title={isOnline ? (isPaired ? 'Online & Terhubung' : 'Online') : 'Offline (Tersimpan Lokal)'} 
            />
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-mono-900 text-white dark:bg-mono-100 dark:text-mono-950 shadow-sm'
                    : 'text-mono-600 dark:text-mono-300 hover:text-mono-950 dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-900'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white text-mono-950 dark:bg-mono-900 dark:text-mono-50'
                      : 'bg-mono-200 text-mono-800 dark:bg-mono-800 dark:text-mono-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="relative flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all text-xs font-bold shadow-sm"
          >
            + Tambah
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => {
              if (isMenuOpen) {
                closeMenu();
              } else {
                setIsMenuOpen(true);
              }
            }}
            className="p-2 rounded-lg text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-900 transition-colors border border-transparent hover:border-mono-200 dark:hover:border-mono-800"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Hamburger Dropdown Menu */}
          {isMenuOpen && (
            <>
              {/* Overlay for outside click */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={closeMenu} 
              />

              <div 
                className={`absolute right-0 top-14 w-80 max-h-[85vh] overflow-y-auto bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl shadow-2xl p-3 z-50 space-y-1.5 ${
                  isClosingMenu 
                    ? 'animate-out fade-out zoom-out-95 duration-150' 
                    : 'animate-in fade-in zoom-in-95 duration-150'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Dark Mode Toggle */}
                <div 
                  onClick={onToggleDarkMode}
                  className="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-mono-100 dark:hover:bg-mono-800/60 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-mono-800 dark:text-mono-200">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <Toggle checked={darkMode} onChange={onToggleDarkMode} />
                </div>

                {/* 2. Notif Section */}
                <div className="px-3 py-2.5 rounded-2xl bg-mono-50/70 dark:bg-mono-950/70 border border-mono-100 dark:border-mono-800/80 transition-colors">
                  <div 
                    onClick={() => setNotifExpanded(!notifExpanded)}
                    className="flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-mono-800 dark:text-mono-200">
                      <Bell className="w-4 h-4" />
                      <span>Notif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${(settings.notifyTaskEnabled || settings.notifyEventEnabled) ? 'bg-black dark:bg-white' : 'bg-mono-400'}`} />
                      {notifExpanded ? <ChevronUp className="w-3.5 h-3.5 text-mono-500" /> : <ChevronDown className="w-3.5 h-3.5 text-mono-500" />}
                    </div>
                  </div>

                  {notifExpanded && (
                    <div className="mt-3 space-y-3 pt-2 border-t border-mono-200 dark:border-mono-800" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Suara Notifikasi */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-mono-700 dark:text-mono-300 flex items-center gap-1.5">
                            {settings.notificationSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-mono-400" />}
                            <span>Suara Notifikasi</span>
                          </span>
                          <Toggle 
                            checked={settings.notificationSound} 
                            onChange={() => onUpdateSettings({ notificationSound: !settings.notificationSound })} 
                            small 
                          />
                        </div>

                        {settings.notificationSound && (
                          <div className="pl-1 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-mono-500">Nada Dering</span>
                              <div className="flex items-center gap-1">
                                <select
                                  value={settings.soundType || 'system'}
                                  onChange={(e) => handleSoundTypeChange(e.target.value as 'system' | 'chime' | 'bell' | 'ping' | 'custom')}
                                  className="text-[10px] font-bold bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-700 rounded-lg px-2 py-1 text-mono-800 dark:text-mono-200"
                                >
                                  <option value="system">Bawaan HP / Default</option>
                                  <option value="chime">Lonceng Melodi</option>
                                  <option value="bell">Genta Bell</option>
                                  <option value="ping">Ping Jernih</option>
                                  <option value="custom">File Audio Kustom</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => SoundService.playSelectedSound(settings.soundType, settings.customSoundDataUri)}
                                  className="p-1 rounded-lg bg-mono-200 dark:bg-mono-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                  title="Putar Suara"
                                >
                                  <Play className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Custom Sound Upload */}
                            {settings.soundType === 'custom' && (
                              <div className="space-y-1 p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-mono-500 truncate max-w-[140px]">
                                    {settings.customSoundName || 'Belum ada file'}
                                  </span>
                                  <label className="cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1 hover:opacity-80">
                                    <Upload className="w-2.5 h-2.5" />
                                    <span>Pilih Audio</span>
                                    <input 
                                      type="file" 
                                      accept="audio/*" 
                                      onChange={handleCustomAudioUpload}
                                      className="hidden" 
                                    />
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* Reset Sound to Default */}
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleResetSound}
                                className="text-[10px] font-semibold text-mono-500 hover:text-black dark:hover:text-white flex items-center gap-1 underline"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Reset ke Suara Bawaan</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-mono-200 dark:border-mono-800" />

                      {/* Tugas Notifications */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-mono-700 dark:text-mono-300">Tugas</span>
                          <Toggle checked={settings.notifyTaskEnabled} onChange={handleToggleTaskNotif} small />
                        </div>
                        
                        {settings.notifyTaskEnabled && (
                          <div className="pl-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-mono-500">Jam notif</span>
                              <input
                                type="time"
                                value={settings.notifyTaskTime}
                                onChange={(e) => onUpdateSettings({ notifyTaskTime: e.target.value })}
                                className="text-[10px] font-mono font-bold bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-700 rounded-lg px-2 py-1 text-mono-800 dark:text-mono-200 w-20"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-mono-500">H-minus</span>
                              <select
                                value={settings.notifyTaskHDays}
                                onChange={(e) => onUpdateSettings({ notifyTaskHDays: Number(e.target.value) })}
                                className="text-[10px] font-bold bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-700 rounded-lg px-2 py-1 text-mono-800 dark:text-mono-200"
                              >
                                {[1, 2, 3, 5, 7].map(d => (
                                  <option key={d} value={d}>H-{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-mono-200 dark:border-mono-800" />

                      {/* Agenda Luar Notifications */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-mono-700 dark:text-mono-300">Agenda Luar</span>
                          <Toggle checked={settings.notifyEventEnabled} onChange={handleToggleEventNotif} small />
                        </div>
                        
                        {settings.notifyEventEnabled && (
                          <div className="pl-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-mono-500">Jam notif</span>
                              <input
                                type="time"
                                value={settings.notifyEventTime}
                                onChange={(e) => onUpdateSettings({ notifyEventTime: e.target.value })}
                                className="text-[10px] font-mono font-bold bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-700 rounded-lg px-2 py-1 text-mono-800 dark:text-mono-200 w-20"
                              />
                            </div>
                            
                            {/* Multiple H-minus reminders */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-mono-500">Pengingat</span>
                              {(settings.notifyEventReminders || [{ hDays: 1 }]).map((reminder, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <select
                                    value={reminder.hDays}
                                    onChange={(e) => handleUpdateEventReminderHDays(idx, Number(e.target.value))}
                                    className="text-[10px] font-bold bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-700 rounded-lg px-2 py-1 text-mono-800 dark:text-mono-200 flex-1"
                                  >
                                    {[1, 2, 3, 5, 7, 14].map(d => (
                                      <option key={d} value={d}>H-{d}</option>
                                    ))}
                                  </select>
                                  {(settings.notifyEventReminders || []).length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveEventReminder(idx)}
                                      className="p-0.5 rounded text-mono-400 hover:text-mono-700 dark:hover:text-mono-200 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={handleAddEventReminder}
                                className="flex items-center gap-1 text-[10px] font-bold text-mono-500 hover:text-mono-800 dark:hover:text-mono-200 transition-colors mt-1"
                              >
                                <Plus className="w-3 h-3" />
                                Tambah pengingat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                <div className="my-1 border-t border-mono-100 dark:border-mono-800" />

                {/* 3. Realtime Sync */}
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenSync();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 text-mono-400" />}
                    <span>Sinkron HP & Desktop</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-black dark:bg-white' : 'bg-mono-400'}`} />
                    <span className="text-[10px] font-mono font-bold text-mono-500">
                      {isOnline ? (isPaired ? 'Real-time' : 'Online') : 'Offline'}
                    </span>
                  </div>
                </button>

                {/* 4. Backup & Export/Import */}
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenExportImport();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800/60 transition-colors text-left"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Backup & Ekspor / Impor</span>
                </button>

              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
