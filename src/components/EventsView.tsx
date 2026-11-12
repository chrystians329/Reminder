import React, { useState } from 'react';
import { 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { OutOfSchoolEvent, PriorityTier } from '../types';
import { formatRelativeDate, formatDateKey } from '../utils/dateUtils';

interface EventsViewProps {
  events: OutOfSchoolEvent[];
  onToggleEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onDeleteBulkEvents: (ids: string[]) => void;
  onOpenAddEvent: (defaultDate?: string) => void;
  onOpenBulkAddEvent: () => void;
  onOpenEditEvent: (event: OutOfSchoolEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onToggleEvent,
  onDeleteEvent,
  onDeleteBulkEvents,
  onOpenAddEvent,
  onOpenBulkAddEvent,
  onOpenEditEvent
}) => {
  const [tierFilter, setTierFilter] = useState<'semua' | PriorityTier>('semua');
  const [statusFilter, setStatusFilter] = useState<'aktif' | 'selesai' | 'semua'>('aktif');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredEvents = events.filter((e) => {
    if (tierFilter !== 'semua' && e.tier !== tierFilter) return false;
    if (statusFilter === 'aktif' && e.completed) return false;
    if (statusFilter === 'selesai' && !e.completed) return false;
    return true;
  }).sort((a, b) => {
    const tierScore: Record<PriorityTier, number> = { penting: 1, sedang: 2, tidak: 3 };
    if (tierScore[a.tier] !== tierScore[b.tier]) {
      return tierScore[a.tier] - tierScore[b.tier];
    }
    return a.date.localeCompare(b.date);
  });

  const countPenting = events.filter(e => e.tier === 'penting' && !e.completed).length;
  const countSedang = events.filter(e => e.tier === 'sedang' && !e.completed).length;
  const countTidak = events.filter(e => e.tier === 'tidak' && !e.completed).length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEvents.map(e => e.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} agenda kegiatan yang dipilih?`)) {
      onDeleteBulkEvents(selectedIds);
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
              AGENDA LUAR
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Daftar Agenda Luar
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 rounded-xl border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold text-xs transition-all"
              >
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}

            <button
              onClick={onOpenBulkAddEvent}
              className="px-3.5 py-2.5 rounded-xl border border-mono-300 dark:border-mono-700 hover:border-black dark:hover:border-white font-bold text-xs transition-all shadow-sm"
            >
              + Massal
            </button>

            <button
              onClick={() => onOpenAddEvent()}
              className="px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              + Tambah Agenda
            </button>
          </div>
        </div>

        {/* Tier Priority Filter Chips & Select All */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-mono-200 dark:border-mono-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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
              <span>Penting</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tierFilter === 'penting' ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-mono-200 dark:bg-mono-800'
              }`}>
                {countPenting}
              </span>
            </button>
            <button
              onClick={() => setTierFilter('sedang')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                tierFilter === 'sedang'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>Sedang</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tierFilter === 'sedang' ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-mono-200 dark:bg-mono-800'
              }`}>
                {countSedang}
              </span>
            </button>
            <button
              onClick={() => setTierFilter('tidak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                tierFilter === 'tidak'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent text-mono-700 dark:text-mono-300 border-mono-200 dark:border-mono-800 hover:border-mono-400'
              }`}
            >
              <span>Biasa</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                tierFilter === 'tidak' ? 'bg-white text-black dark:bg-black dark:text-white' : 'bg-mono-200 dark:bg-mono-800'
              }`}>
                {countTidak}
              </span>
            </button>
          </div>

          {filteredEvents.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-mono-600 dark:text-mono-400 hover:text-black dark:hover:text-white self-start sm:self-auto"
            >
              {selectedIds.length === filteredEvents.length ? 'Batal Pilih Semua' : 'Pilih Semua untuk Aksi Massal'}
            </button>
          )}
        </div>

        {/* Status Filter Tab */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-mono-100 dark:border-mono-800/60 text-xs font-bold">
          <span className="text-mono-500 uppercase text-[10px]">Status:</span>
          {(['aktif', 'selesai', 'semua'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-black text-white dark:bg-white dark:text-black'
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
          <p className="text-sm font-semibold text-mono-800 dark:text-mono-200">
            Tidak ada agenda kegiatan pada filter ini.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => onOpenAddEvent()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
            >
              + Buat Agenda
            </button>
            <span className="text-mono-400 text-xs"> ~ </span>
            <button
              onClick={onOpenBulkAddEvent}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-mono-300 dark:border-mono-700"
            >
              + Tambah Massal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => {
            const isSelected = selectedIds.includes(evt.id);
            const dateInfo = [
              formatRelativeDate(evt.date, formatDateKey(new Date())),
              evt.date
            ].join(' ~ ');

            const eventMeta = [
              evt.time ? `Pukul ${evt.time}` : '',
              evt.location
            ].filter(Boolean).join(' ~ ');

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-black dark:border-white ring-2 ring-mono-400'
                    : evt.completed
                    ? 'bg-mono-50 dark:bg-mono-950 border-mono-200 dark:border-mono-800 opacity-60'
                    : evt.tier === 'penting'
                    ? 'bg-white dark:bg-mono-900 border-2 border-black dark:border-white shadow-sm'
                    : 'bg-white dark:bg-mono-900 border-mono-200 dark:border-mono-800 hover:border-mono-400'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Checkbox selection for mass delete */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(evt.id)}
                        className="w-4 h-4 rounded border-mono-300 accent-black cursor-pointer"
                        title="Pilih untuk hapus massal"
                      />

                      {/* Checkbox completion */}
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
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                          PENTING
                        </span>
                      )}
                      {evt.tier === 'sedang' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-black dark:border-white text-mono-900 dark:text-mono-100">
                          SEDANG
                        </span>
                      )}
                      {evt.tier === 'tidak' && (
                        <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded bg-mono-200 dark:bg-mono-800 text-mono-600 dark:text-mono-400">
                          BIASA
                        </span>
                      )}
                    </div>

                    {/* Date badge */}
                    <span className="text-xs font-mono font-bold text-mono-600 dark:text-mono-400">
                      {dateInfo}
                    </span>
                  </div>

                  <h3 className={`text-base font-bold mt-2.5 tracking-tight ${evt.completed ? 'line-through text-mono-400' : ''}`}>
                    {evt.title}
                  </h3>

                  {/* Metadata combined with ~ */}
                  {eventMeta && (
                    <div className="text-xs text-mono-600 dark:text-mono-400 mt-2 font-mono">
                      {eventMeta}
                    </div>
                  )}

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
