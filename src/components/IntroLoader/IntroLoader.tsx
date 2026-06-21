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

/* Branded intro/transition: red screen with the E.ON logo, "It's on us" and a
   load bar that fills, then the screen lifts away to reveal the page beneath.
   - variant="home"   → plays on the first load of the landing page
   - variant="tariff" → plays on a FRESH load / refresh of /tariff. When arriving
     from the onboarding journey (the `eon:intro-tariff` flag is set), it stays
     inert — the persistent RouteCurtain owns that hand-off instead. */
export default function IntroLoader({ variant }: { variant: 'home' | 'tariff' }) {
  // Cover from the first painted frame (server-rendered) so there's no flash.
  // - home: always.
  // - tariff: on a full page load (server + fresh client hydration). A journey
  //   arrival is a CLIENT navigation (no SSR) — there the flag is set, so the
  //   client initializer returns false and the RouteCurtain owns the reveal.
  const [show, setShow] = useState(() => {
    if (variant === 'home') return true;
    if (typeof window === 'undefined') return true;                 // tariff SSR = full load → cover
    return sessionStorage.getItem('eon:intro-tariff') !== '1';      // client: cover unless journey
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const decided = useRef(false);
  const cued = useRef(false);

  /* tell the page the splash is clearing (once). When this instance won't play,
     fire it right away so the from-below entrance doesn't wait on a dead cue. */
  const cueHero = () => { if (cued.current) return; cued.current = true; emitEon('eon:intro-done'); };

  /* decide whether this instance plays (client-only, before paint → no flash) */
  useIsoLayoutEffect(() => {
    if (decided.current) return;
    decided.current = true;
    if (variant === 'home') {
      if (homePlayed) { setShow(false); cueHero(); return; }   // revisit → don't replay
      homePlayed = true;
      return;                                                  // show already true → plays
    }
    // tariff
    if (sessionStorage.getItem('eon:intro-tariff') === '1') {
      sessionStorage.removeItem('eon:intro-tariff');
      setShow(false);    // journey arrival → RouteCurtain owns it; stay inert (no cue)
      return;
    }
    // full load → `show` is already true from the initializer → the splash plays
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
    tl.fromTo(rowRef.current, { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'eonOut' }, 0.1)
      .fromTo(barRef.current, { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: 'power1.inOut' }, 0.25)
      .to(root, { yPercent: -100, duration: 0.75, ease: 'power3.out', onStart: cueHero }, '+=0.12');

    return () => { tl.kill(); document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div ref={rowRef} className={styles.row}>
        <img src="/icons/logo.svg" alt="E.ON" className={styles.logo} />
        <span className={styles.slogan}>It&apos;s on us</span>
      </div>
      <div className={styles.barTrack}>
        <div ref={barRef} className={styles.bar} />
      </div>
    </div>
  );
}
