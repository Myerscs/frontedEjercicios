import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'fittracker-frontend',
  webDir: 'www',
  plugins: {
    Geolocation: {
      permissions: ["location"]
    }
  }
};

export default config;
