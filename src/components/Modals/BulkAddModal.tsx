import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { SchoolSchedule, TaskItem, OutOfSchoolEvent, DayOfWeek, DAYS_OF_WEEK, PriorityTier } from '../../types';
import { formatDateKey } from '../../utils/dateUtils';

export type BulkType = 'schedule' | 'task' | 'event';

interface BulkAddModalProps {
  isOpen: boolean;
  type: BulkType;
  onClose: () => void;
  onSaveSchedules: (items: Array<Omit<SchoolSchedule, 'id' | 'createdAt'>>) => void;
  onSaveTasks: (items: Array<Omit<TaskItem, 'id' | 'createdAt' | 'completed'>>) => void;
  onSaveEvents: (items: Array<Omit<OutOfSchoolEvent, 'id' | 'createdAt' | 'completed'>>) => void;
  schedules: SchoolSchedule[];
}

interface ScheduleRow {
  day: DayOfWeek;
  subject: string;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
  notes: string;
}

interface TaskRow {
  title: string;
  subjectName: string;
  dueDate: string;
  dueTime: string;
  description: string;
}

interface EventRow {
  title: string;
  date: string;
  time: string;
  tier: PriorityTier;
  location: string;
  description: string;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  type,
  onClose,
  onSaveSchedules,
  onSaveTasks,
  onSaveEvents,
  schedules
}) => {
  const today = formatDateKey(new Date());

  // Input Mode: 'form' (multi-row) or 'paste' (raw text)
  const [mode, setMode] = useState<'form' | 'paste'>('form');
  const [pasteText, setPasteText] = useState('');

  // Form rows
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([
    { day: 'Senin', subject: '', startTime: '07:00', endTime: '08:30', room: '', teacher: '', notes: '' },
    { day: 'Senin', subject: '', startTime: '08:30', endTime: '10:00', room: '', teacher: '', notes: '' },
    { day: 'Senin', subject: '', startTime: '10:15', endTime: '11:45', room: '', teacher: '', notes: '' }
  ]);

  const [taskRows, setTaskRows] = useState<TaskRow[]>([
    { title: '', subjectName: '', dueDate: today, dueTime: '21:00', description: '' },
    { title: '', subjectName: '', dueDate: today, dueTime: '21:00', description: '' }
  ]);

  const [eventRows, setEventRows] = useState<EventRow[]>([
    { title: '', date: today, time: '16:00', tier: 'sedang', location: '', description: '' },
    { title: '', date: today, time: '19:00', tier: 'tidak', location: '', description: '' }
  ]);

  if (!isOpen) return null;

  const subjectOptions = Array.from(new Set(schedules.map(s => s.subject)));

  // Add row
  const handleAddScheduleRow = () => {
    setScheduleRows([
      ...scheduleRows,
      { day: 'Senin', subject: '', startTime: '07:00', endTime: '08:30', room: '', teacher: '', notes: '' }
    ]);
  };

  const handleAddTaskRow = () => {
    setTaskRows([
      ...taskRows,
      { title: '', subjectName: subjectOptions[0] || '', dueDate: today, dueTime: '21:00', description: '' }
    ]);
  };

  const handleAddEventRow = () => {
    setEventRows([
      ...eventRows,
      { title: '', date: today, time: '16:00', tier: 'sedang', location: '', description: '' }
    ]);
  };

  // Submit from form
  const handleSaveForm = () => {
    if (type === 'schedule') {
      const valid = scheduleRows
        .filter(r => r.subject.trim())
        .map(r => ({
          day: r.day,
          subject: r.subject.trim(),
          startTime: r.startTime || '07:00',
          endTime: r.endTime || '08:30',
          room: r.room.trim() || undefined,
          teacher: r.teacher.trim() || undefined,
          notes: r.notes.trim() || undefined
        }));
      if (valid.length === 0) {
        alert('Harap isi minimal 1 nama mata pelajaran!');
        return;
      }
      onSaveSchedules(valid);
    } else if (type === 'task') {
      const valid = taskRows
        .filter(r => r.title.trim())
        .map(r => ({
          title: r.title.trim(),
          subjectName: r.subjectName.trim() || undefined,
          dueDate: r.dueDate || today,
          dueTime: r.dueTime || undefined,
          description: r.description.trim() || undefined
        }));
      if (valid.length === 0) {
        alert('Harap isi minimal 1 judul tugas!');
        return;
      }
      onSaveTasks(valid);
    } else if (type === 'event') {
      const valid = eventRows
        .filter(r => r.title.trim())
        .map(r => ({
          title: r.title.trim(),
          date: r.date || today,
          time: r.time || undefined,
          tier: r.tier,
          location: r.location.trim() || undefined,
          description: r.description.trim() || undefined
        }));
      if (valid.length === 0) {
        alert('Harap isi minimal 1 nama kegiatan!');
        return;
      }
      onSaveEvents(valid);
    }
    onClose();
  };

  // Submit from paste
  const handleSavePaste = () => {
    const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('Teks masih kosong!');
      return;
    }

    if (type === 'schedule') {
      // Expected format per line:
      // Hari | Mapel | Jam Mulai | Jam Selesai | Ruang | Guru | Catatan
      // or simply Mapel per line
      const parsed = lines.map(line => {
        const parts = line.split(/[|~]/).map(p => p.trim());
        const dayCandidates: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        let matchedDay: DayOfWeek = 'Senin';
        let subject = '';
        let startTime = '07:00';
        let endTime = '08:30';
        let room = '';
        let teacher = '';
        let notes = '';

        if (dayCandidates.includes(parts[0] as DayOfWeek)) {
          matchedDay = parts[0] as DayOfWeek;
          subject = parts[1] || '';
          startTime = parts[2] || '07:00';
          endTime = parts[3] || '08:30';
          room = parts[4] || '';
          teacher = parts[5] || '';
          notes = parts[6] || '';
        } else {
          subject = parts[0] || '';
          startTime = parts[1] || '07:00';
          endTime = parts[2] || '08:30';
          room = parts[3] || '';
          teacher = parts[4] || '';
        }

        return {
          day: matchedDay,
          subject: subject || 'Mata Pelajaran',
          startTime,
          endTime,
          room: room || undefined,
          teacher: teacher || undefined,
          notes: notes || undefined
        };
      });
      onSaveSchedules(parsed);
    } else if (type === 'task') {
      // Expected format per line:
      // Judul Tugas | Mapel | Tanggal (YYYY-MM-DD) | Jam | Detail
      const parsed = lines.map(line => {
        const parts = line.split(/[|~]/).map(p => p.trim());
        const title = parts[0] || 'Tugas Baru';
        const subjectName = parts[1] || undefined;
        const dueDate = parts[2] || today;
        const dueTime = parts[3] || undefined;
        const description = parts[4] || undefined;
        return {
          title,
          subjectName,
          dueDate,
          dueTime,
          description
        };
      });
      onSaveTasks(parsed);
    } else if (type === 'event') {
      // Expected format per line:
      // Judul Kegiatan | Tanggal | Jam | Tier (penting/sedang/tidak) | Lokasi | Catatan
      const parsed = lines.map(line => {
        const parts = line.split(/[|~]/).map(p => p.trim());
        const title = parts[0] || 'Kegiatan Baru';
        const date = parts[1] || today;
        const time = parts[2] || undefined;
        const rawTier = (parts[3] || 'sedang').toLowerCase();
        const tier: PriorityTier = rawTier === 'penting' ? 'penting' : rawTier === 'tidak' ? 'tidak' : 'sedang';
        const location = parts[4] || undefined;
        const description = parts[5] || undefined;
        return {
          title,
          date,
          time,
          tier,
          location,
          description
        };
      });
      onSaveEvents(parsed);
    }
    onClose();
  };

  const getTitle = () => {
    if (type === 'schedule') return 'Tambah Massal Jadwal Pelajaran';
    if (type === 'task') return 'Tambah Massal Tugas & PR';
    return 'Tambah Massal Agenda Luar';
  };

  const getPlaceholder = () => {
    if (type === 'schedule') {
      return `Format per baris (pisahkan dengan ~ atau |):\nHari ~ Mata Pelajaran ~ Jam Mulai ~ Jam Selesai ~ Ruangan ~ Guru\n\nContoh:\nSenin ~ Matematika ~ 07:00 ~ 08:30 ~ R.12 ~ Pak Bambang\nSenin ~ Bahasa Indonesia ~ 08:30 ~ 10:00 ~ R.12 ~ Bu Siti\nSelasa ~ Fisika ~ 07:00 ~ 08:45 ~ Lab Fisika ~ Pak Suryo`;
    }
    if (type === 'task') {
      return `Format per baris (pisahkan dengan ~ atau |):\nJudul Tugas ~ Mapel ~ Tanggal Deadline (YYYY-MM-DD) ~ Jam ~ Keterangan\n\nContoh:\nPR Matematika Hal 54 ~ Matematika ~ ${today} ~ 21:00 ~ No 1-10\nKliping Sejarah ~ Sejarah ~ ${today} ~ 18:00 ~ Rangkum bab 2`;
    }
    return `Format per baris (pisahkan dengan ~ atau |):\nNama Kegiatan ~ Tanggal (YYYY-MM-DD) ~ Jam ~ Tier (penting/sedang/tidak) ~ Lokasi\n\nContoh:\nLes Bimbel TPS ~ ${today} ~ 16:30 ~ penting ~ Bimbel Salemba\nNonton Bioskop XXI ~ ${today} ~ 19:00 ~ sedang ~ Mall Central XXI`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-mono-200 dark:border-mono-800 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
              {getTitle()}
            </h2>
            <p className="text-xs text-mono-500 mt-0.5">
              Input banyak data sekaligus melalui formulir baris atau tempel teks langsung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-2 border-b border-mono-100 dark:border-mono-800/80 bg-mono-50 dark:bg-mono-950">
          <button
            onClick={() => setMode('form')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              mode === 'form'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700'
            }`}
          >
            Formulir Multi-Baris
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              mode === 'paste'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-300 dark:border-mono-700'
            }`}
          >
            Tempel Teks Massal
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {mode === 'paste' ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-mono-700 dark:text-mono-300">
                Tempel Data (Gunakan pemisah ~ atau | antar kolom):
              </label>
              <textarea
                rows={10}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full p-3 rounded-2xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
              />
            </div>
          ) : (
            <div>
              {/* Form Multi-Row: SCHEDULE */}
              {type === 'schedule' && (
                <div className="space-y-3">
                  {scheduleRows.map((row, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50/50 dark:bg-mono-950/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-mono-500">
                        <span>Baris {idx + 1}</span>
                        {scheduleRows.length > 1 && (
                          <button
                            onClick={() => setScheduleRows(scheduleRows.filter((_, i) => i !== idx))}
                            className="text-mono-400 hover:text-black dark:hover:text-white p-1"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Hari</label>
                          <select
                            value={row.day}
                            onChange={(e) => {
                              const updated = [...scheduleRows];
                              updated[idx].day = e.target.value as DayOfWeek;
                              setScheduleRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-bold"
                          >
                            {DAYS_OF_WEEK.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Nama Mapel *</label>
                          <input
                            type="text"
                            placeholder="Contoh: Matematika"
                            value={row.subject}
                            onChange={(e) => {
                              const updated = [...scheduleRows];
                              updated[idx].subject = e.target.value;
                              setScheduleRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Mulai</label>
                          <input
                            type="time"
                            value={row.startTime}
                            onChange={(e) => {
                              const updated = [...scheduleRows];
                              updated[idx].startTime = e.target.value;
                              setScheduleRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Selesai</label>
                          <input
                            type="time"
                            value={row.endTime}
                            onChange={(e) => {
                              const updated = [...scheduleRows];
                              updated[idx].endTime = e.target.value;
                              setScheduleRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Ruang</label>
                          <input
                            type="text"
                            placeholder="R.12"
                            value={row.room}
                            onChange={(e) => {
                              const updated = [...scheduleRows];
                              updated[idx].room = e.target.value;
                              setScheduleRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddScheduleRow}
                    className="w-full py-2.5 rounded-xl border border-dashed border-mono-300 dark:border-mono-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-black dark:hover:border-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Baris Mapel</span>
                  </button>
                </div>
              )}

              {/* Form Multi-Row: TASKS */}
              {type === 'task' && (
                <div className="space-y-3">
                  {taskRows.map((row, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50/50 dark:bg-mono-950/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-mono-500">
                        <span>Tugas {idx + 1}</span>
                        {taskRows.length > 1 && (
                          <button
                            onClick={() => setTaskRows(taskRows.filter((_, i) => i !== idx))}
                            className="text-mono-400 hover:text-black dark:hover:text-white p-1"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Judul Tugas *</label>
                          <input
                            type="text"
                            placeholder="Contoh: PR Matematika Hal 45"
                            value={row.title}
                            onChange={(e) => {
                              const updated = [...taskRows];
                              updated[idx].title = e.target.value;
                              setTaskRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Mapel</label>
                          <input
                            type="text"
                            placeholder="Matematika"
                            value={row.subjectName}
                            onChange={(e) => {
                              const updated = [...taskRows];
                              updated[idx].subjectName = e.target.value;
                              setTaskRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Deadline</label>
                          <input
                            type="date"
                            value={row.dueDate}
                            onChange={(e) => {
                              const updated = [...taskRows];
                              updated[idx].dueDate = e.target.value;
                              setTaskRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Jam</label>
                          <input
                            type="time"
                            value={row.dueTime}
                            onChange={(e) => {
                              const updated = [...taskRows];
                              updated[idx].dueTime = e.target.value;
                              setTaskRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddTaskRow}
                    className="w-full py-2.5 rounded-xl border border-dashed border-mono-300 dark:border-mono-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-black dark:hover:border-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Baris Tugas</span>
                  </button>
                </div>
              )}

              {/* Form Multi-Row: EVENTS */}
              {type === 'event' && (
                <div className="space-y-3">
                  {eventRows.map((row, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl border border-mono-200 dark:border-mono-800 bg-mono-50/50 dark:bg-mono-950/50 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-mono-500">
                        <span>Agenda {idx + 1}</span>
                        {eventRows.length > 1 && (
                          <button
                            onClick={() => setEventRows(eventRows.filter((_, i) => i !== idx))}
                            className="text-mono-400 hover:text-black dark:hover:text-white p-1"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Nama Kegiatan *</label>
                          <input
                            type="text"
                            placeholder="Contoh: Nonton bioskop XXI"
                            value={row.title}
                            onChange={(e) => {
                              const updated = [...eventRows];
                              updated[idx].title = e.target.value;
                              setEventRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Tanggal</label>
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => {
                              const updated = [...eventRows];
                              updated[idx].date = e.target.value;
                              setEventRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Jam</label>
                          <input
                            type="time"
                            value={row.time}
                            onChange={(e) => {
                              const updated = [...eventRows];
                              updated[idx].time = e.target.value;
                              setEventRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Tier Prioritas</label>
                          <select
                            value={row.tier}
                            onChange={(e) => {
                              const updated = [...eventRows];
                              updated[idx].tier = e.target.value as PriorityTier;
                              setEventRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs font-bold"
                          >
                            <option value="penting">PENTING</option>
                            <option value="sedang">SEDANG</option>
                            <option value="tidak">SANTAI</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-mono-500 uppercase">Lokasi</label>
                          <input
                            type="text"
                            placeholder="Mall XXI"
                            value={row.location}
                            onChange={(e) => {
                              const updated = [...eventRows];
                              updated[idx].location = e.target.value;
                              setEventRows(updated);
                            }}
                            className="w-full p-2 rounded-xl bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddEventRow}
                    className="w-full py-2.5 rounded-xl border border-dashed border-mono-300 dark:border-mono-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-black dark:hover:border-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Baris Agenda</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-mono-200 dark:border-mono-800 flex items-center justify-end gap-2 bg-mono-50/50 dark:bg-mono-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-mono-300 dark:border-mono-700 text-xs font-bold hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={mode === 'paste' ? handleSavePaste : handleSaveForm}
            className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            Simpan Semua Data Massal
          </button>
        </div>

      </div>
    </div>
  );
};

