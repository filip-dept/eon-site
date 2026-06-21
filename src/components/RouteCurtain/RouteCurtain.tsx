'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { onEon, emitEon } from '@/lib/eventBus';
import styles from './RouteCurtain.module.css';

/* RouteCurtain — a single red panel that lives in the root layout, so it persists
   across client navigation (it does NOT unmount on a route change → no flash).
   The onboarding journey hands off to /tariff through it:
     1. `eon:route-cover` → the panel WIPES DOWN from the top to cover the page,
        then navigates to the target href (the nav is hidden behind the red).
     2. the tariff page mounts beneath the cover and fires `eon:tariff-ready`.
     3. the panel WIPES BACK UP to reveal, emitting `eon:intro-done` as it starts
        so the tariff hero rises in sync. */
export default function RouteCurtain() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const active = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.set(el, { yPercent: -100 }); // parked above the viewport

    const offCover = onEon('eon:route-cover', ({ href }) => {
      if (reduced) { router.push(href); return; } // no animation — just navigate
      if (active.current) return;
      active.current = true;
      el.style.pointerEvents = 'auto';
      gsap.to(el, {
        yPercent: 0, duration: 0.5, ease: 'power3.inOut',
        onComplete: () => router.push(href), // navigate while fully covered
      });
    });

    const offReady = onEon('eon:tariff-ready', () => {
      if (reduced || !active.current) return;
      gsap.to(el, {
        yPercent: -100, duration: 0.75, ease: 'power3.out',
        onStart: () => emitEon('eon:intro-done'), // cue the tariff hero rise
        onComplete: () => { active.current = false; el.style.pointerEvents = 'none'; },
      });
    });

    return () => { offCover(); offReady(); };
  }, [router]);

  return <div ref={ref} className={styles.curtain} aria-hidden="true" />;
}
