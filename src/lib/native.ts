/**
 * Native (Android / iOS) helpers via Capacitor. Every function is safe to
 * call on the web: it reports `false` / 'unsupported' and the caller uses
 * the browser fallback. Plugins are imported lazily so the web bundle
 * doesn't carry them.
 */
import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
}

export function nativePlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web';
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

export async function hapticImpact(strength: 'light' | 'medium' | 'heavy' = 'medium'): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const style = strength === 'light' ? ImpactStyle.Light : strength === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium;
    await Haptics.impact({ style });
    return true;
  } catch {
    return false;
  }
}

export async function hapticSuccess(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
    return true;
  } catch {
    return false;
  }
}

const REMINDER_ID = 1001;

/** Schedules (or replaces) a repeating daily local notification at HH:MM. */
export async function scheduleDailyReminder(
  time: string,
  title: string,
  body: string
): Promise<'scheduled' | 'denied' | 'unsupported'> {
  if (!isNative()) return 'unsupported';
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return 'denied';
    const [hour, minute] = time.split(':').map(Number);
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_ID,
          title,
          body,
          schedule: { on: { hour: hour || 0, minute: minute || 0 }, repeats: true, allowWhileIdle: true },
          extra: { url: '/workout?start=1' },
        },
      ],
    });
    return 'scheduled';
  } catch {
    return 'unsupported';
  }
}

/** Shares an image through the native share sheet (writes it to the cache first). */
export async function shareImageNative(blob: Blob, filename: string, title: string): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ]);
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const written = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    await Share.share({ title, files: [written.uri] });
    return true;
  } catch {
    return false;
  }
}

/** Native share sheet for plain text / links. */
export async function shareTextNative(title: string, text: string, url?: string): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}
