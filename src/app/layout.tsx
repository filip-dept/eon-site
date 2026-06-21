import type { Metadata } from 'next';
import './globals.css';
import SmoothScroller from '@/components/SmoothScroller';
import RouteCurtain from '@/components/RouteCurtain/RouteCurtain';

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
        {/* persistent red wipe panel for cross-route transitions (journey → /tariff) */}
        <RouteCurtain />
      </body>
    </html>
  );
}
