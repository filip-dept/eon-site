'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/gsap';
import styles from './journey.module.css';

/* ─── Answers ────────────────────────────────────────────────────────────── */
type Answers = {
  wechsel: 'eon' | 'self';
  anbieter: string;
  kundennummer: string;
  zaehler: string;
  strasse: string;
  nr: string;
  plz: string;
  stadt: string;
  datum: 'asap' | 'date';
  anrede: 'frau' | 'herr' | 'divers';
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  email: string;
  telefon: string;
};

const INITIAL_ANSWERS: Answers = {
  wechsel: 'eon',
  anbieter: '',
  kundennummer: '',
  zaehler: '',
  strasse: '',
  nr: '',
  plz: '81245',
  stadt: '',
  datum: 'asap',
  anrede: 'frau',
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  email: '',
  telefon: '',
};

const TOTAL_STEPS = 7;

/* per-step gate for Weiter / Enter */
function stepValid(step: number, a: Answers): boolean {
  switch (step) {
    case 1:  return true;
    case 2:  return !!a.wechsel;
    case 3:  return a.anbieter.trim().length > 1;
    case 4:  return a.kundennummer.trim().length > 2;
    case 5:  return a.zaehler.trim().length > 3 && a.strasse.trim() !== '' &&
                    a.nr.trim() !== '' && /^\d{5}$/.test(a.plz) && a.stadt.trim() !== '';
    case 6:  return !!a.datum;
    case 7:  return a.vorname.trim() !== '' && a.nachname.trim() !== '' &&
                    a.geburtsdatum !== '' && /\S+@\S+\.\S+/.test(a.email);
    default: return false;
  }
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TickSmall = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6.2l2.6 2.6L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CheckRed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const MicIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z"/><circle cx="12" cy="11" r="2"/>
  </svg>
);
const PersonsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PlugIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v6M8 6h8M7 12h10l-1 7H8l-1-7z"/><path d="M12 19v3"/>
  </svg>
);

/* Enter hint — per the Figma frames */
const EnterHint = () => (
  <span className={styles.enterHint}>
    drücke auf <em>Enter</em>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
    </svg>
  </span>
);

/* ─── Animated conversational sphere (transparent container, just the orb) ─── */
const ConvSphere = () => (
  <div className={styles.convSphere} aria-hidden="true">
    <span className={styles.convOrb} />
  </div>
);

/* ─── Blurred-typewriter headline — splits into words for a staggered reveal ── */
function Typewriter({ children }: { children: string }) {
  const words = children.split(' ');
  return (
    <h2 className={styles.stepHeadline}>
      {words.map((w, i) => (
        <span key={i} className={styles.twWord}>
          {w}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h2>
  );
}

/* ─── Shared field ───────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.fieldCol}>
      <p className={styles.fieldLabel}>{label}</p>
      {children}
    </div>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────────────── */
export default function JourneyModal() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState(1);
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  const stepRefs   = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_STEPS).fill(null));
  const animating  = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  /* ── Close ── */
  const closeModal = useCallback(() => {
    const modal   = modalRef.current;
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

  /* ── Open ── */
  const openModal = useCallback(() => {
    setStep(1);
    setAnswers(INITIAL_ANSWERS);
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    const handler = () => openModal();
    document.addEventListener('eon:checkout-start', handler);
    return () => document.removeEventListener('eon:checkout-start', handler);
  }, [openModal]);

  /* ── Enter animation ── */
  useEffect(() => {
    if (!open) return;
    const modal   = modalRef.current;
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
      gsap.set(firstStep, { y: 24, opacity: 0 });
      tl.to(firstStep, { y: 0, opacity: 1, duration: 0.42, ease: 'eonOut' }, 0.38);
    }
    /* conversational reveal of the first question */
    animateHeadline(0);
  }, [open]);

  /* ── Blurred-typewriter reveal for a step's question words ── */
  const animateHeadline = useCallback((idx: number) => {
    const panel = stepRefs.current[idx];
    if (!panel) return;
    const words = panel.querySelectorAll<HTMLElement>(`.${styles.twWord}`);
    if (!words.length) return;
    gsap.fromTo(
      words,
      { opacity: 0, filter: 'blur(12px)', y: 10 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.05, delay: 0.12 }
    );
  }, []);

  /* ── Step transition ── */
  const transitionTo = useCallback((nextStep: number, dir: 'fwd' | 'bck') => {
    if (animating.current) return;
    const outEl = stepRefs.current[step - 1];
    const inEl  = stepRefs.current[nextStep - 1];
    if (!outEl || !inEl) return;

    animating.current = true;
    const dx = dir === 'fwd' ? -44 : 44;

    gsap.to(outEl, {
      x: dx,
      opacity: 0,
      duration: 0.32,
      ease: 'eonReveal',
      onComplete: () => {
        gsap.set(outEl, { display: 'none', x: 0 });
        setStep(nextStep);
        requestAnimationFrame(() => {
          gsap.set(inEl, { display: 'flex', x: -dx, opacity: 0 });
          gsap.to(inEl, {
            x: 0,
            opacity: 1,
            duration: 0.42,
            ease: 'eonOut',
            onComplete: () => { animating.current = false; },
          });
          animateHeadline(nextStep - 1);
        });
      },
    });
  }, [step]);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) transitionTo(step + 1, 'fwd');
  }, [step, transitionTo]);

  const goBack = useCallback(() => {
    if (step > 1) transitionTo(step - 1, 'bck');
    else closeModal();
  }, [step, transitionTo, closeModal]);

  /* ── Submit — checkout journey ends here for now (just close) ── */
  const submit = useCallback(() => {
    closeModal();
  }, [closeModal]);

  /* Enter advances (typeform-style); on the last step it submits */
  const advance = useCallback(() => {
    if (animating.current || !stepValid(step, answers)) return;
    if (step < TOTAL_STEPS) goNext();
    else submit();
  }, [step, answers, goNext, submit]);

  /* ── Keyboard ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter') { e.preventDefault(); advance(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeModal, advance]);

  /* ── Sync step panel visibility ── */
  useEffect(() => {
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      if (i === step - 1) {
        if (el.style.display === 'none') return;
        gsap.set(el, { display: 'flex', opacity: 1, x: 0 });
      } else {
        if (!animating.current) gsap.set(el, { display: 'none' });
      }
    });
  }, [step]);

  if (!mounted || !open) return null;

  const set = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));
  /* A/B boxes: picking is enough to move on */
  const pickAndGo = (patch: Partial<Answers>) => {
    set(patch);
    setTimeout(goNext, 240);
  };

  const panels: React.ReactNode[] = [
    /* ── 1 · Overview (Figma) ── */
    <>
      <p className={styles.stepLabel}>Review</p>
      <Typewriter>Bereit für dein neues Energie? Wir schon.</Typewriter>

      <div className={styles.ctxRow}>
        <span className={styles.ctxChip}><LocationIcon />81245</span>
        <span className={styles.ctxSep} />
        <span className={styles.ctxChip}><PersonsIcon />2 Pers.</span>
        <span className={styles.ctxSep} />
        <span className={styles.ctxChip}><PlugIcon />3.200 kWh</span>
        <a className={styles.ctxEdit} href="#" onClick={(e) => e.preventDefault()}>Ändern</a>
        <span className={styles.ctxSep} />
        <span className={styles.miniPrefLabel}>Ich lege Wert auf</span>
        <span className={styles.miniPref}>
          <span className={styles.miniPrefSides}><span>Flexibilität</span><span>Sicherheit</span></span>
          <span className={styles.miniTrack}><span className={styles.miniFill} /><span className={styles.miniDot} /></span>
        </span>
      </div>

      <p className={styles.selLabel}>Dein auswahl</p>
      <div className={styles.tariffPreview}>
        <img src="/tariff-hero.png" alt="" className={styles.tpPhoto} />
        <div className={styles.tpFooter}>
          <div className={styles.tpNameRow}>
            <span className={styles.tpName}>E.ON SolarStrom Extra 12</span>
            <span className={styles.tpBadge}>Unsere Empfehlung für dich</span>
          </div>
          <span className={styles.tpSub}>12 Mo | Solar DE</span>
          <div className={styles.tpPriceRow}>
            <span className={styles.tpPrice}><strong>55,80</strong> € pro Monat</span>
            <span className={styles.tpBonus}>75 € Neukunden-Bonus <em>bis 20.04.2026</em></span>
          </div>
        </div>
      </div>

      <div className={styles.startRow}>
        <button className={styles.ctaBtn} onClick={goNext}>Start <ArrowRight /></button>
        <EnterHint />
        <button className={styles.voiceBox} type="button">
          <span className={styles.voiceOrb} aria-hidden="true" />
          Start mit deine Stimme
          <MicIcon />
        </button>
      </div>
    </>,

    /* ── 2 · Wechsel (Figma — A/B, click advances) ── */
    <>
      <p className={styles.stepLabel}>Wechsel</p>
      <Typewriter>Kümmern wir uns um deinen Wechsel?</Typewriter>
      <p className={styles.stepSub}>Wir erledigen alle Formalitäten und kündigen deinen alten Vertrag.</p>

      <div className={styles.abList}>
        <button className={styles.abBox} data-selected={answers.wechsel === 'eon'} onClick={() => pickAndGo({ wechsel: 'eon' })}>
          <span className={styles.abCheckbox}><TickSmall /></span>
          <span>
            <span className={styles.abTitle}>Ja bitte übernehmen</span>
            <span className={styles.abSub}>Ihr alter Vertrag wird von uns gekündigt</span>
          </span>
        </button>
        <button className={styles.abBox} data-selected={answers.wechsel === 'self'} onClick={() => pickAndGo({ wechsel: 'self' })}>
          <span className={styles.abCheckbox}><TickSmall /></span>
          <span>
            <span className={styles.abTitle}>Ich hab schon gekündigt</span>
            <span className={styles.abSub}>Ich kümmere mich selber drum</span>
          </span>
        </button>
      </div>

      <div className={styles.startRow}>
        <button className={styles.ctaBtn} onClick={advance}>Start <ArrowRight /></button>
        <EnterHint />
      </div>
    </>,

    /* ── 3 · Anbieter ── */
    <>
      <p className={styles.stepLabel}>Anbieter</p>
      <Typewriter>Bei welchem Anbieter bist du aktuell?</Typewriter>
      <p className={styles.stepSub}>Damit wir wissen, an wen die Kündigung geht.</p>

      <div className={styles.formGrid}>
        <Field label="Aktueller Stromanbieter">
          <input
            className={styles.boxInput}
            type="text"
            placeholder="z.B. Stadtwerke München, Yello, ..."
            value={answers.anbieter}
            onChange={(e) => set({ anbieter: e.target.value })}
          />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.backLink} onClick={goBack}>Zurück</button>
        <button className={styles.ctaBtn} onClick={advance} disabled={!stepValid(3, answers)}>
          Weiter <ArrowRight />
        </button>
      </div>
    </>,

    /* ── 4 · Kundennummer ── */
    <>
      <p className={styles.stepLabel}>Kundennr.</p>
      <Typewriter>Wie lautet deine Kundennummer?</Typewriter>
      <p className={styles.stepSub}>Steht auf deiner letzten Jahresabrechnung oben rechts.</p>

      <div className={styles.formGrid}>
        <Field label="Kundennummer beim alten Anbieter">
          <input
            className={styles.boxInput}
            type="text"
            placeholder="z.B. K-12345678"
            value={answers.kundennummer}
            onChange={(e) => set({ kundennummer: e.target.value })}
          />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.backLink} onClick={goBack}>Zurück</button>
        <button className={styles.ctaBtn} onClick={advance} disabled={!stepValid(4, answers)}>
          Weiter <ArrowRight />
        </button>
      </div>
    </>,

    /* ── 5 · Zähler und Adresse ── */
    <>
      <p className={styles.stepLabel}>Zähler</p>
      <Typewriter>Zähler und Adresse</Typewriter>
      <p className={styles.stepSub}>Damit wir wissen, wo der Strom hin soll.</p>

      <div className={styles.formGrid}>
        <Field label="Zählernummer">
          <input
            className={styles.boxInput}
            type="text"
            placeholder="z.B. 1ESY1234567890"
            value={answers.zaehler}
            onChange={(e) => set({ zaehler: e.target.value })}
          />
        </Field>
        <div className={styles.rowStreet}>
          <Field label="Strasse">
            <input
              className={styles.boxInput}
              type="text"
              placeholder="Musterstraße"
              value={answers.strasse}
              onChange={(e) => set({ strasse: e.target.value })}
            />
          </Field>
          <Field label="Nr.">
            <input
              className={styles.boxInput}
              type="text"
              placeholder="12a"
              value={answers.nr}
              onChange={(e) => set({ nr: e.target.value })}
            />
          </Field>
        </div>
        <div className={styles.rowCity}>
          <Field label="PLZ">
            <input
              className={styles.boxInput}
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={answers.plz}
              onChange={(e) => set({ plz: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            />
          </Field>
          <Field label="Stadt">
            <input
              className={styles.boxInput}
              type="text"
              placeholder="Hamburg"
              value={answers.stadt}
              onChange={(e) => set({ stadt: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.backLink} onClick={goBack}>Zurück</button>
        <button className={styles.ctaBtn} onClick={advance} disabled={!stepValid(5, answers)}>
          Weiter <ArrowRight />
        </button>
      </div>
    </>,

    /* ── 6 · Datum (A/B — click advances) ── */
    <>
      <p className={styles.stepLabel}>Datum</p>
      <Typewriter>Wann soll der neue Vertrag starten?</Typewriter>
      <p className={styles.stepSub}>Schnellstmöglich oder zu einem konkreten Datum.</p>

      <div className={styles.abRow}>
        <button className={`${styles.abBox} ${styles.abCorner}`} data-selected={answers.datum === 'asap'} onClick={() => pickAndGo({ datum: 'asap' })}>
          <span>
            <span className={styles.abTitle}>Schnellstmöglich</span>
            <span className={styles.abSub}>Sobald die Kündigung greift</span>
          </span>
          <span className={styles.abTick}><CheckRed /></span>
        </button>
        <button className={`${styles.abBox} ${styles.abCorner}`} data-selected={answers.datum === 'date'} onClick={() => pickAndGo({ datum: 'date' })}>
          <span>
            <span className={styles.abTitle}>Zu einem Datum</span>
            <span className={styles.abSub}>Du gibst es uns vor</span>
          </span>
          <span className={styles.abTick}><CheckRed /></span>
        </button>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.backLink} onClick={goBack}>Zurück</button>
      </div>
    </>,

    /* ── 7 · Daten ── */
    <>
      <p className={styles.stepLabel}>Daten</p>
      <Typewriter>Deine Daten — sicher und schnell.</Typewriter>
      <p className={styles.stepSub}>Wir brauchen nur die nötigsten Angaben für deinen Vertrag.</p>

      <div className={styles.formGrid}>
        <div className={styles.segmented}>
          {([['frau', 'Frau'], ['herr', 'Herr'], ['divers', 'Divers']] as const).map(([id, label]) => (
            <button
              key={id}
              className={styles.segBtn}
              data-active={answers.anrede === id}
              onClick={() => set({ anrede: id })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.rowSplit}>
          <Field label="Vorname">
            <input className={styles.boxInput} type="text" placeholder="Anna"
              value={answers.vorname} onChange={(e) => set({ vorname: e.target.value })} />
          </Field>
          <Field label="Nachname">
            <input className={styles.boxInput} type="text" placeholder="Schmidt"
              value={answers.nachname} onChange={(e) => set({ nachname: e.target.value })} />
          </Field>
        </div>
        <Field label="Geburtsdatum">
          <input className={styles.boxInput} type="date"
            value={answers.geburtsdatum} onChange={(e) => set({ geburtsdatum: e.target.value })} />
        </Field>
        <Field label="E-Mail">
          <input className={styles.boxInput} type="email" placeholder="anna.schmidt@example.com"
            value={answers.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Telefon (optional)">
          <input className={styles.boxInput} type="tel" placeholder="+49 ..."
            value={answers.telefon} onChange={(e) => set({ telefon: e.target.value })} />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.backLink} onClick={goBack}>Zurück</button>
        <button className={styles.ctaBtn} onClick={advance} disabled={!stepValid(7, answers)}>
          Vertrag abschließen <ArrowRight />
        </button>
      </div>
    </>,
  ];

  return createPortal(
    <>
      {/* Backdrop */}
      <div ref={overlayRef} className={styles.overlay} onClick={closeModal} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Tarif-Assistent"
      >
        {/* ── Top bar — E.ON Assistant label · skip · close ── */}
        <span className={styles.assistantLabel}>E.ON Assistant</span>
        <button className={styles.skipBtn} onClick={submit} aria-label="Fragen überspringen">
          Überspringen
        </button>
        <button className={styles.cornerBtn} data-pos="close" onClick={closeModal} aria-label="Schließen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Body: centred conversational column (no side navigation) ── */}
        <div className={styles.modalBody}>
          <div className={styles.contentCol}>
            <div className={styles.content}>
              {panels.map((panel, i) => (
                <div
                  key={i}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  className={styles.stepPanel}
                  style={{ display: step === i + 1 ? 'flex' : 'none' }}
                >
                  <ConvSphere />
                  {panel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
