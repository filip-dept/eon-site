'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { emitEon } from '@/lib/eventBus';
import styles from './IntroLoader.module.css';

/* layout effect on the client (runs before paint → no flash), no-op on the server */
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* module-level so the home intro plays once per app session (on a fresh load),
   not again on client-side navigation back to the home route */
let homePlayed = false;

/* Branded intro/transition: a red screen with the E.ON logo + "It's on us" that
   lifts away to reveal the page beneath.
   - variant="home"   → plays on the first load of the landing page (logo + load bar)
   - variant="tariff" → plays on every load of the tariff page. Two flavours:
       • direct load / refresh — the red is already covering and simply lifts UP
         (the classic exit), and the first screen rises in from below;
       • arriving from the journey (the modal set the `eon:intro-tariff` flag) —
         the red curtain first drops DOWN to cover, holds a beat, then lifts UP.
     Either way the cue fires as it lifts, so TariffPage rises its first screen in. */
export default function IntroLoader({ variant }: { variant: 'home' | 'tariff' }) {
  // both variants cover immediately (no hero flash); home may opt out on revisits
  const [show, setShow] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const decided = useRef(false);
  const cued = useRef(false);
  const fromJourney = useRef(false);

  /* tell the page the splash is clearing (once). When this instance won't play,
     fire it right away so the from-the-top entrance doesn't wait on a dead cue. */
  const cueHero = () => { if (cued.current) return; cued.current = true; emitEon('eon:intro-done'); };

  /* Tariff only: detect a journey hand-off and, if so, park the curtain ABOVE the
     viewport BEFORE paint so it can drop DOWN cleanly (a direct load stays put,
     covering, and just lifts). Reads + clears the flag here (before the decide
     effect) so the play effect can trust `fromJourney`. */
  useIsoLayoutEffect(() => {
    if (variant !== 'tariff') return;
    fromJourney.current = sessionStorage.getItem('eon:intro-tariff') === '1';
    sessionStorage.removeItem('eon:intro-tariff');
    if (fromJourney.current && rootRef.current) gsap.set(rootRef.current, { yPercent: -100 });
  }, [variant]);

  /* decide whether this instance should actually play (client-only) */
  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    if (variant === 'home') {
      if (homePlayed) { setShow(false); cueHero(); return; }   // already shown this session
      homePlayed = true;
    }
    // tariff always plays (covers on every load) — nothing to decide here
  }, [variant]);

  /* play the timeline once we're showing */
  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    if (!root) return;
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => { document.body.style.overflow = ''; setShow(false); },
    });
    const __dbgSlow = Number(sessionStorage.getItem('eon:intro-debug-slow'));
    if (__dbgSlow > 0) tl.timeScale(1 / __dbgSlow);

    if (variant === 'tariff' && fromJourney.current) {
      /* Journey hand-off: the red curtain drops DOWN to cover (parked above the
         viewport by the layout effect), holds a beat, then lifts UP with the same
         exit as the classic intro. */
      tl.to(root, { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
        .fromTo(rowRef.current, { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'eonOut' }, 0.18)
        .to(root, { yPercent: -100, duration: 0.75, ease: 'power3.out', onStart: cueHero }, '+=0.5');
    } else if (variant === 'tariff') {
      /* Direct load / refresh: the red is already covering — show the brand a beat,
         then lift UP (classic exit). The first screen rises in from below. */
      tl.fromTo(rowRef.current, { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'eonOut' }, 0.05)
        .to(root, { yPercent: -100, duration: 0.75, ease: 'power3.out', onStart: cueHero }, '+=0.35');
    } else {
      /* Home splash: logo + load bar fill, then lift away. */
      tl.fromTo(rowRef.current, { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'eonOut' }, 0.1)
        .fromTo(barRef.current, { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: 'power1.inOut' }, 0.25)
        .to(root, { yPercent: -100, duration: 0.75, ease: 'power3.out', onStart: cueHero }, '+=0.12');
    }

    return () => { tl.kill(); document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div ref={rowRef} className={styles.row}>
        <img src="/icons/logo.svg" alt="E.ON" className={styles.logo} />
        <span className={styles.slogan}>It&apos;s on us</span>
      </div>
      {/* the load bar belongs to the home splash only — the tariff intro is a
          quick transition, not a load */}
      {variant === 'home' && (
        <div className={styles.barTrack}>
          <div ref={barRef} className={styles.bar} />
        </div>
      )}
    </div>
  );
}
