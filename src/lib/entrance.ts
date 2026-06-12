'use client';

import { gsap } from './gsap';
import type { MaskController } from './mask';

export interface EntranceRefs {
  mask: MaskController;
  mediaEl: HTMLVideoElement;
  navItems: HTMLElement[];
  headlineEl: HTMLElement;
  subheadEl: HTMLElement;
  chatCardEl: HTMLElement;
  chips: HTMLElement[];
  scrollIndicatorEl: HTMLElement;
}

export function buildEntranceTl(refs: EntranceRefs) {
  const { mask, mediaEl, navItems, headlineEl, subheadEl, chatCardEl, chips, scrollIndicatorEl } = refs;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The notch + fillets are static and fully formed the whole time — only
     the reveal wipe (top→bottom), the image zoom, and the content animate. */
  mask.setChatCut(1);

  if (prefersReduced) {
    mask.setReveal(1);
    gsap.set(mediaEl, { scale: 1, opacity: 1 });
    gsap.set([navItems, headlineEl, subheadEl, chatCardEl, chips, scrollIndicatorEl], { clearProps: 'all' });
    return gsap.timeline();
  }

  /* ── Initial hidden states ── */
  const revealState = { p: 0 };
  mask.setReveal(0);
  gsap.set(mediaEl, { scale: 1.4, opacity: 1 });
  gsap.set(navItems,          { y: -70, opacity: 0 });
  /* headline, subhead and chat card share ONE appear: y 70 → 0, opacity 0 → 1 */
  gsap.set([headlineEl, subheadEl, chatCardEl], { y: 70, opacity: 0 });
  gsap.set(scrollIndicatorEl, { y: 70, opacity: 0 });

  const tl = gsap.timeline({ paused: true, onComplete: () => mask.layout() });

  /* 1 ─ Image unmasks top→bottom + zooms 130%→100%
        cubic-bezier(0.33,0.02,0,0.99), 1.6s */
  tl.to(revealState, {
    p: 1,
    duration: 1.6,
    ease: 'eonReveal',
    onUpdate: () => mask.setReveal(revealState.p),
  }, 0);
  tl.to(mediaEl, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0);

  /* 2 ─ Navbar settles quietly */
  tl.to(navItems, { y: 0, opacity: 1, duration: 0.7, ease: 'eonAppear' }, 0.2);

  /* 3 ─ Title + text + chat card + scroll indicator appear together:
        cubic-bezier(0.44,0,0.04,1.02), 1s (chips ride with the card) */
  tl.to([headlineEl, subheadEl, chatCardEl, scrollIndicatorEl], {
    y: 0, opacity: 1, duration: 1, ease: 'eonAppear',
  }, 0.1);

  return tl;
}
