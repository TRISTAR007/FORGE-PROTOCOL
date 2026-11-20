import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android / iOS app shell for Level Up Dojo.
 *
 * The app loads your deployed site (it needs Supabase auth, server
 * rendering and live community chat, so it can't be a static bundle).
 * Set CAP_SERVER_URL to your production URL before `npx cap sync`, e.g.
 *   CAP_SERVER_URL=https://levelupdojo.app npx cap sync
 * `native-shell/` is only shown if the site can't be reached.
 */
const serverUrl = process.env.CAP_SERVER_URL ?? 'https://your-app.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.levelupdojo.app',
  appName: 'Level Up Dojo',
  webDir: 'native-shell',
  backgroundColor: '#0C0A1D',
  server: {
    url: serverUrl,
    cleartext: false,
    errorPath: 'index.html',
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'never',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#0C0A1D',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0C0A1D',
    },
    LocalNotifications: {
      iconColor: '#FF4D94',
    },
  },
};

export default config;
