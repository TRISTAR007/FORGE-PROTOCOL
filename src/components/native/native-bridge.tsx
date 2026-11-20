'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isNative } from '@/lib/native';

/**
 * Glue for the Android / iOS app shell. Does nothing in a normal browser.
 *  - hides the splash screen once the page is ready
 *  - dark status bar that matches the app
 *  - Android back button navigates back (and exits at the root)
 *  - tapping the daily reminder notification opens today's workout
 */
export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNative()) return;
    document.documentElement.classList.add('native-app');
    const cleanups: (() => void)[] = [];

    void (async () => {
      const [{ SplashScreen }, { StatusBar, Style }, { App }, { LocalNotifications }] = await Promise.all([
        import('@capacitor/splash-screen'),
        import('@capacitor/status-bar'),
        import('@capacitor/app'),
        import('@capacitor/local-notifications'),
      ]);

      await SplashScreen.hide().catch(() => {});
      await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      await StatusBar.setBackgroundColor({ color: '#0C0A1D' }).catch(() => {});

      const back = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else void App.exitApp();
      });
      cleanups.push(() => void back.remove());

      const tapped = await LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
        const url = event.notification.extra?.url;
        if (typeof url === 'string' && url.startsWith('/')) router.push(url);
      });
      cleanups.push(() => void tapped.remove());
    })();

    return () => cleanups.forEach((fn) => fn());
  }, [router]);

  return null;
}
