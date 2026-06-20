'use client';

import { useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { useStepWizard } from '@/hooks/useStepWizard';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Input } from '@/ui/Input';
import { Field } from '@/ui/Field';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { RadioCard } from '@/ui/RadioCard';
import { ContextBar } from '@/components/common/ContextBar';
import { JourneyWizard } from './JourneyWizard';
import { TariffPreview } from './TariffPreview';
import styles from './journey.module.css';

/* ─── Answers ────────────────────────────────────────────────────────────── */
type Answers = {
  wechsel: '' | 'eon' | 'self';
  anbieter: string;
  kundennummer: string;
  zaehler: string;
  strasse: string;
  nr: string;
  plz: string;
  stadt: string;
  datum: '' | 'asap' | 'date';
  anrede: '' | 'frau' | 'herr' | 'divers';
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  email: string;
  telefon: string;
};

/* nothing preselected — the user makes every choice */
const INITIAL_ANSWERS: Answers = {
  wechsel: '',
  anbieter: '',
  kundennummer: '',
  zaehler: '',
  strasse: '',
  nr: '',
  plz: '81245',
  stadt: '',
  datum: '',
  anrede: '',
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
const MicIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4"/>
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

/* ─── Left categories (one per step) ─────────────────────────────────────── */
const CATEGORIES = [
  {
    label: 'Overview',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>
      </svg>
    ),
  },
  {
    label: 'Wechsel',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h13l-3-3M20 17H7l3 3"/>
      </svg>
    ),
  },
  {
    label: 'Anbieter',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.6.5-1 1.5-1 2.5h-6c0-1-.4-2-1-2.5A6 6 0 0 1 12 3z"/>
      </svg>
    ),
  },
  {
    label: 'Kundennummer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h4M7 14h7"/>
      </svg>
    ),
  },
  {
    label: 'Zähler',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19h16M6 19V9m4 10V5m4 14v-8m4 8V11"/>
      </svg>
    ),
  },
  {
    label: 'Datum',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
      </svg>
    ),
  },
  {
    label: 'Daten',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>
      </svg>
    ),
  },
];

/* ─── Main modal ─────────────────────────────────────────────────────────── */
export default function CheckoutJourney() {
  const [eco, setEco] = useState(true); // "Besonders nachhaltig" toggle
  const toggleEco = () => setEco((v) => !v);

  /* blurred rise-in of the step's content blocks; the opening reveal waits longer
     (until the shell has opened) */
  const revealStep = useCallback((panel: HTMLElement, _idx: number, isEnter: boolean) => {
    const items = Array.from(panel.children) as HTMLElement[];
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 16, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out',
        stagger: 0.06, delay: isEnter ? 0.4 : 0.12, clearProps: 'transform,opacity,filter',
      }
    );
  }, []);

  /* the first frame does NOT slide in — it stays put while its content reveals */
  const enterFirstStep = useCallback((firstStep: HTMLElement) => {
    gsap.set(firstStep, { y: 0, opacity: 1 });
  }, []);

  const validateStep = useCallback((s: number, a: Answers) => stepValid(s, a), []);
  const onComplete = useCallback((_a: Answers, { close }: { close: () => void }) => close(), []);

  const {
    mounted, open, step, answers, setAnswers,
    overlayRef, modalRef, stepRefs,
    goNext, goBack, goToStep, advance, close,
  } = useStepWizard<Answers>({
    event: 'eon:checkout-start',
    totalSteps: TOTAL_STEPS,
    initialAnswers: INITIAL_ANSWERS,
    revealStep,
    enterFirstStep,
    validateStep,
    onComplete,
  });

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
      <h2 className={styles.stepHeadline}>Bereit für deine neue Energie? Wir schon.</h2>

      <ContextBar eco={eco} onEcoChange={toggleEco} />

      <p className={styles.selLabel}>Deine Auswahl</p>
      <TariffPreview />

      <div className={styles.startRow}>
        <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={goNext}>Start</Button>
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
      <h2 className={styles.stepHeadline}>Kümmern wir uns um deinen Wechsel?</h2>
      <p className={styles.stepSub}>Wir erledigen alle Formalitäten und kündigen deinen alten Vertrag.</p>

      <div className={styles.abList}>
        <RadioCard
          indicator="checkbox"
          selected={answers.wechsel === 'eon'}
          onClick={() => pickAndGo({ wechsel: 'eon' })}
          title="Ja bitte übernehmen"
          sub="Ihr alter Vertrag wird von uns gekündigt"
        />
        <RadioCard
          indicator="checkbox"
          selected={answers.wechsel === 'self'}
          onClick={() => pickAndGo({ wechsel: 'self' })}
          title="Ich hab schon gekündigt"
          sub="Ich kümmere mich selber drum"
        />
      </div>
    </>,

    /* ── 3 · Anbieter ── */
    <>
      <p className={styles.stepLabel}>Anbieter</p>
      <h2 className={styles.stepHeadline}>Bei welchem Anbieter bist du aktuell?</h2>
      <p className={styles.stepSub}>Damit wir wissen, an wen die Kündigung geht.</p>

      <div className={styles.formGrid}>
        <Field label="Aktueller Stromanbieter">
          <Input
            type="text"
            placeholder="z.B. Stadtwerke München, Yello, ..."
            value={answers.anbieter}
            onChange={(e) => set({ anbieter: e.target.value })}
          />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.ctaGroup}>
          <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={advance} disabled={!stepValid(3, answers)}>
            Weiter
          </Button>
          <EnterHint />
        </div>
      </div>
    </>,

    /* ── 4 · Kundennummer ── */
    <>
      <p className={styles.stepLabel}>Kundennr.</p>
      <h2 className={styles.stepHeadline}>Wie lautet deine Kundennummer?</h2>
      <p className={styles.stepSub}>Steht auf deiner letzten Jahresabrechnung oben rechts.</p>

      <div className={styles.formGrid}>
        <Field label="Kundennummer beim alten Anbieter">
          <Input
            type="text"
            placeholder="z.B. K-12345678"
            value={answers.kundennummer}
            onChange={(e) => set({ kundennummer: e.target.value })}
          />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.ctaGroup}>
          <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={advance} disabled={!stepValid(4, answers)}>
            Weiter
          </Button>
          <EnterHint />
        </div>
      </div>
    </>,

    /* ── 5 · Zähler und Adresse ── */
    <>
      <p className={styles.stepLabel}>Zähler</p>
      <h2 className={styles.stepHeadline}>Zähler und Adresse</h2>
      <p className={styles.stepSub}>Damit wir wissen, wo der Strom hin soll.</p>

      <div className={styles.formGrid}>
        <Field label="Zählernummer">
          <Input
            type="text"
            placeholder="z.B. 1ESY1234567890"
            value={answers.zaehler}
            onChange={(e) => set({ zaehler: e.target.value })}
          />
        </Field>
        <div className={styles.rowStreet}>
          <Field label="Strasse">
            <Input
              type="text"
              placeholder="Musterstraße"
              value={answers.strasse}
              onChange={(e) => set({ strasse: e.target.value })}
            />
          </Field>
          <Field label="Nr.">
            <Input
              type="text"
              placeholder="12a"
              value={answers.nr}
              onChange={(e) => set({ nr: e.target.value })}
            />
          </Field>
        </div>
        <div className={styles.rowCity}>
          <Field label="PLZ">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={answers.plz}
              onChange={(e) => set({ plz: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            />
          </Field>
          <Field label="Stadt">
            <Input
              type="text"
              placeholder="Hamburg"
              value={answers.stadt}
              onChange={(e) => set({ stadt: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.ctaGroup}>
          <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={advance} disabled={!stepValid(5, answers)}>
            Weiter
          </Button>
          <EnterHint />
        </div>
      </div>
    </>,

    /* ── 6 · Datum (A/B — click advances) ── */
    <>
      <p className={styles.stepLabel}>Datum</p>
      <h2 className={styles.stepHeadline}>Wann soll der neue Vertrag starten?</h2>
      <p className={styles.stepSub}>Schnellstmöglich oder zu einem konkreten Datum.</p>

      <div className={styles.abRow}>
        <RadioCard
          indicator="corner"
          selected={answers.datum === 'asap'}
          onClick={() => pickAndGo({ datum: 'asap' })}
          title="Schnellstmöglich"
          sub="Sobald die Kündigung greift"
        />
        <RadioCard
          indicator="corner"
          selected={answers.datum === 'date'}
          onClick={() => pickAndGo({ datum: 'date' })}
          title="Zu einem Datum"
          sub="Du gibst es uns vor"
        />
      </div>

    </>,

    /* ── 7 · Daten ── */
    <>
      <p className={styles.stepLabel}>Daten</p>
      <h2 className={styles.stepHeadline}>Deine Daten — sicher und schnell.</h2>
      <p className={styles.stepSub}>Wir brauchen nur die nötigsten Angaben für deinen Vertrag.</p>

      <div className={styles.formGrid}>
        <SegmentedControl
          aria-label="Anrede"
          options={[
            { value: 'frau', label: 'Frau' },
            { value: 'herr', label: 'Herr' },
            { value: 'divers', label: 'Divers' },
          ]}
          value={answers.anrede}
          onChange={(v) => set({ anrede: v })}
        />
        <div className={styles.rowSplit}>
          <Field label="Vorname">
            <Input type="text" placeholder="Anna"
              value={answers.vorname} onChange={(e) => set({ vorname: e.target.value })} />
          </Field>
          <Field label="Nachname">
            <Input type="text" placeholder="Schmidt"
              value={answers.nachname} onChange={(e) => set({ nachname: e.target.value })} />
          </Field>
        </div>
        <Field label="Geburtsdatum">
          <Input type="date"
            value={answers.geburtsdatum} onChange={(e) => set({ geburtsdatum: e.target.value })} />
        </Field>
        <Field label="E-Mail">
          <Input type="email" placeholder="anna.schmidt@example.com"
            value={answers.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Telefon (optional)">
          <Input type="tel" placeholder="+49 ..."
            value={answers.telefon} onChange={(e) => set({ telefon: e.target.value })} />
        </Field>
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.ctaGroup}>
          <Button variant="primary" iconRight={<Icon name="arrow-right" />} onClick={advance} disabled={!stepValid(7, answers)}>
            Vertrag abschließen
          </Button>
          <EnterHint />
        </div>
      </div>
    </>,
  ];

  return (
    <JourneyWizard
      mounted={mounted}
      open={open}
      overlayRef={overlayRef}
      modalRef={modalRef}
      modifierClass={styles.modalWhite}
      ariaLabel="Tarif-Assistent"
      onBack={goBack}
      onClose={close}
    >
      {/* From step 2 on, the context toolbar docks top-centre between the buttons */}
      {step > 1 && <div className={styles.topBar}><ContextBar placement="docked" eco={eco} onEcoChange={toggleEco} /></div>}

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
          <div className={styles.content}>
            {panels.map((panel, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className={styles.stepPanel}
                style={{ display: step === i + 1 ? 'flex' : 'none' }}
              >
                {panel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </JourneyWizard>
  );
}
