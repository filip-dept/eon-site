'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { suggestPlz } from '@/lib/germanPlz';
import styles from './journey.module.css';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Answers = {
  priority?: string;
  plz?: string;
  persons?: number;
  kwh?: number;
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
const PRIORITIES = [
  {
    id: 'preis',
    title: 'Gute Preise & Stabilität',
    sub: 'Klarer Preis, keine Sprünge.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
        <path d="M12 6v2m0 8v2M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-2.5 2.5-.7.3-1.5.8-1.5 2h4"/>
      </svg>
    ),
  },
  {
    id: 'oeko',
    title: '100% Ökostrom & Nachhaltigkeit',
    sub: 'Aus erneuerbaren Quellen, beweisbar.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 17 3 21 3c0 5-4 9-9 9zM12 12C12 7 7 3 3 3c0 5 4 9 9 9z"/>
      </svg>
    ),
  },
  {
    id: 'einfach',
    title: 'Einfach & unkompliziert',
    sub: 'Wenig Klicks, klare Sprache.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    id: 'schnell',
    title: 'Schnell wechseln & Zeit sparen',
    sub: 'Wir kümmern uns um den Wechsel.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4"/>
      </svg>
    ),
  },
];

const KWH_MIN = 1000;
const KWH_MAX = 10000;

const KWH_PRESETS = [
  { id: 'small', title: 'Kleine Wohnung', sub: '1 – 2 Personen · ~1.500 kWh', kwh: 1500 },
  { id: 'avg',   title: 'Durchschnitt',   sub: '2 – 3 Personen · 3.200 kWh',  kwh: 3200 },
  { id: 'large', title: 'Großes Haus',    sub: '4+ Personen · ~5.000 kWh',    kwh: 5000 },
];

function formatKwh(n: number) {
  return n.toLocaleString('de-DE');
}

/* ─── Arrow icon ─────────────────────────────────────────────────────────── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Left categories (one per step, red indicator on the active one) ──────── */
const CATEGORIES = [
  {
    label: 'Prioritäten',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h9M4 12h6M4 18h12"/>
        <circle cx="17" cy="6" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="20" cy="18" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Dein Zuhause',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9.5 20v-6h5v6"/>
      </svg>
    ),
  },
  {
    label: 'Verbrauch',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8z"/>
      </svg>
    ),
  },
];

/* ─── Step 1 ─────────────────────────────────────────────────────────────── */
function Step1({ answers, setAnswers, goNext }: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  goNext: () => void;
}) {
  return (
    <>
      <p className={styles.stepLabel}>Erstmal kalibrieren</p>
      <h2 className={styles.stepHeadline}>
        Was ist dir bei deinem<br />
        Strom <em>am wichtigsten?</em>
      </h2>
      <div className={styles.optionGrid}>
        {PRIORITIES.map((p) => (
          <button
            key={p.id}
            className={styles.optionCard}
            data-selected={answers.priority === p.id ? 'true' : 'false'}
            onClick={() => {
              setAnswers({ ...answers, priority: p.id });
              setTimeout(goNext, 260);
            }}
          >
            <span className={styles.optionIcon}>{p.icon}</span>
            <span className={styles.optionText}>
              <span className={styles.optionTitle}>{p.title}</span>
              <span className={styles.optionSub}>{p.sub}</span>
            </span>
          </button>
        ))}
      </div>
      <p className={styles.footNote}>
        Eine Auswahl reicht — wir fragen dich noch zwei Dinge, dann steht dein Tarif.
      </p>
    </>
  );
}

/* ─── Step 2 ─────────────────────────────────────────────────────────────── */
function Step2({ answers, setAnswers, goNext }: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  goNext: () => void;
}) {
  const persons = answers.persons ?? 2;
  const plz = answers.plz ?? '';
  const plzValid = /^\d{5}$/.test(plz);

  const [suggestions, setSuggestions] = useState<[string, string][]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [city, setCity] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  function pickSuggestion(p: string, c: string) {
    const cityShort = c.split(',')[1]?.trim() ?? c;
    setAnswers({ ...answers, plz: p });
    setCity(cityShort);
    setSuggestions([]);
    setActiveIdx(-1);
  }

  function handleChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 5);
    setAnswers({ ...answers, plz: digits });
    setCity('');
    setSuggestions(digits.length >= 2 ? suggestPlz(digits) : []);
    setActiveIdx(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      pickSuggestion(...suggestions[activeIdx]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIdx(-1);
    }
  }

  /* Scroll active item into view */
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  return (
    <>
      <p className={styles.stepLabel}>Wo zuhause, mit wem</p>
      <h2 className={styles.stepHeadline}>
        Erzähl mir kurz<br />
        <em>von deinem Zuhause.</em>
      </h2>

      <div className={styles.s2row}>
        {/* PLZ */}
        <div className={styles.s2col}>
          <p className={styles.fieldLabel}>Postleitzahl</p>
          <div className={styles.plzField}>
            <div className={styles.plzRow}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9d9c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                <path d="M12 21c-4-4-7-7.3-7-10a7 7 0 1 1 14 0c0 2.7-3 6-7 10z"/>
                <circle cx="12" cy="11" r="2"/>
              </svg>
              <input
                ref={inputRef}
                className={styles.plzInput}
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="20095"
                value={plz}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                aria-label="Postleitzahl"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
              />
              {city && <span className={styles.plzCity}>{city}</span>}
              {plzValid && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22a053" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>

            {suggestions.length > 0 && (
              <ul ref={listRef} className={styles.plzDropdown} role="listbox">
                {suggestions.map(([p, c], i) => (
                  <li
                    key={p}
                    className={styles.plzOption}
                    data-active={i === activeIdx ? 'true' : 'false'}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseDown={(e) => { e.preventDefault(); pickSuggestion(p, c); }}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <span className={styles.plzOptionCode}>{p}</span>
                    <span className={styles.plzOptionCity}>{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className={styles.plzHint}>Brauchen wir nur, um den passenden Tarif zu finden — wir speichern nichts.</p>
        </div>

        {/* Persons */}
        <div className={styles.s2col}>
          <p className={styles.fieldLabel}>Personen im Haushalt</p>
          <div className={styles.stepper}>
            <button
              className={styles.stepBtn}
              onClick={() => setAnswers({ ...answers, persons: Math.max(1, persons - 1) })}
              disabled={persons <= 1}
              aria-label="Weniger Personen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 8h10"/></svg>
            </button>
            <span className={styles.stepperVal}>{persons}</span>
            <button
              className={styles.stepBtn}
              onClick={() => setAnswers({ ...answers, persons: Math.min(10, persons + 1) })}
              disabled={persons >= 10}
              aria-label="Mehr Personen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
            </button>
            <span className={styles.stepperUnit}>Personen</span>
          </div>
          <div className={styles.pills}>
            {[1, 2, 3, '4+'].map((v) => {
              const num = v === '4+' ? 4 : Number(v);
              const active = persons === num || (v === '4+' && persons >= 4);
              return (
                <button
                  key={v}
                  className={styles.pill}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => setAnswers({ ...answers, persons: num })}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        className={styles.ctaBtn}
        onClick={goNext}
        disabled={!plzValid}
        style={{ opacity: plzValid ? 1 : 0.45, cursor: plzValid ? 'pointer' : 'default', marginTop: 24 }}
      >
        Weiter <ArrowRight />
      </button>
    </>
  );
}

/* ─── Step 3 ─────────────────────────────────────────────────────────────── */
function Step3({ answers, setAnswers, onSubmit }: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  onSubmit: () => void;
}) {
  const kwh = answers.kwh ?? 3200;
  const persons = answers.persons ?? 2;

  const fillPct = ((kwh - KWH_MIN) / (KWH_MAX - KWH_MIN)) * 100;

  const activePreset = KWH_PRESETS.find((p) => p.kwh === kwh)?.id ?? null;

  return (
    <>
      <p className={styles.stepLabel}>Und wie viel Strom</p>
      <h2 className={styles.stepHeadline}>
        Wie viel davon<br />
        <em>brauchst du im Jahr?</em>
      </h2>

      <div className={styles.kwhBlock}>
        <span className={styles.kwhNum}>{formatKwh(kwh)}</span>
        <span className={styles.kwhUnit}>kWh</span>
      </div>
      <p className={styles.kwhHint}>ungefähr · bei {persons} {persons === 1 ? 'Person' : 'Personen'} im Haushalt</p>

      <div className={styles.sliderWrap}>
        <input
          type="range"
          className={styles.slider}
          min={KWH_MIN}
          max={KWH_MAX}
          step={100}
          value={kwh}
          style={{ '--fill': `${fillPct}%` } as React.CSSProperties}
          onChange={(e) => setAnswers({ ...answers, kwh: Number(e.target.value) })}
          aria-label="Jahresverbrauch in kWh"
        />
        <div className={styles.sliderLabels}>
          <span>1.000</span>
          <span>3.200</span>
          <span>5.000</span>
          <span>10.000+</span>
        </div>
      </div>

      <div className={styles.presets}>
        {KWH_PRESETS.map((p) => (
          <button
            key={p.id}
            className={styles.presetCard}
            data-selected={activePreset === p.id ? 'true' : 'false'}
            onClick={() => setAnswers({ ...answers, kwh: p.kwh })}
          >
            <p className={styles.presetTitle}>{p.title}</p>
            <p className={styles.presetSub}>{p.sub}</p>
          </button>
        ))}
      </div>

      <button className={styles.ctaBtn} onClick={onSubmit}>
        Meinen Tarif sehen <ArrowRight />
      </button>
    </>
  );
}

/* ─── Main modal ─────────────────────────────────────────────────────────── */
export default function JourneyModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState(1);
  const [answers, setAnswers] = useState<Answers>({ persons: 2, kwh: 3200 });

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef   = useRef<HTMLDivElement>(null);
  /* refs for all 3 step panels */
  const stepRefs   = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  /* guard against re-animating mid-transition */
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
      clipPath: 'inset(100% 0px 0px 0px round 20px 20px 0px 0px)',
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
    setAnswers({ persons: 2, kwh: 3200 });
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  /* ── Listen for chip event ── */
  useEffect(() => {
    const handler = () => openModal();
    document.addEventListener('eon:journey-start', handler);
    return () => document.removeEventListener('eon:journey-start', handler);
  }, [openModal]);

  /* ── Enter animation (fires when open transitions true → rendered) ── */
  useEffect(() => {
    if (!open) return;
    const modal   = modalRef.current;
    const overlay = overlayRef.current;
    if (!modal || !overlay) return;

    animating.current = true;

    /* Reveal from the bottom edge upward (same eonReveal wipe as hero) */
    gsap.set(modal, { clipPath: 'inset(100% 0px 0px 0px round 20px 20px 0px 0px)', opacity: 1 });
    gsap.set(overlay, { opacity: 0 });

    const tl = gsap.timeline({ onComplete: () => { animating.current = false; } });

    tl.to(overlay, { opacity: 1, duration: 0.28, ease: 'none' }, 0)
      .to(modal, { clipPath: 'inset(0px 0px 0px 0px round 20px 20px 0px 0px)', duration: 0.7, ease: 'eonOut' }, 0);

    /* Content fades up after the shell has mostly revealed */
    const firstStep = stepRefs.current[0];
    if (firstStep) {
      gsap.set(firstStep, { y: 24, opacity: 0 });
      tl.to(firstStep, { y: 0, opacity: 1, duration: 0.42, ease: 'eonOut' }, 0.38);
    }
  }, [open]);

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
        /* Let React render the new step, then animate it in */
        requestAnimationFrame(() => {
          gsap.set(inEl, { display: 'flex', x: -dx, opacity: 0 });
          gsap.to(inEl, {
            x: 0,
            opacity: 1,
            duration: 0.42,
            ease: 'eonOut',
            onComplete: () => { animating.current = false; },
          });
        });
      },
    });
  }, [step]);

  const goNext = useCallback(() => {
    if (step < 3) transitionTo(step + 1, 'fwd');
  }, [step, transitionTo]);

  const goBack = useCallback(() => {
    if (step > 1) transitionTo(step - 1, 'bck');
    else closeModal();
  }, [step, transitionTo, closeModal]);

  /* Jump to an already-visited category (sidebar) */
  const goToStep = useCallback((s: number) => {
    if (s === step || s > step || animating.current) return;
    transitionTo(s, 'bck');
  }, [step, transitionTo]);

  const resetJourney = useCallback(() => {
    const outEl = stepRefs.current[step - 1];
    const inEl  = stepRefs.current[0];
    if (!outEl || !inEl || step === 1) return;

    animating.current = true;
    gsap.to(outEl, {
      x: 44, opacity: 0, duration: 0.32, ease: 'eonReveal',
      onComplete: () => {
        gsap.set(outEl, { display: 'none', x: 0 });
        setStep(1);
        setAnswers({ persons: 2, kwh: 3200 });
        requestAnimationFrame(() => {
          gsap.set(inEl, { display: 'flex', x: -44, opacity: 0 });
          gsap.to(inEl, { x: 0, opacity: 1, duration: 0.42, ease: 'eonOut', onComplete: () => { animating.current = false; } });
        });
      },
    });
  }, [step]);

  /* ── Keyboard ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeModal]);

  /* ── Sync step panel visibility after state-driven step changes ── */
  useEffect(() => {
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      /* Only applies to "static" display on first render of each step */
      if (i === step - 1) {
        if (el.style.display === 'none') return; /* let GSAP handle it */
        gsap.set(el, { display: 'flex', opacity: 1, x: 0 });
      } else {
        /* Don't clobber if GSAP is mid-transition */
        if (!animating.current) gsap.set(el, { display: 'none' });
      }
    });
  }, [step]);

  if (!mounted || !open) return null;

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
        {/* ── Corner buttons (back / close) ── */}
        <button className={styles.cornerBtn} data-pos="back" onClick={goBack} aria-label="Zurück">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className={styles.cornerBtn} data-pos="close" onClick={closeModal} aria-label="Schließen">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── Body: left categories + centered content ── */}
        <div className={styles.modalBody}>
          <nav className={styles.sidebar} aria-label="Fortschritt">
            {CATEGORIES.map((c, i) => {
              const s = i + 1;
              const state = s === step ? 'active' : s < step ? 'done' : 'todo';
              return (
                <button
                  key={c.label}
                  type="button"
                  className={styles.sideItem}
                  data-state={state}
                  onClick={() => goToStep(s)}
                  disabled={s > step}
                  aria-current={s === step ? 'step' : undefined}
                >
                  <span className={styles.sideIndicator} aria-hidden="true" />
                  <span className={styles.sideIcon}>{c.icon}</span>
                  <span className={styles.sideLabel}>{c.label}</span>
                </button>
              );
            })}
          </nav>

          <div className={styles.contentCol}>
            {/* Step panels (all mounted, GSAP controls visibility) */}
            <div className={styles.content}>
              <div
                ref={(el) => { stepRefs.current[0] = el; }}
                className={styles.stepPanel}
                style={{ display: step === 1 ? 'flex' : 'none' }}
              >
                <Step1 answers={answers} setAnswers={setAnswers} goNext={goNext} />
              </div>

              <div
                ref={(el) => { stepRefs.current[1] = el; }}
                className={styles.stepPanel}
                style={{ display: step === 2 ? 'flex' : 'none' }}
              >
                <Step2 answers={answers} setAnswers={setAnswers} goNext={goNext} />
              </div>

              <div
                ref={(el) => { stepRefs.current[2] = el; }}
                className={styles.stepPanel}
                style={{ display: step === 3 ? 'flex' : 'none' }}
              >
                <Step3
                  answers={answers}
                  setAnswers={setAnswers}
                  onSubmit={() => {
                    const q = new URLSearchParams({
                      plz:     answers.plz     ?? '',
                      persons: String(answers.persons ?? 2),
                      kwh:     String(answers.kwh     ?? 3200),
                    });
                    router.push(`/tariff?${q.toString()}`);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
