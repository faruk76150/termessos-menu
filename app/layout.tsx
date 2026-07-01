import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Termessos Hotel Menü',
  description: 'Termessos Hotel QR Menü — Göreme, Nevşehir',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${cormorant.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
