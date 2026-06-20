'use client';

import { gsap } from './gsap';

export interface EntranceRefs {
  introEl: HTMLElement;     // red splash frame that lifts away
  introBarEl: HTMLElement;  // preloader fill (scaleX 0 → 1)
  videoEl: HTMLElement;     // zooms underneath as the frame clears
  navItems: HTMLElement[];
  headlineEl: HTMLElement;
  subheadEl: HTMLElement;
  chatCardEl: HTMLElement;
}

/**
 * buildEntranceTl — the homepage hero first-load sequence (zoox-style):
 *   1. a preloader bar fills 0→100% on the red splash frame;
 *   2. the red frame lifts straight up (ease-in-out `eonGlide`), revealing the
 *      video hero underneath — which gently zooms 1.1→1 for depth;
 *   3. the hero content (headline · subhead · chat) rises ~100px into place with
 *      the same glide, and the nav settles down from the top.
 * Steps 2–3 overlap so the lift and the rise read as one coupled motion.
 */
export function buildEntranceTl(refs: EntranceRefs) {
  const { introEl, introBarEl, videoEl, navItems, headlineEl, subheadEl, chatCardEl } = refs;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // no motion: drop the splash, show the hero in its final state
    gsap.set(introEl, { autoAlpha: 0, display: 'none' });
    gsap.set(videoEl, { scale: 1 });
    gsap.set([navItems, headlineEl, subheadEl, chatCardEl], { clearProps: 'all' });
    return gsap.timeline();
  }

  const HERO_RISE = 100; // px the hero content travels upward as the frame lifts

  /* ── Initial hidden states (the red frame already covers all of this) ── */
  gsap.set(introEl, { yPercent: 0 });
  gsap.set(introBarEl, { scaleX: 0, transformOrigin: 'left center' });
  gsap.set(videoEl, { scale: 1.1 });
  gsap.set(navItems, { y: -70, opacity: 0 });
  gsap.set([headlineEl, subheadEl, chatCardEl], { y: HERO_RISE, opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  /* 1 ─ Preloader bar fills */
  tl.to(introBarEl, { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, 0);

  /* 2 ─ Red frame lifts up and off (ease-in-out glide), revealing the hero */
  const LIFT = 1.15; // start once the bar has filled (+ a short beat)
  tl.to(introEl, {
    yPercent: -100, duration: 1.2, ease: 'eonGlide',
    onComplete: () => { introEl.style.display = 'none'; },
  }, LIFT);

  /* video depth zoom under the lift */
  tl.to(videoEl, { scale: 1, duration: 1.6, ease: 'eonReveal' }, LIFT);

  /* 3 ─ Hero content rises ~100px into place, coupled to the lift */
  tl.to([headlineEl, subheadEl, chatCardEl], {
    y: 0, opacity: 1, duration: 1.1, ease: 'eonGlide',
  }, LIFT + 0.15);

  /* nav settles down as the frame clears the top */
  tl.to(navItems, { y: 0, opacity: 1, duration: 0.7, ease: 'eonAppear' }, LIFT + 0.35);

  return tl;
}
