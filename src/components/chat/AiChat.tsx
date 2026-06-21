'use client';

import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { AiOrb } from './AiOrb';
import { Chip } from '@/ui/Chip';
import styles from './AiChat.module.css';

/* ───────────────────────────────────────────────────────────────────────────
   AiChat — the E.ON assistant bubble (Figma "AI chat" 1877:3106). One component,
   four visual variants built on <AiOrb>:

     • pill          resting bubble — orb + mic. The prompt lives in a collapsed
                     `reveal` that the consumer (tariff orb) grows on hover.
     • bar           full input bar — orb + prompt + mic + send.
     • suggestions   bar + quick-prompt chips (hero / homepage).
     • answer        assistant reply card (header + answer + input row). On the
                     tariff page it grows out of the pill via GSAP, so it exposes
                     `data-ai-*` hooks (card / inner / row / reveal / send) for
                     the morph and keeps a fixed-width inner so growing the outer
                     box never reflows the text.

   Presentational only — open/close/scroll choreography stays with the consumer.
   ─────────────────────────────────────────────────────────────────────────── */

export type AiChatVariant = 'pill' | 'bar' | 'suggestions' | 'answer';
export interface AiChatSuggestion {
  id: string;
  label: string;
  /** only interactive chips react to clicks (matches the hero's journey-starter) */
  interactive?: boolean;
}

export interface AiChatProps extends HTMLAttributes<HTMLElement> {
  variant: AiChatVariant;
  /** placeholder prompt, e.g. "Was beschäftigt dich heute?" */
  prompt?: string;
  /** suggestion chips (suggestions variant) */
  suggestions?: AiChatSuggestion[];
  /** assistant reply (answer variant) */
  answerHeading?: string;
  answerBody?: ReactNode;
  /** assistant title in the answer header (default "E.ON Assistant") */
  assistantLabel?: string;
  /** fixed inner width for the answer card so the GSAP grow doesn't reflow text */
  cardWidth?: number;
  onSend?: () => void;
  onMic?: () => void;
  onCloseChat?: () => void;
  onSuggestion?: (id: string) => void;
  ref?: Ref<HTMLDivElement>;
}

/* ── Inline icons — mic + send match the existing chat SVGs; close is the E.ON × ── */
const MicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
  </svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 20 20" fill="#fff" aria-hidden="true">
    <path d="M13.66 18.6 19.32 4.85a2.06 2.06 0 0 0-2.69-2.69L2.88 7.82a1.93 1.93 0 0 0 .08 3.6l5.93 2.35 2.34 5.92a1.92 1.92 0 0 0 3.6.08l-.27-.17ZM10.2 11.6l-1.8-1.8 6.9-6.9-5.1 8.7Z" />
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* the orb · prompt · actions row — shared by bar / suggestions / answer, and (in
   collapsed form, prompt hidden) by the pill. `open` shows the prompt + send. */
function InputRow({
  prompt,
  open,
  showSend,
  onSend,
  onMic,
}: {
  prompt?: string;
  open: boolean;
  showSend: boolean;
  onSend?: () => void;
  onMic?: () => void;
}) {
  return (
    <div className={styles.row} data-ai-row data-open={open ? 'true' : 'false'}>
      <AiOrb className={styles.orb} />
      <div className={styles.reveal} data-ai-reveal>
        {prompt ? <span className={styles.prompt}>{prompt}</span> : null}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.iconBtn} aria-label="Spracheingabe" onClick={onMic}>
          <MicIcon />
        </button>
        {showSend ? (
          <button type="button" className={styles.send} aria-label="Senden" data-ai-send onClick={onSend}>
            <SendIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AiChat({
  variant,
  prompt = 'Was beschäftigt dich heute?',
  suggestions = [],
  answerHeading,
  answerBody,
  assistantLabel = 'E.ON Assistant',
  cardWidth,
  onSend,
  onMic,
  onCloseChat,
  onSuggestion,
  className,
  ref,
  ...rest
}: AiChatProps) {
  const cn = (...c: (string | undefined | false)[]) => c.filter(Boolean).join(' ');

  /* PILL — the resting bubble. Rendered as a button so the whole thing is the
     click target; the prompt sits in a collapsed reveal the consumer expands. */
  if (variant === 'pill') {
    return (
      <button
        type="button"
        ref={ref as Ref<HTMLButtonElement>}
        className={cn(styles.row, className)}
        data-ai-row
        data-open="false"
        {...(rest as HTMLAttributes<HTMLButtonElement>)}
      >
        <AiOrb className={styles.orb} />
        <div className={styles.reveal} data-ai-reveal>
          <span className={styles.prompt}>{prompt}</span>
        </div>
        <div className={styles.actions}>
          <span className={styles.iconBtn} aria-hidden="true">
            <MicIcon />
          </span>
          {/* revealed on hover (CSS) — a preview of the send action; the whole
              pill is the click target, so this stays a non-interactive span */}
          <span className={styles.send} aria-hidden="true">
            <SendIcon />
          </span>
        </div>
      </button>
    );
  }

  /* BAR — a standalone full input bar */
  if (variant === 'bar') {
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cn(styles.card, styles.block, className)} {...rest}>
        <InputRow prompt={prompt} open showSend onSend={onSend} onMic={onMic} />
      </div>
    );
  }

  /* SUGGESTIONS — bar + quick-prompt chips (hero) */
  if (variant === 'suggestions') {
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={cn(styles.card, styles.block, className)} {...rest}>
        <InputRow prompt={prompt} open showSend onSend={onSend} onMic={onMic} />
        <div className={styles.suggestions} data-ai-suggestions>
          {suggestions.map((s) => (
            <Chip
              key={s.id}
              interactive={s.interactive ?? false}
              onClick={s.interactive ? () => onSuggestion?.(s.id) : undefined}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  /* ANSWER — assistant reply card. The outer card is the growable box; a
     fixed-width inner holds the content so the grow doesn't reflow text. */
  return (
    <div ref={ref as Ref<HTMLDivElement>} className={cn(styles.card, className)} data-ai-card {...rest}>
      <div data-ai-inner style={{ width: cardWidth, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div className={styles.header}>
          <span className={styles.assistant}>{assistantLabel}</span>
          <button type="button" className={styles.close} aria-label="Schließen" onClick={onCloseChat}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.answer}>
          {answerHeading ? <p className={styles.answerHeading}>{answerHeading}</p> : null}
          {answerBody ? <p className={styles.answerBody}>{answerBody}</p> : null}
        </div>
        <InputRow prompt={prompt} open showSend onSend={onSend} onMic={onMic} />
      </div>
    </div>
  );
}

export default AiChat;
