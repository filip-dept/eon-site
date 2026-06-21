import { Suspense } from 'react';
import TariffPage from '@/components/Tariff/TariffPage';

export default function Tariff() {
  return (
    <Suspense>
      <TariffPage />
      {/* The journey → /tariff reveal is handled by the persistent RouteCurtain
          (mounted in the root layout), which lifts away once TariffPage signals
          `eon:tariff-ready`. */}
    </Suspense>
  );
}
