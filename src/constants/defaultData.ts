import { SchoolSchedule, TaskItem, OutOfSchoolEvent } from '../types';
import { formatDateKey, addDays } from '../utils/dateUtils';

const today = formatDateKey(new Date());
const tomorrow = addDays(today, 1);
const dayAfter = addDays(today, 2);

export const DEFAULT_SCHEDULE: SchoolSchedule[] = [
  // SENIN
  {
    id: 'sch-sen-1',
    day: 'Senin',
    subject: 'Upacara Bendera',
    startTime: '06:45',
    endTime: '07:30',
    room: 'Lapangan Utama',
    teacher: 'Kepala Sekolah',
    notes: 'Kenakan seragam lengkap dengan dasi dan topi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sen-2',
    day: 'Senin',
    subject: 'Matematika Wajib',
    startTime: '07:30',
    endTime: '09:00',
    room: 'Kelas XII-1',
    teacher: 'Pak Bambang, M.Pd',
    notes: 'Bawa penggaris dan buku berpetak',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sen-3',
    day: 'Senin',
    subject: 'Bahasa Indonesia',
    startTime: '09:30',
    endTime: '11:00',
    room: 'Kelas XII-1',
    teacher: 'Bu Retno, S.Pd',
    notes: 'Presentasi artikel ilmiah',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sen-4',
    day: 'Senin',
    subject: 'Bahasa Inggris',
    startTime: '11:00',
    endTime: '12:30',
    room: 'Lab Bahasa',
    teacher: 'Mr. David',
    notes: 'Listening comprehension section',
    createdAt: new Date().toISOString()
  },

  // SELASA
  {
    id: 'sch-sel-1',
    day: 'Selasa',
    subject: 'Fisika',
    startTime: '07:00',
    endTime: '08:45',
    room: 'Lab Fisika',
    teacher: 'Pak Suryo, S.Si',
    notes: 'Praktikum dinamika rotasi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sel-2',
    day: 'Selasa',
    subject: 'PJOK (Olahraga)',
    startTime: '09:00',
    endTime: '10:30',
    room: 'GOR Sekolah',
    teacher: 'Pak Joko, S.Pd',
    notes: 'Materi bola basket, bawa baju olahraga ganti',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sel-3',
    day: 'Selasa',
    subject: 'Kimia',
    startTime: '10:45',
    endTime: '12:15',
    room: 'Kelas XII-1',
    teacher: 'Bu Endah, M.Si',
    notes: 'Latihan reaksi asam basa',
    createdAt: new Date().toISOString()
  },

  // RABU
  {
    id: 'sch-rab-1',
    day: 'Rabu',
    subject: 'Matematika Minat',
    startTime: '07:00',
    endTime: '08:30',
    room: 'Kelas XII-1',
    teacher: 'Pak Bambang, M.Pd',
    notes: 'Materi kalkulus & turunan fungsi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-rab-2',
    day: 'Rabu',
    subject: 'Biologi',
    startTime: '08:45',
    endTime: '10:15',
    room: 'Lab Biologi',
    teacher: 'Bu Ratna, S.Pd',
    notes: 'Bawa preparat mikroskop',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-rab-3',
    day: 'Rabu',
    subject: 'Sejarah Indonesia',
    startTime: '10:45',
    endTime: '12:15',
    room: 'Kelas XII-1',
    teacher: 'Pak Haris, S.Pd',
    notes: 'Catat poin penting era pergerakan nasional',
    createdAt: new Date().toISOString()
  },

  // KAMIS
  {
    id: 'sch-kam-1',
    day: 'Kamis',
    subject: 'Sosiologi & Geografi',
    startTime: '07:00',
    endTime: '08:45',
    room: 'Kelas XII-1',
    teacher: 'Bu Maya, M.Pd',
    notes: 'Analisis fenomena sosial urbanisasi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-kam-2',
    day: 'Kamis',
    subject: 'Seni Budaya',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Ruang Kesenian',
    teacher: 'Pak Teguh, S.Sn',
    notes: 'Bawa buku gambar A3 & pensil 2B',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-kam-3',
    day: 'Kamis',
    subject: 'Pendidikan Pancasila (PPKn)',
    startTime: '10:45',
    endTime: '12:00',
    room: 'Kelas XII-1',
    teacher: 'Bu Wahyu, S.Pd',
    notes: 'Diskusi kelompok hak asasi manusia',
    createdAt: new Date().toISOString()
  },

  // JUMAT
  {
    id: 'sch-jum-1',
    day: 'Jumat',
    subject: 'Pendidikan Agama & Budi Pekerti',
    startTime: '07:00',
    endTime: '08:30',
    room: 'Aula Utama / Kelas',
    teacher: 'Ustadz / Pembina Rohis',
    notes: 'Kajian nilai-nilai toleransi dan moralitas',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-jum-2',
    day: 'Jumat',
    subject: 'Bimbingan Konseling (BK)',
    startTime: '08:45',
    endTime: '09:45',
    room: 'Ruang BK',
    teacher: 'Bu Desi, M.Psi',
    notes: 'Sesi perencanaan jurusan kuliah / PTN',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-jum-3',
    day: 'Jumat',
    subject: 'Pramuka Wajib',
    startTime: '13:30',
    endTime: '15:00',
    room: 'Lapangan Luar',
    teacher: 'Kak Ilham',
    notes: 'Seragam pramuka lengkap dengan kacu',
    createdAt: new Date().toISOString()
  },

  // SABTU
  {
    id: 'sch-sab-1',
    day: 'Sabtu',
    subject: 'Ekstrakurikuler Pilihan',
    startTime: '07:30',
    endTime: '09:30',
    room: 'Area Ekskul',
    teacher: 'Pelatih / Kakak Pembina',
    notes: 'Futsal / Robotik / Debat Bahasa Inggris',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sch-sab-2',
    day: 'Sabtu',
    subject: 'Studi Terbimbing & Diskusi',
    startTime: '10:00',
    endTime: '11:30',
    room: 'Perpustakaan',
    teacher: 'Tutor Sebaya',
    notes: 'Membahas soal-soal latihan ujian',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'PR Matematika: Latihan Halaman 54',
    description: 'Kerjakan nomor 1 s/d 10 di buku tugas berpetak beserta langkah penyelesaiannya.',
    scheduleId: 'sch-sen-2',
    subjectName: 'Matematika Wajib',
    dueDate: today,
    dueTime: '21:00',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-2',
    title: 'Kliping Sejarah Nasional',
    description: 'Kumpulkan artikel berita tentang peristiwa bersejarah dan buat rangkumannya.',
    scheduleId: 'sch-rab-3',
    subjectName: 'Sejarah Indonesia',
    dueDate: tomorrow,
    dueTime: '18:00',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'tsk-3',
    title: 'Laporan Praktikum Fisika',
    description: 'Tuliskan hasil pengukuran osilasi pegas dan kesimpulan grafik.',
    scheduleId: 'sch-sel-1',
    subjectName: 'Fisika',
    dueDate: dayAfter,
    dueTime: '23:59',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_EVENTS: OutOfSchoolEvent[] = [
  {
    id: 'evt-1',
    title: 'Les Bimbel Persiapan Masuk PTN',
    description: 'Materi intensif TPS & Penalaran Matematika di cabang Salemba.',
    date: today,
    time: '16:30',
    tier: 'penting',
    location: 'Bimbel Nurul Fikri',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-2',
    title: 'Nonton Bioskop Bareng Teman Kelas',
    description: 'Nonton film terbaru di XXI, kumpul di dekat eskalator jam 16:00.',
    date: tomorrow,
    time: '16:00',
    tier: 'sedang',
    location: 'Cinema XXI Grand Mall',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'evt-3',
    title: 'Beli Buku Catatan & Alat Tulis Baru',
    description: 'Beli pulpen hitam 0.5, binder note, dan sticky notes.',
    date: dayAfter,
    time: '19:00',
    tier: 'tidak',
    location: 'Gramedia',
    completed: false,
    createdAt: new Date().toISOString()
  }
];
