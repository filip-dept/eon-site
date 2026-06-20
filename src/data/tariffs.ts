import type { Tariff } from '@/types/Tariff';

/** Two tariff families: Standard (ÖkoStrom) ↔ Zukunft ("besonders nachhaltig"),
 *  three each, ordered Flexibilität → Sicherheit for the preference slider. */
export const TARIFFS: { standard: Tariff[]; zukunft: Tariff[] } = {
  standard: [
    {
      id: 'oeko-flex', name: 'E.ON ÖkoStrom Flex', sub: 'Flex | Standard',
      price: '57,50', bonus: '30 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '30,50',
      features: [
        ['Keine Mindestlaufzeit', 'sofort kündbar'],
        ['100% Ökostrom', 'aus erneuerbaren Quellen'],
        ['Volle Flexibilität', 'bei Tarif-Wechsel'],
      ],
    },
    {
      id: 'oeko-extra-12', name: 'E.ON ÖkoStrom Extra 12', sub: '12 Mo | Standard',
      price: '53,11', bonus: '60 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '28,13',
      features: [
        ['12 Monate Preisgarantie', 'gute Balance'],
        ['100% Ökostrom', 'aus erneuerbaren Quellen'],
        ['Monatlich kündbar', 'nach der Mindestlaufzeit'],
      ],
    },
    {
      id: 'festpreis-24', name: 'E.ON Festpreis 24', sub: '24 Mo | Standard',
      price: '47,90', bonus: '90 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '25,40',
      features: [
        ['24 Monate Preisgarantie', 'kein Schwanken'],
        ['100% Ökostrom', 'aus erneuerbaren Quellen'],
        ['Pünktliche Verlängerung', 'faire Konditionen'],
      ],
    },
  ],
  zukunft: [
    {
      id: 'zukunft-flex', name: 'E.ON ZukunftsStrom Flex', sub: 'Flex | Zukunft',
      price: '62,80', bonus: '50 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '33,20',
      features: [
        ['Keine Mindestlaufzeit', 'sofort kündbar'],
        ['100% Strom', 'aus neuen Wind- und Solar-Anlagen'],
        ['Dein Beitrag', 'finanziert den Anlagen-Ausbau'],
      ],
    },
    {
      id: 'zukunft-extra-12', name: 'E.ON ZukunftsStrom Extra 12', sub: '12 Mo | Zukunft',
      price: '58,40', bonus: '85 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '30,90',
      features: [
        ['12 Monate Preisgarantie', 'gute Balance'],
        ['100% Strom', 'aus neuen Wind- und Solar-Anlagen'],
        ['Dein Beitrag', 'finanziert den Anlagen-Ausbau'],
      ],
    },
    {
      id: 'zukunft-festpreis-24', name: 'E.ON ZukunftsStrom Festpreis 24', sub: '24 Mo | Zukunft',
      price: '54,30', bonus: '120 € Neukunden-Bonus', bonusUntil: 'bis 20.04.2026', ct: '28,80',
      features: [
        ['24 Monate Preisgarantie', 'kein Schwanken'],
        ['100% Strom', 'aus neuen Wind- und Solar-Anlagen'],
        ['Dein Beitrag', 'finanziert den Anlagen-Ausbau'],
      ],
    },
  ],
};

/* slider snap stops — Flexibilität | Mitte | Sicherheit (both families have 3) */
export const stopsFor = (_eco: boolean) => [6, 50, 94];

export const snapTo = (p: number, stops: number[]) =>
  stops.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));

export const tariffFor = (eco: boolean, p: number): Tariff => {
  const list = eco ? TARIFFS.zukunft : TARIFFS.standard;
  return list[p < 33 ? 0 : p < 67 ? 1 : 2];
};
