import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ivan Fit',
  description: 'Allenamento, progressi e coaching in un’unica app.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
