import type { Metadata, Viewport } from 'next';
import { Anton, Manrope, JetBrains_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'FORGE Protocol — 365-Day Home Transformation',
  description:
    'A 365-day bodyweight training, nutrition, and recovery protocol — built for training at home, on a budget, with no equipment.',
};

export const viewport: Viewport = {
  themeColor: '#131417',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable} ${jbMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
