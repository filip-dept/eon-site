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

  /* ── Chat card: measure the open card, then collapse it to a minimized
        pill. It enters minimized and later expands open. ── */
  const chipsEl   = chatCardEl.querySelector<HTMLElement>('[data-chat-chips]');
  const inputEl   = chatCardEl.querySelector<HTMLElement>('[data-chat-input]');
  const actionsEl = chatCardEl.querySelector<HTMLElement>('[data-chat-actions]');
  const cardStyle = getComputedStyle(chatCardEl);
  const fullW = chatCardEl.offsetWidth;
  const fullH = chatCardEl.offsetHeight;
  const gap = parseFloat(cardStyle.rowGap) || 0;
  const chipsH = chipsEl ? chipsEl.offsetHeight : 0;
  const PILL_H = Math.round(fullH - chipsH - gap);  // just the input row

  /* Smallest variant: an icons-only mini pill (mic + send, no prompt).
     Width = card padding + input-row padding + its gap + the actions block. */
  const padX = parseFloat(cardStyle.paddingLeft) + parseFloat(cardStyle.paddingRight);
  const rowStyle = inputEl?.parentElement ? getComputedStyle(inputEl.parentElement) : null;
  const rowGapX = rowStyle ? parseFloat(rowStyle.columnGap) || 0 : 0;
  const rowPadX = rowStyle ? parseFloat(rowStyle.paddingLeft) + parseFloat(rowStyle.paddingRight) : 0;
  const actionsW = actionsEl ? actionsEl.offsetWidth : 0;
  const PILL_W = Math.round(padX + rowPadX + rowGapX + actionsW);

  /* ── Initial hidden states ── */
  gsap.set(videoWrapEl, { clipPath: CLIP_HIDDEN });
  gsap.set(videoEl, { scale: 1.4 });
  gsap.set(navItems, { y: -70, opacity: 0 });
  gsap.set([headlineEl, subheadEl], { y: 70, opacity: 0 });
  gsap.set(chatCardEl, {
    y: 70, opacity: 0, width: PILL_W, height: PILL_H, overflow: 'hidden',
    marginLeft: 'auto', marginRight: 'auto',   // centre the pill so it grows symmetrically
  });
  if (inputEl) gsap.set(inputEl, { opacity: 0 });   // prompt hidden in the mini pill
  if (chipsEl) gsap.set(chipsEl, { opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  /* 1 ─ Video unmasks top→bottom + zooms 140%→100%
        cubic-bezier(0.33,0.02,0,0.99), 1.6s */
  tl.fromTo(videoWrapEl,
    { clipPath: CLIP_HIDDEN },
    { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0);
  tl.to(videoEl, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0);

  /* 2 ─ Navbar settles in */
  tl.to(navItems, { y: 0, opacity: 1, duration: 0.7, ease: 'eonAppear' }, 0.2);

  /* 3 ─ Title + subhead appear:
        cubic-bezier(0.44,0,0.04,1.02), 1s, 0.1s in */
  tl.to([headlineEl, subheadEl], {
    y: 0, opacity: 1, duration: 1, ease: 'eonAppear',
  }, 0.1);

  /* 4 ─ Minimized chat pill rises in — a clear beat after the copy */
  tl.to(chatCardEl, {
    y: 0, opacity: 1, duration: 0.8, ease: 'eonAppear',
  }, 1.2);

  /* 5 ─ Pill expands open (width + height) with a smooth, non-bouncy
        ease-out, then hands sizing back to CSS */
  tl.to(chatCardEl, {
    width: fullW, height: fullH, duration: 0.7, ease: 'eonOut',
    clearProps: 'width,height,overflow,marginLeft,marginRight',
  }, 1.75);

  /* 6 ─ Prompt fades in as the field stretches open */
  if (inputEl) {
    tl.to(inputEl, {
      opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'opacity',
    }, 1.9);
  }

  /* 7 ─ Suggestion chips fade in as the card opens */
  if (chipsEl) {
    tl.to(chipsEl, {
      opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'opacity',
    }, 2.1);
  }

  return tl;
}
