import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reminder.app',
  appName: 'Reminder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

