import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  MapPin, 
  User, 
  ListPlus
} from 'lucide-react';
import { SchoolSchedule, DayOfWeek, DAYS_OF_WEEK } from '../types';

interface ScheduleViewProps {
  schedules: SchoolSchedule[];
  onOpenAddSchedule: (defaultDay?: DayOfWeek) => void;
  onOpenEditSchedule: (schedule: SchoolSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenAddTaskForSubject: (subjectName: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  onOpenAddSchedule,
  onOpenEditSchedule,
  onDeleteSchedule,
  onOpenAddTaskForSubject
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'Semua'>('Senin');

  const filteredSchedules = selectedDay === 'Semua' 
    ? [...schedules].sort((a, b) => {
        const dayOrder = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
        if (dayOrder !== 0) return dayOrder;
        return a.startTime.localeCompare(b.startTime);
      })
    : schedules
        .filter((s) => s.day === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header & Description */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>ROSTER PELAJARAN TETAP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Jadwal Sekolah (Senin - Sabtu)
            </h1>
            <p className="text-xs sm:text-sm text-mono-600 dark:text-mono-400 mt-1 max-w-xl">
              Jadwal mingguan ini permanen dan berulang setiap minggu otomatis. Tidak akan hilang kecuali kamu menghapusnya secara manual.
            </p>
          </div>

          <button
            onClick={() => onOpenAddSchedule(selectedDay === 'Semua' ? 'Senin' : selectedDay)}
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Mapel Baru</span>
          </button>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <button
            onClick={() => setSelectedDay('Semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              selectedDay === 'Semua'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            Semua Hari
          </button>
          {DAYS_OF_WEEK.map((day) => {
            const count = schedules.filter((s) => s.day === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                    : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected 
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' 
                    : 'bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Items List */}
      {filteredSchedules.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
          <BookOpen className="w-8 h-8 mx-auto text-mono-400 mb-2" />
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Belum ada jadwal untuk {selectedDay === 'Semua' ? 'hari manapun' : `hari ${selectedDay}`}
          </p>
          <p className="text-xs text-mono-500 mt-1">
            Mulai masukkan mata pelajaran agar muncul di dashboard setiap minggunya.
          </p>
          <button
            onClick={() => onOpenAddSchedule(selectedDay === 'Semua' ? 'Senin' : selectedDay)}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
          >
            + Tambah Mata Pelajaran
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-4 flex flex-col justify-between hover:border-mono-400 dark:hover:border-mono-600 transition-all shadow-sm"
            >
              <div className="space-y-3">
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase font-mono tracking-wider bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded">
                    {schedule.day}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-mono-700 dark:text-mono-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </div>

                {/* Subject name */}
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">
                    {schedule.subject}
                  </h3>
                  
                  {/* Room & Teacher */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-mono-600 dark:text-mono-400 mt-1.5">
                    {schedule.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{schedule.room}</span>
                      </span>
                    )}
                    {schedule.teacher && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{schedule.teacher}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {schedule.notes && (
                  <div className="p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs text-mono-700 dark:text-mono-300">
                    <p className="font-medium">📝 {schedule.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-mono-100 dark:border-mono-800">
                {/* Quick Add Task for this subject */}
                <button
                  onClick={() => onOpenAddTaskForSubject(schedule.subject)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-mono-800 dark:text-mono-200 hover:text-black dark:hover:text-white"
                  title="Buat tugas baru untuk mapel ini"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>+ Tugas PR</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditSchedule(schedule)}
                    className="p-1.5 rounded-lg text-mono-500 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                    title="Edit Jadwal"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus jadwal "${schedule.subject}" di hari ${schedule.day}?`)) {
                        onDeleteSchedule(schedule.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-mono-500 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
