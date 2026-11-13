import { SchoolSchedule, TaskItem, OutOfSchoolEvent, DailyNote } from '../types';
import { formatDateKey, isTaskOverdue } from '../utils/dateUtils';

const KEYS = {
  SCHEDULES: 'reminder_pelajar_schedules_v1',
  TASKS: 'reminder_pelajar_tasks_v1',
  EVENTS: 'reminder_pelajar_events_v1',
  NOTES: 'reminder_pelajar_notes_v1',
  SETTINGS: 'reminder_pelajar_settings_v1',
  INITIALIZED: 'reminder_pelajar_initialized_v1'
};

export interface NotifReminder {
  hDays: number; // H-minus berapa hari sebelum event
}

export interface AppSettings {
  darkMode: boolean;
  autoHideExpiredTasks: boolean;
  notificationSound: boolean;
  // Sound settings
  soundType: 'system' | 'chime' | 'bell' | 'ping' | 'custom';
  customSoundDataUri?: string; // base64 / data-uri
  customSoundName?: string;
  // Notifikasi Tugas
  notifyTaskEnabled: boolean;
  notifyTaskTime: string; // "HH:mm" default "18:30"
  notifyTaskHDays: number; // default 1 (H-1)
  // Notifikasi Agenda Luar
  notifyEventEnabled: boolean;
  notifyEventTime: string; // "HH:mm" default "18:30"
  notifyEventReminders: NotifReminder[]; // bisa lebih dari 1, default [{hDays:1}]
  // Legacy compat
  notifyHMinusOne?: boolean;
  syncRoomCode?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  autoHideExpiredTasks: true,
  notificationSound: true,
  soundType: 'system',
  customSoundDataUri: undefined,
  customSoundName: undefined,
  notifyTaskEnabled: true,
  notifyTaskTime: '18:30',
  notifyTaskHDays: 1,
  notifyEventEnabled: true,
  notifyEventTime: '18:30',
  notifyEventReminders: [{ hDays: 1 }],
  syncRoomCode: undefined
};

export const StorageService = {
  // --- Initialization ---
  init() {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      // Default: clean state without sample data
      this.saveSchedules([]);
      this.saveTasks([]);
      this.saveEvents([]);
      this.saveSettings(DEFAULT_SETTINGS);
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  },

  // --- Schedules (Senin - Sabtu) ---
  getSchedules(): SchoolSchedule[] {
    try {
      const data = localStorage.getItem(KEYS.SCHEDULES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSchedules(schedules: SchoolSchedule[]) {
    localStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
  },

  addSchedule(schedule: Omit<SchoolSchedule, 'id' | 'createdAt'>): SchoolSchedule {
    const schedules = this.getSchedules();
    const newSchedule: SchoolSchedule = {
      ...schedule,
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    };
    schedules.push(newSchedule);
    this.saveSchedules(schedules);
    return newSchedule;
  },

  updateSchedule(id: string, updates: Partial<SchoolSchedule>): SchoolSchedule[] {
    const schedules = this.getSchedules().map(item => item.id === id ? { ...item, ...updates } : item);
    this.saveSchedules(schedules);
    return schedules;
  },

  deleteSchedule(id: string): SchoolSchedule[] {
    const schedules = this.getSchedules().filter(item => item.id !== id);
    this.saveSchedules(schedules);
    return schedules;
  },

  addBulkSchedules(items: Array<Omit<SchoolSchedule, 'id' | 'createdAt'>>): SchoolSchedule[] {
    const schedules = this.getSchedules();
    const newItems: SchoolSchedule[] = items.map(item => ({
      ...item,
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString()
    }));
    const combined = [...schedules, ...newItems];
    this.saveSchedules(combined);
    return combined;
  },

  deleteBulkSchedules(ids: string[]): SchoolSchedule[] {
    const idSet = new Set(ids);
    const schedules = this.getSchedules().filter(item => !idSet.has(item.id));
    this.saveSchedules(schedules);
    return schedules;
  },

  // --- Tasks (Tugas / PR) ---
  getTasks(): TaskItem[] {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTasks(tasks: TaskItem[]) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask(task: Omit<TaskItem, 'id' | 'createdAt' | 'completed'>): TaskItem {
    const tasks = this.getTasks();
    const newTask: TaskItem = {
      ...task,
      id: 'tsk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(id: string, updates: Partial<TaskItem>): TaskItem[] {
    const tasks = this.getTasks().map(item => item.id === id ? { ...item, ...updates } : item);
    this.saveTasks(tasks);
    return tasks;
  },

  toggleTaskCompleted(id: string): TaskItem[] {
    const tasks = this.getTasks().map(item => {
      if (item.id === id) {
        const nextState = !item.completed;
        return {
          ...item,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined
        };
      }
      return item;
    });
    this.saveTasks(tasks);
    return tasks;
  },

  deleteTask(id: string): TaskItem[] {
    const tasks = this.getTasks().filter(item => item.id !== id);
    this.saveTasks(tasks);
    return tasks;
  },

  addBulkTasks(items: Array<Omit<TaskItem, 'id' | 'createdAt' | 'completed'>>): TaskItem[] {
    const tasks = this.getTasks();
    const newItems: TaskItem[] = items.map(item => ({
      ...item,
      id: 'tsk-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString()
    }));
    const combined = [...tasks, ...newItems];
    this.saveTasks(combined);
    return combined;
  },

  deleteBulkTasks(ids: string[]): TaskItem[] {
    const idSet = new Set(ids);
    const tasks = this.getTasks().filter(item => !idSet.has(item.id));
    this.saveTasks(tasks);
    return tasks;
  },

  toggleBulkTasks(ids: string[], completed: boolean): TaskItem[] {
    const idSet = new Set(ids);
    const nowIso = new Date().toISOString();
    const tasks = this.getTasks().map(item => {
      if (idSet.has(item.id)) {
        return {
          ...item,
          completed,
          completedAt: completed ? nowIso : undefined
        };
      }
      return item;
    });
    this.saveTasks(tasks);
    return tasks;
  },

  // Clear or purge tasks that are completed or overdue (user requirement #3)
  purgeCompletedOrExpiredTasks(): TaskItem[] {
    const tasks = this.getTasks().filter(item => {
      if (item.completed) return false;
      if (item.dueDate && isTaskOverdue(item.dueDate, item.dueTime, item.completed)) return false;
      return true;
    });
    this.saveTasks(tasks);
    return tasks;
  },

  updateTaskSubTasks(taskId: string, subTasks: import('../types').SubTaskItem[]): TaskItem[] {
    return this.updateTask(taskId, { subTasks });
  },

  // --- Events (Kegiatan Luar Sekolah) ---
  getEvents(): OutOfSchoolEvent[] {
    try {
      const data = localStorage.getItem(KEYS.EVENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveEvents(events: OutOfSchoolEvent[]) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  addEvent(event: Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>): OutOfSchoolEvent {
    const events = this.getEvents();
    const newEvent: OutOfSchoolEvent = {
      ...event,
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent;
  },

  updateEvent(id: string, updates: Partial<OutOfSchoolEvent>): OutOfSchoolEvent[] {
    const events = this.getEvents().map(item => item.id === id ? { ...item, ...updates } : item);
    this.saveEvents(events);
    return events;
  },

  toggleEventCompleted(id: string): OutOfSchoolEvent[] {
    const events = this.getEvents().map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    this.saveEvents(events);
    return events;
  },

  deleteEvent(id: string): OutOfSchoolEvent[] {
    const events = this.getEvents().filter(item => item.id !== id);
    this.saveEvents(events);
    return events;
  },

  addBulkEvents(items: Array<Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>>): OutOfSchoolEvent[] {
    const events = this.getEvents();
    const newItems: OutOfSchoolEvent[] = items.map(item => ({
      ...item,
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      completed: false,
      createdAt: new Date().toISOString()
    }));
    const combined = [...events, ...newItems];
    this.saveEvents(combined);
    return combined;
  },

  deleteBulkEvents(ids: string[]): OutOfSchoolEvent[] {
    const idSet = new Set(ids);
    const events = this.getEvents().filter(item => !idSet.has(item.id));
    this.saveEvents(events);
    return events;
  },

  // --- Daily Notes ---
  getDailyNote(dateStr: string = formatDateKey(new Date())): string {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      const notes: Record<string, DailyNote> = data ? JSON.parse(data) : {};
      return notes[dateStr]?.content || '';
    } catch {
      return '';
    }
  },

  saveDailyNote(dateStr: string, content: string) {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      const notes: Record<string, DailyNote> = data ? JSON.parse(data) : {};
      notes[dateStr] = {
        id: 'note-' + dateStr,
        date: dateStr,
        content,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  },

  // --- Settings ---
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // Migrate legacy notifyHMinusOne → notifyTaskEnabled
      if (parsed.notifyHMinusOne !== undefined && parsed.notifyTaskEnabled === undefined) {
        merged.notifyTaskEnabled = parsed.notifyHMinusOne;
      }
      return merged;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // --- Export & Import ---
  exportBackupJSON(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schedules: this.getSchedules(),
      tasks: this.getTasks(),
      events: this.getEvents(),
      settings: this.getSettings()
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackupJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.schedules)) this.saveSchedules(parsed.schedules);
      if (Array.isArray(parsed.tasks)) this.saveTasks(parsed.tasks);
      if (Array.isArray(parsed.events)) this.saveEvents(parsed.events);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  },

  resetDefaults() {
    this.saveSchedules([]);
    this.saveTasks([]);
    this.saveEvents([]);
    this.saveSettings(DEFAULT_SETTINGS);
  }
};

