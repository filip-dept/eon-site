'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Icon } from '@/ui/Icon';
import styles from './Faq.module.css';

const QUESTIONS = [
  'Wie funktioniert der Wechsel?',
  'Was bedeutet 100% Ökostrom konkret?',
  'Was passiert nach der Mindestlaufzeit?',
  'Kann ich den Tarif noch ändern, wenn ich umziehe?',
];

/** FAQ — independent leaf section. Owns its one-shot entrance + the
 *  "approaching FAQ" trigger that collapses the chat orb (via `onApproach`). */
export interface FaqProps {
  /** called when the section enters the viewport bottom (parent collapses the orb). */
  onApproach?: () => void;
}

export function Faq({ onApproach }: FaqProps) {
  const ref = useRef<HTMLElement>(null);
  const onApproachRef = useRef(onApproach);
  onApproachRef.current = onApproach;

  useEffect(() => {
    const faq = ref.current;
    if (!faq) return;

    const entranceST = ScrollTrigger.create({
      trigger: faq,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.fromTo(faq.querySelector(`.${styles.faqHead}`),
          { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(faq.querySelectorAll(`.${styles.faqItem}`),
          { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.1, delay: 0.15 });
      },
    });

    /* leaving HEMS toward FAQ → compact the chat back to the pill */
    const approachST = ScrollTrigger.create({
      trigger: faq,
      start: 'top bottom',
      onEnter: () => onApproachRef.current?.(),
    });

    return () => { approachST.kill(); entranceST.kill(); };
  }, []);

  return (
    <section ref={ref} className={styles.faq}>
      <div className={styles.faqHead}>
        <span className={styles.faqLabel}>Häufige Fragen</span>
        <h2 className={styles.faqTitle}>Was du noch wissen willst.</h2>
      </div>
      <div className={styles.faqList}>
        {QUESTIONS.map((q) => (
          <div key={q} className={styles.faqItem}>
            <span className={styles.faqQuestion}>{q}</span>
            <button className={styles.faqToggle} aria-label="Antwort anzeigen"><Icon name="chevron-down" /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Faq;
