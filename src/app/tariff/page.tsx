import { Suspense } from 'react';
import TariffPage from '@/components/Tariff/TariffPage';
import IntroLoader from '@/components/IntroLoader/IntroLoader';

export default function Tariff() {
  return (
    <Suspense>
      <TariffPage />
      {/* same branded splash, shown when arriving from a completed journey */}
      <IntroLoader variant="tariff" />
    </Suspense>
  );
}
