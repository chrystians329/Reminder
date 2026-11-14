export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export type AllDayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
export const ALL_DAYS_OF_WEEK: AllDayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export type TodoRepeatType = 'once' | 'daily' | 'specific_days';

export interface TodoItem {
  id: string;
  title: string;
  repeatType: TodoRepeatType; // 'once' | 'daily' | 'specific_days'
  repeatDays?: AllDayOfWeek[]; // e.g. ['Senin', 'Minggu']
  targetDate?: string; // YYYY-MM-DD for 'once'
  time?: string; // "07:00" (opsional)
  notes?: string;
  completedDates: string[]; // List of YYYY-MM-DD when completed
  createdAt: string;
}

export interface SchoolSchedule {
  id: string;
  day: DayOfWeek;
  subject: string; // e.g. Matematika, Fisika, B. Indonesia
  startTime: string; // "07:00"
  endTime: string; // "08:30"
  room?: string; // "R. 12-A"
  teacher?: string; // "Dra. Siti Rahma"
  notes?: string; // "Bawa buku cetak & penggaris"
  createdAt: string;
}

export interface SubTaskItem {
  id: string;
  title: string;
  completed: boolean;
  subTasks?: SubTaskItem[];
}

export interface TaskItem {
  id: string;
  title: string; // e.g. "PR MTK Halaman 45"
  description?: string; // e.g. "Kerjakan soal nomor 1-15 di buku tugas"
  scheduleId?: string; // id of linked SchoolSchedule (optional)
  subjectName?: string; // e.g. "Matematika"
  dueDate?: string; // "YYYY-MM-DD" (opsional)
  dueTime?: string; // "23:59" (opsional)
  completed: boolean;
  completedAt?: string;
  subTasks?: SubTaskItem[]; // Point / sub-point yang dapat dicentang & di-minimize
  createdAt: string;
}

export type PriorityTier = 'penting' | 'sedang' | 'tidak';

export interface OutOfSchoolEvent {
  id: string;
  title: string; // e.g. "Nonton bioskop bareng teman"
  description?: string; // e.g. "XXI Mall jam 16.30, pesan tiket online"
  date: string; // "YYYY-MM-DD"
  time?: string; // "16:30"
  tier: PriorityTier; // 'penting' | 'sedang' | 'tidak'
  location?: string;
  completed: boolean;
  createdAt: string;
}

export interface DailyNote {
  id: string;
  date: string; // "YYYY-MM-DD"
  content: string;
  updatedAt: string;
}

export type ActiveTab = 'dashboard' | 'schedule' | 'tasks' | 'events' | 'calendar' | 'todos';

