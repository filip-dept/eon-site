'use client';

import { gsap } from './gsap';
import type { MaskController } from './mask';

export interface EntranceRefs {
  mask: MaskController;
  imageEl: SVGImageElement;
  navItems: HTMLElement[];
  headlineEl: HTMLElement;
  subheadEl: HTMLElement;
  chatCardEl: HTMLElement;
  chips: HTMLElement[];
  scrollIndicatorEl: HTMLElement;
}

export function buildEntranceTl(refs: EntranceRefs) {
  const { mask, imageEl, navItems, headlineEl, subheadEl, chatCardEl, chips, scrollIndicatorEl } = refs;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    mask.setReveal(1);
    gsap.set(imageEl, { scale: 1 });
    gsap.set([navItems, headlineEl, subheadEl, chatCardEl, chips, scrollIndicatorEl], { clearProps: 'all' });
    return gsap.timeline();
  }

  /* ── Initial hidden states ── */
  const revealState = { p: 0 };
  mask.setReveal(0);
  gsap.set(imageEl, { scale: 1.3 });
  gsap.set(navItems,          { y: -22, opacity: 0 });
  gsap.set(headlineEl,        { y: 46, opacity: 0 });
  gsap.set(subheadEl,         { y: 22, opacity: 0 });
  gsap.set(chatCardEl,        { y: 30, scale: 0.96, opacity: 0 });
  gsap.set(chips,             { y: 10, opacity: 0 });
  gsap.set(scrollIndicatorEl, { scale: 0, opacity: 0 });

  const tl = gsap.timeline({ paused: true, onComplete: () => mask.layout() });

  /* 1 ─ Background: unmask top→bottom + zoom 130%→100%
        cubic-bezier(0.33,0.02,0,0.99), 1.6s */
  tl.to(revealState, {
    p: 1,
    duration: 1.6,
    ease: 'eonReveal',
    onUpdate: () => mask.setReveal(revealState.p),
  }, 0);
  tl.to(imageEl, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0);

  /* 2 ─ Navbar (its own sequence) */
  tl.to(navItems, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'eonOut' }, 0.2);

  /* 3 ─ Content (headline → subhead → chat → chips), its own sequence */
  tl.to(headlineEl, { y: 0, opacity: 1, duration: 0.8, ease: 'eonOut' }, 0.55);
  tl.to(subheadEl,  { y: 0, opacity: 1, duration: 0.6, ease: 'eonOut' }, 0.8);
  tl.to(chatCardEl, { y: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'eonOut' }, 0.95);
  tl.to(chips,      { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'eonOut' }, 1.3);

  /* 4 ─ Scroll indicator */
  tl.to(scrollIndicatorEl, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' }, 1.5);

  return tl;
}
