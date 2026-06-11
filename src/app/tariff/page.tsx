import { Suspense } from 'react';
import TariffPage from '@/components/Tariff/TariffPage';

export default function Tariff() {
  return (
    <Suspense>
      <TariffPage />
    </Suspense>
  );
}
