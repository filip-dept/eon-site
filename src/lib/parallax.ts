'use client';

import { ScrollTrigger } from './gsap';
import type { MaskController } from './mask';

export function initScroll(heroEl: HTMLElement, mask: MaskController) {
  const st = ScrollTrigger.create({
    trigger: heroEl,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => mask.setScroll(self.progress),
    onRefresh: () => mask.layout(),
  });
  return st;
}
