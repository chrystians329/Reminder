import { SchoolSchedule, TaskItem, OutOfSchoolEvent, TodoItem } from '../types';
import { StorageService } from './storage';

export interface FullSyncPayload {
  schedules: SchoolSchedule[];
  tasks: TaskItem[];
  events: OutOfSchoolEvent[];
  todos?: TodoItem[];
  updatedAt: number;
  senderId: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isPaired: boolean;
  roomCode: string | null;
  lastSyncedAt: Date | null;
}

type SyncCallback = (payload: FullSyncPayload) => void;
type StatusCallback = (status: SyncStatus) => void;

const DEVICE_ID = 'dev-' + Math.random().toString(36).substring(2, 8);

export const SyncService = {
  broadcastChannel: typeof window !== 'undefined' && 'BroadcastChannel' in window 
    ? new BroadcastChannel('reminder_sync_bus') 
    : null,
  socket: null as WebSocket | null,
  onDataReceivedCallback: null as SyncCallback | null,
  statusListeners: [] as StatusCallback[],
  lastSyncedAt: null as Date | null,
  reconnectTimer: null as any,
  lastKnownTimestamp: 0,

  init(onDataReceived: SyncCallback) {
    this.onDataReceivedCallback = onDataReceived;

    // 1. Listen to Local BroadcastChannel (Same Device / Multi-tab sync)
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const payload: FullSyncPayload = event.data;
        if (payload && payload.senderId !== DEVICE_ID) {
          this.handleIncomingPayload(payload);
        }
      };
    }

    // 2. Listen to browser Online / Offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyStatus();
        this.connectSocket();
      });
      window.addEventListener('offline', () => {
        this.notifyStatus();
      });
    }

    // 3. Connect to remote room if syncRoomCode exists
    const settings = StorageService.getSettings();
    if (settings.syncRoomCode) {
      this.connectSocket(settings.syncRoomCode);
    }
  },

  handleIncomingPayload(payload: FullSyncPayload) {
    if (!payload || payload.senderId === DEVICE_ID) return;
    if (payload.updatedAt <= this.lastKnownTimestamp) return;

    this.lastKnownTimestamp = payload.updatedAt;
    this.lastSyncedAt = new Date();
    this.notifyStatus();

    if (this.onDataReceivedCallback) {
      this.onDataReceivedCallback(payload);
    }
  },

  connectSocket(roomCode?: string) {
    const code = roomCode || StorageService.getSettings().syncRoomCode;
    if (!code || typeof window === 'undefined') return;

    const sanitizedCode = code.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!sanitizedCode) return;

    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // ignore
      }
      this.socket = null;
    }

    const topic = `reminder_sync_${sanitizedCode}`;
    const wsUrl = `wss://ntfy.sh/${topic}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.notifyStatus();
      };

      this.socket.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          // ntfy.sh format has raw.message containing our published string
          if (raw && raw.message) {
            const parsed = JSON.parse(raw.message);
            if (parsed && parsed.senderId) {
              this.handleIncomingPayload(parsed);
            }
          }
        } catch {
          // ignore parsing error
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.notifyStatus();
        // Try reconnecting in 5 seconds if still online
        if (navigator.onLine && StorageService.getSettings().syncRoomCode) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connectSocket();
          }, 5000);
        }
      };

      this.socket.onerror = () => {
        // Socket error handled in onclose
      };
    } catch (e) {
      console.warn('Sync socket connection failed:', e);
    }
  },

  // Broadcast data changes to other devices
  broadcastChange(schedules: SchoolSchedule[], tasks: TaskItem[], events: OutOfSchoolEvent[], todos?: TodoItem[]) {
    const now = Date.now();
    this.lastKnownTimestamp = now;

    const payload: FullSyncPayload = {
      schedules,
      tasks,
      events,
      todos: todos || StorageService.getTodos(),
      updatedAt: now,
      senderId: DEVICE_ID
    };

    // Broadcast locally
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch {
        // ignore
      }
    }

    // Broadcast remotely to paired room if code exists and online
    const settings = StorageService.getSettings();
    if (settings.syncRoomCode && typeof navigator !== 'undefined' && navigator.onLine) {
      const sanitizedCode = settings.syncRoomCode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const topic = `reminder_sync_${sanitizedCode}`;
      
      try {
        fetch(`https://ntfy.sh/${topic}`, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            'X-Title': 'Reminder Sync',
            'X-Priority': '1'
          }
        }).catch(() => {
          // fetch fail silent
        });
      } catch {
        // network fail silent
      }
    }
  },

  setRoomCode(code: string | null) {
    const settings = StorageService.getSettings();
    const cleanCode = code ? code.trim().toUpperCase() : undefined;
    StorageService.saveSettings({
      ...settings,
      syncRoomCode: cleanCode
    });

    if (cleanCode) {
      this.connectSocket(cleanCode);
      // Immediately send current local data so the other device gets it
      this.broadcastChange(
        StorageService.getSchedules(),
        StorageService.getTasks(),
        StorageService.getEvents()
      );
    } else {
      if (this.socket) {
        try {
          this.socket.close();
        } catch {
          // ignore
        }
        this.socket = null;
      }
    }
    this.notifyStatus();
  },

  generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'RM-';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  },

  getStatus(): SyncStatus {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const settings = StorageService.getSettings();
    const isPaired = !!settings.syncRoomCode;
    return {
      isOnline,
      isPaired,
      roomCode: settings.syncRoomCode || null,
      lastSyncedAt: this.lastSyncedAt
    };
  },

  subscribeStatus(listener: StatusCallback): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  },

  notifyStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch {
        // ignore
      }
    });
  }
};

