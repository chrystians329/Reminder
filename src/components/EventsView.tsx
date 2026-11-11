import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MapPin, 
  AlertCircle,
  Calendar
} from 'lucide-react';
import { OutOfSchoolEvent, PriorityTier } from '../types';
import { formatRelativeDate, formatDateKey } from '../utils/dateUtils';

interface EventsViewProps {
  events: OutOfSchoolEvent[];
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenAddEvent: (defaultDate?: string) => void;
  onOpenEditEvent: (event: OutOfSchoolEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onToggleEvent,
  onDeleteEvent,
  onOpenAddEvent,
  onOpenEditEvent
}) => {
  const [tierFilter, setTierFilter] = useState<'semua' | PriorityTier>('semua');
  const [statusFilter, setStatusFilter] = useState<'aktif' | 'selesai' | 'semua'>('aktif');

  const filteredEvents = events.filter((e) => {
    if (tierFilter !== 'semua' && e.tier !== tierFilter) return false;
    if (statusFilter === 'aktif' && e.completed) return false;
    if (statusFilter === 'selesai' && !e.completed) return false;
    return true;
  }).sort((a, b) => {
    // Priority order: Penting (1), Sedang (2), Tidak (3)
    const tierScore: Record<PriorityTier, number> = { penting: 1, sedang: 2, tidak: 3 };
    if (tierScore[a.tier] !== tierScore[b.tier]) {
      return tierScore[a.tier] - tierScore[b.tier];
    }
    return a.date.localeCompare(b.date);
  });

  const countPenting = events.filter(e => e.tier === 'penting' && !e.completed).length;
  const countSedang = events.filter(e => e.tier === 'sedang' && !e.completed).length;
  const countTidak = events.filter(e => e.tier === 'tidak' && !e.completed).length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-mono-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AGENDA DILUAR SEKOLAH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Kegiatan Pribadi & Ekstra
            </h1>
            <p className="text-xs sm:text-sm text-mono-600 dark:text-mono-400 mt-1 max-w-xl">
              Catat acara non-sekolah seperti nonton bioskop, les bimbel, ekskul, jalan-jalan, atau janji dengan teman dengan sistem tier prioritas.
            </p>
          </div>

          <button
            onClick={() => onOpenAddEvent()}
            className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Agenda Luar</span>
          </button>
        </div>

        {/* Tier Priority Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <button
            onClick={() => setTierFilter('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              tierFilter === 'semua'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            Semua Tier ({events.length})
          </button>

          <button
            onClick={() => setTierFilter('penting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              tierFilter === 'penting'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
            <span>Tier: Penting ({countPenting})</span>
          </button>

          <button
            onClick={() => setTierFilter('sedang')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              tierFilter === 'sedang'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full border border-black dark:border-white" />
            <span>Tier: Sedang ({countSedang})</span>
          </button>

          <button
            onClick={() => setTierFilter('tidak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              tierFilter === 'tidak'
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-mono-400" />
            <span>Tier: Santai / Tidak ({countTidak})</span>
          </button>
        </div>

        {/* Status Toggle (Aktif vs Selesai) */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-mono-100 dark:border-mono-800/60">
          <span className="text-xs text-mono-500 font-medium">Status:</span>
          {(['aktif', 'selesai', 'semua'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                statusFilter === st
                  ? 'bg-mono-200 text-mono-900 dark:bg-mono-800 dark:text-mono-100 font-bold'
                  : 'text-mono-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-mono-300 dark:border-mono-800 rounded-2xl bg-white dark:bg-mono-900">
          <Sparkles className="w-8 h-8 mx-auto text-mono-400 mb-2" />
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Tidak ada agenda kegiatan pada filter ini.
          </p>
          <p className="text-xs text-mono-500 mt-1">
            Tambahkan acara baru seperti nonton bareng, jadwal les bimbel, atau janji hangout.
          </p>
          <button
            onClick={() => onOpenAddEvent()}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
          >
            + Buat Agenda Luar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => {
            return (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  evt.completed
                    ? 'bg-mono-50 dark:bg-mono-950 border-mono-200 dark:border-mono-800 opacity-60'
                    : evt.tier === 'penting'
                    ? 'bg-white dark:bg-mono-900 border-2 border-black dark:border-white shadow-sm'
                    : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    {/* Checkbox & Tier badge */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleEvent(evt.id)}
                        className="text-mono-900 dark:text-mono-100 hover:scale-110 active:scale-95 transition-transform"
                        title={evt.completed ? "Tandai belum selesai" : "Tandai selesai"}
                      >
                        {evt.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-black dark:fill-white text-white dark:text-black" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {evt.tier === 'penting' && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                          TIER: PENTING
                        </span>
                      )}
                      {evt.tier === 'sedang' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white text-mono-900 dark:text-mono-100">
                          TIER: SEDANG
                        </span>
                      )}
                      {evt.tier === 'tidak' && (
                        <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400">
                          TIER: SANTAI
                        </span>
                      )}
                    </div>

                    {/* Date badge */}
                    <span className="text-xs font-mono font-bold text-mono-600 dark:text-mono-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatRelativeDate(evt.date, formatDateKey(new Date()))}</span>
                    </span>
                  </div>

                  <h3 className={`text-base font-bold mt-2.5 tracking-tight ${evt.completed ? 'line-through text-mono-400' : ''}`}>
                    {evt.title}
                  </h3>

                  {/* Metadata (Time & Location) */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-mono-600 dark:text-mono-400 mt-2">
                    {evt.time && (
                      <span className="flex items-center gap-1 font-mono font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>Pukul {evt.time}</span>
                      </span>
                    )}
                    {evt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{evt.location}</span>
                      </span>
                    )}
                  </div>

                  {evt.description && (
                    <p className="text-xs text-mono-600 dark:text-mono-400 mt-2 whitespace-pre-line bg-mono-50 dark:bg-mono-950 p-2.5 rounded-xl border border-mono-100 dark:border-mono-800/80">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-mono-100 dark:border-mono-800">
                  <button
                    onClick={() => onOpenEditEvent(evt)}
                    className="p-1.5 text-mono-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                    title="Edit Agenda"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus kegiatan "${evt.title}"?`)) {
                        onDeleteEvent(evt.id);
                      }
                    }}
                    className="p-1.5 text-mono-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-mono-100 dark:hover:bg-mono-800 transition-colors"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
