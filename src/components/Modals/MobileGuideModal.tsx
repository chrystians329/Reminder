import React from 'react';
import { X, Smartphone, Check, Terminal, Globe } from 'lucide-react';

interface MobileGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileGuideModal: React.FC<MobileGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-mono-900 border border-mono-200 dark:border-mono-800 rounded-3xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-mono-100 dark:border-mono-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">
                Cara Menjadikan Aplikasi Mobile
              </h2>
              <p className="text-xs text-mono-500">
                Web App ini sudah dirancang untuk dua jalur konversi mobile: PWA & Native APK Capacitor.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-mono-400 hover:text-black dark:hover:text-white hover:bg-mono-100 dark:hover:bg-mono-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs sm:text-sm">
          
          {/* Method 1: PWA (Install ke HP tanpa build APK) */}
          <div className="p-4 rounded-2xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 space-y-2.5">
            <div className="flex items-center gap-2 font-black text-sm">
              <Globe className="w-4 h-4" />
              <span>Metode 1: PWA (Langsung Pasang di HP Android & iPhone)</span>
            </div>
            <p className="text-mono-600 dark:text-mono-400 text-xs">
              Aplikasi ini sudah mendukung Progressive Web App. Tampilan langsung menyesuaikan layar HP dengan navigasi bawah dan berjalan fullscreen tanpa bar browser.
            </p>
            <div className="space-y-1.5 text-xs text-mono-700 dark:text-mono-300">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 mt-0.5 text-mono-900 dark:text-mono-100 shrink-0" />
                <span><strong>Android (Chrome):</strong> Buka browser di HP &gt; Tekan Menu titik tiga (⋮) &gt; Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 mt-0.5 text-mono-900 dark:text-mono-100 shrink-0" />
                <span><strong>iPhone (Safari):</strong> Buka di Safari &gt; Tekan tombol <strong>Share</strong> (ikon kotak panah ke atas) &gt; Pilih <strong>"Add to Home Screen"</strong>.</span>
              </div>
            </div>
          </div>

          {/* Method 2: Capacitor (Build Jadi File .APK Android) */}
          <div className="p-4 rounded-2xl bg-mono-50 dark:bg-mono-950 border border-mono-200 dark:border-mono-800 space-y-2.5">
            <div className="flex items-center gap-2 font-black text-sm">
              <Terminal className="w-4 h-4" />
              <span>Metode 2: Capacitor (Build Native APK Android)</span>
            </div>
            <p className="text-mono-600 dark:text-mono-400 text-xs">
              Project ini sudah terkonfigurasi dengan Capacitor (<code>capacitor.config.ts</code>). Kamu bisa langsung menjadikannya APK native Android dengan 4 perintah berikut:
            </p>
            <div className="bg-black text-mono-100 dark:bg-mono-950 dark:text-mono-200 p-3 rounded-xl font-mono text-xs space-y-1.5 overflow-x-auto border border-mono-800">
              <p className="text-mono-400"># 1. Build bundle web app</p>
              <p className="text-white font-bold">npm run build</p>
              <p className="text-mono-400 pt-1"># 2. Tambahkan folder android Capacitor</p>
              <p className="text-white font-bold">npx cap add android</p>
              <p className="text-mono-400 pt-1"># 3. Sinkronisasikan file aset ke android</p>
              <p className="text-white font-bold">npx cap copy</p>
              <p className="text-mono-400 pt-1"># 4. Buka di Android Studio untuk membuat APK</p>
              <p className="text-white font-bold">npx cap open android</p>
            </div>
            <p className="text-[11px] text-mono-500">
              * Di Android Studio, klik menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> untuk langsung mendapatkan file <code>.apk</code> yang dapat diinstal di semua smartphone Android.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-mono-100 dark:border-mono-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
          >
            Mengerti & Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
