import type { Metadata, Viewport } from 'next';
import { Anton, Manrope, JetBrains_Mono } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker';
import './globals.css';

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jbmono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const DESCRIPTION =
  'A 365-day bodyweight training, nutrition, and recovery protocol — built for training at home, on a budget, with no equipment.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'FORGE Protocol — 365-Day Home Transformation',
  description: DESCRIPTION,
  applicationName: 'FORGE Protocol',
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'FORGE',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    siteName: 'FORGE Protocol',
    title: 'FORGE Protocol — 365-Day Home Transformation',
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FORGE Protocol — 365-Day Home Transformation',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#131417',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable} ${jbMono.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
