'use client';

import type { ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import styles from './journey.module.css';

/**
 * JourneyWizard — the shared modal chrome for both journeys: portal + backdrop +
 * the clip-path-revealed modal frame + the back/close corner buttons. The body
 * (orb/rail, step panels) is supplied as `children` by each wizard, and the
 * machine (open/close, transitions, refs) comes from `useStepWizard`.
 */
export interface JourneyWizardProps {
  mounted: boolean;
  open: boolean;
  overlayRef: RefObject<HTMLDivElement | null>;
  modalRef: RefObject<HTMLDivElement | null>;
  /** Modal modifier class (e.g. styles.modalConv / styles.modalWhite). */
  modifierClass?: string;
  ariaLabel: string;
  onBack: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function JourneyWizard({
  mounted,
  open,
  overlayRef,
  modalRef,
  modifierClass,
  ariaLabel,
  onBack,
  onClose,
  children,
}: JourneyWizardProps) {
  if (!mounted || !open) return null;

  return createPortal(
    <>
      <div ref={overlayRef} className={styles.overlay} onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        className={modifierClass ? `${styles.modal} ${modifierClass}` : styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <button className={styles.cornerBtn} data-pos="back" onClick={onBack} aria-label="Zurück">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className={styles.cornerBtn} data-pos="close" onClick={onClose} aria-label="Schließen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </button>

        {children}
      </div>
    </>,
    document.body,
  );
}

export default JourneyWizard;
