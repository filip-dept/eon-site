import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import styles from '@/components/Tariff/tariff.module.css';

/**
 * useStoriesParallax — the tariff "stories" choreography, lifted out of the
 * TariffPage scroll engine (first slice of the usePinnedTrack capstone):
 *  • each story card parallaxes UP at its own speed as the stories text crosses
 *    mid-viewport, and
 *  • the page background switches white → red/purple gradient (text flips to white).
 *
 * Both target their sections by class (no pin involvement), so they're independent
 * of the pinned track. Cleanup via gsap.context().revert(). The global
 * ScrollTrigger.refresh() (driven by the track effect) still re-measures these.
 */
export function useStoriesParallax(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const stories = page.querySelector<HTMLElement>(`.${styles.stories}`);
    const cardEntry = page.querySelector<HTMLElement>(`.${styles.storiesText}`);
    const zoneBg = page.querySelector<HTMLElement>(`.${styles.redZoneBg}`);
    if (!stories || !cardEntry || !zoneBg) return;
    const storyCards = Array.from(stories.querySelectorAll<HTMLElement>(`.${styles.storyCard}`));

    const ctx = gsap.context(() => {
      const vh = () => window.innerHeight;
      const RISE = () => vh() * 0.9; // base rise distance over the run
      const CARD_SPEED = [0.72, 1.28, 1.0]; // per-card rise rate (wide spread = depth)
      const CARD_START = [0.2, 0.85, 0.5]; // entry stagger below the frame top (×vh)

      storyCards.forEach((card, i) => {
        const speed = CARD_SPEED[i % CARD_SPEED.length];
        const start = CARD_START[i % CARD_START.length];
        gsap.fromTo(
          card,
          { y: () => start * vh() },
          {
            y: () => start * vh() - speed * RISE(),
            ease: 'none',
            scrollTrigger: {
              trigger: cardEntry, // the stories text — same anchor as the bg switch
              start: 'center 50%',
              end: () => `+=${vh() * 1.1}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // Background switch: white until the stories text passes mid-viewport, then
      // the constant red→purple gradient fades in (and the text flips to white).
      ScrollTrigger.create({
        trigger: cardEntry,
        start: 'center 50%',
        end: 'max',
        onEnter: () => {
          gsap.to(zoneBg, { opacity: 1, duration: 0.5, ease: 'power1.out', overwrite: 'auto' });
          gsap.to(cardEntry, { color: '#ffffff', duration: 0.4, ease: 'power1.inOut', overwrite: 'auto' });
          page.dataset.navSolid = 'true'; // dark gradient behind the nav → show the white pill
        },
        onLeaveBack: () => {
          gsap.to(zoneBg, { opacity: 0, duration: 0.4, ease: 'power1.in', overwrite: 'auto' });
          gsap.to(cardEntry, { color: '#262626', duration: 0.3, ease: 'power1.inOut', overwrite: 'auto' });
          page.dataset.navSolid = 'false'; // back on the light page → nav goes bare again
        },
      });
    }, page);

    return () => ctx.revert();
  }, [pageRef]);
}
