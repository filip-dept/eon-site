import { Suspense } from 'react';
import TariffPage from '@/components/Tariff/TariffPage';
import IntroLoader from '@/components/IntroLoader/IntroLoader';

export default function Tariff() {
  return (
    <Suspense>
      <TariffPage />
      {/* Fresh load / refresh of /tariff plays the branded splash (same as home),
          then lifts to reveal the hero rising from below. Arriving from the
          onboarding journey it stays inert — the RouteCurtain handles that. */}
      <IntroLoader variant="tariff" />
    </Suspense>
  );
}
