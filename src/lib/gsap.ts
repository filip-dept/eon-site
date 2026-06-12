'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create('eonReveal', 'M0,0 C0.33,0.02 0,1 1,1');
CustomEase.create('eonOut', 'M0,0 C0.22,1 0.36,1 1,1');
/* cubic-bezier(0.44, 0, 0.04, 1.02) — hero text + chat card appear */
CustomEase.create('eonAppear', 'M0,0 C0.44,0 0.04,1.02 1,1');

export { gsap, ScrollTrigger, CustomEase };
