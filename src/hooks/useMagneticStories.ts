import { useEffect, type RefObject } from 'react';
import { gsap } from '@/lib/gsap';
import styles from '@/components/Tariff/tariff.module.css';

/**
 * useMagneticStories — pointer-reactive "magnetic" pull for the tariff story cards.
 *
 * The cards' vertical position (`y` on `.storyCard`) is owned by the scroll
 * parallax (`useStoriesParallax`), so we MUST NOT touch the card's transform.
 * Instead we drive a separate inner wrapper (`.storyInner`): as the cursor nears a
 * card, the inner is pulled toward it (translate) and tilts in 3D (rotateX/rotateY)
 * with a slight lift in scale — a magnetic attraction that eases back to rest on
 * leave. Pull/tilt are scaled by proximity so a card only reacts within its reach.
 *
 * Listener lives on the stage (one pointermove for all cards); cleanup reverts the
 * gsap.context and detaches the listener. Honours prefers-reduced-motion (no-op).
 */
export function useMagneticStories(pageRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch

    const stage = page.querySelector<HTMLElement>(`.${styles.storiesStage}`);
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(`.${styles.storyCard}`));
    if (!cards.length) return;

    const PULL = 0.22; // fraction of cursor offset the card chases
    const MAX_TILT = 12; // deg
    const REACH = 1.15; // activation radius as a multiple of card width

    const ctx = gsap.context(() => {
      const tweens = cards.map((card) => {
        const inner = card.querySelector<HTMLElement>(`.${styles.storyInner}`);
        if (!inner) return null;
        const speed = 0.4;
        return {
          card,
          x: gsap.quickTo(inner, 'x', { duration: speed, ease: 'power3.out' }),
          y: gsap.quickTo(inner, 'y', { duration: speed, ease: 'power3.out' }),
          rx: gsap.quickTo(inner, 'rotationX', { duration: speed, ease: 'power3.out' }),
          ry: gsap.quickTo(inner, 'rotationY', { duration: speed, ease: 'power3.out' }),
          sc: gsap.quickTo(inner, 'scale', { duration: speed, ease: 'power3.out' }),
        };
      });

      const reset = (t: NonNullable<(typeof tweens)[number]>) => {
        t.x(0); t.y(0); t.rx(0); t.ry(0); t.sc(1);
      };

      const onMove = (e: PointerEvent) => {
        tweens.forEach((t) => {
          if (!t) return;
          const r = t.card.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const reach = r.width * REACH;
          const dist = Math.hypot(dx, dy);
          if (dist > reach) { reset(t); return; }

          const pull = 1 - dist / reach; // 1 at the centre, 0 at the edge of reach
          t.x(dx * PULL * pull);
          t.y(dy * PULL * pull);
          // tilt toward the cursor: top edge dips when the cursor is above, etc.
          t.ry(gsap.utils.clamp(-MAX_TILT, MAX_TILT, (dx / r.width) * MAX_TILT * 2));
          t.rx(gsap.utils.clamp(-MAX_TILT, MAX_TILT, (-dy / r.height) * MAX_TILT * 2));
          t.sc(1 + 0.05 * pull);
        });
      };

      const onLeave = () => tweens.forEach((t) => t && reset(t));

      window.addEventListener('pointermove', onMove, { passive: true });
      stage.addEventListener('pointerleave', onLeave);

      return () => {
        window.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerleave', onLeave);
      };
    }, page);

    return () => ctx.revert();
  }, [pageRef]);
}
