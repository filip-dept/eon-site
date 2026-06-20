'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { gsap } from '@/lib/gsap';
import { onEon, type EonEventName } from '@/lib/eventBus';

/** Client-mounted flag without setState-in-effect (false on server, true after hydration). */
const emptySubscribe = () => () => {};

/** Reveal a step's content (per-wizard: onboarding = typewriter+`[data-appear]`,
 *  checkout = panel.children stagger). `isEnter` is true for the opening reveal
 *  (which some wizards delay longer until the shell has opened). */
export type RevealStep = (panel: HTMLElement, stepIndex: number, isEnter: boolean) => void;

export interface StepWizardConfig<A> {
  /** Typed app event that opens the wizard (e.g. 'eon:journey-start'). */
  event: EonEventName;
  totalSteps: number;
  /** Answers reset to this each time the wizard opens. */
  initialAnswers: A;
  revealStep: RevealStep;
  /** Whether Enter may advance from `step` (last step → onComplete instead). */
  validateStep: (step: number, answers: A) => boolean;
  /** Called when advancing past the last step. `helpers.close` runs the close
   *  animation (checkout closes; onboarding navigates away instead). */
  onComplete: (answers: A, helpers: { close: () => void }) => void;
  /** Optional first-step entrance added to the open timeline (onboarding slides it up). */
  enterFirstStep?: (firstPanel: HTMLElement, tl: gsap.core.Timeline) => void;
}

/**
 * The shared journey step-machine — open/close (clip-path reveal), vertical
 * step transitions, keyboard (Esc/Enter), scroll-lock (incl. the load-bearing
 * unmount safety-net, CLAUDE.md gotcha #2), and step-panel visibility sync.
 * GSAP is kept exactly as the original modals; only the per-wizard reveal /
 * validation / completion are injected. Used by OnboardingModal & JourneyModal.
 */
export function useStepWizard<A>(config: StepWizardConfig<A>) {
  const { event, totalSteps } = config;

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<A>(config.initialAnswers);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>(Array(totalSteps).fill(null));
  const animating = useRef(false);

  /* latest config without churning effect deps (updated after each render, before
     the [open]-gated effects below re-run since this effect is declared first) */
  const cfg = useRef(config);
  useEffect(() => { cfg.current = config; });

  /* ── Close ── */
  const close = useCallback(() => {
    const modal = modalRef.current;
    const overlay = overlayRef.current;
    if (!modal || !overlay || animating.current) return;
    animating.current = true;
    gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'none' });
    gsap.to(modal, {
      clipPath: 'inset(100% 0px 0px 0px)',
      duration: 0.45,
      ease: 'eonOut',
      onComplete: () => {
        animating.current = false;
        setOpen(false);
        document.body.style.overflow = '';
      },
    });
  }, []);

  /* ── Open (on the configured event) ── */
  const openWizard = useCallback(() => {
    setStep(1);
    setAnswers(cfg.current.initialAnswers);
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => onEon(event, () => openWizard()), [event, openWizard]);

  /* Safety net: always release the body scroll-lock on unmount. Onboarding's
     completion navigates away via router.push WITHOUT running close(), so this is
     the only thing releasing `body { overflow: hidden }` — drop it and the next
     page's `position: sticky` (HEMS stage) silently breaks. (CLAUDE.md gotcha #2) */
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  /* ── Enter animation ── */
  useEffect(() => {
    if (!open) return;
    const modal = modalRef.current;
    const overlay = overlayRef.current;
    if (!modal || !overlay) return;

    animating.current = true;
    gsap.set(modal, { clipPath: 'inset(100% 0px 0px 0px)', opacity: 1 });
    gsap.set(overlay, { opacity: 0 });

    const tl = gsap.timeline({ onComplete: () => { animating.current = false; } });
    tl.to(overlay, { opacity: 1, duration: 0.28, ease: 'none' }, 0)
      .to(modal, { clipPath: 'inset(0px 0px 0px 0px)', duration: 0.7, ease: 'eonOut' }, 0);

    const firstStep = stepRefs.current[0];
    if (firstStep) {
      cfg.current.enterFirstStep?.(firstStep, tl);
      cfg.current.revealStep(firstStep, 0, true);
    }
  }, [open]);

  /* ── Step transition (vertical scroll motion) ── */
  const transitionTo = useCallback((nextStep: number, dir: 'fwd' | 'bck') => {
    if (animating.current) return;
    const outEl = stepRefs.current[step - 1];
    const inEl = stepRefs.current[nextStep - 1];
    if (!outEl || !inEl) return;

    animating.current = true;
    const dy = dir === 'fwd' ? -140 : 140;

    gsap.to(outEl, {
      y: dy,
      opacity: 0,
      duration: 0.32,
      ease: 'eonReveal',
      onComplete: () => {
        gsap.set(outEl, { display: 'none', y: 0 });
        setStep(nextStep);
        requestAnimationFrame(() => {
          gsap.set(inEl, { display: 'flex', y: -dy, opacity: 0 });
          gsap.to(inEl, {
            y: 0,
            opacity: 1,
            duration: 0.42,
            ease: 'eonOut',
            onComplete: () => { animating.current = false; },
          });
          cfg.current.revealStep(inEl, nextStep - 1, false);
        });
      },
    });
  }, [step]);

  const goNext = useCallback(() => {
    if (step < totalSteps) transitionTo(step + 1, 'fwd');
  }, [step, totalSteps, transitionTo]);

  const goBack = useCallback(() => {
    if (step > 1) transitionTo(step - 1, 'bck');
    else close();
  }, [step, transitionTo, close]);

  /* rail back-nav: only allowed to earlier steps */
  const goToStep = useCallback((s: number) => {
    if (s < step) transitionTo(s, 'bck');
  }, [step, transitionTo]);

  /* Enter advances once the step validates; the last step completes */
  const advance = useCallback(() => {
    if (animating.current) return;
    if (step < totalSteps) {
      if (cfg.current.validateStep(step, answers)) goNext();
    } else {
      cfg.current.onComplete(answers, { close });
    }
  }, [step, totalSteps, answers, goNext, close]);

  /* ── Keyboard ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') { e.preventDefault(); advance(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close, advance]);

  /* ── Sync step-panel visibility after state-driven step changes ── */
  useEffect(() => {
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === step - 1) {
        if (el.style.display === 'none') return; /* let GSAP handle it */
        gsap.set(el, { display: 'flex', opacity: 1, x: 0 });
      } else if (!animating.current) {
        gsap.set(el, { display: 'none' });
      }
    });
  }, [step]);

  return {
    mounted, open, step, answers, setAnswers,
    overlayRef, modalRef, stepRefs, animating,
    goNext, goBack, goToStep, advance, close,
  };
}
