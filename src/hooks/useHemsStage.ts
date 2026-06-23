import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { HEMS_CATS, HEMS_PINS, HEMS_HUB, HEMS_LINKS, HEMS_ZOOM, hemsCover } from '@/data/hems';
import styles from '@/components/Tariff/tariff.module.css';

/**
 * useHemsStage — the connected-home sticky stage choreography, lifted out of the
 * TariffPage scroll engine (capstone slice 2):
 *  • one-shot reveal (house unmask + left-slide) on entry,
 *  • scroll-through category select + progressive hub→device wire draw,
 *  • idle auto-open of the chat after 3s paused on the HEMS (first) category,
 *  • `buildHemsPaths`: pixel-space pin placement + rounded-elbow wire routing,
 *    re-run on resize and on every global ScrollTrigger refresh.
 *
 * Its triggers are `.hems`-relative (not the pin). `buildHemsPaths` rides the
 * shared refresh via the ScrollTrigger 'refresh' event (the track effect keeps
 * calling `ScrollTrigger.refresh()` on settle/fonts/images). Cleanup via
 * gsap.context().revert() + listener/timer teardown.
 */
interface UseHemsStageParams {
  pageRef: RefObject<HTMLElement | null>;
  linesRef: RefObject<SVGSVGElement | null>;
  idxRef: MutableRefObject<number>;
  scrubRef: MutableRefObject<ReturnType<typeof ScrollTrigger.create> | null>;
  setActive: (i: number) => void;
  setPinsReady: (v: boolean) => void;
  onIdleOpen: () => void;
}

export function useHemsStage({ pageRef, linesRef, idxRef, scrubRef, setActive, setPinsReady, onIdleOpen }: UseHemsStageParams) {
  const onIdleOpenRef = useRef(onIdleOpen);
  onIdleOpenRef.current = onIdleOpen;

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const hems = page.querySelector<HTMLElement>(`.${styles.hems}`);
    if (!hems) return;

    /* pre-clip the house to its top-right corner so it never flashes in before the
       reveal fires (the dark hemsRight backing covers the gap meanwhile) */
    const hemsPhotoEl = hems.querySelector<HTMLElement>(`.${styles.hemsPhoto}`);
    const hemsShadeEl = hems.querySelector<HTMLElement>(`.${styles.hemsShade}`);
    gsap.set([hemsPhotoEl, hemsShadeEl].filter(Boolean) as HTMLElement[], { clipPath: 'inset(0% 0% 100% 100% round 8px)' });
    if (hemsPhotoEl) gsap.set(hemsPhotoEl, { scale: 1.3 * HEMS_ZOOM });

    /* idle auto-open: fires when the user pauses 3s while HEMS (and only HEMS) is
       the active category; any scroll re-arms it; once per visit. */
    let hemsIdle: ReturnType<typeof setTimeout> | undefined;
    let hemsAutoOpened = false;
    let hemsActiveNow = false;
    const armHemsIdle = () => {
      clearTimeout(hemsIdle);
      if (!hemsActiveNow || hemsAutoOpened) return;
      hemsIdle = setTimeout(() => {
        if (idxRef.current !== 0) return;
        hemsAutoOpened = true;
        onIdleOpenRef.current();
      }, 3000);
    };

    const HEMS_N = HEMS_CATS.length;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: hems,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(hems.querySelector(`.${styles.hemsLeft}`),
            { x: -48, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out' });
          const HR_HIDDEN = 'inset(0% 0% 100% 100% round 8px)';
          const HR_SHOWN = 'inset(0% 0% 0% 0% round 8px)';
          gsap.fromTo([hemsPhotoEl, hemsShadeEl].filter(Boolean) as HTMLElement[],
            { clipPath: HR_HIDDEN },
            { clipPath: HR_SHOWN, duration: 1.6, ease: 'eonReveal', clearProps: 'clipPath' });
          if (hemsPhotoEl) gsap.fromTo(hemsPhotoEl, { scale: 1.3 * HEMS_ZOOM }, { scale: HEMS_ZOOM, duration: 1.6, ease: 'eonReveal' });
          setTimeout(() => setPinsReady(true), 850);
        },
      });

      /* sticky scroll-through: progress selects the active category + draws wires */
      const hemsScrubST = ScrollTrigger.create({
        trigger: hems,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          /* progressively fill each hub→device wire as the scroll advances */
          const svg = linesRef.current;
          if (svg) {
            const groups = svg.children;
            for (let j = 0; j < groups.length; j++) {
              const d = Math.max(0, Math.min(1, self.progress * (HEMS_N - 1) - j));
              (groups[j] as SVGGElement).style.setProperty('--draw', d.toFixed(4));
            }
          }
          const idx = Math.min(HEMS_N - 1, Math.round(self.progress * (HEMS_N - 1)));
          if (idx !== idxRef.current) { idxRef.current = idx; setActive(idx); }
          armHemsIdle();
        },
      });
      scrubRef.current = hemsScrubST;

      /* on screen → arm idle; off screen → cancel */
      ScrollTrigger.create({
        trigger: hems,
        start: 'top top',
        end: 'bottom bottom',
        onToggle: (self) => {
          hemsActiveNow = self.isActive;
          if (self.isActive) armHemsIdle();
          else clearTimeout(hemsIdle);
        },
      });
    }, page);

    /* place each hotspot's dot at its feature (cover-cropped photo, clamped on),
       then draw the hub→device wires as rounded-corner elbows meeting the dot
       centres. The label floats off the dot via its CSS layout. */
    const buildHemsPaths = () => {
      const svg = linesRef.current;
      if (!svg) return;
      const W = svg.clientWidth, H = svg.clientHeight;
      if (!W || !H) return;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const DOT = 20, EDGE = 12, R = 18;
      const C: Record<string, { x: number; y: number }> = {};
      const pinEls = svg.parentElement?.querySelectorAll<HTMLElement>('[data-hotspot]');
      HEMS_PINS.forEach((p, i) => {
        const c = hemsCover(W, H, p.nx, p.ny);
        const cx = Math.min(Math.max(c.x, EDGE + DOT), W - EDGE - DOT);
        const cy = Math.min(Math.max(c.y, EDGE + DOT), H - EDGE - DOT);
        C[p.title] = { x: cx, y: cy };
        const el = pinEls?.[i];
        if (el) { el.style.left = `${cx - DOT}px`; el.style.top = `${cy - DOT}px`; }
      });
      const hub = C[HEMS_HUB.title];
      const groups = svg.children;
      for (let i = 0; i < groups.length; i++) {
        const c = C[HEMS_LINKS[i].title];
        const hx = hub.x, hy = hub.y, dx = c.x, dy = c.y;
        const sy = dy > hy ? 1 : -1, sx = dx > hx ? 1 : -1;
        const rr = Math.max(0, Math.min(R, Math.abs(dy - hy) - 1, Math.abs(dx - hx) - 1));
        const d = `M ${hx} ${hy} L ${hx} ${dy - sy * rr} Q ${hx} ${dy} ${hx + sx * rr} ${dy} L ${dx} ${dy}`;
        groups[i].querySelectorAll('path').forEach((pa) => pa.setAttribute('d', d));
      }
    };

    let resizeRaf = 0;
    const onHemsResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(buildHemsPaths);
    };
    window.addEventListener('resize', onHemsResize);
    ScrollTrigger.addEventListener('refresh', buildHemsPaths);
    requestAnimationFrame(buildHemsPaths); // initial build (also re-run on every global refresh)

    return () => {
      ScrollTrigger.removeEventListener('refresh', buildHemsPaths);
      window.removeEventListener('resize', onHemsResize);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(hemsIdle);
      scrubRef.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
