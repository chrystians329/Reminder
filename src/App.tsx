import { useState, useEffect, useCallback } from 'react';
import { 
  SchoolSchedule, 
  TaskItem, 
  OutOfSchoolEvent, 
  ActiveTab, 
  DayOfWeek,
  SubTaskItem
} from './types';
import { StorageService, AppSettings } from './services/storage';
import { SyncService, SyncStatus } from './services/syncService';
import { NotificationService } from './services/notificationService';
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
import { SyncModal } from './components/Modals/SyncModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [schedules, setSchedules] = useState<SchoolSchedule[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<OutOfSchoolEvent[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(StorageService.getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncService.getStatus());

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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Initialize and load data on mount
  useEffect(() => {
    StorageService.init();
    refreshAllData();

    const settings = StorageService.getSettings();
    setAppSettings(settings);
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Initialize Real-time Sync
    SyncService.init((payload) => {
      StorageService.saveSchedules(payload.schedules);
      StorageService.saveTasks(payload.tasks);
      StorageService.saveEvents(payload.events);
      setSchedules(payload.schedules);
      setTasks(payload.tasks);
      setEvents(payload.events);
    });

    const unsubSyncStatus = SyncService.subscribeStatus(setSyncStatus);

    // Minta izin akses penting saat pertama kali aplikasi dibuka
    const hasAskedPermission = localStorage.getItem('reminder_initial_permission_asked');
    if (!hasAskedPermission) {
      setTimeout(async () => {
        try {
          await NotificationService.requestPermission();
          localStorage.setItem('reminder_initial_permission_asked', 'true');
        } catch (e) {
          console.warn('Initial permission request:', e);
        }
      }, 800);
    }

    return () => unsubSyncStatus();
  }, []);

  // Periodic notification check (every 5 minutes)
  useEffect(() => {
    if (tasks.length > 0 || events.length > 0) {
      NotificationService.checkAll(tasks, events);
    }

    const interval = setInterval(() => {
      const latestTasks = StorageService.getTasks();
      const latestEvents = StorageService.getEvents();
      NotificationService.checkAll(latestTasks, latestEvents);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, events]);

  const refreshAllData = () => {
    setSchedules(StorageService.getSchedules());
    setTasks(StorageService.getTasks());
    setEvents(StorageService.getEvents());
  };

  const broadcastAll = useCallback((
    curSchedules: SchoolSchedule[], 
    curTasks: TaskItem[], 
    curEvents: OutOfSchoolEvent[]
  ) => {
    SyncService.broadcastChange(curSchedules, curTasks, curEvents);
  }, []);

  const handleToggleDarkMode = () => {
    const nextMode = !appSettings.darkMode;
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const newSettings = { ...appSettings, darkMode: nextMode };
    setAppSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    // If enabling any notification, request permission first
    if (updates.notifyTaskEnabled === true || updates.notifyEventEnabled === true) {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        alert('Izin notifikasi belum diberikan di browser Anda.');
        return;
      }
    }
    const newSettings = { ...appSettings, ...updates };
    setAppSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleTestNotification = async () => {
    const perm = await NotificationService.getPermission();
    if (perm !== 'granted') {
      const granted = await NotificationService.requestPermission();
      if (!granted) {
        alert('Izin notifikasi tidak diberikan di perangkat Anda.');
        return;
      }
    }
    await NotificationService.sendTestNotification();
  };

  // --- Task Handlers ---
  const handleToggleTask = (id: string) => {
    const updated = StorageService.toggleTaskCompleted(id);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  const handleUpdateSubTasks = (taskId: string, subTasks: SubTaskItem[]) => {
    const updated = StorageService.updateTaskSubTasks(taskId, subTasks);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  const handleDeleteTask = (id: string) => {
    const updated = StorageService.deleteTask(id);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  const handleDeleteBulkTasks = (ids: string[]) => {
    const updated = StorageService.deleteBulkTasks(ids);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  const handleToggleBulkTasks = (ids: string[], completed: boolean) => {
    const updated = StorageService.toggleBulkTasks(ids, completed);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
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
    let updatedTasks: TaskItem[];
    if (editingTask) {
      updatedTasks = StorageService.updateTask(editingTask.id, taskData);
    } else {
      StorageService.addTask(taskData);
      updatedTasks = StorageService.getTasks();
    }
    setTasks(updatedTasks);
    broadcastAll(schedules, updatedTasks, events);
  };

  const handlePurgeCompletedOrExpired = () => {
    const updated = StorageService.purgeCompletedOrExpiredTasks();
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  // --- Schedule Handlers ---
  const handleOpenAddSchedule = (defaultDay: DayOfWeek = 'Senin') => {
    setEditingSchedule(null);
    setScheduleModalDefaultDay(defaultDay);
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (schedule: SchoolSchedule) => {
    setEditingSchedule(schedule);
    setScheduleModalDefaultDay(schedule.day);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = (scheduleData: Omit<SchoolSchedule, 'id' | 'createdAt'>) => {
    let updatedSchedules: SchoolSchedule[];
    if (editingSchedule) {
      updatedSchedules = StorageService.updateSchedule(editingSchedule.id, scheduleData);
    } else {
      StorageService.addSchedule(scheduleData);
      updatedSchedules = StorageService.getSchedules();
    }
    setSchedules(updatedSchedules);
    broadcastAll(updatedSchedules, tasks, events);
  };

  const handleDeleteSchedule = (id: string) => {
    const updated = StorageService.deleteSchedule(id);
    setSchedules(updated);
    broadcastAll(updated, tasks, events);
  };

  const handleDeleteBulkSchedules = (ids: string[]) => {
    const updated = StorageService.deleteBulkSchedules(ids);
    setSchedules(updated);
    broadcastAll(updated, tasks, events);
  };

  // --- Event Handlers ---
  const handleOpenAddEvent = (defaultDate?: string) => {
    setEditingEvent(null);
    setEventModalDefaultDate(defaultDate);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: OutOfSchoolEvent) => {
    setEditingEvent(event);
    setEventModalDefaultDate(event.date);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>) => {
    let updatedEvents: OutOfSchoolEvent[];
    if (editingEvent) {
      updatedEvents = StorageService.updateEvent(editingEvent.id, eventData);
    } else {
      StorageService.addEvent(eventData);
      updatedEvents = StorageService.getEvents();
    }
    setEvents(updatedEvents);
    broadcastAll(schedules, tasks, updatedEvents);
  };

  const handleToggleEvent = (id: string) => {
    const updated = StorageService.toggleEventCompleted(id);
    setEvents(updated);
    broadcastAll(schedules, tasks, updated);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = StorageService.deleteEvent(id);
    setEvents(updated);
    broadcastAll(schedules, tasks, updated);
  };

  const handleDeleteBulkEvents = (ids: string[]) => {
    const updated = StorageService.deleteBulkEvents(ids);
    setEvents(updated);
    broadcastAll(schedules, tasks, updated);
  };

  // --- Bulk Handlers ---
  const handleOpenBulkAdd = (type: BulkType) => {
    setBulkAddType(type);
    setIsBulkAddOpen(true);
  };

  const handleSaveBulkSchedules = (items: Array<Omit<SchoolSchedule, 'id' | 'createdAt'>>) => {
    const updated = StorageService.addBulkSchedules(items);
    setSchedules(updated);
    broadcastAll(updated, tasks, events);
  };

  const handleSaveBulkTasks = (items: Array<Omit<TaskItem, 'id' | 'createdAt' | 'completed'>>) => {
    const updated = StorageService.addBulkTasks(items);
    setTasks(updated);
    broadcastAll(schedules, updated, events);
  };

  const handleSaveBulkEvents = (items: Array<Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>>) => {
    const updated = StorageService.addBulkEvents(items);
    setEvents(updated);
    broadcastAll(schedules, tasks, updated);
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
    <div className="min-h-screen bg-mono-50 text-mono-950 dark:bg-mono-950 dark:text-mono-50 transition-colors duration-200 font-sans flex flex-col">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={appSettings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        pendingTasksCount={pendingTasksCount}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
        onTestNotification={handleTestNotification}
        isOnline={syncStatus.isOnline}
        isPaired={syncStatus.isPaired}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'dashboard' && (
          <DashboardView
            schedules={schedules}
            tasks={tasks}
            events={events}
            onToggleTask={handleToggleTask}
            onUpdateSubTasks={handleUpdateSubTasks}
            onDeleteTask={handleDeleteTask}
            onOpenEditTask={handleOpenEditTask}
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
            onUpdateSubTasks={handleUpdateSubTasks}
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

      {/* Modals with click-outside-to-close */}
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

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />

    </div>
  );
}
export default App;
