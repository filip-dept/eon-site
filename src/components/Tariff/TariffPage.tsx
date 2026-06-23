'use client';

import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

/* layout effect on the client (runs before paint → no flash), no-op on the server */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { gsap, ScrollTrigger } from '@/lib/gsap';
import Navbar from '@/components/Navbar/Navbar';
import CheckoutJourney from '@/components/Journey/CheckoutJourney';
import { Button } from '@/ui/Button';
import { Badge } from '@/ui/Badge';
import { Link } from '@/ui/Link';
import { Icon } from '@/ui/Icon';
import { IconButton } from '@/ui/IconButton';
import { Toggle } from '@/ui/Toggle';
import type { Tariff } from '@/types/Tariff';
import { TARIFFS, stopsFor, snapTo, tariffFor } from '@/data/tariffs';
import { HEMS_CATS } from '@/data/hems';
import { usePinnedTrack } from '@/hooks/usePinnedTrack';
import { useStoriesParallax } from '@/hooks/useStoriesParallax';
import { useMagneticStories } from '@/hooks/useMagneticStories';
import { useHemsStage } from '@/hooks/useHemsStage';
import { Proof } from './sections/Proof';
import { Faq } from './sections/Faq';
import { ConnectedHome } from './sections/ConnectedHome';
import { Stories } from './sections/Stories';
import { AiChat } from '@/components/chat/AiChat';
import { emitEon, onEon } from '@/lib/eventBus';
import styles from './tariff.module.css';

/* AI-chat orb: one easing for every transition (default↔hover↔open) so they
   all feel the same. `back.out(n)`: higher n = more bounce. */
const CHAT_EASE = 'back.out(1.1)';
const DEFAULT_PILL_W = 129;   /* Figma "small": 16 + orb 44 + 10 + divider 1 + 6 + mic 36 + 16 */
const PILL_H = 68;            /* py 12 + orb 44 + py 12 */
const CHAT_CARD_W = 440;      /* fixed inner width of the open "answer" card (it grows out of the pill) */
const INTRO_RISE = 300;       /* px the hero content rises on the journey → tariff reveal (mirrors the home hero video) */

/* ─── Icons ──────────────────────────────────────────────────────────────── */
/* Location/Persons/Plug, Doc, Info, HomeGreen, CheckCircle, Bonus, ChevronRight, Cart,
   Menu → real <Icon name=…/>. Chat icons (mic/send/close) live in <AiChat>. */
/* one feature row — shared by the solo card (grid) and the comparison cards (list) */
function Feature({ icon, name, desc, gradient }: { icon: React.ReactNode; name: string; desc: string; gradient?: boolean }) {
  return (
    <div className={styles.feature}>
      {icon}
      <div className={styles.featureText}>
        {gradient ? (
          /* per-letter brand gradient sweeps in as each letter blurs up */
          <span className={styles.featureName}>
            {name.split('').map((char, i) => (
              <span
                key={i}
                className={styles.featureNameLetter}
                style={{ '--i': i } as React.CSSProperties}
              >{char === ' ' ? ' ' : char}</span>
            ))}
          </span>
        ) : (
          <span className={styles.featureName}>{name}</span>
        )}
        <span className={styles.featureDesc}>{desc}</span>
      </div>
    </div>
  );
}
/* MicIcon/SendIcon/CloseIcon now live inside <AiChat> (the chat bubble component) */
/* TickIcon → <Icon name="check"/> (inside <Toggle>) */
/* ChevronDown → <Icon name="chevron-down"/> (inside <Faq>) */
/* PlayCarrierIcon → moved into sections/Stories.tsx */


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
  const heroFrameRef = useRef<HTMLDivElement>(null);  // Frame 1 (hero) — rises in on the journey reveal
  const introPrimed = useRef(false);                  // one-shot guard (survives React Strict double-invoke)

  /* ── Tariff picker: slider position + nachhaltig checkbox drive the card ── */
  const [eco,  setEco]  = useState(true);   // "Besonders nachhaltig" → Zukunft family
  const [pref, setPref] = useState(94);     // Flexibilität (0) ↔ Sicherheit (100)
  const tariff = tariffFor(eco, pref);

  /* The checkout overlay mirrors the SHARED eco/pref state, and previews
     tariffFor(eco, pref). Opening via a card jumps eco/pref to that card so its
     tariff is shown; the overlay's slider + checkbox then cycle through all 6.
     (stops are family-independent: [6, 50, 94] → Flex | Ausgewogen | Sicherheit) */
  const startCheckout = useCallback((t?: Tariff) => {
    if (t) {
      const stops = stopsFor(true);
      const zi = TARIFFS.zukunft.findIndex((x) => x.id === t.id);
      if (zi >= 0) { setEco(true); setPref(stops[zi]); }
      else {
        const si = TARIFFS.standard.findIndex((x) => x.id === t.id);
        if (si >= 0) { setEco(false); setPref(stops[si]); }
      }
    }
    emitEon('eon:checkout-start');
  }, []);
  /* overlay slider → snap the shared preference to the nearest of the 3 stops */
  const changePref = useCallback((p: number) => setPref(snapTo(p, stopsFor(true))), []);
  /* the active family's three tariffs (Flex | Ausgewogen | Sicherheit) — the
     recommended card is one of them; the other two are the comparison cards
     that fan out of the red panel when "Tarif vergleichen" is pressed */
  const family = eco ? TARIFFS.zukunft : TARIFFS.standard;

  /* ── HEMS: which category is active while scrolling through the pinned stage ── */
  const [hemsActive, setHemsActive] = useState(0);
  const [hemsPinsReady, setHemsPinsReady] = useState(false);
  const hemsIdxRef = useRef(0);
  const hemsSTRef  = useRef<ReturnType<typeof ScrollTrigger.create> | null>(null);
  const hemsTextRef = useRef<HTMLDivElement>(null);
  const hemsLinesRef = useRef<SVGSVGElement>(null);
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

  /* "Tarif vergleichen" widens the red panel and fans the two alternative
     cards out beside the recommendation. The image narrows (no mask), the
     panel grows — all via CSS transitions; GSAP just nudges the new cards'
     content in once they have width. */
  const [comparing, setComparing] = useState(false);   // drives the BACKGROUND (frame/column/panel)
  const [cardPhase, setCardPhase] = useState<'solo' | 'compare'>('solo'); // which card SET is mounted
  const panelRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);        // .cards container (to query the compare cards)
  const soloCardsWidth = useRef(0);                     // .cards width in solo state — pins it during collapse so the solo card enters at its final width (no reflow)
  const animatingCards = useRef(false);
  const firstCardPhase = useRef(true);

  /* ── AI chat (orbFloat): open state + a ref so GSAP can drift it to centre.
     `orbCentered` flips true once the breakdown morph has parked it centre. ── */
  const [chatOpen, setChatOpen] = useState(false);
  /* placeholder flips to the tariff-specific prompt once the orb parks centre
     (breakdown onward — the "this tariff" context) */
  const [orbTariffQ, setOrbTariffQ] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  const orbCentered = useRef(false);

  /* footprint of the pill at the moment we open from it (default or hovered) */
  const pillSize = useRef({ w: DEFAULT_PILL_W, h: PILL_H });
  /* The chat markup is now <AiChat>; the morph reaches its nodes through the
     stable `data-ai-*` hooks it renders, queried within orbRef (the float). */
  const q = useCallback(<T extends HTMLElement>(sel: string): T | null =>
    orbRef.current?.querySelector<T>(sel) ?? null, []);

  /* Open is the SAME mechanic as the pill's hover-expand: the box grows
     (width + height) with CHAT_EASE while the wrapper's x re-anchors — right
     edge fixed when docked (grows left), centre fixed when centred (grows both
     ways), and the bottom stays put so it unfolds upward. A fixed-width inner +
     overflow:hidden on the outer reveals the content without reflow. */
  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;
    const vw = document.documentElement.clientWidth;
    if (chatOpen) {
      const card  = q('[data-ai-card]');
      const inner = q<HTMLElement>('[data-ai-inner]');
      const row   = q('[data-ai-row]');
      if (!card || !inner) return;
      const fullW = inner.offsetWidth, fullH = inner.offsetHeight;
      const targetX = orbCentered.current ? -fullW / 2 : vw / 2 - fullW - 30;
      gsap.set(card, { width: pillSize.current.w, height: pillSize.current.h });
      gsap.to(card, { width: fullW, height: fullH, duration: 0.5, ease: CHAT_EASE, clearProps: 'width,height' });
      gsap.to(orb, { x: targetX, duration: 0.5, ease: CHAT_EASE });
      /* hover → open: the send slides in from the right (reverse of the close) */
      const send = row?.querySelector<HTMLElement>('[data-ai-send]') ?? null;
      if (send) gsap.fromTo(send, { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: CHAT_EASE, clearProps: 'opacity,transform' });
    } else {
      const w = orb.offsetWidth;
      gsap.set(orb, { x: orbCentered.current ? -w / 2 : vw / 2 - w - 30 });
    }
  }, [chatOpen, q]);

  /* Close in two beats, both with CHAT_EASE: (1) open → hovered — fold the card
     down to the input row (still full width, prompt visible); (2) hovered →
     default — collapse the width back to the pill and re-anchor, then unmount. */
  /* hover → default: collapse the (already folded) card to the pill and unmount.
     x re-anchors by `orbCentered`, so a centred chat stays centred (no jump). */
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closingRef = useRef(false);

  const collapseChatToDefault = useCallback(() => {
    closingRef.current = false;
    const orb = orbRef.current, card = q('[data-ai-card]'), row = q('[data-ai-row]');
    if (!orb || !card) { setChatOpen(false); return; }
    const vw = document.documentElement.clientWidth;
    const targetX = orbCentered.current ? -DEFAULT_PILL_W / 2 : vw / 2 - DEFAULT_PILL_W - 30;
    const reveal = row?.querySelector<HTMLElement>('[data-ai-reveal]') ?? null;
    const tl = gsap.timeline({ onComplete: () => setChatOpen(false) });
    if (reveal) {   // collapse the prompt so the row becomes the condensed pill
      gsap.set(reveal, { flexGrow: 0, width: reveal.getBoundingClientRect().width });
      tl.to(reveal, { width: 0, opacity: 0, duration: 0.4, ease: CHAT_EASE }, 0);
    }
    tl.to(card, { width: DEFAULT_PILL_W, height: PILL_H, duration: 0.4, ease: CHAT_EASE }, 0);
    tl.to(orb,  { x: targetX, duration: 0.4, ease: CHAT_EASE }, 0);
  }, [q]);

  /* (re)arm the 1s dwell before the hover-state pill collapses to default */
  const armChatDwell = useCallback(() => {
    clearTimeout(dwellTimer.current);
    dwellTimer.current = setTimeout(collapseChatToDefault, 1000);
  }, [collapseChatToDefault]);

  /* Close — open → hover: the EXACT reverse of hover → open. Fold the header/
     body away, grey → white immediately, and the send slides out to the right
     (clipped by the card). Hold there; after 1s untouched it collapses hover →
     default. Hovering the card during the hold cancels the collapse (re-armed
     on leave). The card never moves horizontally, so a centred chat stays put. */
  const closeChat = useCallback(() => {
    const card = q('[data-ai-card]'), inner = q<HTMLElement>('[data-ai-inner]'), row = q('[data-ai-row]');
    if (!card || !inner || !row) { setChatOpen(false); return; }
    const send = row.querySelector<HTMLElement>('[data-ai-send]');
    gsap.set(card, { width: inner.offsetWidth, height: inner.offsetHeight });
    gsap.to(card, { height: row.offsetHeight, duration: 0.5, ease: CHAT_EASE });   // fold → hover
    if (send) gsap.to(send, { x: 70, opacity: 0, duration: 0.5, ease: CHAT_EASE });// send slides out
    closingRef.current = true;
    armChatDwell();
  }, [armChatDwell, q]);

  /* clear the dwell timer on unmount */
  useEffect(() => () => clearTimeout(dwellTimer.current), []);

  /* ── Pill hover: reveal the prompt while keeping the orb's anchor fixed.
     Width-reveal and the compensating x-shift run on the SAME tween (duration +
     ease), so the right edge stays put when docked (grows left) and the centre
     stays put when centred (grows both ways) — through the little bounce too. ── */
  const pillBaseX = useRef(0);

  const onPillEnter = useCallback(() => {
    const orb = orbRef.current, reveal = q('[data-ai-reveal]');
    if (!orb || !reveal) return;
    const w = reveal.scrollWidth;                                  // natural revealed width
    pillBaseX.current = (gsap.getProperty(orb, 'x') as number) || 0;
    const shift = orbCentered.current ? w / 2 : w;                 // centre → half, dock → full
    gsap.to(reveal, { width: w, opacity: 1, duration: 0.55, ease: CHAT_EASE, overwrite: 'auto' });
    gsap.to(orb, { x: pillBaseX.current - shift, duration: 0.55, ease: CHAT_EASE, overwrite: 'auto' });
  }, [q]);

  const onPillLeave = useCallback(() => {
    const orb = orbRef.current, reveal = q('[data-ai-reveal]');
    if (!orb || !reveal) return;
    gsap.to(reveal, { width: 0, opacity: 0, duration: 0.5, ease: CHAT_EASE, overwrite: 'auto' });
    gsap.to(orb, { x: pillBaseX.current, duration: 0.5, ease: CHAT_EASE, overwrite: 'auto' });
  }, [q]);

  /* capture the pill's footprint (default or hovered) so the card can grow from it */
  const openChat = useCallback(() => {
    clearTimeout(dwellTimer.current);
    closingRef.current = false;
    const pill = q('[data-ai-row]');   // current pill footprint (default or hovered)
    if (pill) { const r = pill.getBoundingClientRect(); pillSize.current = { w: r.width, h: r.height }; }
    setChatOpen(true);
  }, [q]);

  /* ── Sequenced OPEN: fade the solo card out → expand the background + mount the
     comparison cards (hidden) → (reveal effect) stagger them in once bg opened. ── */
  const openCompare = useCallback(() => {
    if (animatingCards.current) return;
    animatingCards.current = true;
    const solo = cardRef.current;   // the solo card IS the rec card
    /* capture the solo row's width NOW (steady state) so we can pin it during the
       collapse — lets the solo card re-enter at its final width without reflow */
    if (cardsRef.current) soloCardsWidth.current = cardsRef.current.getBoundingClientRect().width;
    const go = () => { setComparing(true); setCardPhase('compare'); };
    /* solo OUT mirrors the 3-card OUT: same x:80 slide / 0.26s / power2.in */
    if (solo) gsap.to(solo, { opacity: 0, x: 80, duration: 0.26, ease: 'power2.in', onComplete: go });
    else go();
  }, []);

  /* ── Sequenced CLOSE: stagger the comparison cards out (right-most first) →
     collapse the background + mount the solo card (hidden) → (reveal effect) fade
     it back in. The two animation tracks (background vs cards) never overlap. ── */
  const closeCompare = useCallback(() => {
    if (animatingCards.current) return;
    animatingCards.current = true;
    const cont = cardsRef.current;
    const cards = cont ? Array.from(cont.querySelectorAll<HTMLElement>(`.${styles.card}`)) : [];
    const go = () => { setComparing(false); setCardPhase('solo'); };
    if (cards.length) {
      gsap.to(cards, {
        opacity: 0, x: 80, duration: 0.26, ease: 'power2.in',
        stagger: { each: 0.05, from: 'end' },
        onComplete: go,
      });
    } else go();
  }, []);

  /* Reveal whichever card set just mounted (after its background track has begun):
     comparison cards stagger in from the right; the solo card fades up. The very
     first mount is skipped — the hero entrance reveals the solo card via data-au. */
  useIsoLayoutEffect(() => {
    if (firstCardPhase.current) { firstCardPhase.current = false; return; }
    if (cardPhase === 'compare') {
      const cont = cardsRef.current;
      const cards = cont ? Array.from(cont.querySelectorAll<HTMLElement>(`.${styles.card}`)) : [];
      if (!cards.length) { animatingCards.current = false; return; }
      /* The row is pinned at its FINAL width by CSS (.frameHero[data-comparing] .cards),
         so the cards never reflow as the panel expands behind them — which means we
         no longer need to wait. Slide them in IMMEDIATELY, one-by-one (0.12s stagger),
         3rd card first → 1st card last (from:'end', right → left) with ease-out — this
         also matches the panel's right→left reveal, so no card slides in while clipped. */
      gsap.set(cards, { opacity: 0, x: 80 });
      gsap.to(cards, {
        opacity: 1, x: 0,
        duration: 0.26, ease: 'power2.out',
        stagger: { each: 0.07, from: 'end' },
        clearProps: 'opacity,transform',
        onComplete: () => { animatingCards.current = false; },
      });
    } else {
      const solo = cardRef.current;
      const cont = cardsRef.current;
      if (!solo) { animatingCards.current = false; return; }
      /* Pin the row at its captured solo width (right-anchored) so the solo card
         enters at its FINAL width while the panel is still collapsing behind it —
         no reflow, no waiting. Then slide it in IMMEDIATELY from the LEFT
         (left → right), mirroring how the 3 cards enter. */
      if (cont && soloCardsWidth.current) {
        gsap.set(cont, { width: soloCardsWidth.current, marginLeft: 'auto', flex: 'none' });
      }
      gsap.set(solo, { opacity: 0, x: -80 });
      gsap.to(solo, {
        opacity: 1, x: 0, duration: 0.26, ease: 'power2.out',
        clearProps: 'opacity,transform',
        onComplete: () => {
          if (cont) gsap.set(cont, { clearProps: 'width,marginLeft,flex' });
          animatingCards.current = false;
        },
      });
    }
  }, [cardPhase]);

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


  /* The scroll engine, now in hooks. ORDER MATTERS: usePinnedTrack creates the
     master pin FIRST; the section hooks below sit under the pin and must be created
     after it (ScrollTrigger measures in creation order) or their scrub pins at 1. */
  usePinnedTrack({ pageRef, sectionRef, trackRef, orbRef, orbCentered, setOrbTariffQ });
  useStoriesParallax(pageRef); // story-card parallax + white→gradient bg switch (slice 1)
  useMagneticStories(pageRef); // pointer-magnetic pull + 3D tilt on the story cards
  useHemsStage({               // connected-home reveal + scrub category-select + wires + idle (slice 2)
    pageRef,
    linesRef: hemsLinesRef,
    idxRef: hemsIdxRef,
    scrubRef: hemsSTRef,
    setActive: setHemsActive,
    setPinsReady: setHemsPinsReady,
    onIdleOpen: () => setChatOpen(true),
  });

  /* Journey → tariff reveal: enter from under the RouteCurtain. Pre-offset the
     hero frame by INTRO_RISE (parked below, hidden beneath the red cover), signal
     the curtain we've painted so it lifts, then rise the hero up as the curtain
     lifts — mirroring the home hero video. Only when arriving from a completed
     journey (the onboarding sets `eon:intro-tariff`). Animating the frame's own
     translateY is safe: the scroll track scrubs `x` and reveals via clipPath, so
     this transform is otherwise unused. */
  useIsoLayoutEffect(() => {
    const frame = heroFrameRef.current;
    if (!frame) return;

    /* The hero enters by rising from below as the cover lifts away — the journey
       RouteCurtain OR the fresh-load IntroLoader splash, whichever brought us here
       (both emit `eon:intro-done`). Mirrors the home hero video rise. The listener
       is (re)registered every run so it survives React Strict Mode's double-invoke. */
    let fallback = 0;
    const rise = () => {
      clearTimeout(fallback);
      gsap.to(frame, { y: 0, duration: 0.85, ease: 'power3.out', clearProps: 'y' });
    };
    const off = onEon('eon:intro-done', rise);

    /* Prime once (ref-guarded, not flag-gated, so Strict Mode's second invoke
       can't drop it): park the hero below, hidden under the cover, and signal the
       curtain we're painted (the IntroLoader self-drives, so it ignores this). A
       fallback guarantees the hero never stays parked if no cue ever arrives. */
    if (!introPrimed.current) {
      introPrimed.current = true;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        gsap.set(frame, { y: INTRO_RISE });
        requestAnimationFrame(() =>
          requestAnimationFrame(() => emitEon('eon:tariff-ready')));
        fallback = window.setTimeout(rise, 4000);
      }
    }

    return () => { off(); clearTimeout(fallback); };
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
            <span className={styles.contextItem}><Icon name="location" size={16} className="opacity-75" />{plz}</span>
            <div className={styles.contextSep} />
            <span className={styles.contextItem}><Icon name="persons" size={16} className="opacity-75" />{persons} Pers.</span>
            <div className={styles.contextSep} />
            <span className={styles.contextItem}><Icon name="plug" size={16} className="opacity-75" />{kwhFormatted} kWh</span>
            <div className={styles.contextSep} />
          </div>
          {/* floating state: summary label */}
          <span className={styles.floatLabel}>Deine Eingaben</span>
          <Link href="/" className="px-3 py-2">Ändern</Link>
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
            <Toggle checked={eco} onChange={toggleEco} label="Besonders nachhaltig" className="shrink-0" />
          </div>
          {/* floating state: tariff + cart */}
          <div className={styles.floatTariff}>
            <div className={styles.floatDivider} />
            <div className={styles.floatTariffText}>
              <span className={styles.floatTariffName}>{tariff.name}</span>
              <span className={styles.floatTariffPrice}>{tariff.price} € pro Monat</span>
            </div>
            <IconButton variant="primary" aria-label="Zum Warenkorb" onClick={() => startCheckout()}><Icon name="cart" /></IconButton>
          </div>
        </div>
      </div>

      {/* ── AI chat (one <AiChat>, two states): condensed "pill" (default → wider
            on hover) ↔ full "answer" card when opened. The float wrapper carries
            the GSAP x; the morph drives AiChat's data-ai-* nodes. Drifts to centre
            during the breakdown morph; auto-opens after 3s on the HEMS section. ── */}
      <div className={styles.orbFloat} ref={orbRef} data-open={chatOpen ? 'true' : 'false'}>
        {chatOpen ? (
          <AiChat
            variant="answer"
            prompt={orbTariffQ ? 'Fragen zu diesem Tarif?' : 'Was beschäftigt dich heute?'}
            answerHeading="Du willst das Meiste aus deinem Ökostrom herausholen?"
            answerBody="Hier kommt ein HEMS (Home Energy Management System) ins Spiel. Über Apps (wie E.ON Home oder Smart Control) siehst du in Echtzeit, welche deiner Geräte wie viel verbrauchen. Stromfresser werden sofort entlarvt. So kannst du deinen Gesamtverbrauch – und damit auch den Bedarf an Erzeugung – nachhaltig senken."
            cardWidth={CHAT_CARD_W}
            onCloseChat={closeChat}
            onMouseEnter={() => { if (closingRef.current) clearTimeout(dwellTimer.current); }}
            onMouseLeave={() => { if (closingRef.current) armChatDwell(); }}
          />
        ) : (
          <AiChat
            variant="pill"
            prompt={orbTariffQ ? 'Fragen zu diesem Tarif?' : 'Was beschäftigt dich heute?'}
            onClick={openChat}
            onMouseEnter={onPillEnter}
            onMouseLeave={onPillLeave}
            aria-label="E.ON Assistant öffnen"
          />
        )}
      </div>

      {/* ── Pinned horizontal section ── */}
      <section className={styles.scrollSection} ref={sectionRef}>
        <div className={styles.track} ref={trackRef}>

          {/* ═══ Frame 1: Hero + Tariff card ═══ */}
          <div className={`${styles.frame} ${styles.frameHero}`} data-comparing={comparing} ref={heroFrameRef}>
            <div className={styles.frameImage} data-aimg>
              <video src="/newhousevideo.mp4" aria-label="E.ON Kundin" autoPlay loop muted playsInline />
            </div>

            <div className={styles.heroRight}>
            <div className={styles.panel} ref={panelRef}>
              {/* red living-gradient layer — fades out as the comparison opens */}
              <div className={styles.panelGlow} aria-hidden="true" />
              {/* collapse chevron — left edge, vertically centred, only while comparing */}
              {comparing && (
                <button
                  className={styles.compareCollapse}
                  onClick={closeCompare}
                  aria-label="Vergleich schließen"
                >
                  <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
                    <path d="M3 2l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              <div className={styles.panelNormal}>
                <div className={styles.panelHeader} data-al>
                  {comparing ? (
                    <>
                      <span className={styles.panelLabel}>Tarif im Vergleich</span>
                      <h1 className={styles.panelTitle}>Drei Wege, ein Ökostrom</h1>
                      <p className={styles.panelSub}>Gleiche Strom-Quelle, unterschiedliche Bindung – wähle, was zu dir passt.</p>
                    </>
                  ) : (
                    <>
                      <h1 className={styles.panelTitle}>Dein Stromtarif, in 15 Sekunden</h1>
                      <p className={styles.panelSub}>Ehrlich erklärt, was deinen Tarif besonders macht – und warum du mit E.ON richtig liegst.</p>
                    </>
                  )}
                </div>

                {/* one row: recommendation + two alternatives. In normal mode the
                    extras are collapsed to zero width; comparing fans them out. */}
                <div className={styles.cards} data-comparing={cardPhase === 'compare'} ref={cardsRef}>
                  {cardPhase === 'solo' ? (
                    /* ── Card A — initial recommended card: full width, 2×2 grid ── */
                    <div
                      className={styles.card}
                      data-rec="true"
                      data-au=""
                      ref={cardRef}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.cardHeadRow}>
                          <div className={styles.cardHeadText}>
                            <p className={styles.cardName}>{tariff.name}</p>
                            <p className={styles.cardSub}>{tariff.sub}</p>
                          </div>
                          {eco && (
                            <Badge tone="success" iconLeft={<Icon name="leaf" />}>
                              Besonders nachhaltig
                            </Badge>
                          )}
                        </div>
                        <div className={styles.cardPrice}>
                          <span className={styles.priceMain}>{tariff.price}</span>
                          <span className={styles.priceUnit}>€ pro Monat</span>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardDivider} />
                        <div className={styles.cardFeatures}>
                          <Feature gradient icon={<Icon name="bonus" className="text-brand-red shrink-0" />} name={tariff.bonus} desc={tariff.bonusUntil} />
                          {tariff.features.map(([name, desc]) => (
                            <Feature key={name + desc} icon={<Icon name="check-circle" className="text-brand-red" />} name={name} desc={desc} />
                          ))}
                        </div>
                        <div className={styles.cardActions}>
                          <Button variant="primary" fullWidth onClick={() => startCheckout(tariff)}>Tarif auswählen</Button>
                          <Button variant="outline" fullWidth iconRight={<Icon name="chevron-right" />} onClick={openCompare}>
                            Tarif vergleichen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Cards B/C/D — comparison cards: vertical feature list ── */
                    [
                      { t: tariff, isRec: true, k: 'rec' },
                      ...family.filter((t) => t.id !== tariff.id).map((t) => ({ t, isRec: false, k: t.id })),
                    ].map(({ t, isRec, k }, i) => (
                      <div
                        key={k}
                        className={styles.card}
                        data-comparing="true"
                        data-rec={isRec ? 'true' : 'false'}
                        data-extra={isRec ? undefined : 'true'}
                        /* stack so the cascade layers right: 1st card lowest → 3rd card on top */
                        style={{ zIndex: i + 1 }}
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.cardHeadRow}>
                            <div className={styles.cardHeadText}>
                              <p className={styles.cardName}>{t.name}</p>
                              <p className={styles.cardSub}>{t.sub}</p>
                            </div>
                            {isRec && <Badge tone="brand">Unsere Empfehlung für dich</Badge>}
                          </div>
                          <div className={styles.cardPrice}>
                            <span className={styles.priceMain}>{t.price}</span>
                            <span className={styles.priceUnit}>€ pro Monat</span>
                          </div>
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.cardDivider} />
                          <div className={styles.cardFeatures} data-comparing="true">
                            <Feature icon={<Icon name="bonus" className="text-brand-red shrink-0" />} name={t.bonus} desc={t.bonusUntil} />
                            {t.features.map(([name, desc]) => (
                              <Feature key={name + desc} icon={<Icon name="check-circle" className="text-brand-red" />} name={name} desc={desc} />
                            ))}
                          </div>
                          <div className={styles.cardActions}>
                            <Button variant={isRec ? 'primary' : 'outline'} fullWidth onClick={() => startCheckout(t)}>
                              Tarif auswählen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>{/* /panelNormal */}

              {/* Social proof — now INSIDE the gradient panel, no background; rides
                  on the red gradient with light (inverse) text */}
              <div className={styles.socialProof}>
                <div className={styles.avatars}>
                  {[
                    'https://randomuser.me/api/portraits/women/44.jpg',
                    'https://randomuser.me/api/portraits/men/32.jpg',
                    'https://randomuser.me/api/portraits/women/68.jpg',
                  ].map((src, i) => (
                    <img key={i} className={styles.avatar} src={src} alt="" loading="lazy" />
                  ))}
                </div>
                <div className={styles.socialText}>
                  <p className={styles.socialPct}>68% der Haushalte</p>
                  <p className={styles.socialDesc}>mit ähnlichem Verbrauch wählen diesen Tarif</p>
                </div>
                <Link as="button" tone="inverse" weight="medium" className="shrink-0">Mehr entdecken</Link>
              </div>
            </div>{/* /panel */}
            </div>{/* /heroRight */}
          </div>

          {/* ═══ Frame 2: Editorial "28 cent" intro — the ONE travelling headline.
                data-noclip: the photos parallax beyond the frame box, so a
                frame-level clip-path would cut them off if you scroll mid-reveal.
                Its content reveals via per-element data-ahero / data-aimg instead. ═══ */}
          <div className={`${styles.frame} ${styles.frameEditorial}`} data-noclip>
            <div className={styles.editorialContent} data-alines>
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
                    <div className={styles.articleTag}><Icon name="file" size={16} /> Energie Hub</div>
                    <p className={styles.articleTitle}>Vergleichbares Projekt ansehen und CO2 Ersparnis verstehen</p>
                    <Link as="button" tone="inverse" underline={false} iconLeft={<Icon name="chevron-right" />}>Mehr lesen</Link>
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
                        <span
                          className={styles.lineInfo}
                          tabIndex={0}
                          role="note"
                          data-tip="3 von deinen 28 Cent fließen direkt in den Ausbau neuer Wind- und Solar-Anlagen in Deutschland – nicht in Marge."
                          aria-label="3 von deinen 28 Cent fließen direkt in den Ausbau neuer Wind- und Solar-Anlagen in Deutschland – nicht in Marge."
                        ><Icon name="info" size={14} /></span>
                      </span>
                      <span className={styles.lineValGreen}><span className={styles.greenChip}><Icon name="home" size={13} className="text-[#1ea354]" /></span> 3,00 ct</span>
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

      <Stories />

      {/* ═══ HEMS — sticky stage; scroll advances the category ═══ */}
      <ConnectedHome
        cat={hemsCat}
        activeIndex={hemsActive}
        pinsReady={hemsPinsReady}
        onCatClick={scrollToHemsCat}
        textRef={hemsTextRef}
        linesRef={hemsLinesRef}
      />

      {/* ═══ FAQ — same gradient continues behind it ═══ */}
      <Faq onApproach={collapseChatToDefault} />

      </div>{/* /redZone */}

      {/* ═══ Proof — white panel that slides up over the gradient ═══ */}
      <Proof plz={plz} />

      {/* Conversational checkout journey — opened by the red "Tarif auswählen" CTAs */}
      <CheckoutJourney
        tariff={tariff}
        eco={eco}
        pref={pref}
        onEcoChange={toggleEco}
        onPrefChange={changePref}
        plz={plz}
        persons={Number(persons)}
        kwh={Number(kwh)}
      />
    </div>
  );
}
