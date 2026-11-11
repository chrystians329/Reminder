# 📓 Reminder Pelajar (Web & Mobile App)

Aplikasi manajemen jadwal sekolah, tugas / PR, dan agenda kegiatan harian yang fleksibel khusus untuk **pelajar**, dirancang dengan pendekatan **Mobile-First** dan estetika **Monochrome (Hitam & Putih)** yang bersih, minimalis, dan berfokus pada produktivitas tanpa distraksi visual berlebihan.

---

## ✨ Fitur Utama

### 1. 📅 Jadwal Pelajaran Tetap (Senin - Sabtu)
- **Permanen & Rutin**: Jadwal mingguan otomatis berulang setiap minggu dan tidak akan hilang kecuali dihapus manual oleh siswa.
- Informasi lengkap: Hari (Senin–Sabtu), Nama Mapel, Jam Mulai & Selesai, Ruang Kelas/Lab, Nama Guru, dan Catatan Khusus.
- **Deteksi Otomatis Mapel Berlangsung**: Menandai mata pelajaran yang sedang aktif pada jam belajar.
- Tautan Cepat: Tombol **"+ Tugas PR"** langsung dari kartu jadwal untuk menambahkan PR terkait mapel tersebut.

### 2. 📝 Manajemen Tugas & PR (Terhubung dengan Jadwal)
- Hubungkan tugas langsung dengan mata pelajaran dari jadwal sekolah (misal: *PR Matematika Halaman 54*).
- Dilengkapi tenggat waktu (Deadline: Tanggal & Jam) serta deskripsi pengerjaan.
- Filter cerdas: **Aktif & Hari Ini**, **Selesai**, **Terlewat (Overdue)**, dan **Semua**.
- Indikator peringatan jika tugas melewati batas waktu deadline.

### 3. 🎯 Siklus Hidup Tugas yang Bersih
- **Satu Klik Selesai**: Centang checkbox untuk menandai tugas selesai dengan efek coret teks rapi.
- **Pembersihan Otomatis / Manual**: Tombol *"Bersihkan Selesai/Lewat"* dan toggle filter agar dashboard selalu fokus pada hal yang relevan hari ini.

### 4. ⚡ Agenda Kegiatan di Luar Sekolah (Sistem 3 Tier)
Untuk kegiatan non-sekolah seperti nonton bioskop bareng teman, les bimbel, ekstrakurikuler, turnamen futsal, atau janji hangout.
- **Tier 1: PENTING** (Prioritas tinggi, badge kontras hitam-putih tebal dengan ikon peringatan).
- **Tier 2: SEDANG** (Prioritas reguler dengan border tegas).
- **Tier 3: SANTAI / TIDAK PENTING** (Fleksibel, badge minimalis).

### 5. 📊 Dashboard "Hari Ini" & Perencanaan Fleksibel
- Menampilkan jadwal hari ini, tugas yang harus diselesaikan, dan agenda luar penting.
- **Quick Date Switcher**: Pindah instan antara **Hari Ini**, **Besok**, **Lusa**, atau tanggal bebas.
- **Catatan & Memo Cepat Hari Ini**: Papan coretan harian dengan penyimpanan otomatis (*live autosave*).

### 6. 🗓️ Kalender Interaktif
- Tampilan kalender bulanan lengkap.
- Indikator tanggal aktif: tanda hari sekolah (`SCH`), jumlah tugas (`T`), dan agenda kegiatan (`A`).
- Klik tanggal manapun untuk melihat agenda spesifik hari tersebut di masa kini, minggu depan, atau bulan depan.

### 7. 🎨 Desain Minimalis Monochrome
- Tanpa warna-warni berlebih/lebay — strictly **Black & White** (High Contrast & Grayscale).
- Mendukung **Tema Gelap (Dark Mode)** dan **Tema Terang (Light Mode)** yang keduanya berkonsep monokrom elegan.

### 8. 💾 Keamanan Data & Offline-First
- Data tersimpan lokal di browser (`localStorage`).
- Fitur **Ekspor / Impor JSON Cadangan**: Unduh backup atau salin teks JSON untuk memindahkan data antar perangkat dengan aman.

---

## 📱 Panduan Menjadikan Mobile App

Aplikasi ini sudah dipersiapkan secara teknis untuk dua metode konversi mobile:

### Metode 1: Progressive Web App (PWA) — *Paling Cepat & Praktis*
Tanpa perlu instalasi software tambahan, siswa dapat menginstal aplikasi langsung dari browser ke layar beranda HP:
1. Jalankan aplikasi web di server / hosting (atau akses via IP lokal WiFi di HP).
2. **Di HP Android (Google Chrome)**:
   - Ketuk menu titik tiga (⋮) di pojok kanan atas browser.
   - Pilih **"Tambahkan ke Layar Utama"** (*Add to Home Screen*) atau **"Instal Aplikasi"**.
3. **Di iPhone (Safari iOS)**:
   - Ketuk tombol **Share** (kotak dengan panah ke atas) di bagian bawah.
   - Gulir dan pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
4. Aplikasi akan muncul dengan ikon di home screen HP dan berjalan layar penuh tanpa bar browser (*fullscreen app mode*).

---

### Metode 2: Build Native Android APK dengan Capacitor
Proyek ini sudah dilengkapi file `capacitor.config.ts` dan pustaka `@capacitor/android`. Untuk menghasilkan file `.apk` asli:

1. **Build aplikasi web**:
   ```bash
   npm run build
   ```

2. **Inisialisasi platform Android**:
   ```bash
   npx cap add android
   ```

3. **Sinkronisasi aset web ke folder Android**:
   ```bash
   npx cap copy
   ```

4. **Buka project di Android Studio**:
   ```bash
   npx cap open android
   ```

5. Di dalam Android Studio:
   - Pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - File APK siap dipasang di smartphone Android manapun!

---

## 🛠️ Cara Menjalankan di Komputer (Development)

1. Pastikan Node.js sudah terpasang.
2. Jalankan perintah instalasi (jika baru di-clone):
   ```bash
   npm install
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka di browser: `http://localhost:5173`

---

## 📁 Struktur Folder Proyek

```text
reminder/
├── public/
│   ├── icon.svg             # Logo Monochrome PWA
│   └── manifest.json        # Web App Manifest untuk Mobile
├── src/
│   ├── components/
│   │   ├── Modals/          # Modal Tambah/Edit Tugas, Jadwal, Agenda, Backup, & Panduan Mobile
│   │   ├── BottomNav.tsx    # Bar navigasi bawah untuk tampilan HP
│   │   ├── CalendarView.tsx # Kalender bulanan & agenda harian
│   │   ├── DashboardView.tsx# Dashboard hari ini, besok, lusa
│   │   ├── EventsView.tsx   # Agenda kegiatan luar sekolah (Tier)
│   │   ├── Header.tsx       # Top bar & navigasi desktop
│   │   ├── QuickAddModal.tsx# Menu speed-dial tambah cepat
│   │   ├── ScheduleView.tsx # Roster jadwal pelajaran Senin - Sabtu
│   │   └── TasksView.tsx    # Manajemen tugas & PR
│   ├── constants/           # Data contoh bawaan pelajar (sample defaults)
│   ├── services/            # Penyimpanan localStorage & fungsi backup
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Format penanggalan bahasa Indonesia & kalkulasi deadline
│   ├── App.tsx              # Komponen utama & state management
│   ├── index.css            # Styling Tailwind & scrollbar monokrom
│   └── main.tsx             # Entry point React
├── capacitor.config.ts      # Konfigurasi mobile Capacitor
├── tailwind.config.js       # Konfigurasi palette monokrom
├── tsconfig.json
└── vite.config.ts
```

# Reminder
# Reminder
