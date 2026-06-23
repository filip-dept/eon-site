import type { ReactNode } from 'react';

/** A connected-home category (the scroll-through HEMS stage; first = overview). */
export interface HemsCat {
  key: string;
  menu: string;
  title: ReactNode;
  desc: string;
  pin: string | null; // which hotspot lights up (null = overview)
}

export const HEMS_CATS: HemsCat[] = [
  {
    key: 'hems', menu: 'HEMS',
    title: <>Deine Energie.<br />Deine Freiheit</>,
    desc: 'Intelligente Lösungen für ein nachhaltiges Zuhause – alles vernetzt, alles unter Kontrolle.',
    pin: 'HEMS',
  },
  {
    key: 'solar', menu: 'Solar',
    title: <>Sonne, die sich<br />auszahlt.</>,
    desc: 'Erzeuge deinen eigenen Strom direkt vom Dach – und mach dich unabhängiger vom Netz.',
    pin: 'Solar',
  },
  {
    key: 'strom', menu: 'Strom',
    title: <>Strom, der<br />zu dir passt.</>,
    desc: '100 % Ökostrom, fair erklärt und intelligent gesteuert – passend zu deinem Verbrauch.',
    pin: 'Strom',
  },
  {
    key: 'waerme', menu: 'Wärmepumpe',
    title: <>Wärme aus<br />der Umwelt.</>,
    desc: 'Heize effizient und klimafreundlich – mit Strom statt Öl und Gas.',
    pin: 'Wärmepumpe',
  },
  {
    key: 'wallbox', menu: 'Wallbox',
    title: <>Lädt, während<br />du schläfst.</>,
    desc: 'Lade dein E-Auto bequem zuhause – schnell, sicher und am besten mit eigenem Solarstrom.',
    pin: 'Wallbox',
  },
];

/* Hotspots are anchored as fractions of the source image (1600×893), not container
   percentages — so each dot sticks to its physical feature regardless of how
   object-fit:cover crops the portrait frame at different viewport widths. */
export const HEMS_IMG_W = 1600;
export const HEMS_IMG_H = 893;

/* ── House zoom ──────────────────────────────────────────────────────────────
   Manual knob to make the house bigger (>1 zooms in; the overflow is clipped by
   the panel). It scales BOTH the photo and the dot-placement math (hemsCover) so
   the hotspots stay glued to their features. 1 = exact object-fit:cover. */
export const HEMS_ZOOM = 1;

export type HotspotLayout =
  | 'right' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/* `variant` = which way the label points off the dot (Figma "Hotspot" set), chosen
   per feature so the pill stays over the house (see the reference composition). */
export const HEMS_PINS: { title: string; sub: string; nx: number; ny: number; variant: HotspotLayout }[] = [
  { title: 'HEMS',       sub: 'Alles vernetzt · smart gesteuert', nx: 0.515, ny: 0.570, variant: 'right' },
  { title: 'Solar',      sub: '4,2 kWp · ~3.900 kWh/Jahr',        nx: 0.550, ny: 0.350, variant: 'right' },
  { title: 'Strom',      sub: '100 % Ökostrom · 3.200 kWh',       nx: 0.365, ny: 0.440, variant: 'top-right' },
  { title: 'Wallbox',    sub: '11 kW · lädt mit Solar',           nx: 0.700, ny: 0.690, variant: 'bottom-left' },
  { title: 'Wärmepumpe', sub: 'COP 4,1 · ~60 % weniger Gas',      nx: 0.420, ny: 0.770, variant: 'bottom-right' },
];

/* map a native-image fraction → container px under object-fit:cover (centered),
   scaled by HEMS_ZOOM so the dots track the (zoomed) photo */
export const hemsCover = (cw: number, ch: number, nx: number, ny: number) => {
  const s = Math.max(cw / HEMS_IMG_W, ch / HEMS_IMG_H) * HEMS_ZOOM;
  const rw = HEMS_IMG_W * s, rh = HEMS_IMG_H * s;
  return { x: (cw - rw) / 2 + nx * rw, y: (ch - rh) / 2 + ny * rh };
};

/* HEMS is the hub; wires draw outward to each device in slide order. */
export const HEMS_HUB = HEMS_PINS[0];
export const HEMS_LINKS = ['Solar', 'Strom', 'Wärmepumpe', 'Wallbox']
  .map((t) => HEMS_PINS.find((p) => p.title === t)!);
