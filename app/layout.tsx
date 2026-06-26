import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Termessos Hotel Menü',
  description: 'Termessos Hotel QR Menü — Göreme, Nevşehir',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
