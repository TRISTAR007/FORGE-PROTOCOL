import type { Metadata, Viewport } from 'next';
import { Dela_Gothic_One, M_PLUS_Rounded_1c, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker';
import { NativeBridge } from '@/components/native/native-bridge';
import { RTL_LOCALES, type Locale } from '@/i18n/config';
import { APP_NAME } from '@/lib/brand';
import './globals.css';

// Heavy, poster-style display face with an anime title-card feel.
const display = Dela_Gothic_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

// Friendly rounded body face. CJK, Hindi and Arabic text falls back to the system's native fonts.
const body = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const TITLE = `${APP_NAME} — Free Anime Workouts, Coaches & Community`;
const DESCRIPTION =
  'Free home and gym workouts guided by original anime-style coaches, with voice coaching, XP and belts, 30-day Training Arcs and a worldwide community. For anime fans and everyone else.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: APP_NAME,
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Dojo',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#0C0A1D',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <NativeBridge />
        </NextIntlClientProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
