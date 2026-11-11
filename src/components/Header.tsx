import React from 'react';
import { 
  Sun, 
  Moon, 
  Plus, 
  Smartphone, 
  DownloadCloud, 
  CalendarDays, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Clock
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuickAdd: () => void;
  onOpenMobileGuide: () => void;
  onOpenExportImport: () => void;
  pendingTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  onToggleDarkMode,
  onOpenQuickAdd,
  onOpenMobileGuide,
  onOpenExportImport,
  pendingTasksCount
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Hari Ini', icon: <Clock className="w-4 h-4" /> },
    { id: 'schedule', label: 'Jadwal Pelajaran', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tugas & PR', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasksCount },
    { id: 'events', label: 'Agenda Luar', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-mono-950/90 backdrop-blur-md border-b border-mono-200 dark:border-mono-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-black tracking-tighter text-lg shadow-sm border border-mono-900 dark:border-mono-100">
            R
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-base sm:text-lg block leading-none">
              REMINDER
            </span>
            <span className="text-[10px] tracking-widest uppercase font-mono text-mono-500 dark:text-mono-400">
              Pelajar
            </span>
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
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-mono-900 text-white dark:bg-mono-100 dark:text-mono-950 shadow-sm'
                    : 'text-mono-600 dark:text-mono-300 hover:text-mono-950 dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-900'
                }`}
              >
                {item.icon}
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

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all text-xs font-bold shadow-sm"
            title="Tambah Cepat"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Tambah</span>
          </button>

          {/* Mobile App Guide */}
          <button
            onClick={onOpenMobileGuide}
            className="p-2 rounded-lg text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-900 transition-colors"
            title="Jadikan Aplikasi Mobile (APK / PWA)"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Backup / Export / Import */}
          <button
            onClick={onOpenExportImport}
            className="p-2 rounded-lg text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-900 transition-colors"
            title="Backup & Ekspor / Impor Data"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-mono-700 dark:text-mono-300 hover:bg-mono-100 dark:hover:bg-mono-900 transition-colors"
            title={darkMode ? "Ganti ke Tema Terang" : "Ganti ke Tema Gelap"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
