'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './IntroLoader.module.css';

/* module-level so the home intro plays once per app session (on a fresh load),
   not again on client-side navigation back to the home route */
let homePlayed = false;

/* Branded intro/transition: red screen with the E.ON logo, "It's on us" and a
   load bar that fills, then the screen lifts away to reveal the page beneath.
   - variant="home"   → plays on the first load of the landing page
   - variant="tariff" → plays after the onboarding journey completes (the modal
     sets the `eon:intro-tariff` flag right before routing to /tariff) */
export default function IntroLoader({ variant }: { variant: 'home' | 'tariff' }) {
  // home covers immediately (no hero flash); tariff only when arriving from the journey
  const [show, setShow] = useState(variant === 'home');
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const decided = useRef(false);

  /* decide whether this instance should actually play (client-only) */
  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    if (variant === 'home') {
      if (homePlayed) { setShow(false); return; }   // already shown this session
      homePlayed = true;
    } else {
      const flagged = sessionStorage.getItem('eon:intro-tariff') === '1';
      sessionStorage.removeItem('eon:intro-tariff');
      if (!flagged) return;
      setShow(true);
    }
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
      .to(root, { yPercent: -100, duration: 0.6, ease: 'eonOut' }, '+=0.12');

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
