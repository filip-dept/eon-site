'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { emitEon } from '@/lib/eventBus';
import { useStepWizard } from '@/hooks/useStepWizard';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Stepper } from '@/ui/Stepper';
import { Slider } from '@/ui/Slider';
import { SelectableCard } from '@/ui/SelectableCard';
import { JourneyWizard } from './JourneyWizard';
import { PlzField } from './PlzField';
import styles from './journey.module.css';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Answers = {
  priority?: string;
  plz?: string;
  persons?: number;
  kwh?: number;
};

/* ─── Constants ──────────────────────────────────────────────────────────── */
/* abstract, tech-flavoured line icons (white on the orange tile) */
const PRIORITIES = [
  {
    id: 'flexibel',
    title: 'Flexibilität',
    sub: 'Kurze Laufzeiten, dynamische Preise, Verbrauch aktiv steuern',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2.6"/>
        <circle cx="5" cy="6" r="1.5"/><circle cx="19" cy="7" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/>
        <path d="M6.3 6.9 9.8 10.6M17.6 8.4 14 10.7M16.4 16.6 13.4 13.4"/>
      </svg>
    ),
  },
  {
    id: 'sicherheit',
    title: 'Sicherheit und Preis',
    sub: 'Längere Laufzeit, Planbarkeit durch Preisgarantien',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 5 5.8v5.4c0 4.4 3 7 7 7.8 4-0.8 7-3.4 7-7.8V5.8L12 3z"/>
        <circle cx="12" cy="10.5" r="1.6"/><path d="M12 12.1v2.4"/>
      </svg>
    ),
  },
  {
    id: 'eauto',
    title: "Strom für's E-Autofahren",
    sub: 'Günstig laden, mit eigenem Solarstrom kombinierbar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3 19 7v8l-7 4-7-4V7l7-4z"/>
        <path d="M12.8 8 10 12.4h3L11.2 16"/>
      </svg>
    ),
  },
  {
    id: 'waerme',
    title: 'Wärmestrom für Zuhause',
    sub: 'Effiziente Wärme aus Strom – sauber und planbar',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 15c0-2 1.6-2.8 1.6-4.8S7.5 7 7.5 5"/>
        <path d="M12 15c0-2 1.6-2.8 1.6-4.8S12 7 12 5"/>
        <path d="M16.5 15c0-2 1.6-2.8 1.6-4.8S16.5 7 16.5 5"/>
        <path d="M5 19h14"/>
      </svg>
    ),
  },
  {
    id: 'grundversorgung',
    title: 'Grundversorgung',
    sub: 'Einfach und zuverlässig versorgt – ganz ohne Aufwand',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 4.5v2.4M12 17.1v2.4M4.5 12h2.4M17.1 12h2.4"/>
        <circle cx="12" cy="3.4" r="1.1"/><circle cx="12" cy="20.6" r="1.1"/>
        <circle cx="3.4" cy="12" r="1.1"/><circle cx="20.6" cy="12" r="1.1"/>
      </svg>
    ),
  },
];

const KWH_MIN = 1000;
const KWH_MAX = 10000;

const KWH_PRESETS = [
  {
    id: 'small', title: 'Kleine Wohnung', sub: '1 – 2 Personen · ~1.500 kWh', kwh: 1500,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="7" width="10" height="12" rx="1.6"/><path d="M10.5 19v-3.5h3V19"/>
      </svg>
    ),
  },
  {
    id: 'avg', title: 'Durchschnitt', sub: '2 – 3 Personen · 3.200 kWh', kwh: 3200,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11 12 5l8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-4h4v4"/>
      </svg>
    ),
  },
  {
    id: 'large', title: 'Großes Haus', sub: '4+ Personen · ~5.000 kWh', kwh: 5000,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 4l9 6.5"/><path d="M5 9.5V20h14V9.5"/><path d="M9 20v-5h6v5"/><path d="M15 4h3v2.2"/>
      </svg>
    ),
  },
];

function formatKwh(n: number) {
  return n.toLocaleString('de-DE');
}

/* ─── Arrow icon ─────────────────────────────────────────────────────────── */

/* Enter hint — shown beside the red CTAs */
const EnterHint = () => (
  <span className={styles.enterHint}>
    drücke auf <em>Enter</em>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>
    </svg>
  </span>
);

/* ─── Animated conversational sphere — looping orb video (white bg dropped via
   mix-blend-mode in CSS). Play is driven in JS so we can honour reduced-motion
   and dodge React's muted-autoplay quirk. ─── */
const ConvSphere = () => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.playbackRate = 2;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.pause(); v.currentTime = 0; }
    else v.play().catch(() => {});
  }, []);
  return (
    <div className={styles.convSphere} aria-hidden="true">
      <video ref={ref} className={styles.convOrb} src="/orb-anim.mp4" loop muted playsInline preload="auto" />
    </div>
  );
};

/* ─── Blurred-typewriter headline — words split for a staggered reveal ─────── */
type Seg = { text: string; em?: boolean };
function Typewriter({ lines }: { lines: Seg[][] }) {
  return (
    <h2 className={styles.stepHeadline}>
      {lines.map((line, li) => {
        const words: { w: string; em?: boolean }[] = [];
        line.forEach((seg) => seg.text.split(' ').forEach((w) => words.push({ w, em: seg.em })));
        return (
          <span key={li} className={styles.twLine}>
            {words.map((it, i) => (
              <span key={i} className={styles.twWord} data-em={it.em ? 'true' : undefined}>
                {it.w}{i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        );
      })}
    </h2>
  );
}

/* ─── Step 1 ─────────────────────────────────────────────────────────────── */
function Step1({ answers, setAnswers, goNext }: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  goNext: () => void;
}) {
  return (
    <>
      <p className={styles.stepLabel}>Erstmal kalibrieren</p>
      <Typewriter lines={[
        [{ text: 'Was ist dir bei deinem Strom' }, { text: 'am wichtigsten?', em: true }],
      ]} />
      <div className={styles.optionGrid}>
        {PRIORITIES.map((p) => (
          <SelectableCard
            key={p.id}
            data-appear
            layout="row"
            className="min-w-0 flex-1"
            icon={p.icon}
            title={p.title}
            sub={p.sub}
            selected={answers.priority === p.id}
            onClick={() => {
              setAnswers({ ...answers, priority: p.id });
              setTimeout(goNext, 260);
            }}
          />
        ))}
      </div>
      <p className={styles.footNote} data-appear>
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

  return (
    <>
      <p className={styles.stepLabel}>Wo zuhause, mit wem</p>
      <Typewriter lines={[
        [{ text: 'Erzähl mir kurz' }, { text: 'von deinem Zuhause.', em: true }],
      ]} />

      <div className={styles.s2row}>
        {/* PLZ */}
        <div className={styles.s2col} data-appear>
          <PlzField value={plz} onChange={(p) => setAnswers({ ...answers, plz: p })} />
        </div>

        {/* Persons */}
        <div className={styles.s2col} data-appear>
          <p className={styles.fieldLabel}>Personen im Haushalt</p>
          <Stepper
            value={persons}
            min={1}
            max={10}
            onChange={(v) => setAnswers({ ...answers, persons: v })}
            decLabel="Weniger Personen"
            incLabel="Mehr Personen"
          />
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

      <div className={styles.actionsRow} data-appear>
        <div className={styles.ctaGroup}>
          <Button
            variant="primary"
            iconRight={<Icon name="arrow-right" />}
            onClick={goNext}
            disabled={!plzValid}
            style={{ opacity: plzValid ? 1 : 0.45 }}
          >
            Weiter
          </Button>
          <EnterHint />
        </div>
      </div>
    </>
  );
}

/* ─── Step 3 ─────────────────────────────────────────────────────────────── */
function Step3({ answers, setAnswers, onSubmit, goBack }: {
  answers: Answers;
  setAnswers: (a: Answers) => void;
  onSubmit: () => void;
  goBack: () => void;
}) {
  const kwh = answers.kwh ?? 3200;
  const persons = answers.persons ?? 2;

  const activePreset = KWH_PRESETS.find((p) => p.kwh === kwh)?.id ?? null;

  return (
    <>
      <p className={styles.stepLabel}>Und wie viel Strom</p>
      <Typewriter lines={[
        [{ text: 'Wie viel davon' }, { text: 'brauchst du im Jahr?', em: true }],
      ]} />

      <div className={styles.kwhBlock} data-appear>
        <span className={styles.kwhNum}>{formatKwh(kwh)}</span>
        <span className={styles.kwhUnit}>kWh</span>
      </div>
      <p className={styles.kwhHint} data-appear>ungefähr · bei {persons} {persons === 1 ? 'Person' : 'Personen'} im Haushalt</p>

      <Slider
        data-appear
        min={KWH_MIN}
        max={KWH_MAX}
        step={100}
        value={kwh}
        onChange={(v) => setAnswers({ ...answers, kwh: v })}
        labels={['1.000', '3.200', '5.000', '10.000+']}
        aria-label="Jahresverbrauch in kWh"
      />

      <div className={styles.presets}>
        {KWH_PRESETS.map((p) => (
          <SelectableCard
            key={p.id}
            data-appear
            layout="col"
            title={p.title}
            sub={p.sub}
            selected={activePreset === p.id}
            onClick={() => setAnswers({ ...answers, kwh: p.kwh })}
          />
        ))}
      </div>

      <div className={styles.actionsRow} data-appear>
        <div className={styles.ctaGroup}>
          <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={onSubmit}>
            Meinen Tarif sehen
          </Button>
          <EnterHint />
        </div>
      </div>
    </>
  );
}

/* sidebar steps — mirrors the checkout journey's progress rail (3 steps here) */
const STEPS = [
  {
    label: 'Prioritäten',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.6l-5.25 2.55 1-5.85L3.5 9.15l5.9-.85z" />
      </svg>
    ),
  },
  {
    label: 'Wohnort',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: 'Verbrauch',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z" />
      </svg>
    ),
  },
];

/* ─── Main modal ─────────────────────────────────────────────────────────── */
export default function OnboardingJourney() {
  /* Conversational reveal: blurred-typewriter question, then the answers rise in
     staggered just after it. (Per-wizard reveal strategy for useStepWizard.) */
  const revealStep = useCallback((panel: HTMLElement) => {
    const words = panel.querySelectorAll<HTMLElement>(`.${styles.twWord}`);
    if (words.length) {
      gsap.fromTo(
        words,
        { opacity: 0, filter: 'blur(12px)', y: 10 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.045, delay: 0.45 }
      );
    }
    const items = panel.querySelectorAll<HTMLElement>('[data-appear]');
    if (items.length) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 18, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.5, ease: 'power3.out', stagger: 0.07, delay: 0.75,
          clearProps: 'transform,opacity,filter',
        }
      );
    }
  }, []);

  /* The first question's panel slides up as the shell reveals. */
  const enterFirstStep = useCallback((firstStep: HTMLElement, tl: gsap.core.Timeline) => {
    gsap.set(firstStep, { y: 24, opacity: 0 });
    tl.to(firstStep, { y: 0, opacity: 1, duration: 0.42, ease: 'eonOut' }, 0.38);
  }, []);

  const validateStep = useCallback((s: number, a: Answers) => {
    if (s === 1) return !!a.priority;
    if (s === 2) return /^\d{5}$/.test(a.plz ?? '');
    return true;
  }, []);

  /* Completing the last step hands off to /tariff through the red RouteCurtain:
     the flag tells TariffPage to enter from under the cover (hero rises 300px),
     and `eon:route-cover` wipes the curtain down before it navigates. */
  const onComplete = useCallback((a: Answers) => {
    const q = new URLSearchParams({
      plz:     a.plz     ?? '',
      persons: String(a.persons ?? 2),
      kwh:     String(a.kwh     ?? 3200),
    });
    try { sessionStorage.setItem('eon:intro-tariff', '1'); } catch {}
    emitEon('eon:route-cover', { href: `/tariff?${q.toString()}` });
  }, []);

  const {
    mounted, open, step, answers, setAnswers,
    overlayRef, modalRef, stepRefs,
    goNext, goBack, goToStep, advance, close,
  } = useStepWizard<Answers>({
    event: 'eon:journey-start',
    totalSteps: 3,
    initialAnswers: { persons: 2, kwh: 3200 },
    revealStep,
    enterFirstStep,
    validateStep,
    onComplete,
  });

  return (
    <JourneyWizard
      mounted={mounted}
      open={open}
      overlayRef={overlayRef}
      modalRef={modalRef}
      modifierClass={styles.modalConv}
      ariaLabel="E.ON Assistant"
      onBack={goBack}
      onClose={close}
    >
      <span className={styles.assistantLabel}>E.ON Assistant</span>

      {/* Assistant orb — docked top-centre between the back/close buttons */}
      <ConvSphere />

      {/* ── Body: 3-step progress rail + centred conversational column ── */}
      <div className={styles.modalBody}>
        <nav className={styles.sidebar} aria-label="Fortschritt">
          {STEPS.map((c, i) => {
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
              <Step3 answers={answers} setAnswers={setAnswers} onSubmit={advance} goBack={goBack} />
            </div>
          </div>
        </div>
      </div>
    </JourneyWizard>
  );
}
