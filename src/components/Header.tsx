import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  DownloadCloud,
  Menu,
  X
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenQuickAdd: () => void;
  onOpenExportImport: () => void;
  pendingTasksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  onToggleDarkMode,
  onOpenQuickAdd,
  onOpenExportImport,
  pendingTasksCount
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Hari Ini' },
    { id: 'schedule', label: 'Jadwal' },
    { id: 'tasks', label: 'Tugas & PR', badge: pendingTasksCount },
    { id: 'events', label: 'Agenda Luar' },
    { id: 'calendar', label: 'Kalender' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-mono-950/90 backdrop-blur-md border-b border-mono-200 dark:border-mono-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-black tracking-tighter text-base shadow-sm border border-mono-900 dark:border-mono-100">
            R
          </div>
          <span className="font-extrabold text-base tracking-tight">
            REMINDER
          </span>
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />

              <div className="absolute right-0 top-12 w-64 bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Dark / Light Toggle Switch */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-mono-100 dark:hover:bg-mono-800/60 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-mono-800 dark:text-mono-200">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span>Mode Gelap</span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={onToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      darkMode ? 'bg-black dark:bg-white' : 'bg-mono-300 dark:bg-mono-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="my-1 border-t border-mono-100 dark:border-mono-800" />

                {/* Backup & Export/Import Button */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenExportImport();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-mono-700 dark:text-mono-300 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800/60 transition-colors text-left"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Backup & Ekspor / Impor</span>
                </button>

                {/* Mobile Navigation inside Menu */}
                <div className="md:hidden mt-1 pt-1.5 border-t border-mono-100 dark:border-mono-800 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-mono-400">
                    Menu
                  </div>
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === item.id
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-mono-600 dark:text-mono-400 hover:bg-mono-100 dark:hover:bg-mono-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          activeTab === item.id 
                            ? 'bg-white text-black dark:bg-black dark:text-white' 
                            : 'bg-mono-200 dark:bg-mono-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
