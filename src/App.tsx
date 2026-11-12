import { useState, useEffect } from 'react';
import { 
  SchoolSchedule, 
  TaskItem, 
  OutOfSchoolEvent, 
  ActiveTab, 
  DayOfWeek 
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ScheduleView } from './components/ScheduleView';
import { TasksView } from './components/TasksView';
import { EventsView } from './components/EventsView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/Modals/TaskModal';
import { ScheduleModal } from './components/Modals/ScheduleModal';
import { EventModal } from './components/Modals/EventModal';
import { BulkAddModal, BulkType } from './components/Modals/BulkAddModal';
import { QuickAddModal } from './components/QuickAddModal';
import { ExportImportModal } from './components/Modals/ExportImportModal';
import { MobileGuideModal } from './components/Modals/MobileGuideModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [schedules, setSchedules] = useState<SchoolSchedule[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<OutOfSchoolEvent[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskModalInitialSubject, setTaskModalInitialSubject] = useState<string | undefined>();
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SchoolSchedule | null>(null);
  const [scheduleModalDefaultDay, setScheduleModalDefaultDay] = useState<DayOfWeek>('Senin');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OutOfSchoolEvent | null>(null);
  const [eventModalDefaultDate, setEventModalDefaultDate] = useState<string | undefined>();

  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkAddType, setBulkAddType] = useState<BulkType>('task');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isMobileGuideOpen, setIsMobileGuideOpen] = useState(false);

  // Initialize and load data on mount
  useEffect(() => {
    StorageService.init();
    refreshAllData();

    // Check system preference for dark mode
    const settings = StorageService.getSettings();
    if (settings.darkMode !== undefined) {
      setDarkMode(settings.darkMode);
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const refreshAllData = () => {
    setSchedules(StorageService.getSchedules());
    setTasks(StorageService.getTasks());
    setEvents(StorageService.getEvents());
  };

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const settings = StorageService.getSettings();
    StorageService.saveSettings({ ...settings, darkMode: nextMode });
  };

  // --- Task Handlers ---
  const handleToggleTask = (id: string) => {
    const updated = StorageService.toggleTaskCompleted(id);
    setTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = StorageService.deleteTask(id);
    setTasks(updated);
  };

  const handleDeleteBulkTasks = (ids: string[]) => {
    const updated = StorageService.deleteBulkTasks(ids);
    setTasks(updated);
  };

  const handleToggleBulkTasks = (ids: string[], completed: boolean) => {
    const updated = StorageService.toggleBulkTasks(ids, completed);
    setTasks(updated);
  };

  const handleOpenAddTask = (subjectName?: string, defaultDate?: string) => {
    setEditingTask(null);
    setTaskModalInitialSubject(subjectName);
    setTaskModalInitialDate(defaultDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setTaskModalInitialSubject(task.subjectName);
    setTaskModalInitialDate(task.dueDate);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>) => {
    if (editingTask) {
      const updated = StorageService.updateTask(editingTask.id, taskData);
      setTasks(updated);
    } else {
      StorageService.addTask(taskData);
      setTasks(StorageService.getTasks());
    }
  };

  const handlePurgeCompletedOrExpired = () => {
    const remaining = StorageService.purgeCompletedOrExpiredTasks();
    setTasks(remaining);
  };

  // --- Schedule Handlers ---
  const handleOpenAddSchedule = (defaultDay?: DayOfWeek) => {
    setEditingSchedule(null);
    setScheduleModalDefaultDay(defaultDay || 'Senin');
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (sch: SchoolSchedule) => {
    setEditingSchedule(sch);
    setScheduleModalDefaultDay(sch.day);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = StorageService.deleteSchedule(id);
    setSchedules(updated);
  };

  const handleDeleteBulkSchedules = (ids: string[]) => {
    const updated = StorageService.deleteBulkSchedules(ids);
    setSchedules(updated);
  };

  const handleSaveSchedule = (data: Omit<SchoolSchedule, 'id' | 'createdAt'>) => {
    if (editingSchedule) {
      const updated = StorageService.updateSchedule(editingSchedule.id, data);
      setSchedules(updated);
    } else {
      StorageService.addSchedule(data);
      setSchedules(StorageService.getSchedules());
    }
  };

  // --- Event Handlers ---
  const handleToggleEvent = (id: string) => {
    const updated = StorageService.toggleEventCompleted(id);
    setEvents(updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = StorageService.deleteEvent(id);
    setEvents(updated);
  };

  const handleDeleteBulkEvents = (ids: string[]) => {
    const updated = StorageService.deleteBulkEvents(ids);
    setEvents(updated);
  };

  const handleOpenAddEvent = (defaultDate?: string) => {
    setEditingEvent(null);
    setEventModalDefaultDate(defaultDate);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: OutOfSchoolEvent) => {
    setEditingEvent(evt);
    setEventModalDefaultDate(evt.date);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data: Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>) => {
    if (editingEvent) {
      const updated = StorageService.updateEvent(editingEvent.id, data);
      setEvents(updated);
    } else {
      StorageService.addEvent(data);
      setEvents(StorageService.getEvents());
    }
  };

  // --- Bulk Add Handlers ---
  const handleOpenBulkAdd = (type: BulkType) => {
    setBulkAddType(type);
    setIsBulkAddOpen(true);
  };

  const handleSaveBulkSchedules = (items: Array<Omit<SchoolSchedule, 'id' | 'createdAt'>>) => {
    const updated = StorageService.addBulkSchedules(items);
    setSchedules(updated);
  };

  const handleSaveBulkTasks = (items: Array<Omit<TaskItem, 'id' | 'createdAt' | 'completed'>>) => {
    const updated = StorageService.addBulkTasks(items);
    setTasks(updated);
  };

  const handleSaveBulkEvents = (items: Array<Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>>) => {
    const updated = StorageService.addBulkEvents(items);
    setEvents(updated);
  };

  // --- Quick Add Dispatcher ---
  const handleSelectQuickAdd = (type: 'task' | 'schedule' | 'event') => {
    if (type === 'task') handleOpenAddTask();
    if (type === 'schedule') handleOpenAddSchedule();
    if (type === 'event') handleOpenAddEvent();
  };

  const handleSelectBulkQuickAdd = (type: 'task' | 'schedule' | 'event') => {
    handleOpenBulkAdd(type);
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-mono-50 text-mono-950 dark:bg-mono-950 dark:text-mono-50 transition-colors font-sans flex flex-col">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenMobileGuide={() => setIsMobileGuideOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'dashboard' && (
          <DashboardView
            schedules={schedules}
            tasks={tasks}
            events={events}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onToggleEvent={handleToggleEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenAddTask={handleOpenAddTask}
            onOpenAddSchedule={handleOpenAddSchedule}
            onOpenAddEvent={handleOpenAddEvent}
            onOpenBulkAdd={handleOpenBulkAdd}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            schedules={schedules}
            onOpenAddSchedule={handleOpenAddSchedule}
            onOpenBulkAddSchedule={() => handleOpenBulkAdd('schedule')}
            onOpenEditSchedule={handleOpenEditSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onDeleteBulkSchedules={handleDeleteBulkSchedules}
            onOpenAddTaskForSubject={(subj) => handleOpenAddTask(subj)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            schedules={schedules}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onDeleteBulkTasks={handleDeleteBulkTasks}
            onToggleBulkTasks={handleToggleBulkTasks}
            onOpenAddTask={handleOpenAddTask}
            onOpenBulkAddTask={() => handleOpenBulkAdd('task')}
            onOpenEditTask={handleOpenEditTask}
            onPurgeCompletedOrExpired={handlePurgeCompletedOrExpired}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            events={events}
            onToggleEvent={handleToggleEvent}
            onDeleteEvent={handleDeleteEvent}
            onDeleteBulkEvents={handleDeleteBulkEvents}
            onOpenAddEvent={handleOpenAddEvent}
            onOpenBulkAddEvent={() => handleOpenBulkAdd('event')}
            onOpenEditEvent={handleOpenEditEvent}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            schedules={schedules}
            tasks={tasks}
            events={events}
            onOpenAddTask={handleOpenAddTask}
            onOpenAddSchedule={handleOpenAddSchedule}
            onOpenAddEvent={handleOpenAddEvent}
            onToggleTask={handleToggleTask}
            onToggleEvent={handleToggleEvent}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        schedules={schedules}
        initialSubject={taskModalInitialSubject}
        initialDate={taskModalInitialDate}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        editingSchedule={editingSchedule}
        defaultDay={scheduleModalDefaultDay}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        defaultDate={eventModalDefaultDate}
      />

      <BulkAddModal
        isOpen={isBulkAddOpen}
        type={bulkAddType}
        onClose={() => setIsBulkAddOpen(false)}
        onSaveSchedules={handleSaveBulkSchedules}
        onSaveTasks={handleSaveBulkTasks}
        onSaveEvents={handleSaveBulkEvents}
        schedules={schedules}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectOption={handleSelectQuickAdd}
        onSelectBulkOption={handleSelectBulkQuickAdd}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        onDataChanged={refreshAllData}
      />

      <MobileGuideModal
        isOpen={isMobileGuideOpen}
        onClose={() => setIsMobileGuideOpen(false)}
      />

    </div>
  );
}

export default App;
