'use client';

import { gsap } from './gsap';

export interface EntranceRefs {
  videoWrapEl: HTMLElement; // clips the unmask wipe
  videoEl: HTMLElement;     // zooms underneath the static clip
  navItems: HTMLElement[];
  headlineEl: HTMLElement;
  subheadEl: HTMLElement;
  chatCardEl: HTMLElement;
}

const CLIP_HIDDEN  = 'inset(0% 0% 100% 0%)';
const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';

export function buildEntranceTl(refs: EntranceRefs) {
  const { videoWrapEl, videoEl, navItems, headlineEl, subheadEl, chatCardEl } = refs;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    gsap.set(videoWrapEl, { clearProps: 'clipPath' });
    gsap.set(videoEl, { scale: 1 });
    gsap.set([navItems, headlineEl, subheadEl, chatCardEl], { clearProps: 'all' });
    return gsap.timeline();
  }

  /* ── Initial hidden states ── */
  gsap.set(videoWrapEl, { clipPath: CLIP_HIDDEN });
  gsap.set(videoEl, { scale: 1.4 });
  gsap.set(navItems, { y: -70, opacity: 0 });
  gsap.set([headlineEl, subheadEl, chatCardEl], { y: 70, opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  /* 1 ─ Video unmasks top→bottom + zooms 140%→100%
        cubic-bezier(0.33,0.02,0,0.99), 1.6s */
  tl.fromTo(videoWrapEl,
    { clipPath: CLIP_HIDDEN },
    { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0);
  tl.to(videoEl, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0);

  /* 2 ─ Navbar settles in */
  tl.to(navItems, { y: 0, opacity: 1, duration: 0.7, ease: 'eonAppear' }, 0.2);

  /* 3 ─ Title + subhead + chat card appear together:
        cubic-bezier(0.44,0,0.04,1.02), 1s, 0.1s in */
  tl.to([headlineEl, subheadEl, chatCardEl], {
    y: 0, opacity: 1, duration: 1, ease: 'eonAppear',
  }, 0.1);

  return tl;
}
