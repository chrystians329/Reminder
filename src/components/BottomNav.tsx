import React from 'react';
import { 
  CalendarDays, 
  BookOpen, 
  CheckSquare, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingTasksCount
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Hari Ini', icon: <Clock className="w-5 h-5" /> },
    { id: 'schedule', label: 'Jadwal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tugas', icon: <CheckSquare className="w-5 h-5" />, badge: pendingTasksCount },
    { id: 'events', label: 'Agenda', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarDays className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-mono-950/95 backdrop-blur-md border-t border-mono-200 dark:border-mono-800 pb-[env(safe-area-inset-bottom,8px)] transition-colors">
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full transition-colors ${
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-mono-400 dark:text-mono-500 hover:text-mono-700 dark:hover:text-mono-300'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-[9px] font-black flex items-center justify-center leading-none">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

