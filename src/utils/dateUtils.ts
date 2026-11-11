import { DayOfWeek } from '../types';

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format a Date object to YYYY-MM-DD local string
 */
export function formatDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD to local Date object (at midnight)
 */
export function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Get Indonesian day of the week from Date or YYYY-MM-DD
 */
export function getDayName(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return INDONESIAN_DAYS[d.getDay()];
}

/**
 * Check if the day is a school day (Senin - Sabtu)
 */
export function isSchoolDay(dayName: string): dayName is DayOfWeek {
  return ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].includes(dayName);
}

/**
 * Format date nicely for human: e.g. "Rabu, 11 November 2026"
 */
export function formatFullIndonesianDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  const dayName = INDONESIAN_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = INDONESIAN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Format relative date: "Hari Ini", "Besok", "Lusa", "Kemarin", or "12 Nov"
 */
export function formatRelativeDate(dateStr: string, baseDateStr: string = formatDateKey(new Date())): string {
  const target = parseDateKey(dateStr);
  const base = parseDateKey(baseDateStr);

  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari Ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === 2) return 'Lusa';
  if (diffDays === -1) return 'Kemarin';

  const dayNum = target.getDate();
  const monthShort = INDONESIAN_MONTHS_SHORT[target.getMonth()];
  return `${dayNum} ${monthShort}`;
}

/**
 * Check if a date string is in the past (before today)
 */
export function isDatePassed(dateStr: string, baseDateStr: string = formatDateKey(new Date())): boolean {
  return dateStr < baseDateStr;
}

/**
 * Check if a date string is today
 */
export function isDateToday(dateStr: string, baseDateStr: string = formatDateKey(new Date())): boolean {
  return dateStr === baseDateStr;
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(dueDate: string, dueTime?: string, completed: boolean = false): boolean {
  if (completed) return false;
  const todayStr = formatDateKey(new Date());
  if (dueDate < todayStr) return true;
  if (dueDate === todayStr && dueTime) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    return currentTimeStr > dueTime;
  }
  return false;
}

/**
 * Add N days to a date string
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

/**
 * Generate 7 days ahead starting from base date
 */
export function getUpcomingDays(baseDateStr: string = formatDateKey(new Date()), count: number = 7): string[] {
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    list.push(addDays(baseDateStr, i));
  }
  return list;
}
