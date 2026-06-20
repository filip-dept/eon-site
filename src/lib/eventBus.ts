/**
 * eventBus — typed wrapper over the DOM CustomEvents that decouple the trigger
 * components from the journey modals (the app's deliberate event-driven seam).
 * The event names + payloads live here as the single, documented contract.
 *
 *  • `eon:journey-start` — Hero chat chip → opens the OnboardingJourney.
 *  • `eon:checkout-start` — tariff "Tarif auswählen" / cart → opens the CheckoutJourney.
 *  • `eon:intro-done` — the branded IntroLoader is lifting away → the Hero plays
 *    its from-the-top entrance. Fires immediately when the loader won't show
 *    (revisits / reduced motion) so the hero never waits on a cue that won't come.
 */
export interface EonEventDetail {
  'eon:journey-start': { type: string };
  'eon:checkout-start': undefined;
  'eon:intro-done': undefined;
}

export type EonEventName = keyof EonEventDetail;

/** Dispatch a typed app event on `document`. */
export function emitEon<K extends EonEventName>(name: K, detail?: EonEventDetail[K]): void {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Subscribe to a typed app event; returns an unsubscribe fn (use in an effect). */
export function onEon<K extends EonEventName>(name: K, handler: (detail: EonEventDetail[K]) => void): () => void {
  const fn = (e: Event) => handler((e as CustomEvent<EonEventDetail[K]>).detail);
  document.addEventListener(name, fn);
  return () => document.removeEventListener(name, fn);
}
