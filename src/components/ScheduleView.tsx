import React, { useState } from 'react';
import { 
  Trash2, 
  Edit3 
} from 'lucide-react';
import { SchoolSchedule, DayOfWeek, DAYS_OF_WEEK } from '../types';

interface ScheduleViewProps {
  schedules: SchoolSchedule[];
  onOpenAddSchedule: (defaultDay?: DayOfWeek) => void;
  onOpenBulkAddSchedule: () => void;
  onOpenEditSchedule: (schedule: SchoolSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onDeleteBulkSchedules: (ids: string[]) => void;
  onOpenAddTaskForSubject: (subjectName: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedules,
  onOpenAddSchedule,
  onOpenBulkAddSchedule,
  onOpenEditSchedule,
  onDeleteSchedule,
  onDeleteBulkSchedules,
  onOpenAddTaskForSubject
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'Semua'>('Semua');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredSchedules = schedules
    .filter((s) => (selectedDay === 'Semua' ? true : s.day === selectedDay))
    .sort((a, b) => {
      const dayOrder = DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return a.startTime.localeCompare(b.startTime);
    });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredSchedules.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSchedules.map(s => s.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} jadwal yang dipilih?`)) {
      onDeleteBulkSchedules(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              JADWAL MINGGUAN
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Jadwal (Senin - Sabtu)
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            {/* Bulk delete action button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 rounded-xl border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold text-xs transition-all"
              >
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}

            <button
              onClick={onOpenBulkAddSchedule}
              className="px-3.5 py-2.5 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white font-bold text-xs transition-all shadow-sm"
            >
              + Massal
            </button>

            <button
              onClick={() => onOpenAddSchedule(selectedDay === 'Semua' ? 'Senin' : selectedDay)}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              + Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Day Selector Pills & Select All Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setSelectedDay('Semua');
                setSelectedIds([]);
              }}
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
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                  }`}
                >
                  <span>{day}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-mono-200 dark:bg-mono-800'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredSchedules.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white self-start sm:self-auto"
            >
              {selectedIds.length === filteredSchedules.length ? 'Batal Pilih Semua' : 'Pilih Semua untuk Aksi Massal'}
            </button>
          )}
        </div>
      </div>

      {/* Schedule Items List */}
      {filteredSchedules.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Belum ada jadwal untuk {selectedDay === 'Semua' ? 'hari manapun' : `hari ${selectedDay}`}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => onOpenAddSchedule(selectedDay === 'Semua' ? 'Senin' : selectedDay)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              + Tambah Jadwal
            </button>
            <span className="text-mono-400 text-xs"> ~ </span>
            <button
              onClick={onOpenBulkAddSchedule}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-mono-300 dark:border-mono-700"
            >
              + Tambah Massal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((schedule) => {
            const isSelected = selectedIds.includes(schedule.id);
            const scheduleMeta = [schedule.room, schedule.teacher].filter(Boolean).join(' ~ ');

            return (
              <div
                key={schedule.id}
                className={`bg-white dark:bg-mono-900 border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm ${
                  isSelected
                    ? 'border-black dark:border-white ring-2 ring-mono-400'
                    : 'border-mono-200 dark:border-mono-800 hover:border-mono-400'
                }`}
              >
                <div className="space-y-3">
                  {/* Header tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(schedule.id)}
                        className="w-4 h-4 rounded border-mono-300 accent-black cursor-pointer"
                        title="Pilih untuk hapus massal"
                      />
                      <span className="text-[11px] font-black uppercase font-mono tracking-wider bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded">
                        {schedule.day}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-mono-700 dark:text-mono-300">
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </div>

                  {/* Subject name */}
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">
                      {schedule.subject}
                    </h3>
                    
                    {/* Room & Teacher combined with ~ */}
                    {scheduleMeta && (
                      <div className="text-xs text-mono-600 dark:text-mono-400 mt-1.5 font-medium">
                        {scheduleMeta}
                      </div>
                    )}
                  </div>

                  {/* Notes without icon */}
                  {schedule.notes && (
                    <div className="p-2.5 rounded-xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs text-mono-700 dark:text-mono-300">
                      <p className="font-medium">{schedule.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-mono-100 dark:border-mono-800">
                  {/* Quick Add Task for this subject */}
                  <button
                    onClick={() => onOpenAddTaskForSubject(schedule.subject)}
                    className="text-[11px] font-bold text-mono-800 dark:text-mono-200 hover:text-black dark:hover:text-white"
                  >
                    + Tugas
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
            );
          })}
        </div>
      )}

    </div>
  );
};
