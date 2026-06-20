'use client';

import { gsap } from './gsap';

export interface EntranceRefs {
  videoWrapEl: HTMLElement;  // background wrapper (clips the rising video)
  videoEl: HTMLElement;      // background video (rises quickly from below, no zoom)
  navItems: HTMLElement[];
  headlineEl: HTMLElement;
  subheadEl: HTMLElement;
  chatWrapEl: HTMLElement;   // chat positioning wrapper (rises in with the content)
  chatCardEl: HTMLElement;   // the suggestions card (morphs pill → suggestions)
}

const RISE = 180;     // px the copy + chat travel up from below
const RISE_BG = 300;  // px the background video travels up from below
const PILL_W = 129;  // Figma "small" pill: 16 + orb 44 + 10 + divider 1 + 6 + mic 36 + 16
const PILL_H = 68;   // py 12 + orb 44 + py 12

/**
 * buildEntranceTl — the homepage hero reveal, played as the branded IntroLoader
 * lifts away (the Hero plays this on the `eon:intro-done` cue):
 *   • the title, the AI chat and the background all rise IN FROM THE BOTTOM with
 *     an ease-out, as the loader clears (copy/chat travel further than the bg);
 *   • the AI chat starts minimised (a pill: orb + mic) and grows into the full
 *     suggestions card (prompt · send · quick-prompt chips).
 *
 * Initial (hidden) states are set immediately so nothing flashes behind the
 * loader; the returned timeline is PAUSED — the caller plays it on the cue.
 */
export function buildEntranceTl(refs: EntranceRefs) {
  const { videoWrapEl, videoEl, navItems, headlineEl, subheadEl, chatWrapEl, chatCardEl } = refs;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const copy = [headlineEl, subheadEl];
  const content = [...copy, chatWrapEl];

  /* chat morph targets (queried via the AiChat data hooks) */
  const reveal = chatCardEl.querySelector<HTMLElement>('[data-ai-reveal]');
  const send   = chatCardEl.querySelector<HTMLElement>('[data-ai-send]');
  const sugg   = chatCardEl.querySelector<HTMLElement>('[data-ai-suggestions]');

  if (prefersReduced) {
    // no motion: leave the hero in its natural, fully-revealed state
    gsap.set([videoWrapEl, videoEl, ...content, ...navItems, chatCardEl, reveal, send, sugg], { clearProps: 'all' });
    return gsap.timeline();
  }

  /* Measure the full card before collapsing it to the pill footprint. The card
     is content-sized here (suggestions variant), so this is its open geometry. */
  const fullW = chatCardEl.offsetWidth;
  const fullH = chatCardEl.offsetHeight;

  /* ── Initial hidden states (the loader still covers all of this) ── */
  // The video keeps its natural full-frame crop (scale 1, head + trees in view).
  // It rises 150px from the bottom, which would briefly expose a gap at the top —
  // but the rise is QUICK and fires in sync with the loader lifting away (which
  // clears top-last), so the loader still covers that strip until the video has
  // landed. Fully opaque (no fade) so the gradient behind never shows.
  gsap.set(videoEl, { y: RISE_BG });
  gsap.set(content, { y: RISE, opacity: 0 });
  gsap.set(navItems, { opacity: 0 });

  /* chat collapsed to the resting pill: width clips the send off-screen and the
     flex-grow prompt reveal squeezes to ~0 on its own; height clips the chips. */
  gsap.set(chatCardEl, { width: PILL_W, height: PILL_H, overflow: 'hidden' });
  // min-width:0 lets the flex prompt actually collapse to 0 in the pill (its
  // default min-width:auto would keep it at the text's width and shove the mic
  // out past the clip). It flex-grows back as the card expands.
  if (reveal) gsap.set(reveal, { opacity: 0, minWidth: 0 });
  if (send)   gsap.set(send, { opacity: 0 });
  if (sugg)   gsap.set(sugg, { opacity: 0 });

  const tl = gsap.timeline({ paused: true });

  /* 1 ─ Background rises in from the bottom — quick (lands before the loader
     uncovers the top), translate only, no zoom, no fade */
  tl.to(videoEl, { y: 0, duration: 0.85, ease: 'power3.out' }, 0);

  /* 2 ─ Title + subhead rise in from the bottom (ease-out) */
  tl.to(copy, { y: 0, opacity: 1, duration: 1.0, ease: 'eonOut', stagger: 0.06 }, 0.12);

  /* nav simply fades in over the rising hero */
  tl.to(navItems, { opacity: 1, duration: 0.6, ease: 'eonOut' }, 0.25);

  /* the chat rises the same way but a beat later than the copy (quick ease-out) */
  tl.to(chatWrapEl, { y: 0, opacity: 1, duration: 0.7, ease: 'eonOut' }, 0.45);

  /* 3 ─ Once the chat has settled, it grows from the pill into the full
     suggestions card — a longer, gently springy ease-out; reveals fade in. */
  const MORPH = 1.45;
  tl.to(chatCardEl, { width: fullW, height: fullH, duration: 0.5, ease: 'back.out(1.4)' }, MORPH);
  if (reveal) tl.to(reveal, { opacity: 1, duration: 0.28, ease: 'power3.out' }, MORPH + 0.12);
  if (send)   tl.to(send, { opacity: 1, duration: 0.28, ease: 'power3.out' }, MORPH + 0.18);
  if (sugg)   tl.to(sugg, { opacity: 1, duration: 0.3, ease: 'power3.out' }, MORPH + 0.22);

  /* hand sizing back to CSS so the card stays responsive after the morph */
  tl.add(() => {
    gsap.set(chatCardEl, { clearProps: 'width,height,overflow' });
    if (reveal) gsap.set(reveal, { clearProps: 'opacity,minWidth' });
    if (send)   gsap.set(send, { clearProps: 'opacity' });
    if (sugg)   gsap.set(sugg, { clearProps: 'opacity' });
  });

  return tl;
}
