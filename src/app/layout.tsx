import type { Metadata } from 'next';
import './globals.css';
import SmoothScroller from '@/components/SmoothScroller';

export const metadata: Metadata = {
  title: 'E.ON – Energie für Dich',
  description: 'Deutschlands führender Energiepartner.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <SmoothScroller>{children}</SmoothScroller>
      </body>
    </html>
  );
}
