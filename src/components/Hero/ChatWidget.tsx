'use client';

import { forwardRef } from 'react';
import styles from './hero.module.css';

/* First chip is the journey-starter — styled like the rest, still clickable */
const CHIPS = [
  { id: 'strom-tarif', label: 'Strom-Tarif für mich finden' },
  { id: 'solar', label: 'Lohnt sich Solar mit Wärmepumpe?' },
  { id: 'kosten', label: 'Wie senke ich meine Energiekosten?' },
  { id: 'wallbox', label: 'Wallbox und passender Autostrom-Tarif' },
];

function handleChipClick(id: string) {
  document.dispatchEvent(
    new CustomEvent('eon:journey-start', { detail: { type: id } })
  );
}

const ChatWidget = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className={styles.chatCard} ref={ref} data-chat-card>
      {/* Input row */}
      <div className={styles.chatInputRow}>
        <input
          className={styles.chatInput}
          type="text"
          placeholder="Was beschäftigt dich heute?"
          aria-label="Frage an den E.ON Assistenten"
          data-chat-input
        />
        <div className={styles.chatActions} data-chat-actions>
          <button className={styles.chatIconBtn} aria-label="Spracheingabe">
            {/* tabler microphone */}
            <svg viewBox="0 0 22 22" fill="none" stroke="#5c5c5c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4.583 9.167a6.417 6.417 0 0 0 12.834 0M11 15.583V19.25M7.333 19.25h7.334M8.25 4.583a2.75 2.75 0 0 1 5.5 0v4.584a2.75 2.75 0 0 1-5.5 0z" />
            </svg>
          </button>
          <button className={styles.chatSendBtn} aria-label="Senden">
            {/* send (paper plane) */}
            <svg viewBox="0 0 20 20" fill="#fff" aria-hidden="true">
              <path d="M13.66 18.6 19.32 4.85a2.06 2.06 0 0 0-2.69-2.69L2.88 7.82a1.93 1.93 0 0 0 .08 3.6l5.93 2.35 2.34 5.92a1.92 1.92 0 0 0 3.6.08l-.27-.17ZM10.2 11.6l-1.8-1.8 6.9-6.9-5.1 8.7Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestion chips — only the first triggers the journey */}
      <div className={styles.chatChips} data-chat-chips>
        {CHIPS.map((chip, i) => (
          <button
            key={chip.id}
            className={styles.chip}
            onClick={i === 0 ? () => handleChipClick(chip.id) : undefined}
            data-chip
            data-inactive={i !== 0 ? true : undefined}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
});

ChatWidget.displayName = 'ChatWidget';
export default ChatWidget;
