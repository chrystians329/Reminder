import { TaskItem, OutOfSchoolEvent } from '../types';
import { formatDateKey, addDays } from '../utils/dateUtils';
import { StorageService, AppSettings } from './storage';
import { SoundService } from './soundService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  isSupported(): boolean {
    if (this.isNative()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  async initChannel(): Promise<void> {
    if (this.isNative()) {
      try {
        await LocalNotifications.createChannel({
          id: 'reminder_alerts',
          name: 'Pengingat Jadwal & Tugas',
          description: 'Notifikasi pengingat tugas dan agenda dengan suara jelas dan kencang',
          importance: 5, // IMPORTANCE_HIGH (suara kencang & getar)
          visibility: 1, // VISIBILITY_PUBLIC
          vibration: true
        });
      } catch (e) {
        console.warn('Channel creation error:', e);
      }
    }
  },

  async getPermission(): Promise<NotificationPermission> {
    if (this.isNative()) {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') return 'granted';
        if (check.display === 'denied') return 'denied';
        return 'default';
      } catch {
        return 'default';
      }
    }
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (this.isNative()) {
      try {
        const req = await LocalNotifications.requestPermissions();
        return req.display === 'granted';
      } catch (e) {
        console.warn('Native notification permission error:', e);
        return false;
      }
    }
    if (!this.isSupported()) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  },

  async sendTestNotification(): Promise<boolean> {
    const perm = await this.getPermission();
    if (perm !== 'granted') {
      const ok = await this.requestPermission();
      if (!ok) return false;
    }

    if (this.isNative()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Reminder - Notifikasi Aktif',
              body: 'Notifikasi berhasil diaktifkan di perangkat Anda!',
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 500) }
            }
          ]
        });
        return true;
      } catch (e) {
        console.warn('Failed to send native notification:', e);
        return false;
      }
    }

    try {
      new Notification('Reminder - Notifikasi Aktif', {
        body: 'Notifikasi berhasil diaktifkan!',
        icon: '/icon.svg',
        badge: '/icon.svg'
      });
      return true;
    } catch (e) {
      console.warn('Failed to send test notification:', e);
      return false;
    }
  },

  async showNotification(title: string, body: string, idNum: number = Date.now() % 1000000) {
    const settings = StorageService.getSettings();

    // Play sound if enabled
    if (settings.notificationSound) {
      SoundService.playSelectedSound(settings.soundType, settings.customSoundDataUri);
    }

    if (this.isNative()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: idNum,
              channelId: 'reminder_alerts',
              schedule: { at: new Date(Date.now() + 200) }
            }
          ]
        });
      } catch (e) {
        console.warn('Error showing native notification:', e);
      }
      return;
    }

    try {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg'
      });
    } catch (e) {
      console.warn('Error showing web notification:', e);
    }
  },

  _isNotifTimeNow(configuredTime: string): boolean {
    const now = new Date();
    const [h, m] = configuredTime.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = h * 60 + m;
    return nowMinutes >= targetMinutes && nowMinutes < targetMinutes + 5;
  },

  async checkAndNotifyTasks(tasks: TaskItem[]): Promise<void> {
    if (!this.isSupported()) return;
    const perm = await this.getPermission();
    if (perm !== 'granted') return;

    const settings: AppSettings = StorageService.getSettings();
    if (!settings.notifyTaskEnabled) return;
    if (!this._isNotifTimeNow(settings.notifyTaskTime)) return;

    const todayKey = formatDateKey(new Date());
    const hDays = settings.notifyTaskHDays || 1;
    const targetDateKey = addDays(todayKey, hDays);

    const notifiedKey = `reminder_notified_task_${todayKey}`;
    let notifiedIds: string[] = [];
    try {
      const stored = localStorage.getItem(notifiedKey);
      if (stored) notifiedIds = JSON.parse(stored);
    } catch {
      notifiedIds = [];
    }

    const dueTasks = tasks.filter(
      (t) => !t.completed && t.dueDate === targetDateKey && !notifiedIds.includes(t.id)
    );

    if (dueTasks.length === 0) return;

    const hLabel = hDays === 1 ? 'Besok' : `${hDays} hari lagi`;

    if (dueTasks.length === 1) {
      const task = dueTasks[0];
      const subject = task.subjectName ? ` (${task.subjectName})` : '';
      await this.showNotification(
        `Pengingat Tugas H-${hDays}`,
        `"${task.title}"${subject} — deadline ${hLabel}.`,
        Math.abs(task.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0))
      );
      notifiedIds.push(task.id);
    } else {
      const titles = dueTasks.slice(0, 3).map((t) => t.title).join(', ');
      await this.showNotification(
        `Pengingat ${dueTasks.length} Tugas H-${hDays}`,
        `${hLabel}: ${titles}${dueTasks.length > 3 ? '...' : ''}`,
        Date.now() % 1000000
      );
      dueTasks.forEach((t) => notifiedIds.push(t.id));
    }

    try {
      localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
    } catch { /* ignore */ }
  },

  async checkAndNotifyEvents(events: OutOfSchoolEvent[]): Promise<void> {
    if (!this.isSupported()) return;
    const perm = await this.getPermission();
    if (perm !== 'granted') return;

    const settings: AppSettings = StorageService.getSettings();
    if (!settings.notifyEventEnabled) return;
    if (!this._isNotifTimeNow(settings.notifyEventTime)) return;

    const todayKey = formatDateKey(new Date());
    const reminders = settings.notifyEventReminders || [{ hDays: 1 }];

    for (const reminder of reminders) {
      const targetDateKey = addDays(todayKey, reminder.hDays);

      const notifiedKey = `reminder_notified_event_h${reminder.hDays}_${todayKey}`;
      let notifiedIds: string[] = [];
      try {
        const stored = localStorage.getItem(notifiedKey);
        if (stored) notifiedIds = JSON.parse(stored);
      } catch {
        notifiedIds = [];
      }

      const dueEvents = events.filter(
        (e) => !e.completed && e.date === targetDateKey && !notifiedIds.includes(e.id)
      );

      if (dueEvents.length === 0) continue;

      const hLabel = reminder.hDays === 1 ? 'Besok' : `${reminder.hDays} hari lagi`;

      if (dueEvents.length === 1) {
        const evt = dueEvents[0];
        const time = evt.time ? ` jam ${evt.time}` : '';
        await this.showNotification(
          `Pengingat Agenda H-${reminder.hDays}`,
          `"${evt.title}"${time} — ${hLabel}.`,
          Math.abs(evt.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0))
        );
        notifiedIds.push(evt.id);
      } else {
        const titles = dueEvents.slice(0, 3).map((e) => e.title).join(', ');
        await this.showNotification(
          `Pengingat ${dueEvents.length} Agenda H-${reminder.hDays}`,
          `${hLabel}: ${titles}${dueEvents.length > 3 ? '...' : ''}`,
          Date.now() % 1000000
        );
        dueEvents.forEach((e) => notifiedIds.push(e.id));
      }

      try {
        localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
      } catch { /* ignore */ }
    }
  },

  async checkAll(tasks: TaskItem[], events: OutOfSchoolEvent[]): Promise<void> {
    await this.checkAndNotifyTasks(tasks);
    await this.checkAndNotifyEvents(events);
  }
};
