import { useEffect, type RefObject, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import styles from '@/components/Tariff/tariff.module.css';

/**
 * usePinnedTrack — the pinned horizontal frames track (capstone slice 3, final).
 * Verbatim move of TariffPage's master scroll effect: the pinST master pin, the
 * travelling "28 Cent" headline, the bars→columns FLIP morph, the card-deck
 * rotation, and the orb centre/dock (orbCenterST → centreOrb). The module helpers
 * below are the frame-reveal cluster (moved with it). MUST be called BEFORE the
 * section hooks (useStoriesParallax/useHemsStage) so pinST is created first —
 * sections below the pin mismeasure otherwise.
 */
const CLIP_HIDDEN  = 'inset(0% 0% 100% 0%)';
const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';

function qa(frame: HTMLElement, sel: string) {
  return Array.from(frame.querySelectorAll(sel)) as HTMLElement[];
}

function setHidden(frame: HTMLElement) {
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  const ah = qa(frame, '[data-ahero]');
  const ai = qa(frame, '[data-aimg]');
  /* the frame itself unmasks like the hero — except the bars frame, which just
     slides in horizontally with the track (data-noclip) */
  if (!frame.hasAttribute('data-noclip')) gsap.set(frame, { clipPath: CLIP_HIDDEN });
  if (al.length) gsap.set(al, { x: -56, opacity: 0 });
  if (ar.length) gsap.set(ar, { x: 56, opacity: 0 });
  if (ad.length) gsap.set(ad, { y: -44, opacity: 0 });
  if (au.length) gsap.set(au, { y: 36, opacity: 0 });
  if (ah.length) gsap.set(ah, { y: 70, opacity: 0 });
  ai.forEach((w) => {
    gsap.set(w, { clipPath: CLIP_HIDDEN });
    const img = w.querySelector('img');
    if (img) gsap.set(img, { scale: 1.3 });
  });
}

function revealFrame(frame: HTMLElement) {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.8 } });
  const al = qa(frame, '[data-al]');
  const ar = qa(frame, '[data-ar]');
  const ad = qa(frame, '[data-ad]');
  const au = qa(frame, '[data-au]');
  const ah = qa(frame, '[data-ahero]');
  const ai = qa(frame, '[data-aimg]');
  /* hero media settings: unmask wipe top→bottom, eonReveal, 1.6s — the clip is
     cleared on complete so it never interferes with later transforms. The bars
     frame opts out (data-noclip): it just slides in with the track. */
  if (!frame.hasAttribute('data-noclip')) {
    tl.fromTo(frame, { clipPath: CLIP_HIDDEN },
      { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0);
  }
  ai.forEach((w, i) => {
    const img = w.querySelector('img');
    tl.fromTo(w, { clipPath: CLIP_HIDDEN },
      { clipPath: CLIP_VISIBLE, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' }, 0.08 * i);
    if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'eonReveal' }, 0.08 * i);
  });
  if (al.length) tl.to(al, { x: 0, opacity: 1, stagger: 0.07 }, 0.04);
  if (ar.length) tl.to(ar, { x: 0, opacity: 1, stagger: 0.07 }, 0.1);
  if (ad.length) tl.to(ad, { y: 0, opacity: 1, stagger: 0.1, duration: 0.65 }, 0);
  if (au.length) tl.to(au, { y: 0, opacity: 1, stagger: 0.06, duration: 0.55 }, 0.4);
  /* hero content settings: y 70 → 0, opacity 0 → 1, eonAppear, 1s, 0.2s delay */
  if (ah.length) tl.to(ah, { y: 0, opacity: 1, duration: 1, ease: 'eonAppear' }, 0.2);
}

interface UsePinnedTrackParams {
  pageRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  orbRef: RefObject<HTMLDivElement | null>;
  orbCentered: MutableRefObject<boolean>;
  setOrbTariffQ: Dispatch<SetStateAction<boolean>>;
}

export function usePinnedTrack({ pageRef, sectionRef, trackRef, orbRef, orbCentered, setOrbTariffQ }: UsePinnedTrackParams) {
  useEffect(() => {
    const page    = pageRef.current;
    const section = sectionRef.current;
    const track   = trackRef.current;
    if (!page || !section || !track) return;

    const frames = Array.from(track.children) as HTMLElement[];
    const revealed = frames.map((_, i) => i === 0);
    /* The hero frame (0) shows WITHOUT the top→down clip-path wipe — it's simply
       present, and rises into place via the journey → tariff hand-off (see
       TariffPage's intro effect). Later frames stay hidden until scrolled to. */
    frames.forEach((f, i) => { if (i !== 0) setHidden(f); });

    /* Size frames off clientWidth (excludes scrollbar) so the track lands flush */
    const setFrameWidth = () =>
      track.style.setProperty('--fw', `${document.documentElement.clientWidth - 32}px`);
    setFrameWidth();
    window.addEventListener('resize', setFrameWidth);

    /* +16 = trailing track padding that scrollWidth doesn't report */
    const getDist = () => track.scrollWidth + 16 - document.documentElement.clientWidth;

    /* Phase 1 traverses the full horizontal distance over a SHORTER scroll
       length (same movement, just faster) so the grey frame arrives sooner.
       Movement uses getDist(); scroll boundaries use phase1(). */
    const SPEED = 0.7;
    const phase1 = () => getDist() * SPEED;

    /* ── Merged Stromtransparenz frame: stack rotates, then expands ── */
    const merged    = frames[frames.length - 1];
    const barsLeft  = merged.querySelector<HTMLElement>(`.${styles.barsLeft}`)!;
    const stacked   = merged.querySelector<HTMLElement>(`.${styles.stackedBars}`)!;
    const bdContent = merged.querySelector<HTMLElement>(`.${styles.bdContent}`)!;
    const bars      = Array.from(stacked.querySelectorAll<HTMLElement>(`.${styles.bar}`));
    const footers   = bars.map((b) => b.querySelector<HTMLElement>('[data-barfooter]'));
    const pcts      = bars.map((b) => b.querySelector<HTMLElement>('[data-pct]'));

    /* centering moves to gsap so x can animate freely during the rotation */
    gsap.set(bars, { xPercent: -50 });
    gsap.set(footers.slice(0, 2).filter(Boolean) as HTMLElement[], { opacity: 0 });
    gsap.set(bdContent, { autoAlpha: 0 });

    const ROT   = 1200; /* scroll px for one full stack rotation */
    const MORPH = 1200; /* scroll px for the expand-to-breakdown morph */

    /* entrance reveals fire off the track's actual x position */
    const checkReveals = () => {
      const x  = -(gsap.getProperty(track, 'x') as number);
      const vw = document.documentElement.clientWidth;
      frames.forEach((f, i) => {
        if (!revealed[i] && f.offsetLeft - x < vw * 0.72) {
          revealed[i] = true;
          revealFrame(f);
        }
      });
    };

    /* Pin holds the whole sequence: horizontal travel + rotation + morph.
       All phase boundaries are function-based so refresh re-measures them. */
    const pinST = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${phase1() + ROT + MORPH}`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: () => checkReveals(),
    });

    /* Nav / floater state — page-wide so it keeps working past the pin.
       Scrolling backwards re-reveals the nav (pushes the floater down);
       at the very top everything resets to the initial layout. */
    const stateST = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const px = self.scroll() - pinST.start;
        const scrolled = px > 20;
        page.classList.toggle(styles.scrolled, scrolled);
        page.classList.toggle(styles.navShow, scrolled && self.direction < 0);
        page.classList.toggle(styles.compact, px > phase1() * 0.7);
      },
    });

    /* Phase 1 — horizontal travel: full getDist() movement over phase1() scroll */
    const trackTween = gsap.to(track, {
      x: () => -getDist(),
      ease: 'none',
      /* fires every render tick, incl. scrub catch-up after scrolling stops */
      onUpdate: checkReveals,
      scrollTrigger: {
        start: () => pinST.start,
        end: () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* ── ONE travelling headline: once it reaches its reading position it
       counter-translates at exactly track speed (viewport-pinned), riding
       with the user until it docks at the bars frame's left column ── */
    const edFrame = frames[1];
    const edText  = edFrame.querySelector<HTMLElement>(`.${styles.editorialContent}`)!;
    const photoTR = edFrame.querySelector<HTMLElement>(`.${styles.edPhotoTopRight}`)!;
    const photoBL = edFrame.querySelector<HTMLElement>(`.${styles.edPhotoBottomLeft}`)!;

    /* offsetLeft is transform-independent — safe to re-measure on refresh.
       Dock target = barsLeft content edge (frame padding-left = 40px). */
    const followDelta = () =>
      merged.offsetLeft + 40 - (edFrame.offsetLeft + edText.offsetLeft);
    const followStart = () => Math.max(0, getDist() - followDelta()) * SPEED;

    const followTween = gsap.to(edText, {
      x: () => followDelta(),
      ease: 'none',
      scrollTrigger: {
        start: () => pinST.start + followStart(),
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    /* ── The lady photo scrolls slower than the text: it converges on the
       pinned headline, decelerates, and comes to rest BEHIND the beige bars
       panel (frame 3 paints over it — no fade) without ever touching the text ── */
    const GAP_TO_TEXT = 64;
    const barsPanel = merged.querySelector<HTMLElement>(`.${styles.barsPanel}`)!;
    const ladyEntry = () =>
      Math.max(0, edFrame.offsetLeft + photoTR.offsetLeft - document.documentElement.clientWidth);
    const ladyX = () => {
      /* rigid = where she would end without counter-translation. Resting spot:
         right of the docked headline AND inside the beige panel's footprint,
         so the panel fully covers her at the dock (text docks at x = 56). */
      const rigid      = edFrame.offsetLeft + photoTR.offsetLeft - getDist();
      const textClamp  = 56 + edText.offsetWidth + GAP_TO_TEXT;
      const panelCover = merged.offsetLeft + barsPanel.offsetLeft - getDist() + 16;
      return Math.max(0, Math.max(textClamp, panelCover) - rigid);
    };
    const ladyTl = gsap.timeline({
      scrollTrigger: {
        start: () => pinST.start + ladyEntry() * SPEED,
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    /* power1.in: rides almost rigidly at first, then brakes into place while
       the grey frame sweeps over her */
    ladyTl.to(photoTR, { x: ladyX, ease: 'power1.in', duration: 1 }, 0);

    /* the man photo starts well right of the text (CSS) and drives left as
       you scroll — opposite parallax depth, exits before the dock */
    const manEntry = () =>
      Math.max(0, edFrame.offsetLeft + photoBL.offsetLeft - document.documentElement.clientWidth);
    const manTl = gsap.timeline({
      scrollTrigger: {
        start: () => pinST.start + manEntry() * SPEED,
        end:   () => pinST.start + phase1(),
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    manTl.to(photoBL, { x: () => -followDelta() * 0.3, ease: 'none', duration: 1 }, 0);

    const parallaxTweens = [ladyTl, manTl];

    /* ── Hub card: appears only once the sticky frame spans the viewport
       (start of the card-flip phase), with the hero appear settings ── */
    const hubWrap = merged.querySelector<HTMLElement>(`.${styles.hubWrap}`)!;
    gsap.set(hubWrap, { y: 70, opacity: 0 });
    const hubST = ScrollTrigger.create({
      start: () => pinST.start + phase1() - 2,
      end:   () => pinST.start + phase1() + ROT + MORPH,
      onEnter:     () => gsap.to(hubWrap, { y: 0, opacity: 1, duration: 1, ease: 'eonAppear', overwrite: 'auto' }),
      onLeaveBack: () => gsap.to(hubWrap, { y: 70, opacity: 0, duration: 0.45, ease: 'eonOut', overwrite: 'auto' }),
    });

    /* Phase 2 — the three stacked cards rotate through the deck once */
    const POS = [
      { width: 274, height: 231, top: 0,  filter: 'blur(4px)', opacity: 0.92 }, /* back  */
      { width: 308, height: 260, top: 28, filter: 'blur(2px)', opacity: 0.96 }, /* mid   */
      { width: 342, height: 289, top: 68, filter: 'blur(0px)', opacity: 1    }, /* front */
    ];
    const rot = gsap.timeline();
    let order = [0, 1, 2]; /* element index occupying [back, mid, front] */
    for (let s = 0; s < 3; s++) {
      const at = s;
      const [bi, mi, fi] = order;
      /* front card slides out right, shrinks + blurs, tucks to the back */
      rot.to(bars[fi], { x: 430, duration: 0.5, ease: 'power2.in' }, at);
      rot.set(bars[fi], { zIndex: 0 }, at + 0.5);
      rot.to(bars[fi], { x: 0, ...POS[0], duration: 0.5, ease: 'power2.out' }, at + 0.5);
      if (footers[fi]) rot.to(footers[fi], { opacity: 0, duration: 0.15 }, at);
      if (pcts[fi])    rot.to(pcts[fi], { fontSize: 30, duration: 0.5 }, at + 0.5);
      /* mid card steps up to the front */
      rot.set(bars[mi], { zIndex: 2 }, at + 0.45);
      rot.to(bars[mi], { ...POS[2], duration: 0.6, ease: 'power2.inOut' }, at + 0.3);
      if (footers[mi]) rot.to(footers[mi], { opacity: 1, duration: 0.25 }, at + 0.7);
      if (pcts[mi])    rot.to(pcts[mi], { fontSize: 40, duration: 0.6 }, at + 0.3);
      /* back card steps up to the middle */
      rot.set(bars[bi], { zIndex: 1 }, at + 0.5);
      rot.to(bars[bi], { ...POS[1], duration: 0.6, ease: 'power2.inOut' }, at + 0.3);
      order = [fi, bi, mi];
    }
    const rotST = ScrollTrigger.create({
      animation: rot,
      start: () => pinST.start + phase1(),
      end:   () => pinST.start + phase1() + ROT,
      scrub: 1,
      invalidateOnRefresh: true,
    });

    /* Phase 3 — text leaves, panel expands full-bleed, then the cards fly to
       their column slots (FLIP-style) and the extra info appears on top */
    const colEls   = Array.from(bdContent.querySelectorAll<HTMLElement>(`.${styles.bdCol}`));
    const barToCol = [colEls[2], colEls[1], colEls[0]]; /* bars [21,32,47] → cols [3rd,2nd,1st] */
    const colInfo  = bdContent.querySelectorAll(`.${styles.colPrice}, .${styles.colDesc}`);
    gsap.set(colInfo, { opacity: 0, y: 14 });

    const morph = gsap.timeline();
    morph.to(barsLeft, { opacity: 0, x: -60, duration: 0.22, ease: 'power1.in' }, 0);
    /* the travelling headline exits with the column (xPercent leaves the
       follow tween's x untouched) */
    morph.to(edText, { opacity: 0, xPercent: -8, duration: 0.22, ease: 'power1.in' }, 0);
    morph.to(barsLeft, { flexBasis: '0%', paddingLeft: 0, paddingRight: 0, duration: 0.34, ease: 'power2.inOut' }, 0.1);
    morph.to(merged, { gap: 0, duration: 0.34, ease: 'power2.inOut' }, 0.1);

    bars.forEach((bar, i) => {
      const col = barToCol[i];
      /* drop %-based centering so width can tween without the card drifting */
      morph.set(bar, {
        xPercent: 0,
        x: () => (gsap.getProperty(bar, 'x') as number) - bar.offsetWidth / 2,
      }, 0.5);
      /* fly + expand to the column's exact rect; measured lazily mid-scrub,
         after the panel has finished expanding */
      morph.to(bar, {
        x: () => (gsap.getProperty(bar, 'x') as number) + col.getBoundingClientRect().left - bar.getBoundingClientRect().left,
        y: () => (gsap.getProperty(bar, 'y') as number) + col.getBoundingClientRect().top - bar.getBoundingClientRect().top,
        width:  () => col.offsetWidth,
        height: () => col.offsetHeight,
        borderRadius: 6,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      }, 0.5);
      if (pcts[i])    morph.to(pcts[i], { fontSize: 24, duration: 0.35, ease: 'power2.inOut' }, 0.5);
      if (footers[i]) morph.to(footers[i], { opacity: 1, duration: 0.2 }, 0.55);
    });

    /* seamless swap — cards and real columns overlap pixel-perfect here */
    morph.to(bars, { autoAlpha: 0, duration: 0.04 }, 0.86);
    morph.to(bdContent, { autoAlpha: 1, duration: 0.04 }, 0.86);

    /* additional info appears in place */
    morph.to(colInfo, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out', stagger: 0.03 }, 0.92);
    morph.fromTo(
      bdContent.querySelectorAll(`.${styles.lineItem}`),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.02, duration: 0.25, ease: 'power2.out' },
      0.95
    );
    const morphST = ScrollTrigger.create({
      animation: morph,
      start: () => pinST.start + phase1() + ROT,
      end:   () => pinST.start + phase1() + ROT + MORPH,
      scrub: 1,
      invalidateOnRefresh: true,
    });

    /* ── AI chat: parks bottom-right, then ANIMATES to screen centre as a
       one-shot (NOT scroll-scrubbed) once the breakdown is reached — so it's
       never stuck halfway, and `orbCentered` is a reliable boolean that the
       open/close logic can trust (centred stays centred). ── */
    const orbEl = orbRef.current!;
    const orbDockX = () => document.documentElement.clientWidth / 2 - orbEl.offsetWidth - 30;
    const orbCtrX  = () => -orbEl.offsetWidth / 2;
    gsap.set(orbEl, { x: orbDockX });
    const centreOrb = (toCentre: boolean) => {
      orbCentered.current = toCentre;
      setOrbTariffQ(toCentre);   /* switch placeholder to the tariff prompt */
      gsap.to(orbEl, { x: toCentre ? orbCtrX : orbDockX, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' });
    };
    const orbCenterST = ScrollTrigger.create({
      start: () => pinST.start + phase1() + ROT,     /* breakdown morph start */
      invalidateOnRefresh: true,
      onEnter:     () => centreOrb(true),
      onLeaveBack: () => centreOrb(false),
    });


    /* ── HEMS: house unmask on entry, then a sticky stage you scroll through
       category by category ── */

    /* FAQ entrance + the "approaching FAQ → collapse orb" trigger now live inside
       <Faq> (it receives collapseChatToDefault as onApproach). */

    /* Stories parallax + bg switch → useStoriesParallax(pageRef) */

    /* Proof panel overlap: the gradient (.redZoneBg) is position:fixed, so it's
       inherently still while the white proof panel (higher z-index) scrolls up
       over it — no pin needed. Pinning .redZone here used to transform it and
       break the HEMS `position: sticky` stage on a cold first load. */

    /* Re-measure as the layout settles. On a fresh client-side navigation the
       fonts and images (e.g. the HEMS house) load AFTER the first measure and
       shift the pin positions — which left the redZone pin / HEMS sticky stage
       mismeasured until a manual refresh. Refresh on each of those events. */

    const refresh = () => { setFrameWidth(); ScrollTrigger.refresh(); };
    requestAnimationFrame(refresh);
    const settle  = setTimeout(refresh, 500);
    const settle2 = setTimeout(refresh, 1200);
    document.fonts?.ready.then(refresh).catch(() => {});
    const lateImgs = Array.from(page.querySelectorAll('img')).filter((im) => !im.complete);
    lateImgs.forEach((im) => im.addEventListener('load', refresh, { once: true }));
    window.addEventListener('load', refresh);

    return () => {
      clearTimeout(settle);
      clearTimeout(settle2);
      window.removeEventListener('load', refresh);
      lateImgs.forEach((im) => im.removeEventListener('load', refresh));
      window.removeEventListener('resize', setFrameWidth);
      orbCenterST.kill();
      stateST.kill();
      rotST.kill();
      morphST.kill();
      rot.kill();
      morph.kill();
      hubST.kill();
      followTween.scrollTrigger?.kill();
      followTween.kill();
      parallaxTweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      trackTween.scrollTrigger?.kill();
      trackTween.kill();
      pinST.kill();
    };
  }, []);
}
