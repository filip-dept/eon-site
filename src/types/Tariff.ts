/** A single electricity tariff (one row of the Standard / Zukunft families). */
export interface Tariff {
  id: string;
  name: string;
  sub: string;
  price: string; // € pro Monat
  bonus: string;
  bonusUntil: string;
  ct: string; // ct/kWh — feeds the Stromtransparenz Gesamtpreis
  features: [string, string][];
}
