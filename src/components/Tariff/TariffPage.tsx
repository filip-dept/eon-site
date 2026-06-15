'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Navbar from '@/components/Navbar/Navbar';
import JourneyModal from '@/components/Journey/JourneyModal';
import styles from './tariff.module.css';

/* the red "Tarif auswählen" CTAs open the conversational checkout journey */
const startCheckout = () =>
  document.dispatchEvent(new CustomEvent('eon:checkout-start'));

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z"/><circle cx="12" cy="11" r="2"/>
  </svg>
);
const PersonsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PlugIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.75}}>
    <path d="M12 2v6M8 6h8M7 12h10l-1 7H8l-1-7z"/><path d="M12 19v3"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" stroke="#ea1b0a" strokeWidth="1.5"/>
    <path d="M8 14l4 4 8-8" stroke="#ea1b0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
/* "reward program" seal — red star badge for the Neukunden-Bonus cell */
const BonusIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="13" stroke="#ea1b0a" strokeWidth="1.5"/>
    <path
      d="M14 7.5l1.9 3.85 4.25.62-3.08 3 .73 4.23L14 17.2l-3.8 2 .73-4.23-3.08-3 4.25-.62L14 7.5z"
      stroke="#ea1b0a" strokeWidth="1.5" strokeLinejoin="round"
    />
  </svg>
);
/* tiny tag icons for the comparison cards */
const BalanceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18M5 7h14M5 7l-3 6a3 3 0 0 0 6 0l-3-6zM19 7l-3 6a3 3 0 0 0 6 0l-3-6zM8 21h8"/>
  </svg>
);
const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
  </svg>
);

/* ─── Comparison cards — Figma 1093:4573 ─────────────────────────────────── */
type CompareTag = { label: string; green?: boolean; icon?: React.ReactNode };
interface CompareCard {
  id: string; name: string; term: string; price: string; ct: string;
  highlight?: boolean; tags: CompareTag[]; features: [string, string][];
}
const COMPARE: CompareCard[] = [
  {
    id: 'extra12', name: 'E.ON SolarStrom Extra 12', term: '12 Mo | Solar DE',
    price: '55,80', ct: '29,60ct/kWh', highlight: true,
    tags: [{ label: 'Ausgewogen', icon: <BalanceIcon /> }, { label: 'Beste Wahl für dich', green: true }],
    features: [
      ['12 Monaten', 'Preisgarantie'],
      ['100% Solarstrom', 'aus der deutschen Anlagen'],
      ['Monatlich kündbar', 'nach der Mindestlaufzeit'],
      ['75 €', 'Neukunden-Bonus'],
    ],
  },
  {
    id: 'flex', name: 'E.ON SolarStrom Flex', term: '12 Mo | Solar DE',
    price: '60,10', ct: '31,80ct/kWh',
    tags: [{ label: 'Maximal Flexibel', icon: <BoltIcon /> }],
    features: [
      ['Keine Bindung', 'jederzeit wechselbar'],
      ['100% Solarstrom', 'aus der deutschen Anlagen'],
      ['Monatlich kündbar', 'nach der Mindestlaufzeit'],
      ['40 €', 'Neukunden-Bonus'],
    ],
  },
  {
    id: 'fest24', name: 'E.ON SolarStrom Festpreis 24', term: '12 Mo | Solar DE',
    price: '51,10', ct: '29,60ct/kWh',
    tags: [{ label: 'Maximale Sicherheit', icon: <ShieldIcon /> }],
    features: [
      ['24 Monaten', 'Preisgarantie'],
      ['100% Solarstrom', 'aus der deutschen Anlagen'],
      ['Kündbar nach 24 Monaten', 'danach monatlich'],
      ['110 €', 'Neukunden-Bonus'],
    ],
  },
];
const ChevronRight = () => (
  <svg width="10" height="14" viewBox="0 0 10 16" fill="none">
    <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M1 1h16M1 7h16M1 13h16"/>
  </svg>
);
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1.4"/><circle cx="19" cy="21" r="1.4"/>
    <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>
  </svg>
);
const HomeGreenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1ea354" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>
  </svg>
);
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>
  </svg>
);
const TickIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6.2l2.6 2.6L10 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const PlayCarrierIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 14.5l9 5.5-9 5.5z" fill="currentColor"/>
  </svg>
);

/* ─── Tariff catalogue (slider picks within a family, checkbox switches the
       family: Standard ↔ Zukunft "besonders nachhaltig") ───────────────────── */
interface Tariff {
  id: string;
  name: string;
  sub: string;
  price: string;     // € pro Monat
  bonus: string;
  bonusUntil: string;
  ct: string;        // ct/kWh — feeds the Stromtransparenz Gesamtpreis
  features: [string, string][];
}

const TARIFFS: { standard: Tariff[]; zukunft: Tariff[] } = {
  /* slider: Flexibilität → Sicherheit */
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
const stopsFor = (_eco: boolean) => [6, 50, 94];
const snapTo = (p: number, stops: number[]) =>
  stops.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
const tariffFor = (eco: boolean, p: number) => {
  const list = eco ? TARIFFS.zukunft : TARIFFS.standard;
  return list[p < 33 ? 0 : p < 67 ? 1 : 2];
};

/* ─── Preference slider (interactive: click or drag along the rail) ───────── */
function PrefSlider({ groupLabel, left, right, value, onChange, onCommit }: {
  groupLabel: string; left: string; right: string;
  value: number;
  onChange: (p: number) => void;
  onCommit: (p: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const pctFrom = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };

  return (
    <div className={styles.prefItem}>
      <span className={styles.prefLabel}>{groupLabel}</span>
      <div
        className={styles.prefSlider}
        role="slider"
        aria-label={groupLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          onChange(pctFrom(e.clientX));
        }}
        onPointerMove={(e) => { if (dragging.current) onChange(pctFrom(e.clientX)); }}
        onPointerUp={(e) => { dragging.current = false; onCommit(pctFrom(e.clientX)); }}
      >
        <div className={styles.prefSliderLabels}>
          <span>{left}</span><span>{right}</span>
        </div>
        <div className={styles.prefSliderTrack} ref={trackRef}>
          <div className={styles.prefSliderFill} style={{ width: `${value}%` }} />
          <div className={styles.prefSliderThumb} style={{ left: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Animation helpers ───────────────────────────────────────────────────── */
// data-al = from left, data-ar = from right, data-ad = drop from above, data-au = rise from below
// data-ahero = hero-style content appear (y 70 → 0, eonAppear, 1s, 0.2s delay)
// data-aimg  = hero-style media appear: the wrapper unmasks top→bottom while
//              the image inside zooms 1.3 → 1 (mask static, eonReveal, 1.6s)

const CLIP_HIDDEN  = 'inset(0% 0% 100% 0%)';
const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';

function qa(frame: HTMLElement, sel: string) {
  return Array.from(frame.querySelectorAll(sel)) as HTMLElement[];
}

function setHidden(frame: HTMLElement) {
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  const ah = qa(frame, '[data-ahero]');
  const ai = qa(frame, '[data-aimg]');
  /* the frame itself unmasks like the hero — except the bars frame, which just
     slides in horizontally with the track (data-noclip) */
  if (!frame.hasAttribute('data-noclip')) gsap.set(frame, { clipPath: CLIP_HIDDEN });
  if (al.length) gsap.set(al, { x: -56, opacity: 0 });
  if (ar.length) gsap.set(ar, { x: 56, opacity: 0 });
  if (ad.length) gsap.set(ad, { y: -44, opacity: 0 });
  if (au.length) gsap.set(au, { y: 36, opacity: 0 });
  if (ah.length) gsap.set(ah, { y: 70, opacity: 0 });
  ai.forEach((w) => {
    gsap.set(w, { clipPath: CLIP_HIDDEN });
    const img = w.querySelector('img');
    if (img) gsap.set(img, { scale: 1.3 });
  });
}

function revealFrame(frame: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.8 } });
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  const ah = qa(frame, '[data-ahero]');
  const ai = qa(frame, '[data-aimg]');
  /* hero media settings: unmask wipe top→bottom, eonReveal, 1.6s — the clip is
     cleared on complete so it never interferes with later transforms. The bars
     frame opts out (data-noclip): it just slides in with the track. */
  if (!frame.hasAttribute('data-noclip')) {
    tl.fromTo(frame, { clipPath: CLIP_HIDDEN },
      { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0);
  }
  ai.forEach((w, i) => {
    const img = w.querySelector('img');
    tl.fromTo(w, { clipPath: CLIP_HIDDEN },
      { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0.08 * i);
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0.08 * i);
  });
  if (al.length) tl.to(al, { x: 0, opacity: 1, stagger: 0.07 }, 0.04);
  if (ar.length) tl.to(ar, { x: 0, opacity: 1, stagger: 0.07 }, 0.1);
  if (ad.length) tl.to(ad, { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 }, 0);
  if (au.length) tl.to(au, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55 }, 0.4);
  /* hero content settings: y 70 → 0, opacity 0 → 1, eonAppear, 1s, 0.2s delay */
  if (ah.length) tl.to(ah, { y: 0, opacity: 1, duration: 1, ease: 'eonAppear' }, 0.2);
}

/* ─── HEMS: scroll-through categories (first one is the HEMS overview) ─────── */
interface HemsCat {
  key: string;
  menu: string;
  title: React.ReactNode;
  desc: string;
  pin: string | null;   /* which hotspot lights up (null = overview, none) */
}
const HEMS_CATS: HemsCat[] = [
  {
    key: 'hems', menu: 'HEMS',
    title: <>Deine Energie.<br />Deine Freiheit</>,
    desc: 'Intelligente Lösungen für ein nachhaltiges Zuhause – alles vernetzt, alles unter Kontrolle.',
    pin: null,
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

const HEMS_PINS = [
  { title: 'Solar',      sub: '4,2 kWp · ~3.900 kWh/Jahr', left: '36%',   top: '26.8%' },
  { title: 'Strom',      sub: '100 % Ökostrom · 3.200 kWh', left: '13%',   top: '49.6%' },
  { title: 'Wallbox',    sub: '11 kW · lädt mit Solar',     left: '63.8%', top: '53.5%' },
  { title: 'Wärmepumpe', sub: 'COP 4,1 · ~60 % weniger Gas', left: '15.9%', top: '62.4%' },
];

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function TariffPage() {
  const params  = useSearchParams();
  const plz     = params.get('plz')     ?? '81245';
  const persons = params.get('persons') ?? '2';
  const kwh     = params.get('kwh')     ?? '3200';
  const kwhFormatted = Number(kwh).toLocaleString('de-DE');

  const pageRef    = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  /* ── Tariff picker: slider position + nachhaltig checkbox drive the card ── */
  const [eco,  setEco]  = useState(true);   // "Besonders nachhaltig" → Zukunft family
  const [pref, setPref] = useState(94);     // Flexibilität (0) ↔ Sicherheit (100)
  const tariff = tariffFor(eco, pref);

  /* ── HEMS: which category is active while scrolling through the pinned stage ── */
  const [hemsActive, setHemsActive] = useState(0);
  const [hemsPinsReady, setHemsPinsReady] = useState(false);
  const hemsIdxRef = useRef(0);
  const hemsSTRef  = useRef<ReturnType<typeof ScrollTrigger.create> | null>(null);
  const hemsTextRef = useRef<HTMLDivElement>(null);
  const hemsCat = HEMS_CATS[hemsActive];

  /* jump to a category by clicking its menu item */
  const scrollToHemsCat = useCallback((i: number) => {
    const st = hemsSTRef.current;
    if (!st) return;
    const target = st.start + (st.end - st.start) * (i / (HEMS_CATS.length - 1));
    window.scrollTo(0, target);
  }, []);

  /* gentle content swap when the active HEMS category changes */
  const firstHems = useRef(true);
  useEffect(() => {
    if (firstHems.current) { firstHems.current = false; return; }
    if (hemsTextRef.current) {
      gsap.fromTo(hemsTextRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'eonOut' });
    }
  }, [hemsActive]);

  /* "Tarif vergleichen" expands the comparison + pushes the image to the edge */
  const [comparing, setComparing] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  /* Once the grey background has expanded, reveal the head text, then unmask
     each card top→bottom (eonReveal) with a quick stagger. */
  useEffect(() => {
    if (!comparing) return;
    const el = compareRef.current;
    if (!el) return;
    const head  = el.querySelector<HTMLElement>(`.${styles.compareHead}`);
    const cards = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.compareCard}`));
    const CARD_HIDDEN = 'inset(0% 0% 100% 0% round 12px)';
    const CARD_SHOWN  = 'inset(0% 0% 0% 0% round 12px)';

    if (head) gsap.set(head, { y: 16, opacity: 0 });
    if (cards.length) gsap.set(cards, { clipPath: CARD_HIDDEN, opacity: 1 });

    /* start while the frame is still expanding so the whole thing reads as one
       smooth motion; the unmask itself stays gentle */
    const tl = gsap.timeline({ delay: 0.22 });
    if (head) tl.to(head, { y: 0, opacity: 1, duration: 0.5, ease: 'eonOut' }, 0);
    if (cards.length) {
      tl.to(cards, {
        clipPath: CARD_SHOWN,
        duration: 0.7,
        ease: 'eonReveal',
        stagger: 0.06,
        clearProps: 'clipPath',
      }, 0.06);
    }
    return () => { tl.kill(); };
  }, [comparing]);

  /* Close: content fades out fast, THEN the frame retreats (CSS) */
  const closeCompare = useCallback(() => {
    const el = compareRef.current;
    if (!el) { setComparing(false); return; }
    const head  = el.querySelector<HTMLElement>(`.${styles.compareHead}`);
    const cards = Array.from(el.querySelectorAll<HTMLElement>(`.${styles.compareCard}`));
    gsap.to([head, ...cards].filter(Boolean) as HTMLElement[], {
      opacity: 0,
      duration: 0.14,
      ease: 'power1.in',
      overwrite: 'auto',
      onComplete: () => setComparing(false),
    });
  }, []);

  const toggleEco = () => {
    const next = !eco;
    setEco(next);
    setPref((p) => snapTo(p, stopsFor(next)));
  };

  /* gentle content swap when another package is selected */
  const firstTariff = useRef(true);
  useEffect(() => {
    if (firstTariff.current) { firstTariff.current = false; return; }
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'eonOut' });
    }
  }, [tariff.id]);

  useEffect(() => {
    const page    = pageRef.current;
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!page || !section || !track) return;

    const frames = Array.from(track.children) as HTMLElement[];
    const revealed = frames.map((_, i) => i === 0);
    frames.forEach((f, i) => (i === 0 ? revealFrame(f) : setHidden(f)));

    /* Size frames off clientWidth (excludes scrollbar) so the track lands flush */
    const setFrameWidth = () =>
      track.style.setProperty('--fw', `${document.documentElement.clientWidth - 32}px`);
    setFrameWidth();
    window.addEventListener('resize', setFrameWidth);

    /* +16 = trailing track padding that scrollWidth doesn't report */
    const getDist = () => track.scrollWidth + 16 - document.documentElement.clientWidth;

    /* Phase 1 traverses the full horizontal distance over a SHORTER scroll
       length (same movement, just faster) so the grey frame arrives sooner.
       Movement uses getDist(); scroll boundaries use phase1(). */
    const SPEED = 0.7;
    const phase1 = () => getDist() * SPEED;

    /* ── Merged Stromtransparenz frame: stack rotates, then expands ── */
    const merged    = frames[frames.length - 1];
    const barsLeft  = merged.querySelector<HTMLElement>(`.${styles.barsLeft}`)!;
    const stacked   = merged.querySelector<HTMLElement>(`.${styles.stackedBars}`)!;
    const bdContent = merged.querySelector<HTMLElement>(`.${styles.bdContent}`)!;
    const bars      = Array.from(stacked.querySelectorAll<HTMLElement>(`.${styles.bar}`));
    const footers   = bars.map((b) => b.querySelector<HTMLElement>('[data-barfooter]'));
    const pcts      = bars.map((b) => b.querySelector<HTMLElement>('[data-pct]'));

    /* centering moves to gsap so x can animate freely during the rotation */
    gsap.set(bars, { xPercent: -50 });
    gsap.set(footers.slice(0, 2).filter(Boolean) as HTMLElement[], { opacity: 0 });
    gsap.set(bdContent, { autoAlpha: 0 });

    const ROT   = 1200; /* scroll px for one full stack rotation */
    const MORPH = 1200; /* scroll px for the expand-to-breakdown morph */

    /* entrance reveals fire off the track's actual x position */
    const checkReveals = () => {
      const x  = -(gsap.getProperty(track, 'x') as number);
      const vw = document.documentElement.clientWidth;
      frames.forEach((f, i) => {
        if (!revealed[i] && f.offsetLeft - x < vw * 0.72) {
          revealed[i] = true;
          revealFrame(f);
        }
      });
    };

    /* Pin holds the whole sequence: horizontal travel + rotation + morph.
       All phase boundaries are function-based so refresh re-measures them. */
    const pinST = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${phase1() + ROT + MORPH}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: () => checkReveals(),
    });

    /* Nav / floater state — page-wide so it keeps working past the pin.
       Scrolling backwards re-reveals the nav (pushes the floater down);
       at the very top everything resets to the initial layout. */
    const stateST = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const px = self.scroll() - pinST.start;
        const scrolled = px > 20;
        page.classList.toggle(styles.scrolled, scrolled);
        page.classList.toggle(styles.navShow, scrolled && self.direction < 0);
        page.classList.toggle(styles.compact, px > phase1() * 0.7);
      },
    });

    /* Phase 1 — horizontal travel: full getDist() movement over phase1() scroll */
    const trackTween = gsap.to(track, {
      x: () => -getDist(),
      ease: 'none',
      /* fires every render tick, incl. scrub catch-up after scrolling stops */
      onUpdate: checkReveals,
      scrollTrigger: {
        start: () => pinST.start,
        end: () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* ── ONE travelling headline: once it reaches its reading position it
       counter-translates at exactly track speed (viewport-pinned), riding
       with the user until it docks at the bars frame's left column ── */
    const edFrame = frames[1];
    const edText  = edFrame.querySelector<HTMLElement>(`.${styles.editorialContent}`)!;
    const photoTR = edFrame.querySelector<HTMLElement>(`.${styles.edPhotoTopRight}`)!;
    const photoBL = edFrame.querySelector<HTMLElement>(`.${styles.edPhotoBottomLeft}`)!;

    /* offsetLeft is transform-independent — safe to re-measure on refresh.
       Dock target = barsLeft content edge (frame padding-left = 40px). */
    const followDelta = () =>
      merged.offsetLeft + 40 - (edFrame.offsetLeft + edText.offsetLeft);
    const followStart = () => Math.max(0, getDist() - followDelta()) * SPEED;

    const followTween = gsap.to(edText, {
      x: () => followDelta(),
      ease: 'none',
      scrollTrigger: {
        start: () => pinST.start + followStart(),
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* ── The lady photo scrolls slower than the text: it converges on the
       pinned headline, decelerates, and comes to rest BEHIND the beige bars
       panel (frame 3 paints over it — no fade) without ever touching the text ── */
    const GAP_TO_TEXT = 64;
    const barsPanel = merged.querySelector<HTMLElement>(`.${styles.barsPanel}`)!;
    const ladyEntry = () =>
      Math.max(0, edFrame.offsetLeft + photoTR.offsetLeft - document.documentElement.clientWidth);
    const ladyX = () => {
      /* rigid = where she would end without counter-translation. Resting spot:
         right of the docked headline AND inside the beige panel's footprint,
         so the panel fully covers her at the dock (text docks at x = 56). */
      const rigid      = edFrame.offsetLeft + photoTR.offsetLeft - getDist();
      const textClamp  = 56 + edText.offsetWidth + GAP_TO_TEXT;
      const panelCover = merged.offsetLeft + barsPanel.offsetLeft - getDist() + 16;
      return Math.max(0, Math.max(textClamp, panelCover) - rigid);
    };
    const ladyTl = gsap.timeline({
      scrollTrigger: {
        start: () => pinST.start + ladyEntry() * SPEED,
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    /* power1.in: rides almost rigidly at first, then brakes into place while
       the grey frame sweeps over her */
    ladyTl.to(photoTR, { x: ladyX, ease: 'power1.in', duration: 1 }, 0);

    /* the man photo starts well right of the text (CSS) and drives left as
       you scroll — opposite parallax depth, exits before the dock */
    const manEntry = () =>
      Math.max(0, edFrame.offsetLeft + photoBL.offsetLeft - document.documentElement.clientWidth);
    const manTl = gsap.timeline({
      scrollTrigger: {
        start: () => pinST.start + manEntry() * SPEED,
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    manTl.to(photoBL, { x: () => -followDelta() * 0.3, ease: 'none', duration: 1 }, 0);

    const parallaxTweens = [ladyTl, manTl];

    /* ── Hub card: appears only once the sticky frame spans the viewport
       (start of the card-flip phase), with the hero appear settings ── */
    const hubWrap = merged.querySelector<HTMLElement>(`.${styles.hubWrap}`)!;
    gsap.set(hubWrap, { y: 70, opacity: 0 });
    const hubST = ScrollTrigger.create({
      start: () => pinST.start + phase1() - 2,
      end:   () => pinST.start + phase1() + ROT + MORPH,
      onEnter:     () => gsap.to(hubWrap, { y: 0, opacity: 1, duration: 1, ease: 'eonAppear', overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(hubWrap, { y: 70, opacity: 0, duration: 0.45, ease: 'eonOut', overwrite: 'auto' }),
    });

    /* Phase 2 — the three stacked cards rotate through the deck once */
    const POS = [
      { width: 274, height: 231, top: 0,  filter: 'blur(4px)', opacity: 0.92 }, /* back  */
      { width: 308, height: 260, top: 28, filter: 'blur(2px)', opacity: 0.96 }, /* mid   */
      { width: 342, height: 289, top: 68, filter: 'blur(0px)', opacity: 1    }, /* front */
    ];
    const rot = gsap.timeline();
    let order = [0, 1, 2]; /* element index occupying [back, mid, front] */
    for (let s = 0; s < 3; s++) {
      const at = s;
      const [bi, mi, fi] = order;
      /* front card slides out right, shrinks + blurs, tucks to the back */
      rot.to(bars[fi], { x: 430, duration: 0.5, ease: 'power2.in' }, at);
      rot.set(bars[fi], { zIndex: 0 }, at + 0.5);
      rot.to(bars[fi], { x: 0, ...POS[0], duration: 0.5, ease: 'power2.out' }, at + 0.5);
      if (footers[fi]) rot.to(footers[fi], { opacity: 0, duration: 0.15 }, at);
      if (pcts[fi])    rot.to(pcts[fi], { fontSize: 30, duration: 0.5 }, at + 0.5);
      /* mid card steps up to the front */
      rot.set(bars[mi], { zIndex: 2 }, at + 0.45);
      rot.to(bars[mi], { ...POS[2], duration: 0.6, ease: 'power2.inOut' }, at + 0.3);
      if (footers[mi]) rot.to(footers[mi], { opacity: 1, duration: 0.25 }, at + 0.7);
      if (pcts[mi])    rot.to(pcts[mi], { fontSize: 40, duration: 0.6 }, at + 0.3);
      /* back card steps up to the middle */
      rot.set(bars[bi], { zIndex: 1 }, at + 0.5);
      rot.to(bars[bi], { ...POS[1], duration: 0.6, ease: 'power2.inOut' }, at + 0.3);
      order = [fi, bi, mi];
    }
    const rotST = ScrollTrigger.create({
      animation: rot,
      start: () => pinST.start + phase1(),
      end:   () => pinST.start + phase1() + ROT,
      scrub: 1,
      invalidateOnRefresh: true,
    });

    /* Phase 3 — text leaves, panel expands full-bleed, then the cards fly to
       their column slots (FLIP-style) and the extra info appears on top */
    const colEls   = Array.from(bdContent.querySelectorAll<HTMLElement>(`.${styles.bdCol}`));
    const barToCol = [colEls[2], colEls[1], colEls[0]]; /* bars [21,32,47] → cols [3rd,2nd,1st] */
    const colInfo  = bdContent.querySelectorAll(`.${styles.colPrice}, .${styles.colDesc}`);
    gsap.set(colInfo, { opacity: 0, y: 14 });

    const morph = gsap.timeline();
    morph.to(barsLeft, { opacity: 0, x: -60, duration: 0.22, ease: 'power1.in' }, 0);
    /* the travelling headline exits with the column (xPercent leaves the
       follow tween's x untouched) */
    morph.to(edText, { opacity: 0, xPercent: -8, duration: 0.22, ease: 'power1.in' }, 0);
    morph.to(barsLeft, { flexBasis: '0%', paddingLeft: 0, paddingRight: 0, duration: 0.34, ease: 'power2.inOut' }, 0.1);
    morph.to(merged, { gap: 0, duration: 0.34, ease: 'power2.inOut' }, 0.1);

    bars.forEach((bar, i) => {
      const col = barToCol[i];
      /* drop %-based centering so width can tween without the card drifting */
      morph.set(bar, {
        xPercent: 0,
        x: () => (gsap.getProperty(bar, 'x') as number) - bar.offsetWidth / 2,
      }, 0.5);
      /* fly + expand to the column's exact rect; measured lazily mid-scrub,
         after the panel has finished expanding */
      morph.to(bar, {
        x: () => (gsap.getProperty(bar, 'x') as number) + col.getBoundingClientRect().left - bar.getBoundingClientRect().left,
        y: () => (gsap.getProperty(bar, 'y') as number) + col.getBoundingClientRect().top - bar.getBoundingClientRect().top,
        width:  () => col.offsetWidth,
        height: () => col.offsetHeight,
        borderRadius: 6,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      }, 0.5);
      if (pcts[i])    morph.to(pcts[i], { fontSize: 24, duration: 0.35, ease: 'power2.inOut' }, 0.5);
      if (footers[i]) morph.to(footers[i], { opacity: 1, duration: 0.2 }, 0.55);
    });

    /* seamless swap — cards and real columns overlap pixel-perfect here */
    morph.to(bars, { autoAlpha: 0, duration: 0.04 }, 0.86);
    morph.to(bdContent, { autoAlpha: 1, duration: 0.04 }, 0.86);

    /* additional info appears in place */
    morph.to(colInfo, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', stagger: 0.03 }, 0.92);
    morph.fromTo(
      bdContent.querySelectorAll(`.${styles.lineItem}`),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.02, duration: 0.25, ease: 'power2.out' },
      0.95
    );
    const morphST = ScrollTrigger.create({
      animation: morph,
      start: () => pinST.start + phase1() + ROT,
      end:   () => pinST.start + phase1() + ROT + MORPH,
      scrub: 1,
      invalidateOnRefresh: true,
    });

    /* ── Stories: the text frame scrolls normally above; the cards start near
       the top of the frame and parallax DOWN — each moves a little slower than
       the page (different speeds), so they drift apart with layered depth. ── */
    const stories    = page.querySelector<HTMLElement>(`.${styles.stories}`)!;
    const storyCards = Array.from(stories.querySelectorAll<HTMLElement>(`.${styles.storyCard}`));

    /* per-card scroll speed, all < 1.0 ⇒ each lags the page by (1 - speed) */
    const SPEEDS = [0.75, 0.85, 0.63];
    /* the parallax only begins once the section is in view (start 'top center');
       before that the cards ride in at their designed collage positions */
    const cardParallax = storyCards.map((card, i) => {
      const speed = SPEEDS[i % SPEEDS.length];
      return gsap.fromTo(
        card,
        { y: 0 },
        {
          /* total lag over the active window = (1 - speed) × its scroll distance */
          y: () => (1 - speed) * (stories.offsetHeight + window.innerHeight * 0.5),
          ease: 'none',
          scrollTrigger: {
            trigger: stories,
            start: 'top center',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    /* ── HEMS: house unmask on entry, then a sticky stage you scroll through
       category by category ── */
    const hems = page.querySelector<HTMLElement>(`.${styles.hems}`)!;
    /* pre-clip the house to its top-right corner so it never flashes in before
       the reveal fires (the dark hemsRight backing covers the gap meanwhile) */
    const hemsPhotoEl = hems.querySelector<HTMLElement>(`.${styles.hemsPhoto}`);
    const hemsShadeEl = hems.querySelector<HTMLElement>(`.${styles.hemsShade}`);
    gsap.set([hemsPhotoEl, hemsShadeEl].filter(Boolean) as HTMLElement[],
      { clipPath: 'inset(0% 0% 100% 100% round 8px)' });
    if (hemsPhotoEl) gsap.set(hemsPhotoEl, { scale: 1.3 });
    const hemsST = ScrollTrigger.create({
      trigger: hems,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.fromTo(hems.querySelector(`.${styles.hemsLeft}`),
          { x: -48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out' });

        /* the house unmasks from the top-right corner (eonReveal wipe + image
           zoom) — same media reveal we use on the horizontal frames */
        const HR_HIDDEN = 'inset(0% 0% 100% 100% round 8px)';  /* only top-right corner */
        const HR_SHOWN  = 'inset(0% 0% 0% 0% round 8px)';
        gsap.fromTo([hemsPhotoEl, hemsShadeEl].filter(Boolean) as HTMLElement[],
          { clipPath: HR_HIDDEN },
          { clipPath: HR_SHOWN, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' });
        if (hemsPhotoEl) gsap.fromTo(hemsPhotoEl, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'eonReveal' });

        /* pins fade to their state once the house is mostly revealed (CSS owns
           the per-pin opacity via data-ready / data-dim) */
        setTimeout(() => setHemsPinsReady(true), 850);
      },
    });

    /* sticky scroll-through: progress across the tall section selects the
       active category (the stage itself stays pinned via CSS position:sticky) */
    const HEMS_N = HEMS_CATS.length;
    const hemsScrubST = ScrollTrigger.create({
      trigger: hems,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(HEMS_N - 1, Math.round(self.progress * (HEMS_N - 1)));
        if (idx !== hemsIdxRef.current) { hemsIdxRef.current = idx; setHemsActive(idx); }
      },
    });
    hemsSTRef.current = hemsScrubST;

    /* ── FAQ section entrance ── */
    const faq = page.querySelector<HTMLElement>(`.${styles.faq}`)!;
    const faqST = ScrollTrigger.create({
      trigger: faq,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.fromTo(faq.querySelector(`.${styles.faqHead}`),
          { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(faq.querySelectorAll(`.${styles.faqItem}`),
          { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.1, delay: 0.15 });
      },
    });

    /* ── Background switch: white until the stories text passes the middle of
       the viewport, then the constant red→purple gradient fades in (and the
       text flips to white). It stays on for the rest of the journey. ── */
    const redZone     = page.querySelector<HTMLElement>(`.${styles.redZone}`)!;
    const zoneBg      = page.querySelector<HTMLElement>(`.${styles.redZoneBg}`)!;
    const storiesText = page.querySelector<HTMLElement>(`.${styles.storiesText}`)!;
    const zoneBgST = ScrollTrigger.create({
      trigger: storiesText,
      start: 'center 50%',   /* text centre crosses the middle of the viewport */
      end: 'max',
      onEnter: () => {
        gsap.to(zoneBg,      { opacity: 1, duration: 0.5, ease: 'power1.out', overwrite: 'auto' });
        gsap.to(storiesText, { color: '#ffffff', duration: 0.4, ease: 'power1.inOut', overwrite: 'auto' });
      },
      onLeaveBack: () => {
        gsap.to(zoneBg,      { opacity: 0, duration: 0.4, ease: 'power1.in', overwrite: 'auto' });
        gsap.to(storiesText, { color: '#262626', duration: 0.3, ease: 'power1.inOut', overwrite: 'auto' });
      },
    });

    /* ── Proof panel overlap: pin the gradient zone still while the white
       panel scrolls up over it (it sits at a higher z-index). ── */
    const proofWrap = page.querySelector<HTMLElement>(`.${styles.proofWrap}`)!;
    const overlapST = ScrollTrigger.create({
      trigger: proofWrap,
      start: 'top bottom',   /* proof just entering from below */
      end: 'top top',        /* proof fills the viewport */
      pin: redZone,
      pinSpacing: false,     /* no extra runway — proof rises over the frozen zone */
      invalidateOnRefresh: true,
    });

    /* re-measure once the pin spacer exists (scrollbar changes clientWidth) */
    requestAnimationFrame(() => {
      setFrameWidth();
      ScrollTrigger.refresh();
    });
    const settle = setTimeout(() => {
      setFrameWidth();
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', setFrameWidth);
      cardParallax.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      zoneBgST.kill();
      hemsST.kill();
      hemsScrubST.kill();
      faqST.kill();
      overlapST.kill();
      stateST.kill();
      rotST.kill();
      morphST.kill();
      rot.kill();
      morph.kill();
      hubST.kill();
      followTween.scrollTrigger?.kill();
      followTween.kill();
      parallaxTweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      trackTween.scrollTrigger?.kill();
      trackTween.kill();
      pinST.kill();
    };
  }, []);

  return (
    <div className={styles.page} ref={pageRef}>

      {/* ── Fixed top nav (light variant — dark content on white) ── */}
      <header className={styles.topBar}>
        <Navbar variant="solid" className={styles.nav} />
      </header>

      {/* ── Context bar — ONE component that morphs into the floating modal ── */}
      <div className={styles.ctxWrap}>
        <div className={styles.ctxBar}>
          {/* initial state: user inputs */}
          <div className={styles.ctxItems}>
            <span className={styles.contextItem}><LocationIcon />{plz}</span>
            <div className={styles.contextSep} />
            <span className={styles.contextItem}><PersonsIcon />{persons} Pers.</span>
            <div className={styles.contextSep} />
            <span className={styles.contextItem}><PlugIcon />{kwhFormatted} kWh</span>
            <div className={styles.contextSep} />
          </div>
          {/* floating state: summary label */}
          <span className={styles.floatLabel}>Deine Eingaben</span>
          <a href="/" className={styles.contextEdit}>Ändern</a>
          {/* spreads the groups apart at rest, collapses in the pill */}
          <div className={styles.ctxGap} />
          <div className={`${styles.floatDivider} ${styles.midDivider}`} />
          <div className={styles.ctxSliders}>
            <PrefSlider
              groupLabel="Ich lege Wert auf"
              left="Flexibilität"
              right="Sicherheit"
              value={pref}
              onChange={setPref}
              onCommit={(p) => setPref(snapTo(p, stopsFor(eco)))}
            />
            <div className={styles.contextSep} />
            <button
              type="button"
              className={styles.checkItem}
              role="switch"
              aria-checked={eco}
              onClick={toggleEco}
            >
              <span className={styles.checkBox} data-checked={eco ? 'true' : 'false'}><TickIcon /></span>
              Besonders nachhaltig
            </button>
          </div>
          {/* floating state: tariff + cart */}
          <div className={styles.floatTariff}>
            <div className={styles.floatDivider} />
            <div className={styles.floatTariffText}>
              <span className={styles.floatTariffName}>{tariff.name}</span>
              <span className={styles.floatTariffPrice}>{tariff.price} € pro Monat</span>
            </div>
            <button className={styles.cartBtn} aria-label="Zum Warenkorb" onClick={startCheckout}><CartIcon /></button>
          </div>
        </div>
      </div>

      {/* ── Gradient sphere — fixed bottom-right, follows the scroll ── */}
      <div className={styles.orbFloat}>
        <div className={styles.orb} />
        <div className={styles.orbMicWrap}>
          <div className={styles.voiceDivider} />
          <button className={styles.micBtn} aria-label="Spracheingabe"><MicIcon /></button>
        </div>
      </div>

      {/* ── Pinned horizontal section ── */}
      <section className={styles.scrollSection} ref={sectionRef}>
        <div className={styles.track} ref={trackRef}>

          {/* ═══ Frame 1: Hero + Tariff card ═══ */}
          <div className={`${styles.frame} ${styles.frameHero}`} data-comparing={comparing}>
            <div className={styles.frameImage} data-aimg>
              <img src="/house.png" alt="E.ON Kundin" />
              <div className={styles.socialProof}>
                <div className={styles.avatars}>
                  {[0,1,2].map(i => (
                    <div key={i} className={styles.avatar} style={{
                      background: ['#e8c9a0','#b8d4e8','#c8e0c8'][i],
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                    }}>
                      {['👩','👨','👩‍🦱'][i]}
                    </div>
                  ))}
                </div>
                <div className={styles.socialText}>
                  <p className={styles.socialPct}>68% der Haushalte</p>
                  <p className={styles.socialDesc}>mit ähnlichem Verbrauch wählen diesen Tarif</p>
                </div>
                <button className={styles.socialCta}>Mehr entdecken</button>
              </div>
            </div>

            <div className={styles.panel}>
              {/* ── Normal state: headline + recommended card ── */}
              <div className={styles.panelNormal}>
              <div className={styles.panelHeader} data-al>
                <h1 className={styles.panelTitle}>Dein Stromtarif,<br />in 15 Sekunden</h1>
                <p className={styles.panelSub}>Ehrlich erklärt, was deinen Tarif besonders macht – und warum du mit E.ON richtig liegst.</p>
              </div>

              <div className={styles.card} data-au ref={cardRef}>
                <div className={styles.cardNav}>
                  <span className={styles.cardTitle}>{tariff.name}</span>
                  <span className={styles.cardBadge}>Unsere Empfehlung für dich</span>
                </div>
                <p className={styles.cardSub}>{tariff.sub}</p>
                <div className={styles.cardBody}>
                  <div className={styles.priceRow}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceMain}>{tariff.price}</span>
                      <span className={styles.priceUnit}>€ pro Monat</span>
                    </div>
                  </div>
                  <div className={styles.divider} />
                  {/* 2×2 feature grid — the Neukunden-Bonus is the first cell (no purple badge) */}
                  <div className={styles.features}>
                    <div className={styles.feature}>
                      <BonusIcon />
                      <div className={styles.featureText}>
                        <span className={styles.featureName}>{tariff.bonus}</span>
                        <span className={styles.featureDesc}>{tariff.bonusUntil}</span>
                      </div>
                    </div>
                    {tariff.features.map(([name, desc]) => (
                      <div key={name + desc} className={styles.feature}>
                        <CheckCircleIcon />
                        <div className={styles.featureText}>
                          <span className={styles.featureName}>{name}</span>
                          <span className={styles.featureDesc}>{desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cardBtns}>
                    <button className={styles.btnPrimary} onClick={startCheckout}>Tarif auswählen</button>
                    <button className={styles.btnSecondary} onClick={() => setComparing(true)}>
                      Tarif vergleichen <ChevronRight />
                    </button>
                  </div>
                </div>
              </div>
              </div>{/* /panelNormal */}
            </div>

            {/* ── Comparison — expands as its own frame beside the panel (Figma 1093:4573) ── */}
            <div className={styles.panelCompare} aria-hidden={!comparing} ref={compareRef}>
                <button
                  className={styles.compareCollapse}
                  onClick={closeCompare}
                  aria-label="Vergleich schließen"
                >
                  <svg width="11" height="16" viewBox="0 0 10 16" fill="none">
                    <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={styles.compareHead}>
                  <span className={styles.compareLabel}>Tarif im Vergleich</span>
                  <h2 className={styles.compareTitle}>Drei Wege, ein Ökostrom</h2>
                  <p className={styles.compareSub}>Gleiche strom Quelle, unterschiedliche Bindung–wähle, was zu dir passt.</p>
                </div>

                <div className={styles.compareCards}>
                  {COMPARE.map((c) => (
                    <div key={c.id} className={styles.compareCard} data-highlight={c.highlight ? 'true' : 'false'}>
                      <div className={styles.compareTags}>
                        {c.tags.map((t) => (
                          <span key={t.label} className={styles.compareTag} data-green={t.green ? 'true' : 'false'}>
                            {t.icon}{t.label}
                          </span>
                        ))}
                      </div>
                      <p className={styles.compareName}>{c.name}</p>
                      <p className={styles.compareTerm}>{c.term}</p>
                      <p className={styles.comparePrice}>
                        <strong>{c.price}</strong> <span>€ pro Monat | {c.ct}</span>
                      </p>
                      <div className={styles.compareFeatures}>
                        {c.features.map(([name, desc], i) => (
                          <div key={name + desc} className={styles.compareFeature}>
                            {i === c.features.length - 1 ? <BonusIcon /> : <CheckCircleIcon />}
                            <div className={styles.featureText}>
                              <span className={styles.featureName}>{name}</span>
                              <span className={styles.featureDesc}>{desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className={c.highlight ? styles.compareBtnPrimary : styles.compareBtnOutline} onClick={startCheckout}>
                        Tarif auswählen
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* ═══ Frame 2: Editorial "28 cent" intro — the ONE travelling headline ═══ */}
          <div className={`${styles.frame} ${styles.frameEditorial}`}>
            <div className={styles.editorialContent} data-ahero>
              <span className={styles.editorialLabel}>Unsere Stromtransparenz</span>
              <h2 className={styles.editorialTitle}>Was passiert mit deinen 28 Cent?</h2>
              <p className={styles.editorialDesc}>
                Hier siehst du, wo jeder Cent hingeht - auch der, der etwas bewirkt. Kein Pricing-Vodoo, alles aufgeschlüsselt.
              </p>
            </div>
            <div className={styles.edPhotoTopRight} data-aimg>
              <img src="/tariff-woman-car.png" className={styles.edPhotoImg} alt="" />
            </div>
            <div className={styles.edPhotoBottomLeft} data-aimg>
              <img src="/tariff-man.png" className={styles.edPhotoImg} alt="" />
            </div>
          </div>

          {/* ═══ Frame 3: Stromtransparenz — the headline from frame 2 docks here;
                the stack rotates, then expands to breakdown. No unmask wipe —
                it just slides in with the track (data-noclip). ═══ */}
          <div className={`${styles.frame} ${styles.frameBars}`} data-noclip>
            <div className={styles.barsLeft}>
              <div className={styles.hubWrap}>
                <div className={styles.hubCard}>
                  <div className={styles.hubCardLeft}>
                    <div className={styles.articleTag}><DocIcon /> Energie Hub</div>
                    <p className={styles.articleTitle}>Vergleichbares Projekt ansehen und CO2 Ersparnis verstehen</p>
                    <button className={styles.articleLink}><ChevronRight /> Mehr lesen</button>
                  </div>
                  <img src="/tariff-man.png" className={styles.hubThumb} alt="" />
                </div>
              </div>
            </div>

            <div className={styles.barsPanel}>
              <div className={styles.stackedBars}>
                <div className={`${styles.bar} ${styles.barBack}`} data-ad>
                  <span className={styles.barPctSm} data-pct>21%</span>
                  <div className={styles.barFooter} data-barfooter>
                    <span>Netzentgelte</span>
                    <span className={styles.barCt}>5,93 ct</span>
                  </div>
                </div>
                <div className={`${styles.bar} ${styles.barMid}`} data-ad>
                  <span className={styles.barPctSm} data-pct>32%</span>
                  <div className={styles.barFooter} data-barfooter>
                    <span>Steuern &amp; Abgaben</span>
                    <span className={styles.barCt}>9,10 ct</span>
                  </div>
                </div>
                <div className={`${styles.bar} ${styles.barFront}`} data-ad>
                  <span className={styles.barPct} data-pct>47%</span>
                  <div className={styles.barFooter} data-barfooter>
                    <span>Strom-Einkauf + Vertrieb</span>
                    <span className={styles.barCt}>13,10 ct</span>
                  </div>
                </div>
              </div>

              {/* expanded breakdown — revealed by the morph phase */}
              <div className={styles.bdContent}>
                <div className={styles.bdCols}>
                  {[
                    { bg: '#d63a1f', pct: '47%', price: '13,10', desc: 'Was wir am Markt zahlen und intern abwickeln', cat: 'Strom-Einkauf + Vertrieb', ct: null },
                    { bg: '#ac0000', pct: '32%', price: '9,10',  desc: 'Was der Staat einbehält', cat: 'Steuern & Abgaben', ct: '9,10 ct' },
                    { bg: '#8a247f', pct: '21%', price: '5,93',  desc: 'Was der Stromtransport kostet', cat: 'Netzentgelte', ct: '5,93 ct' },
                  ].map(col => (
                    <div key={col.pct} className={styles.bdCol} style={{ background: col.bg }}>
                      <div className={styles.colTop}>
                        <span className={styles.colPct}>{col.pct}</span>
                        <div className={styles.colPrice}>
                          <span className={styles.colPriceMain}>{col.price}</span>
                          <span className={styles.colPriceUnit}>ct/kWh</span>
                        </div>
                        <p className={styles.colDesc}>{col.desc}</p>
                      </div>
                      <div className={styles.colFooter}>
                        <span>{col.cat}</span>
                        {col.ct && <span className={styles.colFooterCt}>{col.ct}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.bdItems}>
                  <div className={styles.lineItemCol}>
                    {[
                      ['Beschaffung am Strommarkt', '7,80 ct'],
                      ['Vertrieb, Service & Abrechnung', '2,30 ct'],
                    ].map(([label, val]) => (
                      <div key={label} className={styles.lineItem}>
                        <span className={styles.lineLabel}>{label}</span>
                        <span className={styles.lineVal}>{val}</span>
                      </div>
                    ))}
                    <div className={styles.lineItem}>
                      <span className={styles.lineLabel}>
                        Zukunftsprojekte (Wind- und Solar-Ausbau)
                        <span className={styles.lineInfo}><InfoIcon /></span>
                      </span>
                      <span className={styles.lineValGreen}><span className={styles.greenChip}><HomeGreenIcon /></span> 3,00 ct</span>
                    </div>
                  </div>
                  <div className={styles.lineItemCol}>
                    {[
                      ['Mehrwertsteuer (Anteilig)', '4,18 ct'],
                      ['Stromsteuer', '2,05 ct'],
                      ['KWK-/§19-Umlage', '1,60 ct'],
                      ['Konzessionsabgabe', '1,27 ct'],
                    ].map(([label, val]) => (
                      <div key={label} className={styles.lineItem}>
                        <span className={styles.lineLabel}>{label}</span>
                        <span className={styles.lineVal}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.lineItemCol}>
                    {[
                      ['Verteilnetz (Vor Ort)', '3,78 ct'],
                      ['Vertrieb, Service & Abrechnung', '2,15 ct'],
                    ].map(([label, val]) => (
                      <div key={label} className={styles.lineItem}>
                        <span className={styles.lineLabel}>{label}</span>
                        <span className={styles.lineVal}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.totalPrice} data-au>
                <span className={styles.totalLabel}>Gesamtpreis</span>
                <span className={styles.totalValue}>{tariff.ct} ct/kWh</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ Red zone — stories + HEMS share one continuous gradient ═══ */}
      <div className={styles.redZone}>
        <div className={styles.redZoneBg} />

      {/* ═══ Stories text — scrolls normally, nothing sticky ═══ */}
      <section className={styles.storiesIntro}>
        <div className={styles.storiesText}>
          <span className={styles.storiesLabel}>Passend zu deinem Tarif</span>
          <h2 className={styles.storiesTitle}>Was hinter deinem Tarif steckt.</h2>
          <p className={styles.storiesDesc}>
            Kurze Stories, die zeigen, was deinen Günstig-Tarif ausmacht – Ökostrom, fairer Preis, persönlicher Service.
          </p>
        </div>
      </section>

      {/* ═══ Stories images — frame pins briefly; cards bounce in, then up & out ═══ */}
      <section className={styles.stories}>
        <div className={styles.storiesStage}>
          {[
            { cls: styles.storyCard1, img: '/tariff-man.png',       title: 'Was heißt hier Ökostrom?', sub: 'Kein Marketing – ein Nachweis.' },
            { cls: styles.storyCard2, img: '/tariff-hero.png',      title: 'Dein Preis, fair erklärt', sub: 'Wir zeigen dir jeden Cent davon.' },
            { cls: styles.storyCard3, img: '/tariff-woman-car.png', title: 'Wechseln in Minuten',      sub: 'Du klickst – Wir kümmern uns.' },
          ].map(card => (
            <div key={card.title} className={`${styles.storyCard} ${card.cls}`}>
              <img src={card.img} alt="" className={styles.storyMedia} />
              <div className={styles.storyShade} />
              <div className={styles.storyPlay}><PlayCarrierIcon /></div>
              <div className={styles.storyCaption}>
                <p className={styles.storyCaptionTitle}>{card.title}</p>
                <p className={styles.storyCaptionSub}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HEMS — sticky stage; scroll advances the category ═══ */}
      <section className={styles.hems}>
        <div className={styles.hemsStage}>
          <div className={styles.hemsLeft}>
            <div ref={hemsTextRef}>
              <p className={styles.hemsLogo}>{hemsCat.menu}</p>
              <h2 className={styles.hemsTitle}>{hemsCat.title}</h2>
              <p className={styles.hemsDesc}>{hemsCat.desc}</p>
            </div>
            <div className={styles.hemsMenu}>
              {HEMS_CATS.map((c, i) => (
                <button
                  key={c.key}
                  className={`${styles.hemsMenuItem} ${i === hemsActive ? styles.hemsMenuActive : ''}`}
                  onClick={() => scrollToHemsCat(i)}
                >
                  {c.menu}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.hemsRight}>
            <img src="/hems-house.jpg" alt="Haus mit Solaranlage, Wallbox und E-Auto" className={styles.hemsPhoto} />
            <div className={styles.hemsShade} />
            {HEMS_PINS.map(pin => (
              <div
                key={pin.title}
                className={styles.hemsPin}
                style={{ left: pin.left, top: pin.top }}
                data-ready={hemsPinsReady ? 'true' : 'false'}
                data-active={hemsCat.pin === pin.title ? 'true' : 'false'}
                data-dim={hemsCat.pin && hemsCat.pin !== pin.title ? 'true' : 'false'}
              >
                <div className={styles.hemsPinDot} />
                <div className={styles.hemsPinLabel}>
                  <span className={styles.hemsPinTitle}>{pin.title}</span>
                  <span className={styles.hemsPinSub}>{pin.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ — same gradient continues behind it ═══ */}
      <section className={styles.faq}>
        <div className={styles.faqHead}>
          <span className={styles.faqLabel}>Häufige Fragen</span>
          <h2 className={styles.faqTitle}>Was du noch wissen willst.</h2>
        </div>
        <div className={styles.faqList}>
          {[
            'Wie funktioniert der Wechsel?',
            'Was bedeutet 100% Ökostrom konkret?',
            'Was passiert nach der Mindestlaufzeit?',
            'Kann ich den Tarif noch ändern, wenn ich umziehe?',
          ].map(q => (
            <div key={q} className={styles.faqItem}>
              <span className={styles.faqQuestion}>{q}</span>
              <button className={styles.faqToggle} aria-label="Antwort anzeigen"><ChevronDown /></button>
            </div>
          ))}
        </div>
      </section>

      </div>{/* /redZone */}

      {/* ═══ Proof — white panel that slides up over the gradient ═══ */}
      <div className={styles.proofWrap}>
        <section className={styles.proof}>
          <div className={styles.proofLeft}>
            <span className={styles.proofLabel}>In deiner Nähe</span>
            <h2 className={styles.proofTitle}>Du bist nicht der<br />erste rund um</h2>
            <div className={styles.proofZip}>
              <LocationIcon />
              <span className={styles.proofZipNum}>{plz}</span>
            </div>
            <p className={styles.proofDesc}>
              Diesen Monat haben 7 Haushalte rund um {plz} zu E.ON gewechselt.
              Drei davon erzählen, was sie überzeugt hat – echte Stimmen statt Werbeversprechen.
            </p>
          </div>

          <div className={styles.proofRight}>
            <img src="/proof-town.jpg" alt="Luftaufnahme der Nachbarschaft" className={`${styles.proofPhoto} ${styles.proofPhotoTown}`} />
            <img src="/hems-house.jpg" alt="Haus mit E-Auto" className={`${styles.proofPhoto} ${styles.proofPhotoHouse}`} />

            <div className={styles.proofCardStack}>
              <div className={styles.proofCardBehind} />
              <div className={styles.proofCard}>
                <div>
                  <p className={styles.proofQuoteTitle}>In 10 Minuten gewechselt.</p>
                  <p className={styles.proofQuoteText}>Bei E.ON hab ich das gute Gefühl, wirklich grün unterwegs zu sein. Da ich mit meinem Ökostrom nachhaltige Projekte in dieser Region unterstütze.</p>
                </div>
                <div className={styles.proofAuthor}>
                  <div className={styles.proofAvatar}>AK</div>
                  <div className={styles.proofAuthorMeta}>
                    <div className={styles.proofAuthorName}>Andrea K.</div>
                    <div className={styles.proofAuthorRow}>
                      <span className={styles.proofAuthorTariff}>Ökostrom 12</span>
                      <span className={styles.proofAuthorWhen}>Gewechselt vor 3 Wochen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.proofDots}>
              <div className={`${styles.proofDot} ${styles.proofDotActive}`} />
              <div className={styles.proofDot} />
              <div className={styles.proofDot} />
            </div>

            <div className={styles.proofStats}>
              <div className={styles.proofStat}>
                <span className={styles.proofStatNum}>~12 Min</span>
                <span className={styles.proofStatLabel}>bis zum Abschluss</span>
              </div>
              <div className={styles.proofStat}>
                <span className={styles.proofStatNum}>94%</span>
                <span className={styles.proofStatLabel}>würden wieder wechseln</span>
              </div>
              <button className={styles.proofStatsBtn}>Mehr erfahrungen</button>
            </div>
          </div>
        </section>
      </div>

      {/* Conversational checkout journey — opened by the red "Tarif auswählen" CTAs */}
      <JourneyModal />
    </div>
  );
}
